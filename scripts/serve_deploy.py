"""Serve the static site with the public routes from vercel.json."""

import argparse
import json
import re
import subprocess
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "portfolio-dist"
ROUTES = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))["routes"]


class DeployHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def send_head(self):
        request = urlsplit(self.path)
        query = parse_qs(request.query)
        self.route_headers = {}
        self.remaining_bytes = None
        for route in ROUTES:
            if "src" not in route:
                continue
            path_match = re.fullmatch(route["src"].replace("(?<", "(?P<"), request.path)
            if not path_match:
                continue
            captures = {str(index): group for index, group in enumerate(path_match.groups(), 1)}
            captures.update(path_match.groupdict())
            for condition in route.get("has", []):
                pattern = condition["value"].replace("(?<", "(?P<")
                if condition["type"] == "host":
                    value = (self.headers.get("Host") or "").split(":")[0]
                else:
                    value = query.get(condition["key"], [""])[0]
                match = re.fullmatch(pattern, value)
                if match is None:
                    break
                captures.update(match.groupdict())
            else:
                self.route_headers.update({
                    name: re.sub(r"\$(\w+)", lambda m: captures[m[1]], value)
                    for name, value in route.get("headers", {}).items()
                })
                if route.get("continue"):
                    continue
                if "status" in route:
                    self.send_response(route["status"])
                    self.send_header("Content-Length", "0")
                    self.end_headers()
                    return None
                if "dest" in route:
                    self.path = re.sub(r"\$(\w+)", lambda m: captures[m[1]], route["dest"])
                    break

        target = Path(self.translate_path(self.path))
        if not target.is_file():
            body = (PUBLIC / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return None
        byte_range = re.fullmatch(r"bytes=(\d+)-(\d*)", self.headers.get("Range", ""))
        if target.suffix.lower() == ".mp4" and byte_range:
            size = target.stat().st_size
            start = int(byte_range[1])
            end = min(int(byte_range[2]), size - 1) if byte_range[2] else size - 1
            if start > end:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.send_header("Content-Length", "0")
                self.end_headers()
                return None
            stream = target.open("rb")
            stream.seek(start)
            self.remaining_bytes = end - start + 1
            self.send_response(206)
            self.send_header("Content-Type", "video/mp4")
            self.send_header("Accept-Ranges", "bytes")
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            self.send_header("Content-Length", str(self.remaining_bytes))
            self.end_headers()
            return stream
        return super().send_head()

    def copyfile(self, source, output):
        if self.remaining_bytes is None:
            return super().copyfile(source, output)
        while self.remaining_bytes:
            chunk = source.read(min(65536, self.remaining_bytes))
            if not chunk:
                return
            output.write(chunk)
            self.remaining_bytes -= len(chunk)

    def end_headers(self):
        for name, value in getattr(self, "route_headers", {}).items():
            self.send_header(name, value)
        super().end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4174)
    args = parser.parse_args()
    subprocess.run(["node", "scripts/build_deploy.cjs"], cwd=ROOT, check=True)
    with ThreadingHTTPServer(("127.0.0.1", args.port), DeployHandler) as server:
        print(f"Serving portfolio at http://127.0.0.1:{args.port}", flush=True)
        server.serve_forever()

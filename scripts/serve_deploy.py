"""Serve the static site with the public routes from vercel.json."""

import argparse
import json
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit


ROOT = Path(__file__).resolve().parents[1]
ROUTES = json.loads((ROOT / "vercel.json").read_text(encoding="utf-8"))["routes"]


class DeployHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        request = urlsplit(self.path)
        query = parse_qs(request.query)
        self.route_headers = {}
        for route in ROUTES:
            if "src" not in route or not re.fullmatch(route["src"], request.path):
                continue
            captures = {}
            for condition in route.get("has", []):
                pattern = condition["value"].replace("(?<", "(?P<")
                value = query.get(condition["key"], [""])[0]
                match = re.fullmatch(pattern, value)
                if match is None:
                    break
                captures.update(match.groupdict())
            else:
                self.route_headers.update({
                    name: re.sub(r"\$([a-z]+)", lambda m: captures[m[1]], value)
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
                    self.path = route["dest"]
                    break

        if not Path(self.translate_path(self.path)).is_file():
            body = (ROOT / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(body)
            return None
        return super().send_head()

    def end_headers(self):
        for name, value in getattr(self, "route_headers", {}).items():
            self.send_header(name, value)
        super().end_headers()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4174)
    args = parser.parse_args()
    with ThreadingHTTPServer(("127.0.0.1", args.port), DeployHandler) as server:
        print(f"Serving portfolio at http://127.0.0.1:{args.port}", flush=True)
        server.serve_forever()

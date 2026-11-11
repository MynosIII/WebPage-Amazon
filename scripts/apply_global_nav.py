"""Give every static page the shared navigation from shared_nav.py.

Run: python scripts/apply_global_nav.py [--check]
The language switch of each page is preserved.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

from shared_nav import render_global_nav

ROOT = Path(__file__).resolve().parents[1]
HEADER = re.compile(r'<header class="global-nav" data-global-nav>.*?</header>\n?', re.S)
SWITCH = re.compile(r'<li class="global-nav__locale"><a href="([^"]*)"')


def pair_href(name: str, lang: str) -> str:
    """The other-language version of a page, if one exists."""
    other = "en" if lang == "es" else "es"
    path = Path(name)
    stem = path.stem
    if stem.endswith(f"-{lang}"):
        candidate = path.with_name(f"{stem[:-3]}-{other}{path.suffix}")
        if (ROOT / candidate).exists():
            return candidate.name if candidate.parent == path.parent else "/" + candidate.as_posix()
    return ""


def main() -> int:
    check = "--check" in sys.argv
    files = subprocess.run(["git", "ls-files", "*.html"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split()
    stale = []
    for name in files:
        path = ROOT / name
        text = path.read_text(encoding="utf-8")
        match = HEADER.search(text)
        if not match:
            continue
        lang = re.search(r'<html[^>]*\blang="([a-z]{2})', text)
        lang = lang.group(1) if lang else "es"
        switch = SWITCH.search(match.group(0))
        href = pair_href(name, lang) or (switch.group(1) if switch else "") or ("/index.html?lang=en" if lang == "es" else "/")
        updated = text[:match.start()] + render_global_nav(lang, href) + text[match.end():]
        if updated != text:
            stale.append(name)
            if not check:
                path.write_text(updated, encoding="utf-8", newline="")
    if check and stale:
        print("Navigation out of date in: " + ", ".join(stale[:10]))
        return 1
    print(f"{'Checked' if check else 'Updated'} navigation; {len(stale)} file(s) {'stale' if check else 'changed'}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Give every static search scope and department nav the same seven sections.

script.js rebuilds these menus in the browser from the same list; this keeps the
static HTML (what crawlers and no-JS visitors see) identical to it.
Run: python scripts/sync_department_nav.py [--check]
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FILES = ["prototype-amazon/index.html", "prototype-amazon/about.html", "prototype-amazon/catalog.html",
         "prototype-amazon/contact.html", "404.html"]
# Keep in sync with normalizeDiscoveryHeader() in prototype-amazon/script.js.
SECTIONS = [("all", "Todo el portfolio"), ("ecommerce", "Amazon Growth & PPC"), ("bi", "Business Intelligence"),
            ("creative", "Data-to-Creative"), ("articles", "Sistemas y artículos"), ("research", "Investigación"),
            ("other", "Automatización y código")]
SELECT = re.compile(r'(<select class="search-scope"[^>]*>)(.*?)(</select>)', re.S)
TRACK = re.compile(r'(<div class="app-width department-nav__track">)(.*?)(</div></nav>)', re.S)


def options() -> str:
    return "".join(f'<option value="{key}">{html.escape(label, quote=False)}</option>' for key, label in SECTIONS)


def links(prefix: str) -> str:
    items = []
    for index, (key, label) in enumerate(SECTIONS):
        cls = ' class="department-nav__all"' if index == 0 else ""
        items.append(f'<a{cls} href="{prefix}catalog.html?section={key}" data-section-link="{key}">{html.escape(label, quote=False)}</a>')
    return "".join(items)


def main() -> int:
    check = "--check" in sys.argv
    stale = []
    for name in FILES:
        path = ROOT / name
        text = path.read_text(encoding="utf-8")
        updated = SELECT.sub(lambda m: m[1] + options() + m[3], text)
        updated = TRACK.sub(lambda m: m[1] + links("/" if name == "404.html" else "") + m[3] if m[2].strip() else m[0], updated)
        if updated != text:
            stale.append(name)
            if not check:
                path.write_text(updated, encoding="utf-8", newline="")
    if check and stale:
        print("Department menus are stale in: " + ", ".join(stale))
        return 1
    print(f"Department menus {'checked' if check else 'updated'}; {len(stale)} file(s) {'stale' if check else 'changed'}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

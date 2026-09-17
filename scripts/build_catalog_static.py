"""Pre-render the Spanish "all work" catalog list into prototype-amazon/catalog.html.

catalog.js populates #data-catalog-list entirely client-side by fetching
catalog-data.json, so a crawler that does not execute JavaScript (most
"AI" crawlers, and link-preview bots) sees an empty list with only a
"Cargando catálogo..." status line -- none of the ~60 portfolio entries
are visible to them. This script writes a static, real snapshot of the
default (Spanish, section=all) view into the same container catalog.js
already targets; catalog.js overwrites it immediately for real visitors
the moment its fetch resolves, so this only changes what a non-JS client
sees, never the interactive behavior.

Run after editing catalog-data.json: python scripts/build_catalog_static.py
--check verifies the committed file is up to date (wired into validate_site
via the same convention as the other build_*.py --check scripts).
"""
from __future__ import annotations

import json
import re
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROTO = ROOT / "prototype-amazon"
DATA_PATH = PROTO / "catalog-data.json"
CATALOG_PATH = PROTO / "catalog.html"
SITEMAP_PATH = PROTO / "sitemap.xml"
SITE = "https://matiasgaglio.vercel.app"
LANGUAGE = "es"
FIXED_PAGES = ["/", "/about.html", "/case-amazon-growth.html", "/catalog.html", "/contact.html"]

SECTION_LABELS_ES = {
    "all": "Todo el catálogo",
    "ecommerce": "Ecommerce y Amazon Growth",
    "bi": "Business Intelligence",
    "creative": "Creatividad y medios",
    "articles": "Sistemas y artículos",
    "research": "Investigación y análisis",
    "other": "Otros proyectos",
}

START = "<!-- STATIC_CATALOG_START -->"
END = "<!-- STATIC_CATALOG_END -->"


def escape(value: str) -> str:
    return (
        value.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&#39;")
    )


def resolve_media(value: str) -> str:
    quoted = urllib.parse.quote("../" + value, safe="/:")
    return quoted.replace("+", "%2B")


def prototype_url(url: str) -> str:
    if url == f"caso-1-{LANGUAGE}.html":
        return "case-amazon-growth.html"
    if url == f"sobre-mi-{LANGUAGE}.html":
        return "about.html"
    if url in ("index.html", f"index-{LANGUAGE}.html"):
        return "index.html"
    return "page.html?source=" + urllib.parse.quote("../" + url, safe="")


def media_markup(item: dict) -> str:
    image_set = item.get("imageSet") or []
    if image_set:
        imgs = "".join(f'<img src="{resolve_media(path)}" alt="" loading="lazy" decoding="async">' for path in image_set)
        return f'<span class="catalog-icon-mosaic" aria-hidden="true">{imgs}</span>'
    image = item.get("image")
    if image:
        return f'<img src="{resolve_media(image)}" alt="" loading="lazy" decoding="async">'
    return '<span class="catalog-media-skeleton" data-catalog-placeholder></span>'


def tool_logo_markup(tool_logos: list[dict]) -> str:
    if not tool_logos:
        return ""
    names = ", ".join(t["name"] for t in tool_logos)
    items = "".join(
        f'<li title="{escape(t["name"])}"><img src="../assets/software-logos/{escape(t["asset"])}" alt="" width="28" height="28" loading="lazy" decoding="async"></li>'
        for t in tool_logos
    )
    return f'<ul class="case-logo-row" aria-label="{escape(names)}">{items}</ul>'


def card_markup(item: dict, category_label: str) -> str:
    url = prototype_url(item["url"])
    media_fit = item.get("mediaFit") or "cover"
    media_kind = ' data-media-kind="icon-mosaic"' if item.get("imageSet") else ""
    return (
        f'<article class="catalog-result" data-source="{escape(item["url"])}">'
        f'<a class="catalog-result__media is-media-ready" data-media-fit="{media_fit}"{media_kind} href="{url}" tabindex="-1" aria-hidden="true">{media_markup(item)}</a>'
        f'<div class="catalog-result__body"><p class="result-kicker">{escape(category_label)}</p>'
        f'<h3><a href="{url}">{escape(item["title"])}</a></h3>'
        f'<p>{escape(item["description"])}</p>'
        f"{tool_logo_markup(item.get('toolLogos') or [])}</div></article>"
    )


def build_list_html(items: list[dict]) -> tuple[str, int]:
    cards = []
    for item in items:
        category = item["categories"][0]
        label = SECTION_LABELS_ES.get(category, SECTION_LABELS_ES["all"])
        cards.append(card_markup(item, label))
    return "".join(cards), len(items)


def build_sitemap_urls(items: list[dict]) -> list[str]:
    seen = set(FIXED_PAGES)
    urls = list(FIXED_PAGES)
    for item in items:
        dest = prototype_url(item["url"])
        if dest.startswith(("case-amazon-growth.html", "about.html", "index.html")):
            continue  # already covered by a fixed page above
        path = "/" + dest
        if path not in seen:
            seen.add(path)
            urls.append(path)
    return urls


def sync_sitemap(items: list[dict], check_only: bool) -> bool:
    urls = build_sitemap_urls(items)
    body = "\n".join(f"  <url><loc>{SITE}{u}</loc></url>" for u in urls)
    xml = f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{body}\n</urlset>\n'
    current = SITEMAP_PATH.read_text(encoding="utf-8") if SITEMAP_PATH.exists() else ""
    if xml == current:
        return True
    if check_only:
        return False
    SITEMAP_PATH.write_text(xml, encoding="utf-8")
    print(f"Wrote {len(urls)} URLs into {SITEMAP_PATH.relative_to(ROOT)}.")
    return True


def main() -> int:
    check_only = "--check" in sys.argv
    all_items = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    es_items = [item for item in all_items if item.get("lang") == LANGUAGE]
    list_html, count = build_list_html(es_items)
    marker = f"{START}{list_html}{END}"

    html = CATALOG_PATH.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    if not pattern.search(html):
        print("catalog.html is missing the STATIC_CATALOG markers.")
        return 1
    updated = pattern.sub(lambda _: marker, html)

    count_text = "1 resultado" if count == 1 else f"{count} resultados"
    updated = re.sub(
        r'(<p role="status" aria-live="polite" data-catalog-count>)[^<]*(</p>)',
        lambda m: f"{m.group(1)}{count_text}{m.group(2)}",
        updated,
    )

    sitemap_ok = sync_sitemap(es_items, check_only)
    catalog_changed = updated != html

    if check_only:
        ok = True
        if catalog_changed:
            print("prototype-amazon/catalog.html is stale; run scripts/build_catalog_static.py.")
            ok = False
        if not sitemap_ok:
            print("prototype-amazon/sitemap.xml is stale; run scripts/build_catalog_static.py.")
            ok = False
        if ok:
            print(f"catalog.html and sitemap.xml are up to date ({count} entries).")
        return 0 if ok else 1

    if catalog_changed:
        CATALOG_PATH.write_text(updated, encoding="utf-8")
        print(f"Wrote {count} static catalog entries into {CATALOG_PATH.relative_to(ROOT)}.")
    else:
        print("catalog.html already up to date.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

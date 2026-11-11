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
from add_image_dimensions import dimensions

ROOT = Path(__file__).resolve().parents[1]
PROTO = ROOT / "prototype-amazon"
DATA_PATH = PROTO / "catalog-data.json"
CATALOG_PATH = PROTO / "catalog.html"
SITEMAP_PATH = PROTO / "sitemap.xml"
from site_config import SITE_URL as SITE
LANGUAGE = "es"
FIXED_PAGES = ["/", "/index-en.html", "/about.html", "/about-en.html", "/catalog.html", "/catalog-en.html", "/contact.html", "/contact-en.html", "/cv-es.html", "/cv-en.html"]
VERCEL_CONFIG = ROOT / "vercel.json"

SECTION_LABELS_ES = {
    "all": "Todo el catálogo",
    "ecommerce": "Ecommerce y Amazon Growth",
    "bi": "Business Intelligence",
    "creative": "Creatividad y medios",
    "articles": "Sistemas y artículos",
    "research": "Investigación y análisis",
    "other": "Otros proyectos",
}

SECTION_LABELS_EN = {
    "all": "All work",
    "ecommerce": "Ecommerce and Amazon Growth",
    "bi": "Business Intelligence",
    "creative": "Creative and media",
    "articles": "Systems and articles",
    "research": "Research and analysis",
    "other": "Other projects",
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


def prototype_url(item: dict) -> str:
    return "/" + urllib.parse.quote(item["url"], safe="/")


def media_markup(item: dict) -> str:
    def image_markup(path: str) -> str:
        size = dimensions(ROOT / path)
        intrinsic = f' width="{size[0]}" height="{size[1]}"' if size else ""
        return f'<img src="{resolve_media(path)}" alt=""{intrinsic} loading="lazy" decoding="async">'

    image_set = item.get("imageSet") or []
    if image_set:
        imgs = "".join(image_markup(path) for path in image_set)
        return f'<span class="catalog-icon-mosaic" aria-hidden="true">{imgs}</span>'
    image = item.get("image")
    if image:
        return image_markup(image)
    return '<span class="catalog-media-skeleton" data-catalog-placeholder></span>'


def tool_logo_markup(tool_logos: list[dict]) -> str:
    if not tool_logos:
        return ""
    names = ", ".join(t["name"] for t in tool_logos)
    items = "".join(
        f'<span role="listitem" title="{escape(t["name"])}"><img src="../assets/software-logos/{escape(t["asset"])}" alt="" width="28" height="28" loading="lazy" decoding="async"></span>'
        for t in tool_logos
    )
    return f'<div class="case-logo-row" role="list" aria-label="{escape(names)}">{items}</div>'


def card_markup(item: dict, category_label: str) -> str:
    url = prototype_url(item)
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


def build_list_html(items: list[dict], labels: dict[str, str] = SECTION_LABELS_ES) -> tuple[str, int]:
    cards = []
    for item in items:
        category = item["categories"][0]
        label = labels.get(category, labels["all"])
        cards.append(card_markup(item, label))
    return "".join(cards), len(items)


def english_list_html() -> str:
    """Static English cards for prototype-amazon/catalog-en.html (see build_english_hubs.cjs)."""
    items = [item for item in json.loads(DATA_PATH.read_text(encoding="utf-8")) if item.get("lang") == "en"]
    return build_list_html(items, SECTION_LABELS_EN)[0]


def build_sitemap_urls(items: list[dict]) -> list[str]:
    seen = set(FIXED_PAGES)
    urls = list(FIXED_PAGES)
    for item in items:
        path = prototype_url(item)
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


def sync_viewer_redirects(items: list[dict], check_only: bool) -> bool:
    """Keep the edge's exact list of recognized legacy links in sync with the catalog."""
    keys = sorted({re.sub(r"-(?:es|en)\.html$", "", item["url"]) for item in items})
    pattern = r"^(?:\.\./|\./|/)?(?<article>(?:" + "|".join(map(re.escape, keys)) + "))-"
    config = VERCEL_CONFIG.read_text(encoding="utf-8")
    updated = config
    for suffix, location in [(r"(?:es|en)\.html$", "/$article-en.html"), (r"(?<locale>es|en)\.html$", "/$article-$locale.html")]:
        updated, count = re.subn(
            r'("key": "source", "value": )"(?:[^"\\]|\\.)*"(?=[^\n]*"Location": "' + re.escape(location) + r'")',
            lambda match: match[1] + json.dumps(pattern + suffix),
            updated,
        )
        if count != 1:
            raise ValueError(f"Expected one legacy redirect for {location}, found {count}")
    if updated == config:
        return True
    if not check_only:
        VERCEL_CONFIG.write_text(updated, encoding="utf-8", newline="\n")
    return False


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

    sitemap_ok = sync_sitemap(all_items, check_only)
    redirects_ok = sync_viewer_redirects(all_items, check_only)
    catalog_changed = updated != html

    if check_only:
        ok = True
        if catalog_changed:
            print("prototype-amazon/catalog.html is stale; run scripts/build_catalog_static.py.")
            ok = False
        if not sitemap_ok:
            print("prototype-amazon/sitemap.xml is stale; run scripts/build_catalog_static.py.")
            ok = False
        if not redirects_ok:
            print("The viewer redirects in vercel.json are stale; run scripts/build_catalog_static.py.")
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

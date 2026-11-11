"""Refresh search-index.json entries for specific pages (Python port of build-search-index.ps1).

    python scripts/update_search_index.py trabajo-con-claude-en.html trabajo-con-claude-es.html

Entries for the given pages are rebuilt in place (or appended); all other entries are kept as they are.
"""
from __future__ import annotations

import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def text(value: str) -> str:
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', value))).strip()


def entry(relative: str, tool_catalog: dict) -> dict:
    source = (ROOT / relative).read_text(encoding='utf-8')
    lang = 'es' if relative.endswith('-es.html') else 'en'
    title_match = re.search(r'<title[^>]*>([\s\S]*?)</title>', source, re.I)
    title = re.sub(r'\s*[|–-]\s*Mat.as Gaglio.*$', '', text(title_match.group(1)) if title_match else '', flags=re.I)
    description = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']*)', source, re.I)
    keywords = re.search(r'<meta\s+name=["\']keywords["\']\s+content=["\']([^"\']*)', source, re.I)
    image = re.search(r'<meta\s+(?:property|name)=["\']og:image["\']\s+content=["\']([^"\']+)', source, re.I) \
        or re.search(r'<img[^>]+src=["\']([^"\']+)', source, re.I)
    headings = [text(match) for match in re.findall(r'<h[1-3][^>]*>([\s\S]*?)</h[1-3]>', source, re.I)]
    body = re.sub(r'<(script|style|svg|header|footer|nav)[^>]*>[\s\S]*?</\1>', ' ', source, flags=re.I)
    content = text(re.sub(r'<!--[\s\S]*?-->', ' ', body))[:30000]
    case_name = re.sub(r'-(en|es)(?=\.html$)', '', Path(relative).name).lower()
    tools = [tool_catalog['tools'][key]['name'] for key in tool_catalog['cases'].get(case_name, [])]
    meta_keywords = text(keywords.group(1)) if keywords else ''
    return {
        'title': title or (headings[0] if headings else Path(relative).stem),
        'description': text(description.group(1)) if description else '',
        'keywords': (meta_keywords + ' ' + ' '.join(headings) + ' ' + ' '.join(tools)).strip(),
        'tools': tools[0] if len(tools) == 1 else tools,
        'content': content,
        'lang': lang,
        'url': relative,
        'image': html.unescape(image.group(1)) if image else '',
    }


def main(pages: list[str]) -> None:
    tool_catalog = json.loads((ROOT / 'content/case-tools.json').read_text(encoding='utf-8'))
    path = ROOT / 'search-index.json'
    index = json.loads(path.read_text(encoding='utf-8'))
    for page in pages:
        fresh = entry(page, tool_catalog)
        positions = [i for i, item in enumerate(index) if item.get('url') == page]
        if positions:
            index[positions[0]] = fresh
        else:
            index.append(fresh)
    path.write_text(json.dumps(index, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'Refreshed {len(pages)} search entries.')


if __name__ == '__main__':
    main(sys.argv[1:])

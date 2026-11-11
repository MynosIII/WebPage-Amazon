"""Build the bilingual articles about work done with Claude and register them across the site.

Writes each article page, then updates the tool lookup, catalog data, article listings,
search index and language catalog. Re-running is idempotent.

    python scripts/add_claude_articles.py
    python scripts/build_catalog_static.py
"""
from __future__ import annotations

import json
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from claude_articles_content import ARTICLES, PUBLISHED  # noqa: E402
from update_search_index import entry as search_entry  # noqa: E402

SITE = 'https://matiasgaglio.com'
TEMPLATE = 'predestinato-simulador-carrera'

NEW_TOOLS = {
    'claude': {'name': 'Claude', 'asset': 'claude.svg', 'aliases': ['Claude', 'Claude Code', 'Anthropic Claude']},
    'github': {'name': 'GitHub', 'asset': 'github.svg', 'aliases': ['GitHub', 'GitHub Actions']},
    'vercel': {'name': 'Vercel', 'asset': 'vercel.svg', 'aliases': ['Vercel']},
    'nextjs': {'name': 'Next.js', 'asset': 'nextjs.svg', 'aliases': ['Next.js', 'NextJS']},
    'google-drive': {'name': 'Google Drive', 'asset': 'google-drive.svg', 'aliases': ['Google Drive']},
    'canva': {'name': 'Canva', 'asset': 'canva.svg', 'aliases': ['Canva']},
    'ffmpeg': {'name': 'FFmpeg', 'asset': 'ffmpeg.svg', 'aliases': ['FFmpeg']},
    'obs-studio': {'name': 'OBS Studio', 'asset': 'obs-studio.svg', 'aliases': ['OBS Studio', 'OBS']},
    'audacity': {'name': 'Audacity', 'asset': 'audacity.svg', 'aliases': ['Audacity']},
}

UI = {
    'es': {'read_other': 'Read in English', 'tags_label': 'Software y etiquetas', 'tags_title': 'Herramientas y temas de este artículo.',
           'software': 'Software usado o relacionado', 'topics': 'Temas', 'articles': 'Artículos', 'locale': 'es_AR', 'date': '11/11/2026'},
    'en': {'read_other': 'Leer en español', 'tags_label': 'Software and tags', 'tags_title': 'Tools and topics in this article.',
           'software': 'Software used or related', 'topics': 'Topics', 'articles': 'Articles', 'locale': 'en_US', 'date': '11/11/2026'},
}


def render_block(block: tuple) -> str:
    kind = block[0]
    if kind == 'p':
        return f'<p>{escape(block[1])}</p>'
    if kind == 'facts':
        return '<div class="pa-facts">' + ''.join(f'<div class="pa-fact"><strong>{escape(v)}</strong><span>{escape(t)}</span></div>' for v, t in block[1]) + '</div>'
    if kind == 'cards':
        return '<div class="pa-grid">' + ''.join(f'<article class="pa-card"><b>{escape(e)}</b><h3>{escape(t)}</h3><p>{escape(x)}</p></article>' for e, t, x in block[1]) + '</div>'
    if kind == 'flow':
        return '<div class="pa-flow">' + ''.join(f'<article><h3>{escape(t)}</h3><p>{escape(x)}</p></article>' for t, x in block[1]) + '</div>'
    if kind == 'list':
        return '<ul class="pa-limit-list">' + ''.join(f'<li><strong>{escape(lead)}</strong> {escape(text)}</li>' for lead, text in block[1]) + '</ul>'
    if kind == 'callout':
        return f'<div class="pa-callout pa-callout--red"><strong>{escape(block[1])}</strong> {escape(block[2])}</div>'
    if kind == 'table':
        _, caption, headers, rows = block
        head = ''.join(f'<th scope="col">{escape(h)}</th>' for h in headers)
        body = ''.join('<tr>' + ''.join((f'<td><strong>{escape(c)}</strong></td>' if i == 0 else f'<td>{escape(c)}</td>') for i, c in enumerate(row)) + '</tr>' for row in rows)
        return f'<div class="pa-table-wrap" role="region" aria-label="{escape(caption, quote=True)}" tabindex="0"><table class="pa-table"><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>'
    if kind == 'figure':
        _, src, width, height, alt, caption = block
        return (f'<figure class="pa-figure pa-figure--inline"><img src="{escape(src, quote=True)}" width="{width}" height="{height}" alt="{escape(alt, quote=True)}" loading="lazy" decoding="async">'
                f'<figcaption>{escape(caption)}</figcaption></figure>')
    if kind == 'sources':
        items = []
        for href, title, note in block[1]:
            external = href.startswith('http')
            attrs = ' target="_blank" rel="noopener"' if external else ''
            items.append(f'<li><a href="{escape(href, quote=True)}"{attrs}><strong>{escape(title)}</strong><span>{escape(note)}</span></a></li>')
        return '<ul class="pa-source-list">' + ''.join(items) + '</ul>'
    raise ValueError(f'Unknown block type: {kind}')


def tags_section(lang: str, tool_names: list[str], keywords: list[str]) -> str:
    ui = UI[lang]
    tools = ''.join(f'<li>{escape(name)}</li>' for name in tool_names)
    topics = ''.join(f'<li>{escape(word)}</li>' for word in keywords if word not in tool_names)
    return (f'<section class="pa-section pa-tags-section"><div class="container"><span class="pa-label">{ui["tags_label"]}</span>'
            f'<h2>{ui["tags_title"]}</h2><h3>{ui["software"]}</h3><ul class="pa-tags" aria-label="{ui["software"]}">{tools}</ul>'
            f'<h3>{ui["topics"]}</h3><ul class="pa-tags pa-tags--topics" aria-label="{ui["topics"]}">{topics}</ul></div></section>')


def json_ld(lang: str, url: str, data: dict, cover: str, tool_names: list[str]) -> str:
    payload = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': data['title'],
        'description': data['deck'],
        'inLanguage': lang,
        'datePublished': PUBLISHED,
        'dateModified': PUBLISHED,
        'author': {'@type': 'Person', 'name': 'Matías Gaglio', 'url': f'{SITE}/sobre-mi-{lang}.html'},
        'image': f'{SITE}/{cover}',
        'mainEntityOfPage': f'{SITE}/{url}',
        'keywords': ', '.join(data['keywords']),
        'about': [{'@type': 'SoftwareApplication', 'name': name} for name in tool_names],
    }
    return '<script type="application/ld+json">' + json.dumps(payload, ensure_ascii=False) + '</script>'


def build_page(article: dict, lang: str, tool_catalog: dict) -> str:
    slug, cover = article['slug'], article['cover']
    data = article[lang]
    other = 'en' if lang == 'es' else 'es'
    url = f'{slug}-{lang}.html'
    tool_names = [tool_catalog['tools'][key]['name'] for key in article['tools']]
    source = (ROOT / f'{TEMPLATE}-{lang}.html').read_text(encoding='utf-8')
    head = source.split('<body')[0]
    head = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', '', head, flags=re.S)  # the template's own Article data
    head = re.sub(r'<title>.*?</title>', f'<title>{escape(data["title"])} | Matías Gaglio</title>', head)
    meta = [('description', data['deck']), ('keywords', ', '.join(data['keywords'])), ('og:title', data['title']),
            ('og:description', data['deck']), ('og:image', f'{SITE}/{cover}')]
    for key, value in meta:
        head = re.sub(r'(<meta (?:name|property)="' + re.escape(key) + r'" content=")[^"]*', lambda m: m[1] + escape(value, quote=True), head)
    head = head.replace(f'{TEMPLATE}-', f'{slug}-')
    head = head.replace('</head>', f'  <meta property="article:published_time" content="{PUBLISHED}">' + ''.join(
        f'<meta property="article:tag" content="{escape(word, quote=True)}">' for word in data['keywords']) + '\n  ' + json_ld(lang, url, data, cover, tool_names) + '\n</head>')
    nav = source[source.index('<header class="global-nav"'):source.index('<main')].replace(f'{TEMPLATE}-', f'{slug}-')
    body = (f'<main class="project-article"><article><header class="pa-hero"><div class="container"><span class="pa-kicker">{escape(data["kicker"])}</span>'
            f'<h1>{escape(data["title"])}</h1><p class="pa-deck">{escape(data["deck"])}</p>'
            f'<p>Matías Gaglio · <time datetime="{PUBLISHED}">{UI[lang]["date"]}</time></p>'
            f'<a href="{slug}-{other}.html" hreflang="{other}">{UI[lang]["read_other"]}</a></div></header>\n')
    for label, heading, blocks in data['sections']:
        body += (f'    <section class="pa-section"><div class="container"><span class="pa-label">{escape(label)}</span><h2>{escape(heading)}</h2>'
                 + ''.join(render_block(block) for block in blocks) + '</div></section>\n')
    body += '    ' + tags_section(lang, tool_names, data['keywords']) + '\n  </article></main>\n  '
    footer = source[source.index('<footer'):]
    return head + '<body class="project-article-page">\n  ' + nav + body + footer


def listing_card(url: str, label: str, title: str, description: str) -> str:
    return (f'<a class="article-card" href="{url}"><div class="article-card-body"><span class="article-meta">{escape(label)}</span>'
            f'<h3>{escape(title)}</h3><p>{escape(description)}</p></div></a>')


def main() -> None:
    tools_path = ROOT / 'content/case-tools.json'
    tool_catalog = json.loads(tools_path.read_text(encoding='utf-8'))
    for key, spec in NEW_TOOLS.items():
        tool_catalog['tools'].setdefault(key, spec)
    for article in ARTICLES:
        tool_catalog['cases'][f'{article["slug"]}.html'] = article['tools']
    tools_path.write_text(json.dumps(tool_catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    catalog_path = ROOT / 'prototype-amazon/catalog-data.json'
    catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
    search_path = ROOT / 'search-index.json'
    search = json.loads(search_path.read_text(encoding='utf-8'))
    lang_path = ROOT / 'language-catalog.json'
    lang_catalog = json.loads(lang_path.read_text(encoding='utf-8'))

    for article in ARTICLES:
        slug = article['slug']
        tool_names = [tool_catalog['tools'][key]['name'] for key in article['tools']]
        for lang in ('es', 'en'):
            data = article[lang]
            url = f'{slug}-{lang}.html'
            (ROOT / url).write_text(build_page(article, lang, tool_catalog), encoding='utf-8')
            keywords = ', '.join(data['keywords'])

            positions = [i for i, entry in enumerate(catalog) if entry.get('url') == url]
            catalog = [entry for entry in catalog if entry.get('url') != url]
            catalog.insert(positions[0] if positions else len(catalog), dict(title=data['title'], description=data['deck'], keywords=keywords, lang=lang, url=url,
                                staticArticle=True, categories=article['categories'], image=article['cover'], mediaFit='cover',
                                toolLogos=[dict(key=key, **tool_catalog['tools'][key]) for key in article['tools']]))

            positions = [i for i, entry in enumerate(search) if entry.get('url') == url]
            search = [entry for entry in search if entry.get('url') != url]
            search.insert(positions[0] if positions else len(search), search_entry(url, tool_catalog))

            for listing in [f'Articles-{lang}.html'] + (['Articles.html'] if lang == 'en' else []):
                path = ROOT / listing
                page = path.read_text(encoding='utf-8')
                if f'href="{url}"' not in page:
                    card = listing_card(url, data['kicker'], data['title'], data['deck'])
                    page = page.replace('<div class="articles-grid">', '<div class="articles-grid">\n' + card, 1)
                    path.write_text(page, encoding='utf-8')

        if not any(entry.get('page') == f'{slug}.html' for entry in lang_catalog['pages']):
            lang_catalog['pages'].append({'page': f'{slug}.html', 'sourceLanguage': 'es', 'english': f'{slug}-en.html',
                                          'spanish': f'{slug}-es.html', 'legacy': False})

    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    search_path.write_text(json.dumps(search, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    lang_path.write_text(json.dumps(lang_catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()

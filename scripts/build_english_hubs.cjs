#!/usr/bin/env node
/* Prerender the English home, about, catalog and contact pages.
 *
 * The Spanish hubs in prototype-amazon/ are the source of truth. English used to
 * exist only after i18n.js translated the page in the browser, so crawlers and
 * link previews saw Spanish <head> tags. This script applies the same glossary
 * at build time and writes prototype-amazon/<page>-en.html with English metadata,
 * self canonicals and hreflang pairs. It also keeps the hreflang tags of the
 * Spanish pages in sync.
 *
 * Run: node scripts/build_english_hubs.cjs [--check]
 */
'use strict';

const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const proto = path.join(root, 'prototype-amazon');
const SITE = (process.env.SITE_URL_SOURCE || 'https://matiasgaglio.vercel.app').replace(/\/$/, '');
const check = process.argv.includes('--check');

const pages = {
  index: {
    es: '/', en: '/index-en.html', locale: 'en_US',
    title: 'Matías Gaglio — Ecommerce & Amazon Growth Strategist',
    description: 'Ecommerce and Amazon Growth strategy: Business Intelligence, PPC and visual content to improve conversion and profitability.',
  },
  about: {
    es: '/about.html', en: '/about-en.html', locale: 'en_US',
    title: 'About — Matías Gaglio',
    description: 'Professional profile of Matías Gaglio: communication, ecommerce, Amazon Growth, Business Intelligence and performance.',
  },
  catalog: {
    es: '/catalog.html', en: '/catalog-en.html', locale: 'en_US',
    title: 'Work catalog — Matías Gaglio',
    description: 'Case studies, systems, research and creative work by Matías Gaglio.',
  },
  contact: {
    es: '/contact.html', en: '/contact-en.html', locale: 'en_US',
    title: 'Contact — Matías Gaglio',
    description: 'Contact Matías Gaglio about Amazon Growth, ecommerce, data and content projects.',
  },
};

function loadGlossary() {
  const source = fs.readFileSync(path.join(proto, 'i18n.js'), 'utf8');
  const take = (name) => {
    const match = source.match(new RegExp(`const ${name} = (\\{[\\s\\S]*?\\n  \\});`));
    if (!match) throw new Error(`i18n.js: ${name} not found`);
    return Function(`"use strict"; return (${match[1]});`)();
  };
  return { text: take('english'), attributes: take('attributeEnglish') };
}

const decode = (value) => value
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const encodeText = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const encodeAttr = (value) => encodeText(value).replace(/"/g, '&quot;');

const HUB_EN = { '': 'index-en.html', 'index.html': 'index-en.html', 'about.html': 'about-en.html', 'catalog.html': 'catalog-en.html', 'contact.html': 'contact-en.html' };

// Mirrors withLanguage() in i18n.js for links that point to English content.
function englishHref(href) {
  if (!href || /^(?:#|mailto:|tel:|https?:|data:|javascript:)/i.test(href)) return href;
  const url = new URL(href, 'https://site.invalid/prototype-amazon/index.html');
  const name = url.pathname.split('/').pop();
  const absolute = href.startsWith('/');
  const shape = () => (absolute ? url.pathname : href.startsWith('../') ? '../' + url.pathname.replace(/^\//, '') : name) + url.search + url.hash;
  if (/^\/(?:prototype-amazon\/)?[^/]*$/.test(url.pathname) && name in HUB_EN) {
    url.pathname = url.pathname.replace(/[^/]*$/, HUB_EN[name]);
    url.searchParams.delete('lang');
    return shape();
  }
  if (!/\.html$/i.test(name)) return href;
  if (/-es\.html$/i.test(name)) {
    url.pathname = url.pathname.replace(/-es\.html$/i, '-en.html');
    return shape();
  }
  const sourceValue = url.searchParams.get('source');
  if (sourceValue) {
    url.searchParams.set('source', sourceValue.replace(/-es(\.html)$/i, '-en$1'));
    url.searchParams.set('lang', 'en');
    return shape();
  }
  return href;
}

function translateBody(html, glossary) {
  // Split into tags and text, skipping <script>/<style> content.
  let output = '';
  let index = 0;
  const pattern = /<(script|style)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->|<[^>]+>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    output += translateText(html.slice(index, match.index), glossary);
    output += match[1] || match[0].startsWith('<!--') ? match[0] : translateTag(match[0], glossary);
    index = pattern.lastIndex;
  }
  return output + translateText(html.slice(index), glossary);
}

function translateText(text, glossary) {
  const trimmed = decode(text).replace(/\s+/g, ' ').trim();
  if (!trimmed || !glossary.text[trimmed]) return text;
  const lead = text.match(/^\s*/)[0];
  const tail = text.match(/\s*$/)[0];
  return lead + encodeText(glossary.text[trimmed]) + tail;
}

function translateTag(tag, glossary) {
  return tag.replace(/\s(aria-label|placeholder|title|alt|href|action|data-query)="([^"]*)"/g, (all, name, raw) => {
    const value = decode(raw);
    if (name === 'href' || name === 'action') return ` ${name}="${encodeAttr(englishHref(value))}"`;
    if (name === 'data-query') {
      const map = { 'conversión': 'conversion', 'rentabilidad': 'profitability', 'tráfico': 'traffic', 'contenido': 'content', 'automatización': 'automation' };
      return map[value] ? ` ${name}="${map[value]}"` : all;
    }
    const english = glossary.attributes[value] || glossary.text[value];
    return english ? ` ${name}="${encodeAttr(english)}"` : all;
  });
}

// Swap the static Spanish result cards for the English ones.
function englishCatalog(body) {
  const cards = execFileSync('python3', ['-c', 'import build_catalog_static as b; print(b.english_list_html(), end="")'], { cwd: __dirname, encoding: 'utf8' });
  const count = (cards.match(/<article class="catalog-result"/g) || []).length;
  return body
    .replace(/(<!-- STATIC_CATALOG_START -->)[\s\S]*?(<!-- STATIC_CATALOG_END -->)/, (_, start, end) => start + cards + end)
    .replace(/(<p role="status" aria-live="polite" data-catalog-count>)[^<]*(<\/p>)/, `$1${count === 1 ? '1 result' : count + ' results'}$2`);
}

function setMeta(head, selector, value) {
  const [attr, key] = selector;
  const pattern = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  if (!pattern.test(head)) return head;
  return head.replace(pattern, `$1${encodeAttr(value)}$2`);
}

function alternates(page) {
  return [
    `  <link rel="alternate" hreflang="es" href="${SITE}${page.es}">`,
    `  <link rel="alternate" hreflang="en" href="${SITE}${page.en}">`,
    `  <link rel="alternate" hreflang="x-default" href="${SITE}${page.es}">`,
  ].join('\n');
}

function withAlternates(head, page) {
  const cleaned = head.replace(/\n\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*">/g, '');
  return cleaned.replace(/(\n\s*<link rel="canonical" href="[^"]*">)/, `$1\n${alternates(page)}`);
}

function buildEnglish(name, page, glossary) {
  const spanish = fs.readFileSync(path.join(proto, `${name}.html`), 'utf8').replace(/\r\n/g, '\n');
  const split = spanish.indexOf('</head>');
  let head = spanish.slice(0, split);
  let body = spanish.slice(split);

  head = head.replace('<html lang="es">', '<html lang="en">');
  head = withAlternates(head, page).replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${SITE}${page.en}$2`);
  head = head.replace(/<title>[^<]*<\/title>/, `<title>${encodeText(page.title)}</title>`);
  head = setMeta(head, ['name', 'description'], page.description);
  head = setMeta(head, ['property', 'og:title'], page.title);
  head = setMeta(head, ['property', 'og:description'], page.description);
  head = setMeta(head, ['property', 'og:url'], `${SITE}${page.en}`);
  head = setMeta(head, ['property', 'og:locale'], page.locale);
  head = setMeta(head, ['name', 'twitter:title'], page.title);
  head = setMeta(head, ['name', 'twitter:description'], page.description);
  head = head.replace(/"url":"[^"]*","name":"[^"]*"/, `"url":"${SITE}${page.en}","name":${JSON.stringify(page.title)}`);
  head = head.replace(/"inLanguage":"es[^"]*"/g, '"inLanguage":"en"');
  head = head.split(`"@id":"${SITE}/#profile-page"`).join(`"@id":"${SITE}${page.en}#profile-page"`);

  if (name === 'catalog') body = englishCatalog(body);
  body = translateBody(body, glossary);
  // The language switch on an English hub returns to its Spanish source.
  body = setLocale(body, page.es === '/' ? 'index.html' : page.es.slice(1), 'es');
  head = head.replace('<!doctype html>\n', `<!doctype html>\n<!-- Generated by scripts/build_english_hubs.cjs from ${name}.html. Do not edit. -->\n`);
  return head + body;
}

function setLocale(html, href, lang) {
  const label = lang === 'en' ? 'View in English' : 'Ver en español';
  return html.replace(/<a class="locale"[^>]*>[^<]*<\/a>/, `<a class="locale" href="${href}" hreflang="${lang}" lang="${lang}" aria-label="${label}">${lang.toUpperCase()}</a>`);
}

function syncSpanish(name, page) {
  const file = path.join(proto, `${name}.html`);
  const original = fs.readFileSync(file, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const normalized = original.replace(/\r\n/g, '\n');
  const split = normalized.indexOf('</head>');
  const body = setLocale(normalized.slice(split), `${name}-en.html`, 'en');
  const updated = (withAlternates(normalized.slice(0, split), page) + body).replace(/\n/g, eol);
  return { file, original, updated };
}

function main() {
  const glossary = loadGlossary();
  const stale = [];
  for (const [name, page] of Object.entries(pages)) {
    const outputs = [syncSpanish(name, page)];
    const target = path.join(proto, `${name}-en.html`);
    outputs.push({ file: target, original: fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : '', updated: buildEnglish(name, page, glossary) });
    for (const { file, original, updated } of outputs) {
      if (original === updated) continue;
      stale.push(path.relative(root, file));
      if (!check) fs.writeFileSync(file, updated);
    }
  }
  if (check && stale.length) {
    console.error(`English hubs are stale: ${stale.join(', ')}. Run node scripts/build_english_hubs.cjs.`);
    process.exit(1);
  }
  console.log(check ? 'English hubs are current.' : `English hubs written (${stale.length} file(s) changed).`);
}

if (require.main === module) main();
module.exports = { englishHref };

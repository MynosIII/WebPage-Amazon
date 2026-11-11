/* Package the public site and give catalog projects self-contained HTML for Vercel. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'portfolio-dist');
const marker = path.join(output, '.generated-portfolio');
// Set SITE_URL (for example in the Vercel project settings) to publish under another domain.
const canonicalOrigin = 'https://matiasgaglio.vercel.app';
const origin = (process.env.SITE_URL || canonicalOrigin).replace(/\/+$/, '');
const catalog = require('../prototype-amazon/catalog-data.json');
const publicDirectories = ['assets', 'Cases', 'creatives', 'New format', 'output/pdf', 'prototype-amazon', 'Revolution', 'vendor'];
const publicExtensions = /\.(?:css|glb|html|jpe?g|js|mp4|pdf|png|svg|txt|webmanifest|webp|xml)$/i;
const excluded = new Set(['anchor-test.html', 'revolution-test.html', 'debug.log', 'playwright.config.js', 'lighthouserc.json', 'package.json', 'package-lock.json', 'vercel.json']);
const publicData = ['content/case-tools.json', 'prototype-amazon/catalog-data.json', 'search-index.json'];

// Files that vercel.json always redirects or rewrites elsewhere would never be
// served, so leave them out of the deploy (legacy unsuffixed duplicates, the
// old root homepages). Routes with a `has` condition only match some requests.
const routes = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8')).routes;
function shadowedByRoute(relative) {
  if (!relative.endsWith('.html') || relative === '404.html') return false;
  const pathname = '/' + relative;
  return routes.some(route => route.src && !route.has && !route.continue && (route.status || route.dest)
    && new RegExp(route.src).test(pathname));
}

function copy(relative) {
  const target = path.join(output, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(root, relative), target);
}

function copyPublicDirectory(relative) {
  for (const entry of fs.readdirSync(path.join(root, relative), { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const child = path.join(relative, entry.name);
    if (entry.isDirectory()) copyPublicDirectory(child);
    else if (entry.isFile() && publicExtensions.test(entry.name) && !shadowedByRoute(child.split(path.sep).join("/"))) copy(child);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

function url(relative) {
  return origin + '/' + relative.split('/').map(encodeURIComponent).join('/');
}

function discoveryHead(html, item, pair) {
  const canonical = url(item.url);
  const image = url(item.image && !item.image.endsWith('.svg') ? item.image : 'prototype-amazon/og-card.png');
  const tags = [
    `<link rel="canonical" href="${canonical}">`,
    ...['es', 'en', 'x-default'].map(lang =>
      `<link rel="alternate" hreflang="${lang}" href="${url(pair[lang === 'x-default' ? 'es' : lang])}">`),
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta name="twitter:image" content="${image}">`
  ];
  for (const [name, value] of [
    ['og:title', item.title], ['og:description', item.description],
    ['twitter:title', item.title], ['twitter:description', item.description]
  ]) {
    tags.push(`<meta ${name.startsWith('og:') ? 'property' : 'name'}="${name}" content="${escapeHtml(value)}">`);
  }
  return html.replace(/<head\b[^>]*>[\s\S]*?<\/head>/i, head => {
    const clean = head
      .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, '')
      .replace(/<link\b(?=[^>]*\brel=["']alternate["'])(?=[^>]*\bhreflang=)[^>]*>/gi, '')
      .replace(/<meta\b[^>]*\b(?:name|property)=["'](?:og:(?:url|image(?::[^"']+)?|title|description)|twitter:(?:image|title|description))["'][^>]*>/gi, '');
    return clean.replace(/<\/head>/i, '\n  ' + tags.join('\n  ') + '\n</head>');
  });
}

function readVideoData(lang) {
  const filename = path.join(root, `ecommerce-video-case-data-${lang}.js`);
  const window = {};
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), { window }, { filename, timeout: 1000 });
  return window.ecommerceVideoCases;
}

function renderVideoCase(html, number, lang, data) {
  if (data.source !== `rollator-conversion-${number}.mp4`) throw new Error(`Unexpected video source: ${data.source}`);
  const setText = (input, attribute, text) => input.replace(
    new RegExp(`(<([a-z0-9]+)\\b[^>]*\\b${attribute}[^>]*>)[\\s\\S]*?(</\\2>)`, 'i'),
    (_match, open, tag, close) => open + escapeHtml(text) + close
  );
  const notes = data.notes.map(([heading, body], index) =>
    `<article><b>${String(index + 1).padStart(2, '0')}</b><h3>${escapeHtml(heading)}</h3><p>${escapeHtml(body)}</p></article>`
  ).join('');
  const skills = data.skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join('');
  const label = lang === 'es' ? 'Video de conversión' : 'Conversion video';
  html = setText(html, 'data-case-eyebrow', `${label} ${number} · ${data.eyebrow} · ${data.duration}`);
  html = setText(html, 'data-case-title', data.title);
  html = setText(html, 'data-case-lead', data.lead);
  return html
    .replace(/(<title>)[\s\S]*?(<\/title>)/i, (_, open, close) => open + escapeHtml(data.title + ' | Matías Gaglio') + close)
    .replace(/(<div class="animation-skill-list">)[\s\S]*?(<\/div>)/, (_, open, close) => open + skills + close)
    .replace(/(<h2>)[\s\S]*?(<\/h2>)/, (_, open, close) => open + escapeHtml(data.breakdownTitle) + close)
    .replace(/(<div class="animation-notes" data-case-notes>)<\/div>/, (_, open) => open + notes + '</div>')
    .replace(/(<video\b[^>]*\bdata-case-video\b[^>]*?)>[\s\S]*?<\/video>/i, (_, opening) => {
      const tag = opening.replace(/\s(?:autoplay|muted)(?=\s|$)/gi, '');
      return `${tag} aria-label="${escapeHtml(data.media)}" preload="none" poster="/assets/rollator-conversion-${number}-poster.jpg"><source src="/creatives/ecommerce-video/${data.source}" type="video/mp4"></video>`;
    })
    .replace(/<script\b[^>]*\bsrc="ecommerce-video-(?:case-data|page)-(?:es|en)\.js"[^>]*><\/script>/gi, '');
}

const bookingUrl = 'https://calendar.app.google/UyiMPukNRaHi2HhD7';
const contactEmail = 'matiasignaciogaglio@gmail.com';
const nextStepCopy = {
  es: { label: 'Siguiente paso', title: '¿Querés aplicar este enfoque en tu marca o equipo?', body: 'Agendá una llamada de 30 minutos, revisá mi CV o escribime.', book: 'Agendar una reunión', cv: 'Ver CV', more: 'Explorar más trabajo' },
  en: { label: 'Next step', title: 'Want to apply this approach to your brand or team?', body: 'Book a 30-minute call, review my CV or email me.', book: 'Book a call', cv: 'View CV', more: 'Explore more work' }
};

// Every case ends with the same next step: booking, CV and email.
function nextStep(html, lang) {
  if (html.includes('data-case-next-step')) return html;
  const copy = nextStepCopy[lang];
  const catalogHref = lang === 'en' ? '/catalog-en.html?section=all' : '/catalog.html?section=all';
  const block = `<section class="case-next-step" data-case-next-step aria-labelledby="case-next-step-title"><div class="case-next-step__inner">`
    + `<p class="case-next-step__label">${copy.label}</p><h2 id="case-next-step-title">${copy.title}</h2><p>${copy.body}</p>`
    + `<div class="case-next-step__actions"><a class="case-next-step__primary" href="${bookingUrl}">${copy.book}</a>`
    + `<a href="/cv-${lang}.html">${copy.cv}</a><a href="mailto:${contactEmail}">${contactEmail}</a><a href="${catalogHref}">${copy.more}</a></div>`
    + `</div></section>`;
  return html.replace(/<\/main>/i, block + '</main>');
}

const sectionNames = {
  es: { ecommerce: 'Ecommerce y Amazon Growth', bi: 'Business Intelligence', creative: 'Creatividad y medios', articles: 'Sistemas y artículos', research: 'Investigación y análisis', other: 'Otros proyectos' },
  en: { ecommerce: 'Ecommerce and Amazon Growth', bi: 'Business Intelligence', creative: 'Creative and media', articles: 'Systems and articles', research: 'Research and analysis', other: 'Other projects' }
};

// Article + breadcrumb structured data for each case page.
function structuredData(html, item) {
  const section = item.categories?.[0] || 'all';
  const home = item.lang === 'en' ? `${canonicalOrigin}/index-en.html` : `${canonicalOrigin}/`;
  const catalogPage = `${canonicalOrigin}/${item.lang === 'en' ? 'catalog-en.html' : 'catalog.html'}`;
  const canonical = canonicalOrigin + '/' + item.url.split('/').map(encodeURIComponent).join('/');
  const image = item.image && !item.image.endsWith('.svg') ? item.image : 'prototype-amazon/og-card.png';
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${canonical}#article`,
        headline: item.title,
        description: item.description,
        inLanguage: item.lang,
        url: canonical,
        mainEntityOfPage: canonical,
        image: canonicalOrigin + '/' + image.split('/').map(encodeURIComponent).join('/'),
        author: { '@type': 'Person', '@id': `${canonicalOrigin}/#matias-gaglio`, name: 'Matías Gaglio', url: home },
        isPartOf: { '@type': 'WebSite', name: 'Matías Gaglio', url: `${canonicalOrigin}/` }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: item.lang === 'en' ? 'Home' : 'Inicio', item: home },
          { '@type': 'ListItem', position: 2, name: sectionNames[item.lang][section] || 'Portfolio', item: `${catalogPage}?section=${section}` },
          { '@type': 'ListItem', position: 3, name: item.title, item: canonical }
        ]
      }
    ]
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return html.replace(/<\/head>/i, `  <script type="application/ld+json" data-case-schema>${json}</script>\n</head>`);
}

function renderProjects() {
  const pairs = new Map();
  for (const item of catalog) {
    if (!/^(?:Cases\/)?[\w-]+-(?:es|en)\.html$/.test(item.url)) throw new Error(`Invalid case path: ${item.url}`);
    const key = item.url.replace(/-(?:es|en)\.html$/, '');
    const pair = pairs.get(key) || {};
    pair[item.lang] = item.url;
    pairs.set(key, pair);
  }
  const videoData = { es: readVideoData('es'), en: readVideoData('en') };
  for (const item of catalog) {
    const key = item.url.replace(/-(?:es|en)\.html$/, '');
    const pair = pairs.get(key);
    if (!pair.es || !pair.en) throw new Error(`Missing language for ${key}`);
    const target = path.join(output, item.url);
    let html = fs.readFileSync(target, 'utf8');
    const video = /^ecommerce-video-(\d+)$/.exec(key);
    if (video) html = renderVideoCase(html, video[1], item.lang, videoData[item.lang][video[1]]);
    if (key === 'ecommerce-video-case') {
      html = html.replace(/<video muted playsinline preload="metadata"([^>]*><source src="creatives\/ecommerce-video\/(rollator-conversion-\d+)\.mp4")/g,
        (_, rest, clip) => `<video muted playsinline preload="none" poster="/assets/${clip}-poster.jpg"${rest}`);
    }
    if (key === 'caso-1') {
      // Old links used this fragment on the featured case wrapper.
      html = html.replace(/(<section\b[^>]*)(aria-labelledby="results-title")/, '$1id="workspace" $2');
    }
    if (!/<h1\b[^>]*>\s*[^<\s]|<h1\b[^>]*>\s*<(?:em|span|strong)\b/i.test(html)) {
      throw new Error(`No static heading in ${item.url}`);
    }
    fs.writeFileSync(target, structuredData(discoveryHead(nextStep(html, item.lang), item, pair), item));
  }
  console.log(`Prepared ${catalog.length} case pages in ${pairs.size} bilingual pairs.`);
}

function* textFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* textFiles(child);
    else if (/\.(?:html|json|txt|webmanifest|xml)$/i.test(entry.name)) yield child;
  }
}

// Add <lastmod> from the last commit that touched each page's source file.
// A shallow clone or a build without git history would give wrong dates, so
// the sitemap then ships without them.
function addSitemapDates() {
  const { execFileSync } = require('node:child_process');
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  try {
    if (git('rev-parse', '--is-shallow-repository') !== 'false') return;
  } catch {
    return;
  }
  const sitemap = path.join(output, 'prototype-amazon', 'sitemap.xml');
  const source = (pathname) => {
    if (pathname === '/') return 'prototype-amazon/index.html';
    const relative = decodeURIComponent(pathname.slice(1));
    return fs.existsSync(path.join(root, 'prototype-amazon', relative)) && !relative.includes('/') ? `prototype-amazon/${relative}` : relative;
  };
  const xml = fs.readFileSync(sitemap, 'utf8').replace(/<url><loc>([^<]+)<\/loc><\/url>/g, (entry, loc) => {
    const file = source(new URL(loc).pathname);
    let date = '';
    try { date = git('log', '-1', '--format=%cs', '--', file); } catch { /* untracked */ }
    return date ? `<url><loc>${loc}</loc><lastmod>${date}</lastmod></url>` : entry;
  });
  fs.writeFileSync(sitemap, xml);
}

// Publish every absolute URL under one origin and refuse to ship the retired Render domain.
function finalizeOrigins() {
  const stale = [];
  for (const file of textFiles(output)) {
    let text = fs.readFileSync(file, 'utf8');
    if (origin !== canonicalOrigin && text.includes(canonicalOrigin)) {
      text = text.split(canonicalOrigin).join(origin);
      fs.writeFileSync(file, text);
    }
    if (text.includes('onrender.com')) stale.push(path.relative(output, file));
  }
  if (stale.length) throw new Error(`Retired onrender.com URLs found in: ${stale.slice(0, 10).join(', ')}`);
}

if (fs.existsSync(output)) {
  if (fs.realpathSync(output) !== output || path.dirname(output) !== root || !fs.existsSync(marker)) {
    throw new Error(`Refusing to replace unmanaged directory: ${output}`);
  }
  fs.rmSync(output, { recursive: true });
}
fs.mkdirSync(output);
fs.writeFileSync(marker, 'Generated by scripts/build_deploy.cjs.\n');
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (entry.isFile() && !excluded.has(entry.name) && publicExtensions.test(entry.name) && !shadowedByRoute(entry.name)) copy(entry.name);
}
for (const directory of publicDirectories) copyPublicDirectory(directory);
for (const relative of publicData) copy(relative);
renderProjects();
addSitemapDates();
finalizeOrigins();

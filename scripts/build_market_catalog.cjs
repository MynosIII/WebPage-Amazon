/* The original pages/search index remain the source of truth. Run against the
   local static server to rebuild lightweight catalog data and genuine UI previews. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const root = path.resolve(__dirname, '..');
const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:8765';
const canonical = value => value.replace(/-(es|en)(?=\.html$)/i, '').toLowerCase();
const categories = key => {
  if (/^cases\//.test(key)) return ['articles', 'ecommerce', ...(/dayparting|market-share|search-query|voice-of/.test(key) ? ['bi'] : [])];
  if (/amazon-content|amazon-lifecycle/.test(key)) return ['articles', 'ecommerce'];
  if (/^caso-2|^bi-case/.test(key)) return ['bi', 'ecommerce'];
  if (/^caso-1|^caso-daizzy|^caso-hogar/.test(key)) return ['ecommerce'];
  if (/^caso-3|animation|creative|ecommerce-video|icon-system|unimac/.test(key)) return ['creative'];
  if (/consultora|articulo-milei|documento/.test(key)) return ['research'];
  return ['other'];
};

// Catalog imagery is deliberately curated. Picking the first image in a page
// made utility screenshots, "before" assets and adjacent evidence look like
// project covers. Every entry below points to an original project asset or to
// a screenshot of the project's own UI.
const explicitCovers = {
  'animation-01.html': 'assets/social-edit-01-poster.jpg',
  'animation-02.html': 'assets/social-edit-02-poster.jpg',
  'animation-03.html': 'assets/social-edit-03-poster.jpg',
  'animation-04.html': 'assets/social-edit-04-poster.jpg',
  'bi-case-2.html': 'Revolution/KPI/Screenshot 2026-07-07 150233.png',
  'caso-1.html': 'Caso1_plot.jpeg',
  'caso-2.html': 'Caso2.jpeg',
  'caso-3.html': 'Revolution/New Style Images/61HEg-LnYyL._AC_SL1400_.jpg',
  'caso-daizzy-gear.html': 'image_060.png',
  'caso-hogar-cocina-ppc.html': '1783099763487.jpg',
  'ecommerce-video-01.html': 'assets/rollator-conversion-01-poster.jpg',
  'ecommerce-video-02.html': 'assets/rollator-conversion-02-poster.jpg',
  'ecommerce-video-03.html': 'assets/rollator-conversion-03-poster.jpg',
  'ecommerce-video-04.html': 'assets/rollator-conversion-04-poster.jpg',
  'ecommerce-video-05.html': 'assets/rollator-conversion-05-poster.jpg',
  'ecommerce-video-case.html': 'assets/rollator-conversion-04-poster.jpg',
  'icon-system-case.html': 'creatives/icons/corporate-system/heart-pulse-outline.png',
  'amazon-content-architecture.html': 'Revolution/EBC/New EBC/8fae7bda-deda-4ab8-b719-ba1de54ad308.__CR0,0,2021,1250_PT0_SX970_V1___.jpg',
  'amazon-lifecycle-operating-system.html': 'image_076.png',
  'revolution_creative_case.html': 'Revolution/New Style Images/61HEg-LnYyL._AC_SL1400_.jpg',
  'shulex-voc-creative-case.html': 'creatives/voc-bath-mat/04-size-fit.jpg',
  'unimac-case.html': 'creatives/flyers/unimac-heater/01-main-product.png',
  'cases/amazon-listing-audit-checklist.html': 'Revolution/New Style Images/61HEg-LnYyL._AC_SL1400_.jpg',
  'cases/automotive-fitment-seo.html': 'assets/fitment-compatibility-photo.jpg',
  'cases/dayparting-case.html': 'Cases/dayparting-dashboard.jpg',
  'cases/market-share-loss-diagnosis.html': 'Caso1_Sales.png',
  'cases/search-query-keyword-harvesting.html': 'image_060.png',
  'cases/search-suppression-catalog-recovery.html': 'assets/catalog-recovery-product-photo-1600.jpg',
  'cases/voice-of-customer-conversion-brief.html': 'creatives/voc-bath-mat/04-size-fit.jpg'
};

const explicitCoverSets = {
  'icon-system-case.html': [
    'creatives/icons/corporate-system/heart-pulse-outline.png',
    'creatives/icons/corporate-system/lightweight-outline.png',
    'creatives/icons/corporate-system/machine-washable1-outline.png',
    'creatives/icons/corporate-system/wheelchair.png',
    'creatives/icons/corporate-system/travel1.png',
    'creatives/icons/corporate-system/shield1-outline.png'
  ]
};

const captureSpecs = {
  'articulo-milei-chad.html': ['articulo-milei-chad-en.html', '.academic-detail-hero'],
  'consultora.html': ['consultora-en.html', '.chart-card'],
  'seo.html': ['SEO-en.html', 'main']
};

const coverFit = (key, image) => /(?:dashboard|kpi|caso1_plot|caso1_sales|caso2|image_060|image_076)/i.test(image)
  || /consultora/.test(key) ? 'contain' : 'cover';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const covers = { ...explicitCovers };
  const entries = JSON.parse(fs.readFileSync(path.join(root, 'search-index.json'), 'utf8'))
    .filter(item => !/^(index|sobre-mi|cv|contact|404|privacy|search|Articles-|ecommerce-(?:en|es)\.|otros-)/i.test(item.url))
    .filter(item => !/^(?:creatives|documento)-(?:en|es)\.html$/i.test(item.url));
  const previews = path.join(root, 'assets', 'catalog-previews');
  fs.mkdirSync(previews, { recursive: true });
  for (const [key, [source, selector]] of Object.entries(captureSpecs)) {
    await page.goto(`${base}/${source}`, { waitUntil: 'domcontentloaded' });
    const target = page.locator(selector).first();
    if (!await target.count()) throw new Error(`Missing cover selector ${selector} in ${source}`);
    await target.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    const name = key.replace(/\.html$/, '').replace(/[^a-z0-9-]/g, '-') + '.png';
    await target.screenshot({ path: path.join(previews, name), type: 'png' });
    covers[key] = `assets/catalog-previews/${name}`;
    console.log('Captured curated original UI:', key);
  }

  const toolCatalog = JSON.parse(fs.readFileSync(path.join(root, 'content', 'case-tools.json'), 'utf8'));
  const normalizedCaseTools = Object.fromEntries(Object.entries(toolCatalog.cases).map(([key, value]) => [key.toLowerCase(), value]));
  const aliases = new Map();
  Object.entries(toolCatalog.tools).forEach(([key, tool]) => [tool.name, ...(tool.aliases || [])].forEach(alias => aliases.set(alias.toLowerCase(), key)));
  const fallbackToolKeys = value => {
    const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[·,]/) : [];
    return [...new Set(values.map(name => aliases.get(String(name).trim().toLowerCase())).filter(Boolean))];
  };
  const manifest = entries.map(({ title, description, keywords, tools, lang, url }) => {
    const key = canonical(url);
    const image = covers[key];
    const stackKey = path.posix.basename(key).toLowerCase();
    const toolKeys = normalizedCaseTools[stackKey] || fallbackToolKeys(tools);
    return {
      title, description, keywords, lang, url,
      categories: categories(key),
      image,
      imageSet: explicitCoverSets[key] || undefined,
      mediaFit: coverFit(key, image || ''),
      toolLogos: toolKeys.map(toolKey => ({ key: toolKey, ...toolCatalog.tools[toolKey] }))
    };
  });
  if (manifest.some(item => !item.image)) throw new Error('Missing catalog cover');
  fs.writeFileSync(path.join(root, 'prototype-amazon', 'catalog-data.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Built ${manifest.length} localized entries; ${Object.keys(covers).length} original covers.`);
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });

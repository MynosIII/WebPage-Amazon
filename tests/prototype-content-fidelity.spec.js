const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

const utilityUrls = /^(index|sobre-mi|cv|contact|404|privacy|search)/;
const catalogEntries = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'search-index.json'), 'utf8'));

function normalize(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function wrapperPath(source, language) {
  const languageQuery = language === 'en' ? '?lang=en' : '';
  if (source === `caso-1-${language}.html`) return '/prototype-amazon/case-amazon-growth.html' + languageQuery;
  return '/prototype-amazon/page.html?source=' + encodeURIComponent('../' + source) + (language === 'en' ? '&lang=en' : '');
}

async function verifyLanguage(page, language) {
  test.setTimeout(360000);
  const failures = [];
  const entries = catalogEntries.filter(item => item.lang === language && !utilityUrls.test(item.url));

  for (const entry of entries) {
    await page.goto('/' + entry.url, { waitUntil: 'domcontentloaded' });
    // Some source pages populate their real case-study content from local assets.
    // Compare only after those original scripts have had the same time to settle
    // as the source copy inside the portfolio shell.
    await page.waitForTimeout(1800);
    const sourceMain = page.locator('main');
    if (!await sourceMain.count()) {
      failures.push(`${entry.url}: source has no main`);
      continue;
    }
    const sourceText = normalize(await sourceMain.innerText());
    const sourceMedia = await sourceMain.locator('img, video').count();
    const hasCanvas = await sourceMain.locator('canvas').count() > 0;

    await page.goto(wrapperPath(entry.url, language), { waitUntil: 'domcontentloaded' });
    const liveGallery = /^creatives-/.test(entry.url) || hasCanvas;
    const copiedMainLocator = liveGallery ? page.frameLocator('[data-source-live]').locator('main') : page.locator('[data-source-embed] main');
    await copiedMainLocator.waitFor({ state: 'attached', timeout: 10000 });
    await page.waitForTimeout(2200);
    const copiedText = normalize(await copiedMainLocator.innerText());
    const copiedMedia = await copiedMainLocator.locator('img, video').count();
    const brokenImages = await copiedMainLocator.locator('img').evaluateAll(async images => {
      await Promise.all(images.map(image => new Promise(resolve => {
        image.loading = 'eager';
        if (image.complete) return resolve();
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 10000);
      })));
      return images.filter(image => !image.complete || image.naturalWidth === 0).length;
    });
    const hostHeight = await page.locator(liveGallery ? '[data-source-live]' : '[data-source-embed]').evaluate(host => Math.round(host.getBoundingClientRect().height));
    const copiedHeight = await copiedMainLocator.evaluate(main => Math.round(main.getBoundingClientRect().height));

    if (copiedText !== sourceText) failures.push(`${entry.url}: text mismatch (${sourceText.length} source / ${copiedText.length} copy)`);
    if (copiedMedia !== sourceMedia) failures.push(`${entry.url}: media mismatch (${sourceMedia} source / ${copiedMedia} copy)`);
    if (brokenImages) failures.push(`${entry.url}: ${brokenImages} broken image(s)`);
    if (hostHeight + 3 < copiedHeight) failures.push(`${entry.url}: container cuts content (${hostHeight}px / ${copiedHeight}px)`);

    await page.setViewportSize({ width: 390, height: 844 });
    const mobileWidth = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth }));
    if (mobileWidth.content > mobileWidth.viewport + 1) failures.push(`${entry.url}: mobile horizontal overflow (${mobileWidth.content}px / ${mobileWidth.viewport}px)`);
    await page.setViewportSize({ width: 1280, height: 720 });
  }

  expect(failures, failures.join('\n')).toEqual([]);
}

test('all Spanish project pages preserve their complete source text and media', async ({ page }) => {
  await verifyLanguage(page, 'es');
});

test('all English project pages preserve their complete source text and media', async ({ page }) => {
  await verifyLanguage(page, 'en');
});

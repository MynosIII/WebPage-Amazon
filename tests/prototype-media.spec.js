const { test, expect } = require('@playwright/test');

const widths = [390, 820, 1024, 1440];
const shellPages = [
  '/prototype-amazon/index.html',
  '/prototype-amazon/about.html',
  '/prototype-amazon/contact.html',
  '/prototype-amazon/catalog.html?section=all',
  '/404.html'
];

for (const width of widths) {
  test(`screen-native shell has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of shellPages) {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(900);
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(dimensions.scrollWidth, path).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    }
  });
}

test('catalog resolves every preview and uses lightweight original-video posters', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/prototype-amazon/catalog.html?section=all', { waitUntil: 'domcontentloaded' });
  await page.locator('.catalog-result').first().waitFor({ state: 'visible' });
  const cards = page.locator('.catalog-result');
  const total = await cards.count();

  for (let index = 0; index < total; index += 1) {
    await cards.nth(index).scrollIntoViewIfNeeded();
  }

  await expect(page.locator('[data-catalog-placeholder]')).toHaveCount(0, { timeout: 60000 });
  await expect(page.locator('[data-source="ecommerce-video-01-es.html"] .catalog-result__media img')).toHaveAttribute('src', /rollator-conversion-01-poster\.jpg/);
  await expect(page.locator('[data-source="ecommerce-video-01-es.html"] video')).toHaveCount(0);
  const brokenImages = await page.locator('.catalog-result img').evaluateAll((images) => images.filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.src));
  expect(brokenImages).toEqual([]);
});

test('priority images load, preserve their natural ratio and settle their UI state', async ({ page }) => {
  await page.goto('/prototype-amazon/index.html', { waitUntil: 'networkidle' });
  const hero = page.locator('.sponsored-banner__media img');
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  await expect(page.locator('.sponsored-banner__media')).toHaveClass(/is-media-ready/);
  const metrics = await hero.evaluate((image) => ({ width: image.naturalWidth, height: image.naturalHeight }));
  expect(metrics.width).toBeGreaterThan(0);
  expect(metrics.height).toBeGreaterThan(0);
});

test('custom 404 stays inside the same UI in Spanish and English', async ({ page }) => {
  await page.goto('/404.html', { waitUntil: 'networkidle' });
  await expect(page.locator('body')).toHaveClass(/not-found-page/);
  await expect(page.locator('.market-header')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('No encontramos esta página.');

  await page.goto('/404.html?lang=en', { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('We could not find this page.');
  await expect(page.locator('.not-found-actions a').first()).toHaveAttribute('href', '/index.html?lang=en');
});

test('all conversion-video cases populate their original content and defer heavy playback', async ({ page }) => {
  test.setTimeout(90000);
  for (const language of ['es', 'en']) {
    for (let index = 1; index <= 5; index += 1) {
      const number = String(index).padStart(2, '0');
      await page.goto(`/prototype-amazon/page.html?source=../ecommerce-video-${number}-${language}.html${language === 'en' ? '&lang=en' : ''}`, { waitUntil: 'domcontentloaded' });
      const main = page.locator('[data-source-embed] main');
      await expect(main.locator('[data-case-notes] article')).toHaveCount(4);
      await expect(main.locator('[data-case-title]')).not.toHaveText('');
      const video = main.locator('video');
      await expect(video.locator('source')).toHaveAttribute('src', new RegExp(`rollator-conversion-${number}\\.mp4`));
      await expect(video).toHaveAttribute('poster', new RegExp(`rollator-conversion-${number}-poster\\.jpg`));
      await expect(video).toHaveAttribute('preload', 'none');
      await expect(video).not.toHaveAttribute('autoplay');
    }
  }
});

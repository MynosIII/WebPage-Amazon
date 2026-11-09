const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const bookingUrl = 'https://calendar.app.google/UyiMPukNRaHi2HhD7';

test('public aliases redirect and unknown pages return a real 404', async ({ request }) => {
  for (const [path, location] of [
    ['/index-es.html', '/'],
    ['/index-en.html', '/index.html?lang=en'],
    ['/prototype-amazon/', '/']
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    const destination = new URL(response.headers().location, response.url());
    expect(destination.pathname + destination.search).toBe(location);
  }
  const missing = await request.get('/deploy-check-not-a-page');
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain('not-found-page');
});

test('article URLs expose localized content and metadata without JavaScript', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    const base = (await request.get('/')).url();
    for (const lang of ['es', 'en']) {
      const url = new URL(`/telemetry-one-ecosistema-${lang}.html`, base);
      const redirect = await request.get('/page.html?source=..%2Ftelemetry-one-ecosistema-es.html&lang=' + lang, { maxRedirects: 0 });
      expect(redirect.status()).toBe(308);
      expect(new URL(redirect.headers().location, base).pathname).toBe(url.pathname);
      await page.goto(url.href);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('main h1')).toContainText(lang === 'es' ? 'ecosistema navegable' : 'navigable ecosystem');
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://matiasgaglio.vercel.app' + url.pathname);
      await expect(page.locator('link[hreflang="' + (lang === 'es' ? 'en' : 'es') + '"]')).toHaveCount(1);
    }
  } finally {
    await context.close();
  }
});

for (const lang of ['es', 'en']) {
  test(`public ${lang} home leads to catalog, case, CV and contact on mobile`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(lang === 'es' ? '/' : '/index-en.html');
    await expect(page.locator('html')).toHaveAttribute('lang', lang);
    await expect(page.locator('.market-header')).toBeVisible();
    const bookingLabel = lang === 'es' ? 'Agendar una reunión' : 'Book a call';
    await expect(page.locator('.sponsored-banner').getByRole('link', { name: bookingLabel })).toHaveAttribute('href', bookingUrl);
    await page.locator('[data-search-input]').fill('Amazon');
    await page.locator('[data-search-form] button[type="submit"]').click();
    await expect(page).toHaveURL(/\/catalog\.html\?/);
    await expect(page.locator('[data-catalog-list]')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.catalog-result').first()).toBeVisible();

    const query = lang === 'en' ? '?lang=en' : '';
    for (const path of ['/case-amazon-growth.html', '/about.html', '/contact.html']) {
      const response = await page.goto(path + query);
      expect(response.ok(), path).toBeTruthy();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('main h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
    }

    const contact = page.locator('.direct-contact');
    await expect(contact.getByRole('link', { name: bookingLabel })).toHaveAttribute('href', bookingUrl);
    await expect(contact.locator('a[href^="mailto:"]')).toBeVisible();
    await expect(page.locator('.load-progress')).toBeHidden();
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-reveal]'))
      .every(element => getComputedStyle(element).opacity === '1'));
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(({ impact }) => ['serious', 'critical'].includes(impact))).toEqual([]);

    const params = new URLSearchParams({ source: `/cv-${lang}.html` });
    if (lang === 'en') params.set('lang', 'en');
    await page.goto('/page.html?' + params);
    await expect(page.locator('[data-source-live]')).toBeVisible();
  });
}

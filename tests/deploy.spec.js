const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const catalog = require('../prototype-amazon/catalog-data.json');
const bookingUrl = 'https://calendar.app.google/UyiMPukNRaHi2HhD7';

test('public aliases redirect and unknown pages return a real 404', async ({ request }) => {
  for (const [path, location] of [
    ['/index-es.html', '/'],
    ['/index.html?lang=en', '/index-en.html'],
    ['/about.html?lang=en', '/about-en.html'],
    ['/catalog.html?section=bi&lang=en', '/catalog-en.html?section=bi'],
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

test('the sitemap lists indexable case pages in both languages', async ({ request }) => {
  test.setTimeout(90000);
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).not.toContain('page.html?source=');
  const canonicalOrigin = 'https://matiasgaglio.vercel.app';
  for (const item of catalog) {
    const pathname = '/' + item.url;
    const opposite = item.lang === 'es' ? 'en' : 'es';
    const sibling = pathname.replace(/-(?:es|en)\.html$/, '-' + opposite + '.html');
    const response = await request.get(pathname, { maxRedirects: 0 });
    expect(response.status(), pathname).toBe(200);
    const html = await response.text();
    expect(html, pathname).toMatch(/<h1\b[^>]*>\s*(?:[^<\s]|<(?:em|span|strong)\b)/i);
    expect(html, pathname).toContain(`<link rel="canonical" href="${canonicalOrigin}${pathname}">`);
    expect(html, pathname).toContain(`hreflang="${opposite}" href="${canonicalOrigin}${sibling}"`);
    expect(html, pathname).toMatch(/<meta\b[^>]*name="description"[^>]*content="[^"]+"/i);
    expect(html, pathname).toMatch(/<meta\b[^>]*property="og:description"[^>]*content="[^"]+"/i);
    expect(html, pathname).not.toMatch(/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i);
    expect(sitemap).toContain(`<loc>${canonicalOrigin}${pathname}</loc>`);
  }
});

test('previous project links resolve to the matching localized case', async ({ request }) => {
  for (const [path, destination] of [
    ['/case-amazon-growth.html', '/caso-1-es.html'],
    ['/case-amazon-growth.html?lang=en', '/caso-1-en.html'],
    ['/page.html?source=..%2FCases%2FDayParting-Case-es.html&lang=en', '/Cases/DayParting-Case-en.html'],
    ['/prototype-amazon/page.html?source=..%2Fecommerce-video-05-en.html', '/ecommerce-video-05-en.html']
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status(), path).toBe(308);
    expect(new URL(response.headers().location, response.url()).pathname).toBe(destination);
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
    for (const path of [`/caso-1-${lang}.html`, '/about.html', '/contact.html']) {
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

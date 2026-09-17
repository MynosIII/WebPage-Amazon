const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const viewports = [
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1000 }
];

for (const viewport of viewports) {
  test(`Amazon-style home and case remain stable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    for (const path of ['/prototype-amazon/index.html', '/prototype-amazon/case-amazon-growth.html']) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
      expect(await page.locator('img').evaluateAll(images => images.filter(image => image.complete && image.naturalWidth === 0).length)).toBe(0);
    }
  });
}

test('theme follows dark preference and remains explicitly switchable', async ({ page }) => {
  await page.goto('/prototype-amazon/index.html', { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const toggle = page.locator('[data-theme-toggle]');
  await expect(toggle).toHaveText(/Modo claro/);
  await toggle.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.goto('/prototype-amazon/about.html', { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('portfolio dropdown searches the full catalog instead of filtering featured cards', async ({ page }) => {
  await page.goto('/prototype-amazon/index.html', { waitUntil: 'networkidle' });
  await page.locator('[data-search-scope]').selectOption('bi');
  await page.locator('[data-search-form] button[type="submit"]').click();
  await expect(page).toHaveURL(/catalog\.html\?section=bi/);
  await expect(page.locator('[data-catalog-title]')).toHaveText('Business Intelligence');
  await expect(page.locator('[data-source="caso-2-es.html"]')).toBeVisible();
  expect(await page.locator('.catalog-result').count()).toBeGreaterThan(1);
});

test('new interface contains no removed positioning copy', async ({ page }) => {
  for (const path of ['/prototype-amazon/index.html', '/prototype-amazon/about.html', '/prototype-amazon/contact.html', '/prototype-amazon/case-amazon-growth.html']) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator(':root > body')).not.toContainText(/portfolio operativo|disponible para|freelance|consultor[ií]a|colaboraci[oó]n remota/i);
  }
});

test('creative catalog loads a poster from the original animation media', async ({ page }) => {
  await page.goto('/prototype-amazon/catalog.html?section=creative', { waitUntil: 'networkidle' });
  const animationCard = page.locator('[data-source="animation-01-es.html"]');
  await animationCard.scrollIntoViewIfNeeded();
  const preview = animationCard.locator('.catalog-result__media img');
  await expect(preview).toHaveCount(1);
  await expect(preview).toHaveAttribute('src', /social-edit-01-poster\.jpg/);
});

test('English switch keeps the Amazon interface and routes to English content', async ({ page }) => {
  await page.goto('/prototype-amazon/index.html', { waitUntil: 'networkidle' });
  await page.locator('.locale').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('body')).not.toHaveClass(/source-page/);
  await expect(page.locator('h1')).toHaveText('Data, media and content focused on profitability.');
  await expect(page.locator('.utility-nav')).toContainText('About');
  await expect(page.locator('.locale')).toHaveText('ES');

  await page.goto('/prototype-amazon/case-amazon-growth.html?lang=en', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-source-embed] h1')).toHaveText('Amazon Growth: media, listings and conversion as one system');
  await expect(page.locator('.locale')).toHaveAttribute('href', 'case-amazon-growth.html');
});

test('English catalog uses English source entries and media', async ({ page }) => {
  await page.goto('/prototype-amazon/catalog.html?section=creative&lang=en', { waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('[data-catalog-title]')).toHaveText('Creative and media');
  const animationCard = page.locator('[data-source="animation-01-en.html"]');
  await animationCard.scrollIntoViewIfNeeded();
  await expect(animationCard.locator('h3')).toContainText(/Neon Orbital Study/i);
  await expect(animationCard.locator('.catalog-result__media img')).toHaveAttribute('src', /social-edit-01-poster\.jpg/);
  await expect(animationCard.locator('a').last()).toHaveAttribute('href', /animation-01-en\.html.*lang=en/);
});

test('home, case, about and contact have no serious automated accessibility violations', async ({ page }) => {
  test.setTimeout(90000);
  for (const path of ['/prototype-amazon/index.html', '/prototype-amazon/case-amazon-growth.html', '/prototype-amazon/about.html', '/prototype-amazon/contact.html', '/prototype-amazon/index.html?lang=en', '/prototype-amazon/case-amazon-growth.html?lang=en', '/prototype-amazon/about.html?lang=en', '/prototype-amazon/contact.html?lang=en']) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.locator('.load-progress')).toBeHidden();
    await page.waitForFunction(() => Array.from(document.querySelectorAll('[data-reveal]')).every(element => element.classList.contains('is-visible') && Number(getComputedStyle(element).opacity) === 1));
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter(violation => ['serious', 'critical'].includes(violation.impact));
    expect(blocking, `${path}: ${blocking.map(item => item.id).join(', ')}`).toEqual([]);
  }
});

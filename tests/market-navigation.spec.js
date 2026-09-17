const { test, expect } = require('@playwright/test');
const manifest = require('../prototype-amazon/catalog-data.json');

test('English and Spanish categories expose identical projects and every entry has a specific cover', async ({ page, request }) => {
  test.setTimeout(120000);
  for (const section of ['all', 'ecommerce', 'bi', 'creative', 'research', 'articles', 'other']) {
    const sets = [];
    for (const lang of ['es', 'en']) {
      await page.goto(`/prototype-amazon/catalog.html?section=${section}&lang=${lang}`);
      await expect(page.locator('[data-catalog-list]')).toHaveAttribute('aria-busy', 'false');
      sets.push(await page.locator('.catalog-result').evaluateAll(cards => cards.map(card => card.dataset.source.replace(/-(?:es|en)(?=\.html$)/i, '')).sort()));
      await expect(page.locator('body')).not.toContainText('No se inventan proyectos');
    }
    expect(sets[0], section).toEqual(sets[1]);
    expect(sets[0].length, section).toBeGreaterThan(0);
  }
  for (const item of manifest.filter(item => item.lang === 'en')) {
    expect(item.image).not.toMatch(/og-card/);
    const response = await request.get('/' + item.image.replace(/\+/g, '%2B'));
    expect(response.ok(), item.image).toBeTruthy();
    expect(response.headers()['content-type'], item.image).toMatch(/^image\//);
  }
});

for (const lang of ['es', 'en']) {
  test(`homepage navigation and search open full catalogs in ${lang}`, async ({ page }) => {
    for (const section of ['ecommerce', 'bi', 'creative', 'other', 'research']) {
      await page.goto(`/prototype-amazon/index.html?lang=${lang}`);
      await page.locator(`.department-nav a[href*="section=${section}"]`).click();
      await expect(page).toHaveURL(new RegExp(`catalog.html\\?section=${section}`));
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('[data-catalog-list]')).toHaveAttribute('aria-busy', 'false');
    }
    await page.goto(`/prototype-amazon/index.html?lang=${lang}`);
    await page.locator('[data-search-input]').fill('Amazon');
    await page.locator('[data-search-form] button[type="submit"]').click();
    await expect(page.locator('[data-catalog-input]')).toHaveValue('Amazon');
    await expect(page.locator('[data-catalog-list]')).toHaveAttribute('aria-busy', 'false');
    expect(await page.locator('.catalog-result').count()).toBeGreaterThan(3);
    await page.locator('.locale').click();
    await expect(page.locator('[data-catalog-input]')).toHaveValue('Amazon');
  });
}

test('original tools carousel, brand links and account icons are present without a pause control', async ({ page }) => {
  for (const route of ['index', 'about']) {
    await page.goto(`/prototype-amazon/${route}.html?lang=en`);
    const carousel = page.locator('.market-tools');
    await expect(carousel).toBeVisible();
    await expect(carousel.locator('.market-tools__row')).toHaveCount(3);
    const logos = carousel.locator('.market-tools__group:not([aria-hidden]) img');
    expect(await logos.count()).toBe(29);
    expect(await logos.evaluateAll(imgs => imgs.filter(img => img.complete && !img.naturalWidth).map(img => img.src))).toEqual([]);
    await expect(carousel.locator('button')).toHaveCount(0);
    await expect(carousel.locator('.market-tools__group[aria-hidden="true"]')).toHaveCount(3);
  }
  await expect(page.locator('.account-card__icon svg')).toHaveCount(5);
  await page.goto('/prototype-amazon/contact.html?lang=en');
  await expect(page.locator('a[href*="github.com"] svg')).toHaveCount(1);
  await expect(page.locator('a[href*="linkedin.com"] svg')).toHaveCount(1);
  await expect(page.locator('.direct-contact a svg')).toHaveCount(1);
});

test('the same discovery header is used on every screen-native route', async ({ page }) => {
  const routes = ['index.html', 'about.html', 'contact.html', 'catalog.html?section=all', 'case-amazon-growth.html', 'page.html?source=../caso-2-en.html'];
  const expected = ['All work', 'Amazon Growth & PPC', 'Business Intelligence', 'Data-to-Creative', 'Systems & articles', 'Research', 'Automation & code'];
  for (const route of routes) {
    const joiner = route.includes('?') ? '&' : '?';
    await page.goto(`/prototype-amazon/${route}${joiner}lang=en`);
    await expect(page.locator('.department-nav__track a')).toHaveText(expected);
    await expect(page.locator('.search-scope option')).toHaveText(expected);
  }
});

test('catalog cards use curated covers and logo-only tool metadata', async ({ page }) => {
  await page.goto('/prototype-amazon/catalog.html?section=all&lang=en');
  await expect(page.locator('[data-catalog-list]')).toHaveAttribute('aria-busy', 'false');
  const fitment = page.locator('[data-source="Cases/automotive-fitment-seo-en.html"]');
  await expect(fitment.locator('.catalog-result__media img')).toHaveAttribute('src', /fitment-compatibility-photo\.jpg/);
  await expect(fitment.locator('.case-logo-row img')).toHaveCount(3);
  await expect(page.locator('[data-source="icon-system-case-en.html"] .catalog-icon-mosaic img')).toHaveCount(6);
  await expect(page.locator('.catalog-tools')).toHaveCount(0);
  await expect(page.locator('.catalog-result .result-action')).toHaveCount(0);
  await expect(page.locator('[data-source="documento-en.html"], [data-source="creatives-en.html"]')).toHaveCount(0);
});

test('case presentation follows the shared theme and back links retain English', async ({ page }) => {
  await page.goto('/prototype-amazon/page.html?source=../Cases/search-query-keyword-harvesting-en.html&lang=en');
  await expect(page.locator('[data-source-embed] main')).toBeVisible();
  const root = page.locator('[data-source-embed] html');
  await expect(root).toHaveAttribute('data-market-theme', 'dark');
  await page.locator('[data-theme-toggle]').click();
  await expect(root).toHaveAttribute('data-market-theme', 'light');
  const back = page.locator('[data-source-embed] a[href*="catalog.html?section=articles"]');
  await expect(back.first()).toHaveAttribute('href', /lang=en/);
  await back.first().click();
  await expect(page.locator('[data-catalog-title]')).toHaveText('Systems and articles');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('creative gallery keeps working filters, 3D controls and full responsive content', async ({ page }) => {
  test.setTimeout(90000);
  for (const lang of ['es', 'en']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/prototype-amazon/page.html?source=../creatives-${lang}.html&lang=${lang}`, { waitUntil: 'domcontentloaded' });
    const frame = page.frameLocator('[data-source-live]');
    await expect(frame.locator('h1')).toBeVisible();
    await expect(frame.locator('.filter-chip[data-filter="models-3d"]')).toBeVisible();
    // The live iframe starts at a small placeholder height while its styles and
    // media settle. Measure the expanded gallery, not that temporary height.
    await expect.poll(() => page.locator('[data-source-live]').evaluate(frame => frame.offsetHeight), { timeout: 15000 }).toBeGreaterThan(3000);
    const height = await page.locator('[data-source-live]').evaluate(frame => frame.offsetHeight);
    await frame.locator('.filter-chip[data-filter="models-3d"]').click();
    await expect(frame.locator('#video-editing')).toBeHidden();
    await expect(frame.locator('[id="3d-modeling"]')).toBeVisible();
    await expect.poll(() => page.locator('[data-source-live]').evaluate(frame => frame.offsetHeight)).toBeLessThan(height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
    await page.screenshot({ path: `tmp/gallery-${lang}-mobile.png` });
    await frame.locator('.filter-chip[data-filter="all"]').click();
    await expect(frame.locator('#video-editing')).toBeVisible();
    const mainHeight = await frame.locator('main').evaluate(main => main.offsetHeight);
    await expect.poll(() => page.locator('[data-source-live]').evaluate(frame => frame.offsetHeight)).toBeGreaterThanOrEqual(mainHeight);
  }
});

test('live charts and CV retain original content, media and controls', async ({ page }) => {
  test.setTimeout(120000);
  for (const lang of ['es', 'en']) {
    for (const name of ['BI-case-2', 'Revolution_creative_case', 'Cases/DayParting-Case', 'cv']) {
      const source = `${name}-${lang}.html`;
      await page.goto('/' + source, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const original = (await page.locator('main').innerText()).replace(/\s+/g, ' ').trim();
      const mediaCount = await page.locator('main img,main video').count();
      await page.goto(`/prototype-amazon/page.html?source=../${source}&lang=${lang}`, { waitUntil: 'domcontentloaded' });
      const frame = page.frameLocator('[data-source-live]');
      await expect(frame.locator('main')).toBeVisible();
      await page.waitForTimeout(1500);
      expect((await frame.locator('main').innerText()).replace(/\s+/g, ' ').trim(), source).toEqual(original);
      await expect(frame.locator('main img,main video')).toHaveCount(mediaCount);
      if (name === 'cv') {
        await frame.locator('[data-cv-expand]').click();
        await expect(frame.locator('[data-cv-expand]')).toHaveAttribute('aria-expanded', 'true');
        await expect(frame.locator('.cv-case:not([open])')).toHaveCount(0);
      } else {
        expect(await frame.locator('canvas').evaluateAll(canvases => canvases.every(canvas => canvas.width > 0 && canvas.height > 0))).toBeTruthy();
      }
      await page.setViewportSize({ width: 390, height: 844 });
      expect(await frame.locator('html').evaluate(root => root.scrollWidth <= root.clientWidth + 1), source).toBeTruthy();
      await page.setViewportSize({ width: 1280, height: 720 });
    }
  }
});

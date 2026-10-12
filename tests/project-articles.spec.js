const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const articles = [
  ['telemetry-one-ecosistema-es.html', 'De varios experimentos a un ecosistema navegable.', 3, 'Telemetry 1: ecosistema de Fórmula 1'],
  ['f1-predictor-walk-forward-es.html', 'Predecir antes de saber. Aprender después.', 1, 'F1Predictor: predicción walk-forward sin fuga de datos'],
  ['predestinato-simulador-carrera-es.html', 'Una vida deportiva hecha de decisiones conectadas.', 2, 'Predestinato: diseño de un simulador de carrera'],
  ['deteccion-copas-arboles-es.html', 'De un código postal a un mapa vivo del arbolado.', 1, 'Detección geoespacial de copas de árboles']
];

const englishArticles = [
  ['telemetry-one-ecosistema-en.html', 'From separate experiments to a navigable ecosystem.', 3, 'Telemetry 1: a Formula 1 ecosystem'],
  ['f1-predictor-walk-forward-en.html', 'Predict before knowing. Learn afterward.', 1, 'F1Predictor: leakage-free walk-forward prediction'],
  ['predestinato-simulador-carrera-en.html', 'A sporting life built from connected decisions.', 2, 'Predestinato: designing a career simulator'],
  ['deteccion-copas-arboles-en.html', 'From a ZIP code to a living tree map.', 1, 'Geospatial tree-crown detection']
];

const normalized = value => String(value || '').replace(/\s+/g, ' ').trim();

test('new Spanish project articles preserve text, media and responsive layout in the marketplace shell', async ({ page }) => {
  test.setTimeout(120000);
  const failures = [];

  for (const [source, heading, minimumImages] of articles) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/' + source, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__softwareStackReady === true, null, { timeout: 15000 });
    const sourceMain = page.locator('main');
    // Compare authored content rather than CSS-transformed presentation
    // (for example, an uppercase eyebrow in the standalone article).
    const sourceText = normalized(await sourceMain.locator(':scope > article').textContent());

    await page.goto('/prototype-amazon/page.html?source=' + encodeURIComponent('../' + source), { waitUntil: 'domcontentloaded' });
    const embeddedMain = page.locator('[data-source-embed] main');
    await embeddedMain.waitFor({ state: 'attached', timeout: 15000 });
    await embeddedMain.locator('.case-software-stack').waitFor({ state: 'attached', timeout: 15000 });
    await expect(embeddedMain.getByRole('heading', { level: 1 })).toContainText(heading);
    const embeddedText = normalized(await embeddedMain.locator(':scope > article').textContent());
    if (embeddedText !== sourceText) failures.push(`${source}: embedded text differs from source`);

    const images = embeddedMain.locator('img');
    if (await images.count() < minimumImages) failures.push(`${source}: expected at least ${minimumImages} images`);
    const broken = await images.evaluateAll(async nodes => {
      await Promise.all(nodes.map(node => new Promise(resolve => {
        node.loading = 'eager';
        if (node.complete) return resolve();
        node.addEventListener('load', resolve, { once: true });
        node.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 10000);
      })));
      return nodes.filter(node => !node.complete || node.naturalWidth === 0).length;
    });
    if (broken) failures.push(`${source}: ${broken} broken image(s)`);

    await page.setViewportSize({ width: 390, height: 844 });
    const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    if (widths[0] > widths[1] + 1) failures.push(`${source}: horizontal overflow ${widths[0]}/${widths[1]}`);
  }

  expect(failures, failures.join('\n')).toEqual([]);
});

test('Spanish article catalog exposes all four projects with real cover media', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/prototype-amazon/catalog.html?section=articles', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-catalog-list] article').first().waitFor({ state: 'visible' });

  for (const [, , , catalogTitle] of articles) {
    const titleLink = page.getByRole('link', { name: catalogTitle, exact: true }).last();
    await expect(titleLink).toBeVisible();
    const card = titleLink.locator('xpath=ancestor::article');
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('img').first();
    await expect(image).toBeVisible();
    await image.evaluate(node => { node.loading = 'eager'; });
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0), { timeout: 15000 }).toBe(true);
  }
});

test('English project articles preserve translated text, media and responsive layout in the marketplace shell', async ({ page }) => {
  test.setTimeout(120000);
  const failures = [];

  for (const [source, heading, minimumImages] of englishArticles) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/' + source, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__softwareStackReady === true, null, { timeout: 15000 });
    const sourceText = normalized(await page.locator('main > article').textContent());

    await page.goto('/prototype-amazon/page.html?source=' + encodeURIComponent('../' + source) + '&lang=en', { waitUntil: 'domcontentloaded' });
    const embeddedMain = page.locator('[data-source-embed] main');
    await embeddedMain.waitFor({ state: 'attached', timeout: 15000 });
    await embeddedMain.locator('.case-software-stack').waitFor({ state: 'attached', timeout: 15000 });
    await expect(embeddedMain.getByRole('heading', { level: 1 })).toContainText(heading);
    const embeddedText = normalized(await embeddedMain.locator(':scope > article').textContent());
    if (embeddedText !== sourceText) failures.push(`${source}: embedded text differs from source`);

    const images = embeddedMain.locator('img');
    if (await images.count() < minimumImages) failures.push(`${source}: expected at least ${minimumImages} images`);
    const broken = await images.evaluateAll(async nodes => {
      await Promise.all(nodes.map(node => new Promise(resolve => {
        node.loading = 'eager';
        if (node.complete) return resolve();
        node.addEventListener('load', resolve, { once: true });
        node.addEventListener('error', resolve, { once: true });
        setTimeout(resolve, 10000);
      })));
      return nodes.filter(node => !node.complete || node.naturalWidth === 0).length;
    });
    if (broken) failures.push(`${source}: ${broken} broken image(s)`);

    await page.setViewportSize({ width: 390, height: 844 });
    const widths = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
    if (widths[0] > widths[1] + 1) failures.push(`${source}: horizontal overflow ${widths[0]}/${widths[1]}`);
  }

  expect(failures, failures.join('\n')).toEqual([]);
});

test('English article catalog and All work expose the complete bilingual inventory', async ({ page }) => {
  test.setTimeout(120000);
  await page.goto('/prototype-amazon/catalog.html?section=articles&lang=en', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-catalog-list] article').first().waitFor({ state: 'visible' });

  for (const [, , , catalogTitle] of englishArticles) {
    const titleLink = page.getByRole('link', { name: catalogTitle, exact: true }).last();
    await expect(titleLink).toBeVisible();
    const image = titleLink.locator('xpath=ancestor::article').locator('img').first();
    await image.evaluate(node => { node.loading = 'eager'; });
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0), { timeout: 15000 }).toBe(true);
  }

  const allWork = page.locator('.catalog-filters a', { hasText: 'All work' });
  await expect(allWork).toBeVisible();
  await allWork.click();
  await expect(page).toHaveURL(/section=all/);
  await expect(page.locator('[data-catalog-list] article')).toHaveCount(36);
  await expect(page.locator('[data-catalog-count]')).toContainText('36');

  await page.goto('/prototype-amazon/catalog.html?section=all', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-catalog-list] article').first().waitFor({ state: 'visible' });
  await expect(page.locator('[data-catalog-list] article')).toHaveCount(36);
});

test('every catalog section filter returns the same bilingual inventory shape', async ({ page }) => {
  test.setTimeout(120000);
  const expected = { all: 36, ecommerce: 14, bi: 6, creative: 15, articles: 13, research: 5, other: 5 };
  for (const lang of ['es', 'en']) {
    for (const [section, count] of Object.entries(expected)) {
      await page.goto(`/prototype-amazon/catalog.html?section=${section}${lang === 'en' ? '&lang=en' : ''}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-catalog-list] article')).toHaveCount(count);
      await expect(page.locator('[data-catalog-count]')).toContainText(String(count));
    }
  }
});

test('tree detection case leads with the real 07042 result in both languages', async ({ page }) => {
  for (const [source, lang, count] of [
    ['deteccion-copas-arboles-es.html', 'es', '1.986'],
    ['deteccion-copas-arboles-en.html', 'en', '1,986']
  ]) {
    await page.goto(`/prototype-amazon/page.html?source=${encodeURIComponent('../' + source)}${lang === 'en' ? '&lang=en' : ''}`, { waitUntil: 'domcontentloaded' });
    const main = page.locator('[data-source-embed] main');
    await main.waitFor({ state: 'attached', timeout: 15000 });
    const resultImage = main.locator('img[src*="tree-crown-07042-results.webp"]');
    await expect(resultImage).toBeVisible();
    await expect.poll(() => resultImage.evaluate(image => image.complete && image.naturalWidth === 1920 && image.naturalHeight === 1080), { timeout: 15000 }).toBe(true);
    await expect(main).toContainText('07042');
    await expect(main).toContainText(count);
    await expect(main).not.toContainText('tree-crown-pipeline');
  }
});

test('dark marketplace routes keep readable text contrast', async ({ page }) => {
  test.setTimeout(120000);
  const failures = [];
  const routes = [
    '/prototype-amazon/index.html?lang=en',
    '/prototype-amazon/catalog.html?section=articles&lang=en',
    '/prototype-amazon/about.html?lang=en',
    ...englishArticles.map(([source]) => '/prototype-amazon/page.html?source=' + encodeURIComponent('../' + source) + '&lang=en')
  ];

  await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('mg-theme', 'dark'));
  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' });
    if (route.includes('page.html')) {
      await page.locator('[data-source-embed] main').waitFor({ state: 'attached', timeout: 15000 });
    } else if (route.includes('catalog.html')) {
      await page.locator('[data-catalog-list] article').first().waitFor({ state: 'visible', timeout: 15000 });
    }
    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
    for (const violation of results.violations) {
      for (const node of violation.nodes) failures.push(`${route}: ${node.target.join(' > ')} — ${node.failureSummary}`);
    }
  }

  expect(failures, failures.join('\n')).toEqual([]);
});

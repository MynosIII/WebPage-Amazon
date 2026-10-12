const { test, expect } = require('@playwright/test');

const articles = [
  ['telemetry-one-ecosistema-es.html', 'De varios experimentos a un ecosistema navegable.', 3, 'Telemetry 1: ecosistema de Fórmula 1'],
  ['f1-predictor-walk-forward-es.html', 'Predecir antes de saber. Aprender después.', 1, 'F1Predictor: predicción walk-forward sin fuga de datos'],
  ['predestinato-simulador-carrera-es.html', 'Una vida deportiva hecha de decisiones conectadas.', 2, 'Predestinato: diseño de un simulador de carrera'],
  ['deteccion-copas-arboles-es.html', 'De una imagen satelital a un mapa de copas.', 1, 'Detección geoespacial de copas de árboles']
];

const normalized = value => String(value || '').replace(/\s+/g, ' ').trim();

test('new Spanish project articles preserve text, media and responsive layout in the marketplace shell', async ({ page }) => {
  test.setTimeout(120000);
  const failures = [];

  for (const [source, heading, minimumImages] of articles) {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/' + source, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);
    const sourceMain = page.locator('main');
    // Compare authored content rather than CSS-transformed presentation
    // (for example, an uppercase eyebrow in the standalone article).
    const sourceText = normalized(await sourceMain.textContent());

    await page.goto('/prototype-amazon/page.html?source=' + encodeURIComponent('../' + source), { waitUntil: 'domcontentloaded' });
    const embeddedMain = page.locator('[data-source-embed] main');
    await embeddedMain.waitFor({ state: 'attached', timeout: 15000 });
    await expect(embeddedMain.getByRole('heading', { level: 1 })).toContainText(heading);
    const embeddedText = normalized(await embeddedMain.textContent());
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
  await page.goto('/prototype-amazon/catalog.html?section=articles', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-catalog-list] article').first().waitFor({ state: 'visible' });

  for (const [, , , catalogTitle] of articles) {
    const titleLink = page.getByRole('link', { name: catalogTitle, exact: true }).last();
    await expect(titleLink).toBeVisible();
    const card = titleLink.locator('xpath=ancestor::article');
    await card.scrollIntoViewIfNeeded();
    const image = card.locator('img').first();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate(node => node.complete && node.naturalWidth > 0)).toBe(true);
  }
});

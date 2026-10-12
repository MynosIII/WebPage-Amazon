const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'assets', 'project-articles');
fs.mkdirSync(output, { recursive: true });

async function settle(page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1800);
}

async function capture(page, name) {
  await page.screenshot({
    path: path.join(output, name),
    type: 'png',
    fullPage: false
  });
  console.log(`Captured ${name}`);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    locale: 'es-AR'
  });
  const page = await context.newPage();

  await page.goto('https://telemetry-1.vercel.app', { timeout: 60_000 });
  await settle(page);
  await capture(page, 'telemetry-home.png');

  await page.goto('https://telemetry-1.vercel.app/historia', { timeout: 60_000 });
  await settle(page);
  await capture(page, 'telemetry-history.png');

  await page.goto('https://telemetry-1.vercel.app/ranking', { timeout: 60_000 });
  await settle(page);
  await capture(page, 'telemetry-ranking.png');

  await page.goto('https://predestinato.vercel.app', { timeout: 60_000 });
  await settle(page);
  await capture(page, 'predestinato-home.png');

  await page.locator('#create-driver-button').click();
  await page.locator('#randomize-button').click();
  await page.waitForTimeout(500);
  await capture(page, 'predestinato-driver-setup.png');

  await browser.close();
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

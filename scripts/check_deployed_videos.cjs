const assert = require('node:assert/strict');
const { chromium, devices, expect } = require('@playwright/test');

const origin = new URL(process.env.PLAYWRIGHT_BASE_URL || 'https://matiasgaglio.vercel.app').origin;
const clips = ['01', '02', '03', '04', '05'];

async function checkByteRanges(number) {
  const url = `${origin}/creatives/ecommerce-video/rollator-conversion-${number}.mp4`;
  const response = await fetch(url, {
    headers: { Range: 'bytes=0-31' },
    signal: AbortSignal.timeout(15000)
  });
  try {
    assert.equal(response.status, 206, url);
    assert.match(response.headers.get('content-type') || '', /^video\/mp4\b/i, url);
    assert.match(response.headers.get('content-range') || '', /^bytes 0-31\/\d+$/, url);
  } finally {
    await response.body?.cancel();
  }
}

async function checkPlayer(page, number) {
  const source = encodeURIComponent(`../ecommerce-video-${number}-es.html`);
  const response = await page.goto(`${origin}/page.html?source=${source}`, { waitUntil: 'domcontentloaded' });
  assert.ok(response?.ok(), `Case page ${number} returned ${response?.status()}`);
  const video = page.locator('main video');
  await expect(video).toBeVisible({ timeout: 15000 });
  assert.equal(await video.evaluate(node => node.controls), true, 'The video needs visible playback controls');
  const duration = await video.evaluate(async node => {
    node.muted = true;
    await node.play();
    return node.duration;
  }, null, { timeout: 15000 });
  assert.ok(Number.isFinite(duration) && duration > 2, `Unexpected duration for video ${number}`);
  await expect.poll(() => video.evaluate(node => node.currentTime), { timeout: 10000 }).toBeGreaterThan(.2);
  const destination = duration * .7;
  await video.evaluate((node, time) => {
    node.pause();
    node.currentTime = time;
  }, destination);
  await expect.poll(() => video.evaluate((node, time) =>
    !node.seeking && Math.abs(node.currentTime - time) < .25 && node.readyState >= 2, destination),
  { timeout: 15000 }).toBe(true);
  const currentSrc = await video.evaluate(node => node.currentSrc);
  assert.equal(currentSrc, `${origin}/creatives/ecommerce-video/rollator-conversion-${number}.mp4`);
  return duration;
}

async function main() {
  await Promise.all(clips.map(checkByteRanges));
  console.log('All five video URLs support partial requests.');
  const browser = await chromium.launch();
  try {
    await Promise.all([
      ['desktop', { viewport: { width: 1440, height: 900 } }],
      ['mobile (Pixel 7 emulation)', devices['Pixel 7']]
    ].map(async ([label, options]) => {
      const context = await browser.newContext(options);
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        for (const number of clips) {
          const duration = await checkPlayer(page, number);
          console.log(`${label} / ${number}: played and seeked successfully (${duration.toFixed(1)}s).`);
        }
      } finally {
        await context.close();
      }
    }));
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

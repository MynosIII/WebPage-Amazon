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
  await video.evaluate(node => {
    node.muted = true;
    node.play().catch(error => { node.dataset.playbackFailure = error.message; });
  });
  try {
    await expect.poll(() => video.evaluate(node => node.currentTime), { timeout: 15000 }).toBeGreaterThan(.2);
  } catch (error) {
    const state = await video.evaluate(node => ({
      currentSrc: node.currentSrc, readyState: node.readyState, networkState: node.networkState,
      mediaError: node.error?.message, playError: node.dataset.playbackFailure
    }));
    throw new Error(`Video ${number} did not play: ${JSON.stringify(state)}`, { cause: error });
  }
  const duration = await video.evaluate(node => node.duration);
  assert.ok(Number.isFinite(duration) && duration > 2, `Unexpected duration for video ${number}`);
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
  await video.evaluate(node => { node.play().catch(() => {}); });
  await expect.poll(() => video.evaluate(node => node.currentTime), { timeout: 10000 }).toBeGreaterThan(destination + .1);
  return duration;
}

async function main() {
  await Promise.all(clips.map(checkByteRanges));
  console.log('All five video URLs support partial requests.');
  const browser = await chromium.launch();
  try {
    const failures = [];
    await Promise.all([
      ['desktop', { viewport: { width: 1440, height: 900 } }],
      ['mobile (Pixel 7 emulation)', devices['Pixel 7']]
    ].map(async ([label, options]) => {
      const context = await browser.newContext(options);
      try {
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        for (const number of clips) {
          try {
            const duration = await checkPlayer(page, number);
            console.log(`${label} / ${number}: played, seeked and resumed (${duration.toFixed(1)}s).`);
          } catch (error) {
            failures.push(error);
            console.error(`${label} / ${number}: ${error.message}`);
          }
        }
      } finally {
        await context.close();
      }
    }));
    if (failures.length) throw new Error(`${failures.length} playback checks failed.`);
  } finally {
    await browser.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

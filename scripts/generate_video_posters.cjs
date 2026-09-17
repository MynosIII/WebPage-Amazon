const { chromium } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });

  const sources = [
    ...Array.from({ length: 5 }, (_, index) => ({ folder: 'ecommerce-video', name: `rollator-conversion-${String(index + 1).padStart(2, '0')}` })),
    ...Array.from({ length: 4 }, (_, index) => ({ folder: path.join('videos', 'editing-reel'), name: `social-edit-${String(index + 1).padStart(2, '0')}` }))
  ];

  for (const source of sources) {
    const videoUrl = pathToFileURL(path.resolve('creatives', source.folder, `${source.name}.mp4`)).href;
    await page.goto(videoUrl, { waitUntil: 'domcontentloaded' });
    await page.addStyleTag({ content: '*{box-sizing:border-box}html,body{margin:0;background:#fff}video{display:block;width:960px!important;height:540px!important;object-fit:contain}' });
    const video = page.locator('video');
    const timing = await video.evaluate(async (element) => {
      await new Promise((resolve, reject) => {
        if (element.readyState >= 2) return resolve();
        element.addEventListener('loadeddata', resolve, { once: true });
        element.addEventListener('error', reject, { once: true });
        element.load();
      });
      element.currentTime = Math.max(.8, element.duration * .72);
      await new Promise((resolve) => element.addEventListener('seeked', resolve, { once: true }));
      element.controls = false;
      element.pause();
      return { duration: element.duration, target: element.currentTime };
    });
    console.log(`${source.name}: duration=${timing.duration.toFixed(2)}s target=${timing.target.toFixed(2)}s`);
    await page.mouse.move(0, 0);
    await video.screenshot({ path: path.join('assets', `${source.name}-poster.jpg`), type: 'jpeg', quality: 82 });
  }

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

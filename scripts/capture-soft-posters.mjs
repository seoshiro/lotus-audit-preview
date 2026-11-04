import { chromium } from '@playwright/test';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const [kind,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
    const page = await browser.newPage({ viewport:{width,height},reducedMotion:'reduce' });
    for (const [name,pose] of [['bud',0],['open',1]]) {
      await page.goto(`http://127.0.0.1:5318/soft-lotus.html?pose=${pose}`);
      await page.waitForFunction(value => document.querySelector('.soft-canvas')?.getAttribute('data-asset') === 'accepted' && document.querySelector('.soft-canvas')?.getAttribute('data-bloom') === value.toFixed(3), pose);
      await page.addStyleTag({ content: '.soft-header,.prototype-note,.scene-introduction,.petal-labels,.petal-preview,.scene-bottom,.scene-index,.scene-poster{visibility:hidden!important}' });
      await page.locator('.soft-stage').screenshot({ path:`public/models/soft-lotus-${name}-${kind}.png` });
    }
    await page.close();
  }
  console.log('Four same-model loading/fallback posters captured from actual WebGL scene.');
} finally { await browser.close(); }

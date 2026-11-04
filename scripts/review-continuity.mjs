import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const dir = 'evidence/lotus-continuity';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const width of [1440, 390]) for (const mode of ['calm', 'rapid', 'reading']) {
    const bytes = await fs.readFile(`${dir}/${mode}-${width}.webm`);
    const { marks } = JSON.parse(await fs.readFile(`${dir}/${mode}-${width}.json`, 'utf8'));
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.setContent(`<body style="margin:0;background:#eee;font:14px Arial"><video muted preload="auto" style="display:none" src="data:video/webm;base64,${bytes.toString('base64')}"></video><main style="display:grid;grid-template-columns:repeat(${width === 1440 ? 3 : 5},1fr);gap:3px"></main>`);
    const names = (mode === 'calm' ? ['catalog-open', 'catalog-close', 'reader-close', 'return-home'] : mode === 'reading' ? ['read-perch', 'back-perch', 'read-selvedge', 'read-forme', 'interrupted-reader'] : ['early-reader', 'project-reversals', 'catalog-reversals', 'home-reversal']).filter(name => !process.argv[2] || process.argv[2].split(',').includes(name));
    for (const name of names) {
      await page.evaluate(async ({ width, at, step }) => {
        const video = document.querySelector('video');
        if (video.readyState < 2) await new Promise(resolve => { video.onloadeddata = resolve; });
        video.pause(); document.querySelector('main').replaceChildren();
        for (let i = 0; i < 15; i++) {
          const time = Math.min(video.duration - .01, Math.max(.01, at - 1.2 + i * step));
          await new Promise(resolve => { video.onseeked = resolve; video.currentTime = time; });
          const canvas = document.createElement('canvas');
          canvas.width = width === 1440 ? 478 : 216; canvas.height = width === 1440 ? 299 : 467;
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
          const figure = document.createElement('figure'); figure.style = 'margin:0;background:white'; figure.append(canvas);
          const caption = document.createElement('figcaption'); caption.textContent = time.toFixed(2) + ' s'; figure.append(caption);
          document.querySelector('main').append(figure);
        }
      }, { width, at: marks.find(mark => mark.name === name).at, step: mode === 'rapid' ? .25 : mode === 'reading' ? .20 : .18 });
      await page.screenshot({ path: `${dir}/review-${mode}-${width}-${name}.png`, fullPage: true });
    }
    await page.close();
  }
} finally { await browser.close(); }

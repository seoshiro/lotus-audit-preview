import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base = process.argv[2] || 'http://127.0.0.1:5319/';
const dir = 'evidence/lotus-continuity';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }].filter(viewport => !process.argv[3] || viewport.width === Number(process.argv[3]))) {
    for (const mode of ['calm', 'rapid', 'reading']) {
      const mobile = viewport.width < 700;
      const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, recordVideo: { dir, size: viewport } });
      const page = await context.newPage();
      const started = Date.now(), marks = [];
      const mark = name => marks.push({ name, at: (Date.now() - started) / 1000 });
      const activate = selector => mobile ? page.locator(selector).tap() : page.locator(selector).click();
      const dismissCatalog = () => mobile ? activate('.work-browser-close') : page.keyboard.press('Escape');
      const dismissReader = () => mobile ? activate('.reader-top button') : page.keyboard.press('Escape');
      await page.goto(new URL('index.html?lang=ru', base).href);
      await page.waitForFunction(() => document.body.dataset.model === 'ready' && document.querySelector('.soft-canvas')?.dataset.animating === 'false');
      mark('ready'); await page.waitForTimeout(700);
      if (mode === 'calm') {
        mark('catalog-open'); await activate('#hero-work'); await page.waitForTimeout(1500);
        mark('catalog-close'); await dismissCatalog(); await page.waitForTimeout(1500);
        mark('select-perch'); await activate('#index-perch'); await page.waitForTimeout(1300);
        mark('reader-open'); await activate('#preview-case-perch'); await page.waitForTimeout(1500);
        mark('reader-close'); await dismissReader(); await page.waitForTimeout(1400);
        mark('return-home'); await activate('.preview-close'); await page.waitForTimeout(1600);
      } else if (mode === 'reading') {
        for (const id of ['perch', 'selvedge', 'forme']) {
          mark(`select-${id}`); await activate(`#index-${id}`); await page.waitForTimeout(1100);
          mark(`read-${id}`); await activate(`#preview-case-${id}`); await page.waitForTimeout(1600);
          mark(`back-${id}`); await dismissReader(); await page.waitForTimeout(1100);
        }
        mark('interrupted-reader'); await activate('#preview-case-forme'); await page.waitForTimeout(180); await dismissReader(); await page.waitForTimeout(220); await page.goForward(); await page.waitForTimeout(1000);
        // Browser history reversal retains the same scene and its current pose.
        if (await page.locator('.case-reader').isVisible()) await dismissReader();
        await page.waitForTimeout(1000);
      } else {
        mark('early-reader'); await activate('#index-perch'); await activate('#preview-case-perch'); await page.waitForTimeout(100); await dismissReader(); await page.waitForTimeout(1000);
        mark('project-reversals');
        for (const id of ['forme', 'selvedge', 'perch', 'forme']) { await activate(`#index-${id}`); await page.waitForTimeout(95); }
        await page.waitForTimeout(1000);
        mark('catalog-reversals');
        for (const pause of [90, 250, 130]) { await activate('#index-all'); await page.waitForTimeout(pause); await dismissCatalog(); await page.waitForTimeout(pause); }
        await page.waitForTimeout(900);
        mark('home-reversal'); await activate('.signature'); await page.waitForTimeout(100); await activate('#index-perch'); await page.waitForTimeout(90); await activate('.signature'); await page.waitForTimeout(1400);
        mark('history-return'); await page.goBack(); await page.waitForTimeout(1000);
      }
      const renderer = await page.evaluate(() => { const gl = document.querySelector('canvas').getContext('webgl2'); return gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL); });
      const video = page.video(); await context.close();
      await video.saveAs(`${dir}/${mode}-${viewport.width}.webm`);
      await fs.writeFile(`${dir}/${mode}-${viewport.width}.json`, JSON.stringify({ base, viewport, mode, marks, browser: browser.version(), renderer, conditions: 'Continuous 25 fps installed Chrome recording on Windows with hardware WebGL. No CPU/network throttle. Mobile uses touch emulation. Video is a demonstration, not a frame-delivery benchmark; wall-time marks are approximate relative to the encoded video start.' }, null, 2));
      console.log(`Recorded ${mode} ${viewport.width}`);
    }
  }
} finally { await browser.close(); }

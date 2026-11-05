import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const base = process.argv[2] || 'http://127.0.0.1:5319/';
const dir = 'evidence/lotus-opening';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const mobile = viewport.width < 700;
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, recordVideo: { dir, size: viewport } });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.openingFrames = [];
      function sample() {
        const host = document.querySelector('.soft-canvas');
        if (host?.dataset.introStartedAt) window.openingFrames.push({ time: performance.now(), bloom: Number(host.dataset.bloom), petals: JSON.parse(host.dataset.petals || '[]'), labels: Number(host.dataset.introLabels), phase: host.dataset.intro, loading: !!document.querySelector('.ink-loading') });
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    const started = Date.now();
    await page.goto(new URL('index.html?lang=ru', base).href, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('.soft-canvas')?.dataset.intro === 'complete', { timeout: 25000 });
    await page.waitForTimeout(2400);
    const result = await page.evaluate(() => {
      const host = document.querySelector('.soft-canvas');
      const gl = host.querySelector('canvas').getContext('webgl2');
      return { data: { ...host.dataset }, frames: window.openingFrames, renderer: gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL), navigationStart: performance.timeOrigin };
    });
    const video = page.video();
    await context.close();
    await video.saveAs(`${dir}/first-entry-${viewport.width}.webm`);
    const duration = Number(result.data.introEndedAt) - Number(result.data.introStartedAt);
    await fs.writeFile(`${dir}/first-entry-${viewport.width}.json`, JSON.stringify({ base, viewport, browser: browser.version(), videoStartedAt: started, duration, conditions: 'Fresh browser context and cache; installed Chrome on Windows, hardware WebGL; no CPU/network throttle. Continuous ordinary-speed 25 fps recording with no time edits. Mobile is touch emulation, not a physical phone. Frame samples verify the animation timeline, not display frame delivery.', ...result }, null, 2));
    console.log(JSON.stringify({ viewport, duration, ready: result.data.modelReadyAt, start: result.data.introStartedAt, renderer: result.renderer }));
  }
} finally { await browser.close(); }

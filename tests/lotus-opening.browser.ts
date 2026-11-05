import { test, expect, type Page } from '@playwright/test';
import { sceneCopy } from '../src/soft-lotus/copy.ts';

test.use({ hasTouch: true });

const remote = process.env.PORTFOLIO_BASE_URL;
const prefix = remote ? new URL(remote).pathname.replace(/\/$/, '') : '';
const entry = prefix + (process.env.PORTFOLIO_RELEASE === '1' ? '/index.html' : '/soft-lotus.html');
type Frame = { time: number; bloom: number; petals: number[]; labels: number; loading: boolean };
type SampleWindow = Window & { openingFrames: Frame[]; originalCanvas?: Element };

async function observe(page: Page) {
  await page.addInitScript(() => {
    const target = window as unknown as SampleWindow;
    target.openingFrames = [];
    function sample() {
      const host = document.querySelector<HTMLElement>('.soft-canvas');
      if (host?.dataset.introStartedAt) {
        target.openingFrames.push({ time: performance.now() - Number(host.dataset.introStartedAt), bloom: Number(host.dataset.bloom), petals: JSON.parse(host.dataset.petals || '[]'), labels: Number(host.dataset.introLabels), loading: !!document.querySelector('.ink-loading') });
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
}

for (const width of [1440, 390]) test(`First entrance lasts 3.2 seconds after real readiness with a held bud and staggered petals (${width})`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
  await observe(page);
  let release!: () => void;
  const transfer = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/models/*.glb', async route => { await transfer; await route.continue(); });
  await page.goto(`${entry}?lang=ru`, { waitUntil: 'domcontentloaded' });
  const scene = page.locator('.soft-canvas');
  await expect(page.locator('.ink-loading')).toBeVisible();
  await page.waitForTimeout(250);
  await expect(scene).toHaveAttribute('data-intro', 'waiting');
  expect(await scene.getAttribute('data-intro-started-at')).toBeNull();
  release();
  await expect(scene).toHaveAttribute('data-intro', 'complete', { timeout: 20000 });
  const result = await scene.evaluate(host => ({ data: { ...(host as HTMLElement).dataset }, frames: (window as unknown as SampleWindow).openingFrames }));
  const duration = Number(result.data.introEndedAt) - Number(result.data.introStartedAt);
  expect(duration).toBeGreaterThanOrEqual(3100);
  expect(duration).toBeLessThan(3450);
  expect(Number(result.data.introStartedAt) - Number(result.data.modelReadyAt)).toBeLessThan(150);
  const hold = result.frames.filter(frame => frame.time < 350);
  expect(hold.length).toBeGreaterThan(3);
  expect(hold.every(frame => frame.bloom === 0 && frame.petals.every(value => value === 0) && frame.labels === 0 && !frame.loading)).toBe(true);
  const middle = result.frames.filter(frame => frame.time > 1200 && frame.time < 1700);
  expect(middle.some(frame => Math.max(...frame.petals) - Math.min(...frame.petals) > .05)).toBe(true);
  expect(result.frames.filter(frame => frame.time < 2550).every(frame => frame.labels === 0)).toBe(true);
  expect(result.frames.some(frame => frame.time > 2600 && frame.time < 3100 && frame.labels > 0 && frame.labels < 1)).toBe(true);
  for (let i = 1; i < result.frames.length; i++) for (let petal = 0; petal < 5; petal++) expect(result.frames[i].petals[petal]).toBeGreaterThanOrEqual(result.frames[i - 1].petals[petal]);
  await expect(scene).toHaveAttribute('data-bloom', '1.000');
  await expect(page.locator('.intro-skip')).toHaveCount(0);
  await testInfo.attach('opening-timing.json', { body: JSON.stringify(result, null, 2), contentType: 'application/json' });
});

for (const method of ['escape', 'tap', 'button'] as const) test(`Opening can be skipped by ${method} without selecting a project`, async ({ page }) => {
  const locale = method === 'escape' ? 'ru' : method === 'tap' ? 'kk' : 'en';
  if (method === 'tap') await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${entry}?lang=${locale}`);
  const scene = page.locator('.soft-canvas');
  await expect(page.locator('.intro-skip')).toHaveText(`${sceneCopy[locale].skipIntro} · Esc`, { timeout: 20000 });
  await page.waitForTimeout(method === 'escape' ? 80 : method === 'tap' ? 1000 : 2500);
  if (method === 'escape') await page.keyboard.press('Escape');
  else if (method === 'button') { await page.locator('.intro-skip').focus(); await page.keyboard.press('Enter'); }
  else await page.touchscreen.tap(210, 500);
  await expect(scene).toHaveAttribute('data-intro', 'skipped');
  await expect(scene).toHaveAttribute('data-bloom', '1.000');
  await expect(page.locator('body')).toHaveAttribute('data-view', 'overview');
  await expect(page.locator('.ink-loading')).toHaveCount(0);
  if (method === 'button') await expect(page.locator('#index-perch')).toBeFocused();
});

test('Early project and gallery navigation complete the entrance once, preserving the scene through returns and history', async ({ page }) => {
  test.setTimeout(60000);
  for (const action of ['#hero-work', '#index-perch']) {
    await page.goto(`${entry}?lang=ru`);
    await page.evaluate(() => sessionStorage.removeItem('soft-lotus-intro-v2'));
    await page.reload();
    const scene = page.locator('.soft-canvas');
    await expect(page.locator('.intro-skip')).toBeVisible({ timeout: 20000 });
    const started = await scene.getAttribute('data-intro-started-at');
    await page.evaluate(() => { (window as unknown as SampleWindow).originalCanvas = document.querySelector('.soft-canvas canvas')!; });
    await page.locator(action).click();
    if (action === '#hero-work') { await page.keyboard.press('Escape'); await expect(page.locator('#work-browser')).toBeHidden(); }
    else { await page.locator('#preview-case-perch').click(); await page.keyboard.press('Escape'); await expect(page.locator('.case-reader')).toBeHidden(); await page.locator('.signature').click(); await page.goBack(); await page.goForward(); }
    await expect(scene).toHaveAttribute('data-bloom', '1.000');
    await expect(scene).toHaveAttribute('data-intro', 'skipped');
    expect(await scene.getAttribute('data-intro-started-at')).toBe(started);
    expect(await page.evaluate(() => document.querySelector('.soft-canvas canvas') === (window as unknown as SampleWindow).originalCanvas)).toBe(true);
    await expect(page.locator('.ink-loading')).toHaveCount(0);
    await expect(page.locator('.intro-skip')).toHaveCount(0);
  }
});

test('Reduced motion and repeat visits use only a short appearance', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await observe(page);
  await page.goto(`${entry}?lang=kk`);
  const scene = page.locator('.soft-canvas');
  await expect(scene).toHaveAttribute('data-intro', 'complete', { timeout: 20000 });
  await expect(scene).toHaveAttribute('data-intro-mode', 'reduced');
  let data = await scene.evaluate(host => ({ ...(host as HTMLElement).dataset }));
  expect(Number(data.introEndedAt) - Number(data.introStartedAt)).toBeLessThan(400);
  expect(await page.evaluate(() => (window as unknown as SampleWindow).openingFrames.every(frame => frame.bloom === 1 && frame.petals.every(value => value === 1)))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect(scene).toHaveAttribute('data-intro', 'complete', { timeout: 20000 });
  await expect(scene).toHaveAttribute('data-intro-mode', 'cached');
  data = await scene.evaluate(host => ({ ...(host as HTMLElement).dataset }));
  expect(Number(data.introEndedAt) - Number(data.introStartedAt)).toBeLessThan(400);
  await expect(page.locator('.intro-skip')).toHaveCount(0);
});

test('Locale changes preserve elapsed opening time and automatic completion retains keyboard focus', async ({ page }) => {
  await page.goto(`${entry}?lang=ru`);
  const scene = page.locator('.soft-canvas');
  await expect(page.locator('.intro-skip')).toBeVisible({ timeout: 20000 });
  const started = await scene.getAttribute('data-intro-started-at');
  for (const locale of ['en', 'kk', 'ru'] as const) {
    await page.locator(`.soft-languages button[lang="${locale}"]`).click();
    await expect(page.locator('.intro-skip')).toContainText(sceneCopy[locale].skipIntro);
    expect(await scene.getAttribute('data-intro-started-at')).toBe(started);
  }
  await page.locator('.intro-skip').focus();
  await expect(scene).toHaveAttribute('data-intro', 'complete');
  await expect(page.locator('#index-perch')).toBeFocused();
  const duration = await scene.evaluate(host => Number((host as HTMLElement).dataset.introEndedAt) - Number((host as HTMLElement).dataset.introStartedAt));
  expect(duration).toBeLessThan(3450);
});

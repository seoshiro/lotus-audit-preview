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

// Control feature time independently of the runner's GPU cadence. These are
// sampled animation-state checks, not an FPS benchmark. Ordinary-speed hardware
// recordings separately measure actual wall-clock duration.
const clockPages = new WeakSet<Page>();
async function advance(page: Page, milliseconds: number) {
  for (let left = milliseconds; left > 0; left -= 50) await page.clock.fastForward(Math.min(left, 50));
}
async function loadPaused(page: Page, locale: string, verifyLoading = false) {
  if (!clockPages.has(page)) { await page.clock.install(); clockPages.add(page); }
  else await page.clock.resume();
  await page.addInitScript(() => sessionStorage.removeItem('soft-lotus-intro-v2'));
  let release!: () => void;
  const transfer = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/models/*.glb', async route => { await transfer; await route.continue(); });
  await page.goto(`${entry}?lang=${locale}`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.ink-loading')).toBeVisible();
  await page.clock.pauseAt(await page.evaluate(() => Date.now() + 20));
  if (verifyLoading) {
    await advance(page, 250);
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-intro', 'waiting');
    expect(await page.locator('.soft-canvas').getAttribute('data-intro-started-at')).toBeNull();
  }
  release();
  await expect.poll(async () => { await page.clock.fastForward(16); return page.locator('body').getAttribute('data-model'); }, { timeout: 25000, intervals: [20] }).toBe('ready');
  await page.unroute('**/models/*.glb');
}

for (const width of [1440, 390]) test(`Opening preserves the 0.4 / 2.2 / 0.6 second schedule with staggered petals (${width})`, async ({ page }, testInfo) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width, height: width === 1440 ? 900 : 844 });
  await observe(page);
  await loadPaused(page, 'ru', true);
  const scene = page.locator('.soft-canvas');
  await advance(page, 3300);
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
  await loadPaused(page, locale);
  const scene = page.locator('.soft-canvas');
  await expect(page.locator('.intro-skip')).toHaveText(`${sceneCopy[locale].skipIntro} · Esc`, { timeout: 20000 });
  await advance(page, method === 'escape' ? 80 : method === 'tap' ? 1000 : 2750);
  if (method === 'escape') await page.keyboard.press('Escape');
  else if (method === 'button') { await page.locator('.intro-skip').focus(); await page.keyboard.press('Enter'); }
  else await page.touchscreen.tap(210, 500);
  await expect(scene).toHaveAttribute('data-intro', 'skipped');
  await advance(page, 250);
  await expect(scene).toHaveAttribute('data-bloom', '1.000');
  await expect(page.locator('body')).toHaveAttribute('data-view', 'overview');
  await expect(page.locator('.ink-loading')).toHaveCount(0);
  if (method === 'button') await expect(page.locator('#index-perch')).toBeFocused();
});

test('Early project and gallery navigation complete the entrance once, preserving the scene through returns and history', async ({ page }) => {
  test.setTimeout(60000);
  for (const action of ['#hero-work', '#index-perch']) {
    await loadPaused(page, 'ru');
    const scene = page.locator('.soft-canvas');
    await expect(page.locator('.intro-skip')).toBeVisible({ timeout: 20000 });
    const started = await scene.getAttribute('data-intro-started-at');
    await page.evaluate(() => { (window as unknown as SampleWindow).originalCanvas = document.querySelector('.soft-canvas canvas')!; });
    await page.locator(action).click();
    if (action === '#hero-work') { await advance(page, 150); await page.keyboard.press('Escape'); await advance(page, 800); await expect(page.locator('#work-browser')).toBeHidden(); }
    else { await advance(page, 600); await page.locator('#preview-case-perch').click(); await advance(page, 200); await page.keyboard.press('Escape'); await advance(page, 700); await expect(page.locator('.case-reader')).toBeHidden(); await page.locator('.signature').click(); await advance(page, 700); await page.goBack(); await advance(page, 700); await page.goForward(); await advance(page, 700); }
    await expect(scene).toHaveAttribute('data-bloom', '1.000');
    await expect(scene).toHaveAttribute('data-intro', 'skipped');
    expect(await scene.getAttribute('data-intro-started-at')).toBe(started);
    expect(await page.evaluate(() => document.querySelector('.soft-canvas canvas') === (window as unknown as SampleWindow).originalCanvas)).toBe(true);
    await expect(page.locator('.ink-loading')).toHaveCount(0);
    await expect(page.locator('.intro-skip')).toHaveCount(0);
  }
});

test('Reduced motion and repeat visits use only a short appearance', async ({ page }, testInfo) => {
  // Retain the real native animations after they finish. On software WebGL a
  // compositor stall can delay the completion callback without extending their
  // scheduled duration. Record that delay separately from the motion contract.
  await page.addInitScript(() => {
    const target = window as unknown as Window & { quietAppearances: Animation[] };
    target.quietAppearances = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args: Parameters<Element['animate']>) {
      const animation = animate.apply(this, args);
      if (this.matches('.soft-canvas canvas, [data-anchor]')) target.quietAppearances.push(animation);
      return animation;
    };
  });
  const checkAppearance = async (mode: string) => {
    const result = await page.evaluate(() => {
      const host = document.querySelector<HTMLElement>('.soft-canvas')!;
      const animations = (window as unknown as Window & { quietAppearances: Animation[] }).quietAppearances;
      return {
        started: Number(host.dataset.introStartedAt), ended: Number(host.dataset.introEndedAt),
        animations: animations.map(animation => ({ start: Number(animation.startTime), state: animation.playState,
          timing: animation.effect!.getComputedTiming(), frames: (animation.effect as KeyframeEffect).getKeyframes() })),
        frames: (window as unknown as SampleWindow).openingFrames,
      };
    });
    expect(result.animations).toHaveLength(6);
    for (const animation of result.animations) {
      expect(animation.timing.duration).toBe(180);
      expect(animation.timing.delay).toBe(0);
      expect(animation.timing.iterations).toBe(1);
      expect(animation.start).toBe(result.animations[0].start);
      expect(animation.start).toBeLessThanOrEqual(result.started + 1);
      expect(animation.frames.map(frame => frame.opacity)).toEqual(['0', '1']);
      expect(animation.state).toBe('finished');
    }
    expect(result.frames.length).toBeGreaterThan(0);
    expect(result.frames.every(frame => frame.bloom === 1 && frame.petals.every(value => value === 1))).toBe(true);
    await testInfo.attach(`${mode}-appearance.json`, { body: JSON.stringify({ ...result, observedMs: result.ended - result.started }, null, 2), contentType: 'application/json' });
  };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await observe(page);
  await page.goto(`${entry}?lang=kk`);
  const scene = page.locator('.soft-canvas');
  await expect(scene).toHaveAttribute('data-intro', 'complete', { timeout: 20000 });
  await expect(scene).toHaveAttribute('data-intro-mode', 'reduced');
  await checkAppearance('reduced');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect(scene).toHaveAttribute('data-intro', 'complete', { timeout: 20000 });
  await expect(scene).toHaveAttribute('data-intro-mode', 'cached');
  await checkAppearance('cached');
  await expect(page.locator('.intro-skip')).toHaveCount(0);
});

test('Locale changes preserve elapsed opening time and automatic completion retains keyboard focus', async ({ page }) => {
  await loadPaused(page, 'ru');
  const scene = page.locator('.soft-canvas');
  await expect(page.locator('.intro-skip')).toBeVisible({ timeout: 20000 });
  const started = await scene.getAttribute('data-intro-started-at');
  for (const locale of ['en', 'kk', 'ru'] as const) {
    await page.locator(`.soft-languages button[lang="${locale}"]`).click();
    await expect(page.locator('.intro-skip')).toContainText(sceneCopy[locale].skipIntro);
    expect(await scene.getAttribute('data-intro-started-at')).toBe(started);
  }
  await page.locator('.intro-skip').focus();
  await advance(page, 3300);
  await expect(scene).toHaveAttribute('data-intro', 'complete');
  await expect(page.locator('#index-perch')).toBeFocused();
  const duration = await scene.evaluate(host => Number((host as HTMLElement).dataset.introEndedAt) - Number((host as HTMLElement).dataset.introStartedAt));
  expect(duration).toBeLessThan(3450);
});

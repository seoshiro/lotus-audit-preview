import { test, expect, type Page } from '@playwright/test';

const remote = process.env.PORTFOLIO_BASE_URL;
const prefix = remote ? new URL(remote).pathname.replace(/\/$/, '') : '';
const entry = prefix + (process.env.PORTFOLIO_RELEASE === '1' ? '/index.html' : '/soft-lotus.html');
type Frame = { scene: number; gallery: number; distortion: number; scale: number; preview: number; emphasis: number };
type ProbeWindow = Window & { continuityFrames: Frame[]; continuityStop: boolean };

async function startProbe(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as ProbeWindow;
    w.continuityFrames = []; w.continuityStop = false;
    const opacity = (selector: string) => {
      const el = document.querySelector(selector);
      if (!el) return 0;
      const css = getComputedStyle(el);
      return css.visibility === 'hidden' || css.display === 'none' ? 0 : Number(css.opacity);
    };
    const tick = () => {
      const image = document.querySelector('.preview-product');
      const matrix = new DOMMatrixReadOnly(image ? getComputedStyle(image).transform : undefined);
      const dialog = document.querySelector<HTMLDialogElement>('#work-browser');
      const gallery = dialog?.open ? opacity('#work-browser') * Math.max(opacity('.work-browser-header'), ...[...document.querySelectorAll('#work-list>a')].map(el => Number(getComputedStyle(el).opacity))) : 0;
      const labels = document.querySelector('.petal-labels');
      const labelOpacity = labels && getComputedStyle(labels).display !== 'none' ? Number(getComputedStyle(labels).getPropertyValue('--labels-reveal')) : 0;
      const emphasis = JSON.parse(document.querySelector<HTMLElement>('.soft-canvas')?.dataset.pose || '[0,0,0,0]')[2];
      w.continuityFrames.push({ scene: Math.max(opacity('.scene-introduction'), opacity('.petal-preview'), labelOpacity), gallery, distortion: Math.abs(matrix.a - matrix.d), scale: matrix.a, preview: opacity('.petal-preview'), emphasis });
      if (!w.continuityStop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
async function stopProbe(page: Page) {
  return page.evaluate(() => { const w = window as unknown as ProbeWindow; w.continuityStop = true; return w.continuityFrames; });
}

test('Catalog and scene text never compete during calm or interrupted transitions', async ({ page }) => {
  test.setTimeout(60000);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${entry}?lang=ru`);
    await expect(page.locator('body')).toHaveAttribute('data-model', 'ready', { timeout: 20000 });
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
    for (const reduced of [false, true]) {
      await page.emulateMedia({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
      await startProbe(page);
      await page.locator('#index-all').click();
      await expect(page.locator('#work-browser')).toHaveAttribute('data-phase', 'open');
      await page.keyboard.press('Escape');
      await expect(page.locator('#work-browser')).toBeHidden();
      await page.waitForTimeout(350);
      for (const pause of [60, 240, 100]) {
        await page.locator('#index-all').click();
        await page.waitForTimeout(pause);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(pause);
      }
      await expect(page.locator('#work-browser')).toBeHidden();
      await page.waitForTimeout(500);
      const frames = await stopProbe(page);
      expect(frames.length).toBeGreaterThan(15);
      expect(frames.filter(frame => frame.scene > .055 && frame.gallery > .055), `${viewport.width}/${reduced}: simultaneous legible layers`).toEqual([]);
      await expect(page.locator('#index-all')).toBeFocused();
    }
  }
});

test('Mobile project copy waits for the flower to clear its reading area even after a mid-lift switch', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 640 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${entry}?lang=ru`);
    await expect(page.locator('body')).toHaveAttribute('data-model', 'ready', { timeout: 20000 });
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
    await startProbe(page);
    await page.locator('#index-perch').click();
    await page.waitForTimeout(190);
    await page.locator('#index-forme').click();
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
    await page.waitForTimeout(200);
    const frames = await stopProbe(page);
    expect(frames.filter(frame => frame.preview > .1 && frame.emphasis < .88)).toEqual([]);
    await expect(page.locator('.petal-preview')).toBeVisible();
  }
});

test('Early case entry and rapid project changes never squash or strand the product image', async ({ page }) => {
  test.setTimeout(60000);
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`${entry}?lang=ru`);
    await expect(page.locator('body')).toHaveAttribute('data-model', 'ready', { timeout: 20000 });
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
    await startProbe(page);
    await page.locator('#index-perch').click();
    await page.locator('#preview-case-perch').click();
    await page.waitForTimeout(100);
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).toHaveAttribute('data-view', 'selected');
    await expect(page.locator('.preview-product')).toHaveCSS('transform', 'none');
    for (const id of ['forme', 'selvedge', 'perch', 'forme']) {
      await page.locator(`#index-${id}`).click();
      await page.waitForTimeout(90);
    }
    await expect(page.locator('.preview-product')).toHaveCSS('transform', 'none');
    await page.locator('#index-all').click();
    await page.waitForTimeout(180); await page.keyboard.press('Escape');
    await expect(page.locator('#work-browser')).toBeHidden();
    const frames = await stopProbe(page);
    expect(frames.some(frame => frame.scale > 0 && frame.scale < .99)).toBe(true);
    expect(Math.max(...frames.map(frame => frame.distortion))).toBeLessThan(.0001);
    expect(frames.filter(frame => frame.scene > .055 && frame.gallery > .055)).toEqual([]);
    await page.locator('.preview-close').click();
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
    await expect(page.locator('.ink-loading')).toHaveCount(0);
  }
});

test('Every shared case fits the whole flower in its actual column and adapts while open', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${entry}?lang=ru`);
  await expect(page.locator('body')).toHaveAttribute('data-model', 'ready', { timeout: 20000 });
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
  const originalCanvas = await page.locator('canvas').elementHandle();
  for (const [index, id] of ['perch', 'selvedge', 'forme'].entries()) {
    await page.getByRole('button', { name: ['RU', 'EN', 'KK'][index], exact: true }).click();
    await page.locator(`#index-${id}`).click();
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
    const selected = JSON.parse(await page.locator('.soft-canvas').getAttribute('data-pose') || '[]');
    await page.locator(`#preview-case-${id}`).click();
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
    for (const viewport of [{ width: 1917, height: 968 }, { width: 1440, height: 900 }, { width: 1165, height: 747 }, { width: 800, height: 900 }, { width: 390, height: 844 }, { width: 320, height: 640 }, { width: 1440, height: 900 }]) {
      await page.setViewportSize(viewport);
      await expect.poll(async () => page.evaluate(() => {
        const scene = document.querySelector<HTMLElement>('.soft-canvas')!;
        const reader = document.querySelector<HTMLElement>('.case-reader')!.getBoundingClientRect();
        const [left, top, right, bottom] = JSON.parse(scene.dataset.flowerBounds!) as number[];
        return innerWidth <= 700 ? Math.abs(reader.left) < 1 && Math.abs(reader.width - innerWidth) < 1 : left >= 12 && right <= reader.left - 12 && top >= 12 && bottom <= innerHeight - 12 && Math.abs((left + right) / 2 - reader.left / 2) < 5;
      }), { message: `${id} ${viewport.width}: whole centered model with margins` }).toBe(true);
      await expect(page.locator('.scene-bottom')).toBeHidden();
      expect(await page.locator('.soft-stage').evaluate(el => (el as HTMLElement).inert)).toBe(true);
      expect(await page.locator('#scene-index').evaluate(el => (el as HTMLElement).inert)).toBe(true);
      await expect(page.locator('.reader-top button')).toBeInViewport();
      await expect(page.locator('#reader-title')).toHaveText(id.toUpperCase());
    }
    await page.keyboard.press('Escape');
    await expect(page.locator('.case-reader')).toBeHidden();
    await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
    expect(JSON.parse(await page.locator('.soft-canvas').getAttribute('data-pose') || '[]')).toEqual(selected);
    await expect(page.locator(`#preview-case-${id}`)).toBeFocused();
  }
  expect(await originalCanvas!.evaluate(el => el === document.querySelector('canvas'))).toBe(true);
  await expect(page.locator('.ink-loading')).toHaveCount(0);
});

test('Reader and flower stay clear through Escape and history reversals without scene resets', async ({ page }) => {
  test.setTimeout(60000);
  for (const width of [1440, 800]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${entry}?lang=ru`);
  await expect(page.locator('body')).toHaveAttribute('data-model', 'ready', { timeout: 20000 });
  await page.locator('#index-perch').click();
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
  const sampled = page.evaluate(async () => {
    const frames: { left: number; right: number; panel: number; bloom: number; reading: number; time: number; caption: number; labels: number; readerLayer: number; headerLayer: number }[] = [];
    const start = performance.now();
    while (performance.now() - start < 5000) {
      await new Promise(requestAnimationFrame);
      const scene = document.querySelector<HTMLElement>('.soft-canvas')!, reader = document.querySelector<HTMLDialogElement>('.case-reader')!;
      const bounds = JSON.parse(scene.dataset.flowerBounds!) as number[], pose = JSON.parse(scene.dataset.pose!) as number[];
      if (reader.open) frames.push({ left: bounds[0], right: bounds[2], panel: reader.getBoundingClientRect().left, bloom: pose[0], reading: pose[3], time: performance.now(), caption: Number(getComputedStyle(document.querySelector('.reading-lotus-caption')!).opacity), labels: Number(getComputedStyle(document.querySelector('.petal-labels')!).getPropertyValue('--labels-reveal')), readerLayer: Number(getComputedStyle(reader).zIndex), headerLayer: Number(getComputedStyle(document.querySelector('.soft-header')!).zIndex) });
    }
    return frames;
  });
  await page.locator('#preview-case-perch').click();
  await page.waitForTimeout(170); await page.keyboard.press('Escape');
  await page.waitForTimeout(120); await page.goForward();
  await page.waitForTimeout(650); await page.goBack();
  await expect(page.locator('.case-reader')).toBeHidden();
  await page.locator('#preview-case-perch').click();
  await page.waitForTimeout(650); await page.locator('.reader-top button').click();
  await expect(page.locator('.case-reader')).toBeHidden();
  const frames = await sampled;
  expect(frames.length).toBeGreaterThan(20);
  expect(frames.some(frame => frame.reading > .2 && frame.reading < .8)).toBe(true);
  expect(frames.filter(frame => frame.left < 0 || frame.right > frame.panel + 2 || frame.bloom !== 1)).toEqual([]);
  expect(frames.filter(frame => frame.caption > .055 && frame.labels > .055 || frame.readerLayer <= frame.headerLayer)).toEqual([]);
  const shortSteps = frames.slice(1).map((frame, i) => ({ delta: Math.abs(frame.reading - frames[i].reading), ms: frame.time - frames[i].time })).filter(frame => frame.ms < 25);
  expect(Math.max(...shortSteps.map(frame => frame.delta))).toBeLessThan(.22);
  await expect(page.locator('.preview-product')).toHaveCSS('transform', 'none');
  await expect(page.locator('.ink-loading')).toHaveCount(0);
  }
});

test('Reading remains usable with reduced motion and a failed model', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1165, height: 747 });
  await page.goto(`${entry}?lang=kk`);
  await expect(page.locator('body')).toHaveAttribute('data-model', 'ready', { timeout: 20000 });
  await page.locator('#index-forme').click();
  await page.locator('#preview-case-forme').click();
  expect(await page.locator('.case-reader').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
  await page.keyboard.press('Escape');
  await expect(page.locator('.case-reader')).toBeHidden();
  await page.route('**/models/*.glb', route => route.abort());
  await page.goto(`${entry}?lang=en`);
  await expect(page.locator('body')).toHaveAttribute('data-model', 'failed');
  await page.locator('#index-perch').click();
  await page.locator('#preview-case-perch').click();
  await expect(page.locator('#reader-title')).toHaveText('PERCH');
  const poster = await page.locator('.scene-poster').boundingBox(), reader = await page.locator('.case-reader').boundingBox();
  expect(poster!.x + poster!.width).toBeLessThanOrEqual(reader!.x + 1);
  await expect(page.locator('.scene-poster img')).toHaveCSS('object-fit', 'contain');
  await expect(page.locator('.scene-bottom')).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.scene-poster')).toBeHidden();
  await page.locator('.reader-top button').click();
  await expect(page.locator('.case-reader')).toBeHidden();
  await expect(page.locator('#preview-case-perch')).toBeFocused();
});

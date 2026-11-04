import { test, expect, type Page } from '@playwright/test';
import { sceneCopy } from '../src/soft-lotus/copy.ts';

const remote = process.env.PORTFOLIO_BASE_URL;
const prefix = remote ? new URL(remote).pathname.replace(/\/$/, '') : '';
const entry = prefix + (process.env.PORTFOLIO_RELEASE === '1' ? '/index.html' : '/soft-lotus.html');
const locales = ['ru', 'en', 'kk'] as const;

async function inkIsUncut(page: Page, label: string) {
  const masked = await page.screenshot();
  await page.locator('.reveal-word-mask').evaluateAll(masks => masks.forEach(mask => { (mask as HTMLElement).style.overflow = 'visible'; }));
  const unmasked = await page.screenshot();
  expect(masked.equals(unmasked), `${label}: the mask must not remove visible glyph pixels`).toBe(true);
  await page.locator('.reveal-word-mask').evaluateAll(masks => masks.forEach(mask => { (mask as HTMLElement).style.overflow = 'clip'; }));
}

test('Italic word masks preserve actual glyph pixels during and after reveal in all languages and sizes', async ({ page }) => {
  test.setTimeout(120000);
  // Freeze the animation clock, not the font renderer. Compare two captures of
  // the same rendered glyphs, with and without their clipping surface. This has
  // no platform-specific golden image and detects actual ink loss.
  await page.clock.install({ time: new Date('2026-11-04T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-11-04T00:00:01Z'));
  await page.route('**/models/*.glb', route => route.abort());
  let provedOldMaskFails = false;
  for (const viewport of [{ width: 1440, height: 900 }, { width: 1165, height: 747 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
    await page.setViewportSize(viewport);
    for (const locale of locales) {
      await page.goto(`${entry}?lang=${locale}`);
      await page.waitForSelector('.reveal-word');
      await page.addStyleTag({ content: 'body *{visibility:hidden!important}.scene-introduction,.scene-introduction h1,.scene-introduction h1 *{visibility:visible!important}.scene-introduction>:not(h1){visibility:hidden!important}' });
      await page.clock.runFor(100);
      const moving = await page.locator('h1 .reveal-word').evaluateAll(words => words.map(word => ({ opacity: Number(getComputedStyle(word).opacity), transform: getComputedStyle(word).transform })));
      expect(moving.some(word => word.opacity > 0 && word.opacity < 1 && word.transform !== 'none')).toBe(true);
      await page.clock.runFor(300);
      await inkIsUncut(page, `${locale}/${viewport.width}/400ms`);
      await page.clock.runFor(600);
      await inkIsUncut(page, `${locale}/${viewport.width}/settled`);
      if (!provedOldMaskFails) {
        const correct = await page.screenshot();
        const before = await page.locator('h1 .reveal-word').evaluateAll(words => words.map(word => word.getBoundingClientRect().toJSON()));
        await page.locator('.reveal-word-mask').evaluateAll(masks => masks.forEach(mask => { (mask as HTMLElement).style.padding = '0'; (mask as HTMLElement).style.margin = '0'; }));
        expect(correct.equals(await page.screenshot()), 'negative control: the old tight mask must visibly lose ink').toBe(false);
        const after = await page.locator('h1 .reveal-word').evaluateAll(words => words.map(word => word.getBoundingClientRect().toJSON()));
        expect(after, 'extra clipping space must preserve original word positions and line spacing').toEqual(before);
        await page.locator('.reveal-word-mask').evaluateAll(masks => masks.forEach(mask => { (mask as HTMLElement).style.padding = ''; (mask as HTMLElement).style.margin = ''; }));
        provedOldMaskFails = true;
      }
      await page.locator('h1').evaluate(heading => { heading.style.fontSize = `${parseFloat(getComputedStyle(heading).fontSize) * 2}px`; });
      await page.clock.runFor(1000);
      await inkIsUncut(page, `${locale}/${viewport.width}/200%`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});

test('Enlarged hero text stays readable and its actions remain reachable without overlapping petal labels', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const viewport of [{ width: 390, height: 844 }, { width: 320, height: 640 }, { width: 720, height: 450 }]) {
    await page.setViewportSize(viewport);
    for (const locale of locales) {
      await page.goto(`${entry}?lang=${locale}`);
      await expect(page.locator('body')).toHaveAttribute('data-model', 'ready', { timeout: 20000 });
      await page.locator('.scene-introduction').evaluate(intro => {
        for (const node of intro.querySelectorAll<HTMLElement>('.eyebrow,h1,.hero-offer,.hero-actions,.scene-hint')) node.style.fontSize = `${parseFloat(getComputedStyle(node).fontSize) * 2}px`;
      });
      await expect(page.locator('.soft-stage')).toHaveAttribute('data-text-reflow', 'true');
      await expect(page.locator('.petal-labels')).toBeHidden();
      const intro = page.locator('.scene-introduction');
      expect(await intro.evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await expect(page.locator('h1')).toHaveText(sceneCopy[locale].headline);
      expect(await intro.evaluate(el => { const a = el.getBoundingClientRect(), b = document.querySelector('.scene-bottom')!.getBoundingClientRect(); return a.top >= 64 && a.bottom <= b.top + 1; })).toBe(true);
      await page.locator('#hero-work').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('#work-browser')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#hero-work')).toBeFocused();
      // Reset the text size and verify that the normal composition is restored.
      await intro.evaluate(el => el.querySelectorAll<HTMLElement>('[style]').forEach(node => node.style.removeProperty('font-size')));
      if (viewport.height > 700) await expect(page.locator('.soft-stage')).toHaveAttribute('data-text-reflow', 'false');
    }
  }
});

test('Rapid locale changes and reduced motion keep one complete accessible headline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${entry}?lang=ru`);
  await page.waitForSelector('.reveal-word');
  for (const locale of ['en', 'kk', 'ru', 'kk'] as const) {
    await page.locator(`.soft-languages button[lang=${locale}]`).click();
    await page.waitForTimeout(90);
  }
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(sceneCopy.kk.headline);
  await expect(page.locator('h1 .reveal-word').first()).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('h1 .reveal-word-mask')).toHaveCount(0);
  for (const locale of locales) {
    await page.locator(`.soft-languages button[lang=${locale}]`).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(sceneCopy[locale].headline);
    await expect(page.locator('h1')).toHaveText(sceneCopy[locale].headline);
  }
});

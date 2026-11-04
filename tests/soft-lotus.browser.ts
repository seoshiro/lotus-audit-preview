import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

test('Draft PERCH flow preserves real content, Back, Escape and exact trigger focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/soft-lotus.html?lang=ru');
  await expect(page.locator('.prototype-note')).toBeVisible();
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-asset', 'temporary-wireframe');
  await page.locator('#index-perch').click();
  await expect(page.locator('.petal-preview')).toContainText('PERCH');
  await page.locator('#preview-case-perch').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('img').first()).toHaveJSProperty('naturalWidth', 1440);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#preview-case-perch')).toBeFocused();
  await expect(page.locator('body')).toHaveAttribute('data-view', 'selected');
  await page.locator('#preview-case-perch').click();
  await page.goBack();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-petal', 'perch');
  await mkdir('evidence/lotus-v2/flow', { recursive: true });
  await page.screenshot({ path: 'evidence/lotus-v2/flow/perch-return-1440.png' });
  expect(errors).toEqual([]);
});

test('All five draft entries retain their state across three languages', async ({ page }) => {
  await page.goto('/soft-lotus.html?lang=en');
  for (const id of ['perch', 'selvedge', 'forme', 'about', 'contact']) {
    await page.locator(`#index-${id}`).click();
    for (const locale of ['ru', 'kk', 'en']) {
      await page.locator(`.soft-languages button[lang="${locale}"]`).click();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('body')).toHaveAttribute('data-petal', id);
      await expect(page.locator('.petal-preview')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    }
    if (['perch', 'selvedge', 'forme'].includes(id)) {
      await page.locator(`#preview-case-${id}`).click();
      await expect(page.getByRole('dialog')).toContainText(id.toUpperCase());
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  }
});

test('Phone draft case has accessible controls and a constrained reader', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/soft-lotus.html?lang=kk');
  await page.locator('#index-perch').click();
  await page.locator('#preview-case-perch').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const violations = (await new AxeBuilder({ page }).analyze()).violations;
  expect(violations).toEqual([]);
  await mkdir('evidence/lotus-v2/flow', { recursive: true });
  await page.screenshot({ path: 'evidence/lotus-v2/flow/perch-reader-390.png' });
  await page.keyboard.press('Escape');
  await expect(page.locator('#preview-case-perch')).toBeFocused();
});

test('No JavaScript still exposes the real case URLs', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false });
  await page.goto('http://127.0.0.1:5318/soft-lotus.html');
  await expect(page.getByRole('link', { name: 'PERCH', exact: true })).toHaveAttribute('href', 'projects/perch.html?lang=ru');
  await page.getByRole('link', { name: 'PERCH', exact: true }).click();
  await expect(page.locator('h1')).toContainText('PERCH');
  await page.close();
});

test('Direct case route remains readable and keyboard-contained without WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type.startsWith('webgl') || type === 'experimental-webgl') return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto('/soft-lotus.html?lang=kk&petal=forme&view=case');
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-webgl', 'unavailable');
  await expect(page.getByRole('dialog')).toContainText('FORME');
  await expect(page.locator('html')).toHaveAttribute('lang', 'kk');
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => document.querySelector('dialog')?.contains(document.activeElement))).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.locator('#index-forme')).toBeFocused();
  await page.locator('#index-selvedge').click();
  await page.locator('#preview-case-selvedge').click();
  await expect(page.getByRole('dialog')).toContainText('SELVEDGE');
});

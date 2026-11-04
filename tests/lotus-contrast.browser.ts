import { test, expect } from '@playwright/test';
import { measureSceneContrast } from './contrast-probe.ts';
// Pixel measurements are retained in the compact report; duplicating screenshots in traces
// makes failed runs needlessly large without adding useful evidence.
test.use({ trace: 'off' });
const remote = process.env.PORTFOLIO_BASE_URL;
const prefix = remote ? new URL(remote).pathname.replace(/\/$/, '') : '';
const entry = prefix + (process.env.PORTFOLIO_RELEASE === '1' ? '/index.html' : '/soft-lotus.html');
for (const viewport of [{ width: 1440, height: 900 }, { width: 1165, height: 747 }, { width: 390, height: 844 }, { width: 320, height: 640 }]) {
  test(`Scene labels and secondary navigation contrast against rendered background at ${viewport.width}`, async ({ page }, testInfo) => {
    test.setTimeout(150000);
    await page.setViewportSize(viewport); await page.emulateMedia({ reducedMotion: 'reduce' });
    const report: { locale: string; state: string; rows: Awaited<ReturnType<typeof measureSceneContrast>> }[] = [];
    for (const locale of ['ru', 'en', 'kk']) {
      await page.goto(`${entry}?lang=${locale}`);
      await expect(page.locator('body')).toHaveAttribute('data-model', 'ready', { timeout: 20000 });
      const measure = async (state: string) => {
        await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
        await page.waitForTimeout(180);
        const rows = await measureSceneContrast(page); report.push({ locale, state, rows });
        expect(rows.length).toBeGreaterThan(1);
        for (const row of rows) {
          expect.soft(row.samples, `${locale}/${state}/${row.text}: visible ink samples`).toBeGreaterThan(0);
          expect.soft(row.minimum, `${locale}/${state}/${row.text}: ${row.color} over ${row.worstBackground}`).toBeGreaterThanOrEqual(4.5);
        }
        if (viewport.width > 700 && state !== 'case') {
          const labels = rows.filter(row => row.id.startsWith('petal-'));
          expect(labels).toHaveLength(5);
          for (const label of labels) expect(label.opacity, `${state}/${label.id} must remain opaque`).toBe(1);
          if (state !== 'overview') {
            const selected = labels.find(row => row.id === `petal-${state}`)!;
            expect(Number(selected.weight)).toBeGreaterThanOrEqual(600);
          }
        }
      };
      await measure('overview');
      for (const id of ['perch', 'selvedge', 'forme', 'about', 'contact']) {
        await page.locator(`#index-${id}`).click(); await measure(id);
        if (['perch', 'selvedge', 'forme'].includes(id)) {
          await page.locator(`#preview-case-${id}`).click(); await measure('case');
          await page.locator('.reader-top button').click();
        }
      }
    }
    await testInfo.attach('actual-background-contrast', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  });
}

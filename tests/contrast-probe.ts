import type { Page } from '@playwright/test';

/** Sample the actual composited WebGL/paper pixels beneath each text rectangle.
 * Text is made transparent for one capture without changing layout or scene pose.
 * A before/transparent difference mask restricts samples to rendered ink pixels,
 * excluding padding, thumbnail borders and unoccupied space in the label box.
 */
export async function measureSceneContrast(page: Page) {
  const labels = await page.evaluate(() => {
    const selectors = '.petal-labels button>span,.scene-bottom p,.scene-bottom button,.scene-index button,.scene-index button>span,.scene-hint,.preview-subtitle,.reading-lotus-caption,.reader-top button,.reader-summary,.reader-links a,.case-reader .eyebrow,.case-reader figcaption';
    return [...document.querySelectorAll<HTMLElement>(selectors)].flatMap((el, index) => {
      const css = getComputedStyle(el), rect = el.getBoundingClientRect();
      let opacity = 1, visible = true;
      for (let node: HTMLElement | null = el; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        opacity *= Number(style.opacity);
        if (style.display === 'none' || style.visibility === 'hidden') visible = false;
      }
      if (!visible || opacity < .01 || !rect.width || !rect.height || !el.textContent?.trim() || rect.top < 0 || rect.bottom > innerHeight || rect.left < 0 || rect.right > innerWidth) return [];
      el.dataset.contrastProbe = String(index);
      return [{ text: el.textContent.trim(), id: el.id || el.parentElement?.id || el.className, color: css.color, opacity, weight: css.fontWeight, decoration: css.textDecorationLine, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } }];
    });
  });
  const foreground = (await page.screenshot()).toString('base64');
  const style = await page.addStyleTag({ content: '[data-contrast-probe],[data-contrast-probe] *{color:transparent!important;text-shadow:none!important;text-decoration-color:transparent!important}' });
  let encoded: string;
  try { encoded = (await page.screenshot()).toString('base64'); }
  finally { await style.evaluate(el => (el as HTMLElement).remove()); await page.locator('[data-contrast-probe]').evaluateAll(els => els.forEach(el => el.removeAttribute('data-contrast-probe'))); }
  // Decode in an empty test page: the site intentionally disallows data: images.
  const viewportWidth = await page.evaluate(() => innerWidth);
  const decoder = await page.context().newPage();
  try { return await decoder.evaluate(async ({ encoded, foreground, labels, viewportWidth }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + encoded; await img.decode();
    const canvas = document.createElement('canvas'); canvas.width = img.width; canvas.height = img.height;
    const context = canvas.getContext('2d')!; context.drawImage(img, 0, 0);
    const pixels = context.getImageData(0, 0, img.width, img.height).data;
    const ink = new Image(); ink.src = 'data:image/png;base64,' + foreground; await ink.decode();
    context.drawImage(ink, 0, 0); const painted = context.getImageData(0, 0, img.width, img.height).data;
    const ratio = img.width / viewportWidth;
    const luminance = (rgb: number[]) => rgb.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    return labels.map(label => {
      const channels = label.color.match(/[\d.]+/g)!.map(Number), alpha = label.opacity * (channels[3] ?? 1);
      let minimum = Infinity, samples = 0, worstBackground: number[] = [];
      const r = label.rect;
      for (let y = Math.max(0, Math.ceil(r.y * ratio)); y < Math.min(img.height, (r.y + r.height) * ratio); y++) {
        for (let x = Math.max(0, Math.ceil(r.x * ratio)); x < Math.min(img.width, (r.x + r.width) * ratio); x++) {
          const offset = (y * img.width + x) * 4, bg = [...pixels.slice(offset, offset + 3)];
          if (Math.max(...bg.map((c, i) => Math.abs(c - painted[offset + i]))) < 10) continue;
          samples++;
          const a = luminance(channels.slice(0, 3).map((c, i) => c * alpha + bg[i] * (1 - alpha))), b = luminance(bg);
          const contrast = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
          if (contrast < minimum) { minimum = contrast; worstBackground = bg; }
        }
      }
      return { ...label, minimum: Number(minimum.toFixed(3)), samples, worstBackground };
    });
  }, { encoded, foreground, labels, viewportWidth }); } finally { await decoder.close(); }
}

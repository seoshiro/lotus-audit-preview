const remote = process.env.PORTFOLIO_BASE_URL;
const prefix = remote ? new URL(remote).pathname.replace(/\/$/, '') : '';
const entry = prefix + (process.env.PORTFOLIO_RELEASE === '1' ? '/index.html' : '/soft-lotus.html');
const base = remote ? new URL(remote).origin : (process.env.PORTFOLIO_RELEASE === '1' ? 'http://127.0.0.1:5319' : 'http://127.0.0.1:5318');
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
import { copy, projects, dimensions } from '../src/content.ts';
import { sceneCopy } from '../src/soft-lotus/copy.ts';
import { caseNotes } from '../src/case-notes.ts';

test('Early static shell honors language while the 3D application bundle is unavailable', async ({page}) => {
  await page.setViewportSize({width:360,height:800});
  await page.route('**/assets/*.js', route=>route.abort());
  for(const locale of ['en','kk','ru'] as const){
    await page.goto(`${entry}?lang=${locale}`);
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    await expect(page.locator('.scene-introduction h1')).toHaveText(sceneCopy[locale].headline);
    await expect(page.locator('.hero-offer')).toHaveText(sceneCopy[locale].intro);
    await expect(page.locator('.scene-index>a').first()).toHaveAttribute('href',new RegExp(`projects/perch.html\\?lang=${locale}$`));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});

test('Legacy section routes, standalone case links and confirmed contacts work in every language', async ({page}) => {
  test.setTimeout(90000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const locale of ['ru','en','kk'] as const) {
    for(const id of ['about','contact']) {
      await page.goto(`${entry}?lang=${locale}#${id}`);
      await expect(page.locator('body')).toHaveAttribute('data-petal',id);
      await expect(page).toHaveURL(new RegExp(`lang=${locale}&petal=${id}$`));
      await page.locator('.preview-close').click();
      await expect(page.locator('body')).toHaveAttribute('data-view','overview');
      await page.goBack();
      await expect(page.locator('body')).toHaveAttribute('data-petal',id);
      await page.goForward();
      await expect(page.locator('body')).toHaveAttribute('data-view','overview');
    }
    await page.goto(`${prefix}/projects/forme.html?lang=${locale}`);
    await page.locator('#main-navigation a').nth(2).click();
    await expect(page.locator('body')).toHaveAttribute('data-petal','contact');
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    await expect(page.locator('.contact-actions a').first()).toHaveAttribute('href','https://t.me/tserriednichs');
    await expect(page.locator('.contact-actions a').nth(1)).toHaveAttribute('href','mailto:beibars.ileskhan2405@gmail.com');
    await page.evaluate(()=>{location.hash='about';});
    // Explicit query wins over an unrelated hash; legacy links without it migrate.
    await expect(page.locator('body')).toHaveAttribute('data-petal','contact');
  }
});

test('Cached revisit skips the opening delay and share errors expose a selectable link', async ({page}) => {
  await page.goto(`${entry}?lang=en`);
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating','false');
  await expect(page.locator('body')).toHaveAttribute('data-model','ready');
  await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('soft-lotus-intro-v2'))).toBe('1');
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-model','ready');
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-bloom','1.000');
  await page.locator('#index-perch').click();await page.locator('#preview-case-perch').click();
  await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('blocked'))},configurable:true}));
  await page.locator('.reader-links button').click();
  await expect(page.locator('.share-manual input')).toHaveValue(new RegExp('projects/perch.html\\?lang=en$'));
  await page.keyboard.press('Escape');await expect(page.locator('#preview-case-perch')).toBeFocused();
});

test('Draft PERCH flow preserves real content, Back, Escape and exact trigger focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${entry}?lang=ru`);
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-asset', 'accepted');
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
  await page.goto(`${entry}?lang=en`);
  for (const id of ['perch', 'selvedge', 'forme', 'about', 'contact']) {
    await page.locator(`#index-${id}`).click();
    for (const locale of ['ru', 'kk', 'en']) {
      await page.locator(`.soft-languages button[lang="${locale}"]`).click();
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page).toHaveTitle(`${copy[locale as 'ru'|'en'|'kk'].name} — ${sceneCopy[locale as 'ru'|'en'|'kk'].headline}`);
      await expect(page.locator('body')).toHaveAttribute('data-petal', id);
      await expect(page.locator('.petal-preview')).toBeVisible();
      await expect(page.locator('#preview-title')).toHaveText(['perch','selvedge','forme'].includes(id) ? id.toUpperCase() : sceneCopy[locale as 'ru'|'en'|'kk'][id as 'about'|'contact']);
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
  await page.goto(`${entry}?lang=kk`);
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
  await page.goto(`${base}${entry}`);
  await expect(page.locator('.scene-index > a').filter({hasText:'PERCH'})).toHaveAttribute('href', 'projects/perch.html?lang=ru');
  await page.locator('.scene-index > a').filter({hasText:'PERCH'}).click();
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
  await page.goto(`${entry}?lang=kk&petal=forme&view=case`);
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

test('One-screen navigation has no empty scroll and never captures the wheel', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${entry}?lang=en`);
  await expect(page.locator('body')).toHaveAttribute('data-model', 'ready');
  await page.evaluate(() => window.addEventListener('wheel', event => {
    document.documentElement.dataset.wheelPrevented = String(event.defaultPrevented);
  }));
  await page.mouse.move(400, 350);
  await page.mouse.wheel(0, 100);
  await expect(page.locator('html')).toHaveAttribute('data-wheel-prevented', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.locator('.scene-bottom button').click();
  await expect(page.locator('.scene-bottom button')).toHaveAttribute('aria-pressed', 'false');
  await page.mouse.move(400, 350);
  await page.mouse.wheel(0, 100);
  await expect(page.locator('html')).toHaveAttribute('data-wheel-prevented', 'false');
  await page.locator('.scene-bottom button').click();
  await page.mouse.move(400, 350);
  await page.mouse.wheel(0, -100);
  await expect(page.locator('html')).toHaveAttribute('data-wheel-prevented', 'false');
});

test('Loading keeps the same bud and model failure retains useful navigation', async ({ page }) => {
  let release: () => void = () => {};
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/models/*.glb', async route => { await gate; await route.abort(); });
  await page.goto(`${entry}?lang=en`);
  await expect(page.locator('.scene-poster img')).toHaveAttribute('src', /bud-desktop/);
  await expect(page.locator('.ink-loading')).toBeVisible();
  await expect(page.locator('progress')).not.toHaveAttribute('value', '100');
  await page.locator('#index-perch').click();
  await page.locator('#preview-case-perch').click();
  await expect(page.getByRole('dialog')).toContainText('PERCH');
  release();
  await expect(page.locator('body')).toHaveAttribute('data-model', 'failed');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#preview-case-perch')).toBeFocused();
  await expect(page.locator('.scene-poster img')).toHaveAttribute('src', /open-desktop/);
});

test('Mobile asset, all five projected controls and repeated selection remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${entry}?lang=en`);
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-asset-url', /mobile.glb/);
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-bloom', '1.000');
  for (const id of ['perch', 'selvedge', 'forme', 'about', 'contact']) {
    const button=page.locator(`#petal-${id}`);
    await expect(button).toBeVisible();
    const box=await button.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x+box!.width).toBeLessThanOrEqual(391);
  }
  await page.locator('#petal-perch').click();
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating', 'false');
  await page.screenshot({path:'evidence/lotus-v2/flow/perch-selected-390.png'});
  for(const id of ['forme','selvedge','about','contact','perch']) await page.locator(`#index-${id}`).click({delay:10});
  await expect(page.locator('body')).toHaveAttribute('data-petal','perch');
  await page.locator('#preview-case-perch').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#preview-case-perch')).toBeFocused();
});

test('Overview and selected content remain accessible at small and large viewports', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const viewport of [{width:1440,height:900},{width:320,height:640},{width:720,height:450}]) {
    await page.setViewportSize(viewport);
    await page.goto(`${entry}?lang=en`);
    await expect(page.locator('body')).toHaveAttribute('data-model','ready');
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
    await page.locator('#index-about').click();
    await expect(page.locator('.petal-preview')).toBeVisible();
    expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});

test('WebGL context loss leaves all content reachable', async ({ page }) => {
  await page.goto(`${entry}?lang=en`);
  await expect(page.locator('body')).toHaveAttribute('data-model','ready');
  await page.locator('canvas').evaluate(canvas => {
    (canvas as HTMLCanvasElement).getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
  });
  await expect(page.locator('body')).toHaveAttribute('data-model','failed');
  await page.locator('#index-forme').click();
  await page.locator('#preview-case-forme').click();
  await expect(page.getByRole('dialog')).toContainText('FORME');
});

test('All eleven cases preserve real evidence and EN/RU/KK at 360px', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({width:360,height:800});
  for(const locale of ['en','ru','kk'] as const) for(const project of projects) {
    expect((await page.goto(`${prefix}/projects/${project.id}.html?lang=${locale}`))?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    await expect(page.locator('h1')).toHaveText(project.name+'.');
    await expect(page.locator('.case-context').first()).toContainText(caseNotes[locale][project.id]?.role || copy[locale].roleText);
    await expect(page.locator('.case-details')).toContainText(copy[locale].project[project.id].limit);
    await expect(page.locator('.case-cover img')).toHaveJSProperty('naturalWidth',dimensions[project.id].main[0]);
    await expect(page.locator('.case-actions a').first()).toHaveAttribute('href',project.live);
    await expect(page.locator('.case-actions a').nth(1)).toHaveAttribute('href',project.source);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});

test('Legacy locale URLs keep translated cases and home, with and without JavaScript', async ({ page, browser }) => {
  test.setTimeout(90000);
  for(const locale of ['en','kk'] as const) {
    await page.goto(`${prefix}/${locale}/index.html#work`);
    await expect(page).toHaveURL(new RegExp(`index.html\\?lang=${locale}$`));
    await expect(page.locator('html')).toHaveAttribute('lang',locale);
    for(const project of projects) {
      await page.goto(`${prefix}/${locale}/projects/${project.id}.html`);
      await expect(page).toHaveURL(new RegExp(`/projects/${project.id}.html\\?lang=${locale}`));
      await expect(page.locator('html')).toHaveAttribute('lang',locale);
    }
    const staticPage=await browser.newPage({javaScriptEnabled:false});
    for(const path of ['index.html','projects/perch.html','credits.html']) {
      expect((await staticPage.goto(`${base}${prefix}/${locale}/${path}`))?.status()).toBe(200);
      await expect(staticPage.locator('html')).toHaveAttribute('lang',locale);
      expect(await staticPage.locator('a[href]').count()).toBeGreaterThan(0);
    }
    await staticPage.close();
  }
});

test('The actual petal surface selects SELVEDGE and a drag does not select', async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(`${entry}?lang=en`);
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-bloom','1.000');
  // Bare front-right surface of the nearest petal, outside its HTML label.
  await page.mouse.move(810,760);await page.mouse.down();await page.mouse.move(840,760);await page.mouse.up();
  await expect(page.locator('body')).toHaveAttribute('data-view','overview');
  await page.mouse.click(810,760);
  await expect(page.locator('body')).toHaveAttribute('data-petal','selvedge');
  await expect(page.locator('#preview-title')).toHaveText('SELVEDGE');
});

test('Fallback gives accurate directions, readable navigation and uncropped short previews', async ({page}) => {
  test.setTimeout(60000);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,type:string,...args:unknown[]){
      return type.startsWith('webgl')?null:Reflect.apply(original,this,[type,...args]);
    } as typeof original;
  });
  for(const viewport of [{width:1165,height:747},{width:390,height:844},{width:320,height:640}]) {
    await page.setViewportSize(viewport);
    for(const locale of ['ru','en','kk'] as const) {
      await page.goto(`${entry}?lang=${locale}`);
      await expect(page.locator('body')).toHaveAttribute('data-model','failed');
      await expect(page).toHaveTitle(`${copy[locale].name} — ${sceneCopy[locale].headline}`);
      await expect(page.locator('.scene-introduction')).toContainText(sceneCopy[locale].fallbackHint);
      await expect(page.locator('.scene-poster')).toHaveCSS('opacity','1');
      for(const id of ['perch','selvedge','forme','contact']) {
        await page.locator(`#index-${id}`).click();
        expect(await page.locator('.petal-preview').evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
        if(locale==='ru'&&id==='perch') {
          await mkdir('evidence/lotus-v2/fallback-review',{recursive:true});
          await page.screenshot({path:`evidence/lotus-v2/fallback-review/perch-${viewport.width}.png`});
          expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
        }
        await page.locator('.preview-close').click();
        await expect(page.locator(`#index-${id}`)).toBeFocused();
      }
    }
  }
});

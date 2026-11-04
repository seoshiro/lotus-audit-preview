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
    await expect(page.locator('.hero-actions a').first()).toHaveAttribute('href',new RegExp(`projects/perch.html\\?lang=${locale}$`));
    await expect(page.locator('.scene-index>a').first()).toHaveAttribute('href',new RegExp(`projects/perch.html\\?lang=${locale}$`));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
});

test('Main work action opens a visible project list and returns keyboard focus in every language', async ({page}) => {
  test.setTimeout(60000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const locale of ['ru','en','kk'] as const){
    await page.goto(`${entry}?lang=${locale}`);
    const action=page.locator('#hero-work'),list=page.locator('#work-list'),close=page.locator('.work-browser-close');
    await action.focus();await page.keyboard.press('Enter');
    await expect(action).toHaveAttribute('aria-expanded','true');await expect(list).toBeVisible();await expect(close).toBeFocused();
    await expect(list.locator('a')).toHaveCount(11);
    await page.keyboard.press('Tab');await expect(list.locator('a').first()).toBeFocused();
    await page.keyboard.press('Escape');await expect(list).toBeHidden();await expect(action).toBeFocused();
    await page.keyboard.press('Space');await expect(list).toBeVisible();
    await list.locator(`a[href*="projects/perch.html"]`).click();await expect(page).toHaveURL(new RegExp(`projects/perch.html\\?lang=${locale}$`));
  }
  await page.route('**/models/*.glb',route=>route.abort());
  for(const viewport of [{width:390,height:844},{width:320,height:640}]){
    await page.setViewportSize(viewport);
    await page.goto(`${entry}?lang=kk`);await expect(page.locator('body')).toHaveAttribute('data-model','failed');
    await page.locator('#hero-work').click();await expect(page.locator('#work-list')).toBeVisible();
    expect(await page.locator('#work-browser').evaluate(el=>{const r=el.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&el.scrollWidth<=el.clientWidth;})).toBe(true);
  }
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
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

test('All-project catalog excludes the selected card and restores selection and focus on close', async ({page}) => {
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:640}]) {
    await page.setViewportSize(viewport);
    for(const locale of ['ru','en','kk']) {
      await page.goto(`${entry}?lang=${locale}`);
      await expect(page.locator('body')).toHaveAttribute('data-model','ready',{timeout:20000});
      await page.locator('#index-selvedge').click();
      const selectedURL=page.url(),trigger=page.locator('#index-all'),dialog=page.locator('#work-browser'),close=page.locator('.work-browser-close'),links=page.locator('#work-list>a');
      await trigger.focus();await page.keyboard.press('Enter');
      await expect(dialog).toBeVisible();await expect(close).toBeFocused();
      await expect(page.locator('.petal-preview')).toBeHidden();await expect(page.locator('.petal-labels')).toBeHidden();
      await expect(page.locator('.soft-canvas')).toHaveAttribute('data-decor','paused');
      expect(page.url()).toBe(selectedURL);await expect(links).toHaveCount(11);
      await page.keyboard.press('Tab');await expect(links.first()).toBeFocused();
      await page.keyboard.press('Shift+Tab');await expect(close).toBeFocused();
      await page.keyboard.press('Shift+Tab');await expect(links.last()).toBeFocused();
      await page.keyboard.press('Tab');await expect(close).toBeFocused();
      expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
      if(locale==='ru') {
        await links.locator('img').evaluateAll(images=>Promise.all(images.map(img=>(img as HTMLImageElement).decode())));
        await mkdir('evidence/project-list',{recursive:true});
        await page.screenshot({path:`evidence/project-list/after-${viewport.width}.png`});
        expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
      }
      await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();
      await expect(page.locator('#preview-title')).toHaveText('SELVEDGE');await expect(page.locator('.petal-preview')).toBeVisible();expect(page.url()).toBe(selectedURL);
      await page.locator('#index-forme').click();await trigger.click();await close.click();
      await expect(dialog).toBeHidden();await expect(trigger).toBeFocused();await expect(page.locator('#preview-title')).toHaveText('FORME');
      // Escape outside the catalog still returns to the flower; hero entry uses the same catalog.
      await page.keyboard.press('Escape');await expect(page.locator('body')).toHaveAttribute('data-view','overview');
      await page.locator('#hero-work').click();await expect(dialog).toBeVisible();await close.click();await expect(page.locator('#hero-work')).toBeFocused();
      // Real project links keep the locale, and browser Back cannot reopen two competing panels.
      await page.locator('#index-selvedge').click();await trigger.click();
      await links.locator('strong').filter({hasText:'PERCH'}).click();await expect(page).toHaveURL(new RegExp(`projects/perch.html\\?lang=${locale}$`));
      await page.goBack();await expect(page.locator('body')).toHaveAttribute('data-petal','selvedge');
      await expect(dialog).toBeHidden();await expect(page.locator('.petal-preview')).toBeVisible();
    }
  }
});

test('Catalog reversals preserve the live pose and home navigation reuses the loaded scene', async ({page}) => {
  test.setTimeout(60000);
  let modelRequests=0;
  page.on('request',r=>{if(r.url().endsWith('.glb'))modelRequests++;});
  await page.goto(`${entry}?lang=ru`);
  const scene=page.locator('.soft-canvas'),dialog=page.locator('#work-browser');
  await expect(scene).toHaveAttribute('data-bloom','1.000',{timeout:20000});
  await expect(scene).toHaveAttribute('data-animating','false');
  const identity=await page.evaluate(()=>{(window as unknown as {originalCanvas:HTMLCanvasElement|null}).originalCanvas=document.querySelector('canvas');return performance.timeOrigin;});
  await page.locator('#index-selvedge').click();await expect(scene).toHaveAttribute('data-animating','false');
  const pose=await scene.getAttribute('data-pose');
  await page.locator('#index-all').click();await expect(dialog).toHaveAttribute('data-phase','open');
  expect(await scene.getAttribute('data-pose')).toBe(pose);
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(scene).toHaveAttribute('data-catalog-depth','0.00000');
  expect(await scene.getAttribute('data-pose')).toBe(pose);
  for(let i=0;i<3;i++){
    await page.locator('#index-all').click();await page.waitForTimeout(110);
    await page.keyboard.press('Escape');await page.waitForTimeout(80);
    await page.locator('#index-all').click();
    await expect(dialog).toHaveAttribute('data-phase','open');
    await page.locator('.work-browser-close').click();await expect(dialog).toBeHidden();
  }
  await page.locator('.signature').click();await expect(page.locator('body')).toHaveAttribute('data-view','overview');
  await expect(scene).toHaveAttribute('data-animating','false');
  const homePose=JSON.parse((await scene.getAttribute('data-pose'))!);
  expect(homePose[0]).toBe(1);expect(Math.sin(homePose[1]+.18)).toBeCloseTo(0,4);expect(homePose.slice(2)).toEqual([0,0]);
  await expect(page.locator('.ink-loading')).toHaveCount(0);
  await page.goBack();await expect(page.locator('body')).toHaveAttribute('data-petal','selvedge');
  await page.goForward();await expect(page.locator('body')).toHaveAttribute('data-view','overview');
  await page.locator('#index-forme').click();await page.locator('.preview-close').click();
  await expect(scene).toHaveAttribute('data-animating','false');
  expect(await page.evaluate(()=>performance.timeOrigin)).toBe(identity);
  expect(await page.evaluate(()=>document.querySelector('canvas')===(window as unknown as {originalCanvas:HTMLCanvasElement}).originalCanvas)).toBe(true);
  expect(modelRequests).toBe(1);
  await page.locator('#index-perch').click();await page.locator('#index-all').click();await page.goBack();
  await expect(dialog).toBeHidden();await expect(page.locator('body')).toHaveAttribute('data-view','overview');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#hero-work').click();await expect(dialog).toHaveAttribute('data-phase','open');
  await expect(scene).toHaveAttribute('data-catalog-depth','0.00000');
  expect(await dialog.locator('.work-browser-header').evaluate(el=>getComputedStyle(el).transform)).toMatch(/none|matrix\(1, 0, 0, 1, 0, 0\)/);
  await page.keyboard.press('Escape');await expect(dialog).toBeHidden();await expect(page.locator('#hero-work')).toBeFocused();
});

test('Focus restoration follows visible controls under CPU throttling', async ({page}) => {
  test.setTimeout(60000);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});
  await page.route('**/models/*.glb',route=>route.abort());
  for(const reducedMotion of ['reduce','no-preference'] as const) {
    await page.emulateMedia({reducedMotion});
    await page.goto(`${entry}?lang=kk`);await expect(page.locator('body')).toHaveAttribute('data-model','failed');
    const hero=page.locator('#hero-work');
    await hero.focus();await page.keyboard.press('Enter');await expect(page.locator('#work-browser')).toHaveAttribute('data-phase','open');
    await page.keyboard.press('Tab');await page.keyboard.press('Escape');
    await expect(page.locator('#work-browser')).toBeHidden();await expect(hero).toBeFocused();
    await page.locator('#index-perch').click();await page.locator('#preview-case-perch').click();
    await page.keyboard.press('Escape');await expect(page.locator('#preview-case-perch')).toBeFocused();
  }
});

test('Cached revisit skips the opening delay and share errors expose a selectable link', async ({page}) => {
  await page.goto(`${entry}?lang=en`);
  await expect(page.locator('body')).toHaveAttribute('data-model','ready', { timeout: 20000 });
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-animating','false');
  await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('soft-lotus-intro-v2'))).toBe('1');
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-model','ready', { timeout: 20000 });
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
  await expect(page.locator('.soft-canvas')).toHaveAttribute('data-asset', 'accepted', { timeout: 20000 });
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
    expect(await page.evaluate(() => document.querySelector('dialog[open]')?.contains(document.activeElement))).toBe(true);
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
  await expect(page.locator('.soft-canvas')).toBeHidden();
  await expect(page.locator('progress')).not.toHaveAttribute('value', '100');
  await page.locator('#index-perch').click();
  await page.locator('#preview-case-perch').click();
  await expect(page.getByRole('dialog')).toContainText('PERCH');
  release();
  await expect(page.locator('body')).toHaveAttribute('data-model', 'failed');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#preview-case-perch')).toBeFocused();
  await expect(page.locator('.scene-poster img')).toHaveAttribute('src', /selected-desktop/);
  await page.locator('.scene-poster img').evaluate(image => (image as HTMLImageElement).decode());
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
  await page.mouse.move(970,710);await page.mouse.down();await page.mouse.move(995,710);await page.mouse.up();
  await expect(page.locator('body')).toHaveAttribute('data-view','overview');
  await page.mouse.click(970,710);
  await expect(page.locator('body')).toHaveAttribute('data-petal','selvedge');
  await expect(page.locator('#preview-title')).toHaveText('SELVEDGE');
});

test('Touch selection preserves a separate flower area and readable project content in all languages', async ({browser,baseURL}) => {
  const context = await browser.newContext({baseURL,viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'});
  const page = await context.newPage();
  try {
    for (const locale of ['ru','en','kk']) {
      await page.goto(`${entry}?lang=${locale}`);
      await expect(page.locator('body')).toHaveAttribute('data-model','ready',{timeout:20000});
      await expect(page.locator('.soft-canvas')).toHaveAttribute('data-decor','paused');
      await page.locator('#petal-forme').tap();
      for (const id of ['forme','perch','selvedge']) {
        await page.locator(`#index-${id}`).tap();
        await expect(page.locator('#preview-title')).toHaveText(id.toUpperCase());
        const boundary = Number(await page.locator('.soft-canvas').getAttribute('data-content-boundary'));
        const box = await page.locator('.petal-preview').boundingBox();
        expect(box!.y).toBeGreaterThanOrEqual(boundary-1);
        expect(await page.locator('.petal-preview').evaluate(el=>el.scrollHeight<=el.clientHeight+1)).toBe(true);
        await page.locator('.preview-product').evaluate(async image=>{await (image as HTMLImageElement).decode();});
      }
      await page.locator('#preview-case-selvedge').tap();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('dialog').locator('.reader-top button').tap();
      await expect(page.getByRole('dialog')).not.toBeVisible();
      await expect(page.locator('body')).toHaveAttribute('data-petal','selvedge');
      await page.locator('#index-all').tap();
      await expect(page.locator('#work-browser')).toBeVisible();
      await expect(page.locator('.petal-preview')).toBeHidden();
      await page.locator('.work-browser-close').tap();
      await expect(page.locator('#work-browser')).toBeHidden();
      await expect(page.locator('#preview-title')).toHaveText('SELVEDGE');
    }
  } finally { await context.close(); }
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
      const status = await page.locator('.scene-bottom').boundingBox(), nav = await page.locator('.scene-index').boundingBox();
      expect(status!.y + status!.height).toBeLessThanOrEqual(nav!.y);
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

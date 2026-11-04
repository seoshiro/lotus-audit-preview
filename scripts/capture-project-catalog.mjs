import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const origin=process.argv[2]||'https://seoshiro.github.io/lotus-audit-preview/';
const expected=process.argv[3];
if(!expected)throw Error('Expected deployed commit is required');
const version=await(await globalThis.fetch(new URL('version.json',origin))).json();
if(version.commit!==expected)throw Error('Published revision mismatch');
const dir='docs/lotus-art/catalog-proofs';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const records=[];
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:640}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('index.html?lang=ru',origin).href);await page.waitForFunction(()=>document.body.dataset.model==='ready');
  await page.locator('#index-selvedge').click();await page.locator('#index-all').click();
  await page.locator('#work-list img').evaluateAll(images=>Promise.all(images.map(img=>img.decode())));
  await page.screenshot({path:`${dir}/catalog-${viewport.width}.png`});
  const exclusive=!(await page.locator('.petal-preview').isVisible())&&await page.locator('#work-browser').isVisible();
  await page.keyboard.press('Escape');await page.locator('#preview-title').waitFor();
  await page.locator('.preview-product').evaluate(img=>img.decode());
  const restored=await page.locator('#index-all').evaluate(el=>el===document.activeElement)&&await page.locator('#preview-title').textContent()==='SELVEDGE';
  await page.screenshot({path:`${dir}/return-${viewport.width}.png`});
  records.push({viewport,exclusive,restored,errors});await page.close();
  if(!exclusive||!restored||errors.length)throw Error('Catalog interaction failed');
 }
}finally{await browser.close();}
const production=await(await globalThis.fetch('https://seoshiro.github.io/version.json')).json();
await fs.writeFile(`${dir}/verification.json`,JSON.stringify({origin,version,production,records},null,2));
console.log({origin,version,production,records});

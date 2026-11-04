import { Buffer } from 'node:buffer';
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
const origin=process.argv[2],commit=process.argv[3];if(!origin||!commit)throw Error('Usage: node scripts/verify-audit-live.mjs URL SHA');
const dir='evidence/lotus-audit/live';await fs.mkdir(dir,{recursive:true});
const html=await(await globalThis.fetch(new URL('index.html',origin))).text();const version=await(await globalThis.fetch(new URL('version.json',origin))).json();
if(version.commit!==commit||!html.includes(`name="portfolio-build" content="${commit}"`))throw Error('Published source revision mismatch');
if(!html.includes('noindex,nofollow'))throw Error('Preview must not be indexed');
const records=[];
for(const file of ['soft-lotus-candidate.glb','soft-lotus-mobile.glb','soft-lotus-open-desktop.png','soft-lotus-open-mobile.png']){
 const remote=await(await globalThis.fetch(new URL(`models/${file}`,origin))).arrayBuffer();const local=await fs.readFile(`public/models/${file}`);
 const hash=b=>createHash('sha256').update(Buffer.from(b)).digest('hex');
 if(hash(remote)!==hash(local))throw Error('Asset mismatch '+file);records.push({file,bytes:local.length,sha256:hash(local)});
}
const production=await(await globalThis.fetch('https://seoshiro.github.io/version.json')).json();
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});const errors=[];
try{
 for(const viewport of [{width:1440,height:900},{width:1165,height:747},{width:390,height:844},{width:320,height:640}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(new URL('index.html?lang=en',origin).href);await page.waitForFunction(()=>document.body.dataset.model==='ready');
  await page.screenshot({path:`${dir}/overview-${viewport.width}.png`});
  await page.locator('#index-perch').click();await page.screenshot({path:`${dir}/perch-${viewport.width}.png`});await page.close();
  const fallback=await browser.newPage({viewport,reducedMotion:'reduce'});
  await fallback.addInitScript(()=>{const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:Reflect.apply(old,this,[type,...args]);};});
  for(const locale of ['en','kk']){
   await fallback.goto(new URL(`index.html?lang=${locale}`,origin).href);await fallback.waitForFunction(()=>document.body.dataset.model==='failed');await fallback.locator('.scene-poster img').evaluate(img=>img.decode());
   if(!await fallback.evaluate(()=>document.documentElement.scrollHeight<=window.innerHeight+1&&document.documentElement.scrollWidth<=window.innerWidth+1))throw Error('Fallback has empty document overflow');
   await fallback.screenshot({path:`${dir}/fallback-${locale}-${viewport.width}.png`});
  }
  await fallback.locator('#index-contact').click();await fallback.screenshot({path:`${dir}/fallback-contact-${viewport.width}.png`});await fallback.close();
 }
}finally{await browser.close();}
await fs.writeFile(`${dir}/verification.json`,JSON.stringify({origin,commit,production,assets:records,errors},null,2));if(errors.length)throw Error(errors.join('\n'));console.log({origin,commit,production,assets:records.length,errors});

import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const dir='evidence/lotus-audit';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 for(const [width,height] of [[1440,900],[390,844],[320,640],[1165,747],[720,450]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:5318/soft-lotus.html?lang=ru');
  await page.waitForFunction(()=>document.querySelector('.soft-canvas')?.dataset.bloom==='1.000');
  await page.screenshot({path:`${dir}/overview-${width}.png`});
  for(const id of ['perch','selvedge','forme','about','contact']) {
   await page.locator(`#index-${id}`).click();
   await page.screenshot({path:`${dir}/${id}-${width}.png`});
   console.log(JSON.stringify({width,id,overflow:await page.locator('.petal-preview').evaluate(el=>el.scrollHeight-el.clientHeight),errors}));
  }
  await page.close();
 }
 for(const pose of [0,.25,.5,.75,1]) {
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await page.goto(`http://127.0.0.1:5318/soft-lotus.html?pose=${pose}&lang=en`);
  await page.waitForFunction(()=>document.querySelector('.soft-canvas')?.dataset.asset==='accepted');
  await page.waitForFunction(v=>document.querySelector('.soft-canvas')?.dataset.bloom===v.toFixed(3),pose);
  await page.screenshot({path:`${dir}/bloom-${pose*100}.png`});await page.close();
 }
} finally {await browser.close();}

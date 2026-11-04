import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const origin=process.argv[2]||'http://127.0.0.1:5318/soft-lotus.html';
const tag=process.argv[3]||'candidate';
if(!/^[a-z0-9-]+$/.test(tag))throw Error('Invalid evidence tag');
const dir=`evidence/lotus-art/${tag}`;await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const records=[],errors=[];
try{
 for(const viewport of [{width:1440,height:900},{width:1165,height:747},{width:390,height:844},{width:430,height:932},{width:320,height:640}]){
  const page=await browser.newPage({viewport,reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const url=new URL(origin);url.searchParams.set('lang','ru');await page.goto(url.href);
  await page.waitForFunction(()=>document.body.dataset.model==='ready');
  await page.evaluate(async()=>{await document.fonts.ready;const url=window.getComputedStyle(document.querySelector('.botanical-shadow')).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];if(url){const img=new window.Image();img.src=url;await img.decode();}});
  await page.screenshot({path:`${dir}/overview-${viewport.width}.png`});
  for(const id of ['perch','selvedge','forme','about','contact']){
   await page.locator(`#index-${id}`).click();
   if(await page.locator('.preview-product').count())await page.locator('.preview-product').evaluate(img=>img.decode());
   await page.screenshot({path:`${dir}/${id}-${viewport.width}.png`});
   records.push({viewport,id,...await page.locator('.petal-preview').evaluate(el=>({overflow:el.scrollHeight-el.clientHeight,top:el.getBoundingClientRect().top,canvasBottom:document.querySelector('.soft-canvas').getBoundingClientRect().bottom}))});
  }
  await page.close();
 }
 if(origin.includes('127.0.0.1'))for(const pose of [0,.25,.5,.75,1]){
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const url=new URL(origin);url.searchParams.set('pose',String(pose));url.searchParams.set('lang','ru');
  await page.goto(url.href);await page.waitForFunction(()=>document.body.dataset.model==='ready');
  await page.waitForFunction(value=>document.querySelector('.soft-canvas')?.dataset.bloom===value.toFixed(3),pose);
  await page.screenshot({path:`${dir}/bloom-${pose*100}.png`});await page.close();
 }
}finally{await browser.close();}
await fs.writeFile(`${dir}/layout.json`,JSON.stringify({origin,records,errors},null,2));
console.log(JSON.stringify({tag,records,errors},null,2));if(errors.length)throw Error('Browser errors in visual capture');

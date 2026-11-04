import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
const label=process.argv[2]||'before',base=process.argv[3]||'http://127.0.0.1:5319/';
const dir='evidence/lotus-contrast/'+label;await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[];
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,isMobile:viewport.width<700,hasTouch:viewport.width<700,reducedMotion:'reduce'});
  const page=await context.newPage();await page.goto(new URL('index.html?lang=ru',base).href);
  await page.waitForFunction(()=>document.body.dataset.model==='ready'&&document.querySelector('.soft-canvas')?.dataset.animating==='false');
  const save=async state=>{
   await page.waitForTimeout(250);
   const info=await page.evaluate(()=>{const host=document.querySelector('.soft-canvas'),gl=document.querySelector('canvas').getContext('webgl2');return {pose:JSON.parse(host.dataset.pose),bounds:JSON.parse(host.dataset.flowerBounds),renderer:gl.getParameter(gl.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)};});
   await page.screenshot({path:`${dir}/${viewport.width}-${state}.png`});results.push({viewport,state,...info});
  };
  await save('overview');
  for(const id of ['perch','selvedge','forme']){
   await page.locator('#index-'+id).click();await page.waitForFunction(()=>document.querySelector('.soft-canvas')?.dataset.animating==='false');await save(id);
   await page.locator('#preview-case-'+id).click();await page.waitForFunction(()=>JSON.parse(document.querySelector('.soft-canvas').dataset.pose)[3]===1);await save(id+'-case');
   await page.locator('.reader-top button').click();await page.waitForFunction(()=>document.body.dataset.view==='selected'&&document.querySelector('.soft-canvas').dataset.animating==='false');
  }
  await context.close();
 }
 await fs.writeFile(dir+'/captures.json',JSON.stringify({label,base,browser:browser.version(),conditions:'Installed headless Chrome, real AMD WebGL, reduced motion for identical stable camera and pose; mobile is touch emulation, not a physical phone.',results},null,2));
 console.log(`Saved ${results.length} ${label} captures`);
}finally{await browser.close();}

import { chromium } from '@playwright/test';
import { mkdir,writeFile } from 'node:fs/promises';
const output='evidence/lotus-v2/release-review'; await mkdir(output,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CI?undefined:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const reports=[];
for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:320,height:640},{width:720,height:450}]) {
 const context=await browser.newContext({viewport});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
   window.__lotusFrames=[];window.__lotusLong=[];
   new window.PerformanceObserver(list=>window.__lotusLong.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
   let previous=performance.now();const start=previous;
   function sample(now){const el=document.querySelector('.soft-canvas');window.__lotusFrames.push({at:now,dt:now-previous,bloom:Number(el?.dataset.bloom||0),moving:el?.dataset.animating==='true',cpu:Number(el?.dataset.renderCpuMs||0),w:document.querySelector('canvas')?.width,h:document.querySelector('canvas')?.height});previous=now;if(now-start<12000)requestAnimationFrame(sample)}requestAnimationFrame(sample);
 });
 await page.goto('http://127.0.0.1:5319/index.html?lang=en');
 await page.waitForFunction(()=>document.querySelector('.soft-canvas')?.dataset.bloom==='1.000'&&document.body.dataset.model==='ready');
 await page.screenshot({path:`${output}/overview-${viewport.width}.png`});
 for(const id of ['perch','selvedge','forme','about','contact']) {
   await page.locator(`#index-${id}`).click();
   await page.waitForFunction(()=>document.querySelector('.soft-canvas')?.dataset.animating==='false');
   await page.screenshot({path:`${output}/${id}-${viewport.width}.png`});
   if(['perch','selvedge','forme'].includes(id)) {
     await page.locator(`#preview-case-${id}`).click();await page.getByRole('dialog').waitFor();
     await page.screenshot({path:`${output}/${id}-reader-${viewport.width}.png`});
     await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
   }
 }
 const report=await page.evaluate(()=>{
  const frames=window.__lotusFrames, moving=frames.filter(f=>f.moving&&f.dt<250);const sorted=moving.map(f=>f.dt).sort((a,b)=>a-b);const canvas=document.querySelector('canvas');const gl=canvas?.getContext('webgl2');const debug=gl?.getExtension('WEBGL_debug_renderer_info');
  return {frames,longTasks:window.__lotusLong,motionFrames:moving.length,frameMedian:sorted[Math.floor(sorted.length*.5)],frameP95:sorted[Math.floor(sorted.length*.95)],renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unavailable',canvasSizes:[...new Set(frames.filter(f=>f.w).map(f=>`${f.w}x${f.h}`))],resources:performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.glb')).map(r=>({url:r.name,duration:r.duration,bytes:r.transferSize}))};
 });
 reports.push({viewport,errors,...report});await context.close();
}
await writeFile(`${output}/performance.json`,JSON.stringify({browser:browser.version(),note:'Chrome on local Windows hardware; phone viewports are emulated, not physical devices. RAF intervals include browser scheduling, not isolated GPU timings.',reports},null,2));await browser.close();
if(reports.some(r=>r.errors.length))throw Error('Page errors in flow');console.log(reports.map(({viewport,motionFrames,frameMedian,frameP95,canvasSizes,errors})=>({viewport,motionFrames,frameMedian,frameP95,canvasSizes,errors})));

import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
const origin=process.argv[2]||'http://127.0.0.1:5319/';
const dir='evidence/lotus-audit/performance';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const reports=[];
try {
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  const context=await browser.newContext({viewport});const page=await context.newPage();
  const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:40,downloadThroughput:1250000,uploadThroughput:625000});
  await page.addInitScript(()=>{
   window.audit={longTasks:[],marks:[],lcp:[],cls:0};
   new window.PerformanceObserver(list=>window.audit.longTasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
   new window.PerformanceObserver(list=>window.audit.lcp.push(...list.getEntries().map(e=>({start:e.startTime,size:e.size})))).observe({type:'largest-contentful-paint',buffered:true});
   new window.PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.audit.cls+=e.value;}).observe({type:'layout-shift',buffered:true});
   window.auditMark=name=>{performance.mark(name);window.audit.marks.push({name,at:performance.now()});};
  });
  await cdp.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline.frame,cc,viz,gpu,blink.user_timing,toplevel',transferMode:'ReturnAsStream'});
  await page.goto(new URL('index.html?lang=en',origin).href);
  await page.waitForFunction(()=>document.body.dataset.model==='ready');await page.evaluate(()=>window.auditMark('model-ready'));
  await page.waitForFunction(()=>document.querySelector('.soft-canvas')?.dataset.bloom==='1.000');await page.evaluate(()=>window.auditMark('opening-complete'));
  await page.evaluate(()=>window.auditMark('rapid-start'));
  for(const id of ['perch','forme','selvedge','about','contact','perch','forme','perch']){
   await page.locator(`#index-${id}`).click();await page.waitForTimeout(90);
  }
  await page.waitForFunction(()=>document.querySelector('.soft-canvas')?.dataset.animating==='false');await page.evaluate(()=>window.auditMark('rapid-complete'));
  await page.locator('#preview-case-perch').click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.waitForTimeout(250);
  const completed=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await completed;
  let trace='';for(;;){const part=await cdp.send('IO.read',{handle:stream});trace+=part.data;if(part.eof)break;}await cdp.send('IO.close',{handle:stream});
  await fs.writeFile(`${dir}/trace-${viewport.width}.json`,trace);
  const events=JSON.parse(trace).traceEvents;
  const counts={};for(const event of events)if(/frame|present|swap|pipeline/i.test(event.name))counts[event.name]=(counts[event.name]||0)+1;
  const details=await page.evaluate(()=>{
   const gl=document.querySelector('canvas')?.getContext('webgl2');const debug=gl?.getExtension('WEBGL_debug_renderer_info');
   return {...window.audit,renderer:debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'unknown',resources:performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.glb')).map(r=>({url:r.name,duration:r.duration,transfer:r.transferSize})),navigation:performance.getEntriesByType('navigation').map(r=>({ttfb:r.responseStart,domReady:r.domContentLoadedEventEnd}))};
  });
  reports.push({viewport,...details,traceEventCounts:counts});await context.close();
 }
 await fs.writeFile(`${dir}/report.json`,JSON.stringify({origin,browser:browser.version(),os:os.version(),cpu:os.cpus()[0]?.model,logicalCores:os.cpus().length,memoryGiB:Math.round(os.totalmem()/1024**3),conditions:'Installed headless Chrome on Windows hardware; cold browser cache; simulated 10 Mbps down / 5 Mbps up / 40 ms latency; no CPU throttle; phone viewport emulation, not a physical phone. Trace records compositor and GPU pipeline as well as main thread. No screenshot tracing during timed pass.',reports},null,2));
 console.log(JSON.stringify(reports.map(r=>({viewport:r.viewport,renderer:r.renderer,marks:r.marks,longTasks:r.longTasks,traceEventCounts:r.traceEventCounts})),null,2));
} finally {await browser.close();}

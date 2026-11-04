import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const origin=process.argv[2]||'http://127.0.0.1:5319/';
const dir='evidence/lotus-audit/motion';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  const context=await browser.newContext({viewport,recordVideo:{dir,size:viewport}});const started=Date.now();const page=await context.newPage();
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:70,downloadThroughput:375000,uploadThroughput:250000});
  await page.goto(new URL('index.html?lang=en',origin).href);
  await page.waitForFunction(()=>document.body.dataset.model==='ready');const ready=(Date.now()-started)/1000;await page.waitForFunction(()=>document.querySelector('.soft-canvas')?.dataset.animating==='false');const open=(Date.now()-started)/1000;
  await page.waitForTimeout(500);
  for(const id of ['perch','selvedge','forme','about','contact']) {await page.locator(`#index-${id}`).click();await page.waitForTimeout(680);}
  for(const id of ['perch','forme','about','selvedge','contact','perch']) {await page.locator(`#index-${id}`).click();await page.waitForTimeout(100);}
  await page.waitForTimeout(600);await page.locator('#preview-case-perch').click();await page.getByRole('dialog').waitFor();await page.waitForTimeout(400);
  await page.getByRole('dialog').evaluate(el=>el.scrollTo(0,700));await page.waitForTimeout(400);await page.keyboard.press('Escape');await page.getByRole('dialog').waitFor({state:'hidden'});await page.waitForTimeout(400);
  await page.locator('.preview-close').click();await page.waitForTimeout(1000);
  const video=page.video();await context.close();await video.saveAs(`${dir}/flow-${viewport.width}.webm`);
  await fs.writeFile(`${dir}/flow-${viewport.width}.json`,JSON.stringify({origin,viewport,ready,open,conditions:'Continuous 25 fps browser capture; cold cache; 3 Mbps down / 2 Mbps up / 70 ms latency. Marker times relative to page creation; not a frame-time benchmark.'},null,2));
  console.log(`Recorded real continuous browser flow at ${viewport.width}x${viewport.height}`);
 }
} finally {await browser.close();}

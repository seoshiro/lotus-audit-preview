import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const origin=process.argv[2]||'http://127.0.0.1:5319/';
const dir='evidence/lotus-transitions';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]) {
  const context=await browser.newContext({viewport,recordVideo:{dir,size:viewport}});
  const page=await context.newPage();const started=Date.now();const marks=[];
  const mark=name=>marks.push({name,at:(Date.now()-started)/1000});
  await page.goto(new URL('index.html?lang=ru',origin).href);
  await page.waitForFunction(()=>document.body.dataset.model==='ready'&&document.querySelector('.soft-canvas')?.dataset.animating==='false');
  mark('ready');await page.waitForTimeout(800);
  mark('overview-to-catalog');await page.locator('#hero-work').click();await page.waitForTimeout(1100);
  mark('catalog-to-overview');await page.locator('.work-browser-close').click();await page.waitForTimeout(1100);
  mark('select-selvedge');await page.locator('#index-selvedge').click();await page.waitForTimeout(1100);
  mark('selected-to-catalog');await page.locator('#index-all').click();await page.waitForTimeout(1000);
  mark('catalog-to-selected');await page.keyboard.press('Escape');await page.waitForTimeout(1100);
  mark('beibars-to-overview');await page.locator('.signature').click();await page.waitForTimeout(1300);
  mark('select-forme');await page.locator('#index-forme').click();await page.waitForTimeout(900);
  mark('return-to-flower');await page.locator('.preview-close').click();await page.waitForTimeout(1100);
  mark('rapid-reversals');
  for(let i=0;i<2;i++) {await page.locator('#index-all').click();await page.waitForTimeout(150);await page.keyboard.press('Escape');await page.waitForTimeout(100);}
  await page.locator('#index-all').click();await page.waitForTimeout(800);await page.keyboard.press('Escape');await page.waitForTimeout(900);
  mark('case-and-back');await page.locator('#index-perch').click();await page.locator('#preview-case-perch').click();await page.waitForTimeout(1000);await page.keyboard.press('Escape');await page.waitForTimeout(800);
  mark('history-back');await page.goBack();await page.waitForTimeout(1000);
  mark('reduced-motion');await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#hero-work').click();await page.waitForTimeout(600);await page.keyboard.press('Escape');await page.waitForTimeout(700);
  const video=page.video();await context.close();await video.saveAs(`${dir}/transitions-${viewport.width}.webm`);
  await fs.writeFile(`${dir}/transitions-${viewport.width}.json`,JSON.stringify({origin,viewport,marks,browser:browser.version(),conditions:'Continuous 25 fps recording of installed Chrome on Windows with hardware WebGL. No artificial network or CPU throttling for this demonstration. Phone viewport emulation, not a physical phone. Recording is not the performance measurement.'},null,2));
  console.log(`Recorded transitions ${viewport.width}`);
 }
}finally{await browser.close();}

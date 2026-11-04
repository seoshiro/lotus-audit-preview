import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const origin=process.argv[2]||'http://127.0.0.1:5319/';
const dir='evidence/lotus-audit/followup';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
  for(const [width,height,locale] of [[1440,900,'ru'],[390,844,'kk'],[320,640,'en']]) {
    const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
    await page.goto(new URL(`index.html?lang=${locale}`,origin).href);
    await page.waitForFunction(()=>document.body.dataset.model==='ready');
    await page.screenshot({path:`${dir}/overview-${width}.png`});
    await page.locator('#hero-work').click();
    await page.locator('#work-list').waitFor({state:'visible'});
    await page.screenshot({path:`${dir}/work-${width}-${locale}.png`});await page.close();
  }
}finally{await browser.close();}

import { chromium } from '@playwright/test';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const device=viewport.width===1440?'desktop':'mobile';
  for(const state of ['bud','open','selected']){
   const page=await browser.newPage({viewport,reducedMotion:'reduce'});
   await page.goto(`http://127.0.0.1:5318/soft-lotus.html?lang=en${state==='selected'?'&petal=perch':`&pose=${state==='bud'?0:1}`}`);
   await page.waitForFunction(()=>document.body.dataset.model==='ready');
   if(state==='selected'&&await page.locator('.preview-close').count()===0)await page.locator('#index-perch').click();
   await page.addStyleTag({content:'html,body,.soft-stage{background:transparent!important}.soft-header,.scene-introduction,.petal-labels,.scene-index,.scene-bottom,.paper-grain,.botanical-shadow,.prototype-note,.petal-preview{visibility:hidden!important}'});
   if(state==='selected'&&device==='mobile'){
    const boundary=await page.locator('.soft-canvas').getAttribute('data-content-boundary');
    await page.screenshot({path:`public/models/soft-lotus-${state}-${device}.png`,omitBackground:true,clip:{x:0,y:64,width:viewport.width,height:Math.floor(Number(boundary)-64)}});
   }else await page.screenshot({path:`public/models/soft-lotus-${state}-${device}.png`,omitBackground:true});
   await page.close();
  }
 }
}finally{await browser.close();}
console.log('Captured six transparent posters from the real WebGL scene.');

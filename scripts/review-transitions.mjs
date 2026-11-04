import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const dir='evidence/lotus-transitions';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 for(const width of [1440,390]) {
  const bytes=await fs.readFile(`${dir}/transitions-${width}.webm`);
  const marks=JSON.parse(await fs.readFile(`${dir}/transitions-${width}.json`,'utf8')).marks;
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.setContent(`<body style="margin:0;background:#eee;font:14px Arial"><video muted preload="auto" style="display:none" src="data:video/webm;base64,${bytes.toString('base64')}"></video><main style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px"></main>`);
  for(const name of ['overview-to-catalog','catalog-to-overview','selected-to-catalog','catalog-to-selected','beibars-to-overview','return-to-flower','rapid-reversals','reduced-motion']) {
   await page.evaluate(async ({width,at})=>{
    const video=document.querySelector('video');await new Promise(resolve=>{if(video.readyState>=2)resolve();else video.onloadeddata=resolve;});video.pause();
    document.querySelector('main').replaceChildren();
    for(let i=0;i<15;i++){
     const time=Math.min(video.duration-.01,Math.max(.01,at-.12+i*.065));
     await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});
     const canvas=document.createElement('canvas');canvas.width=width===1440?284:130;canvas.height=width===1440?178:281;
     canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
     const figure=document.createElement('figure');figure.style='margin:0;background:white;display:flex;flex-direction:column;align-items:center';figure.append(canvas);
     const caption=document.createElement('figcaption');caption.textContent=time.toFixed(3)+' s';figure.append(caption);document.querySelector('main').append(figure);
    }
   },{width,at:marks.find(m=>m.name===name).at});
   await page.screenshot({path:`${dir}/review-${width}-${name}.png`,fullPage:true});
  }
  await page.close();
 }
}finally{await browser.close();}

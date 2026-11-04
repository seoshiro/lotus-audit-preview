import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const dir='evidence/lotus-art/motion';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try {
 for(const width of [1440,390]) {
  const bytes=await fs.readFile(`${dir}/flow-${width}.webm`);
  const page=await browser.newPage({viewport:{width:1440,height:1500}});
  await page.setContent(`<body style="margin:0;background:#eee;font:14px Arial"><video muted preload="auto" style="display:none" src="data:video/webm;base64,${bytes.toString('base64')}"></video><main style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px"></main>`);
  await page.evaluate(async width=>{
   const video=document.querySelector('video');await new Promise(resolve=>{if(video.readyState>=2)resolve();else video.onloadeddata=resolve;});video.pause();
   const duration=video.duration;
   for(let i=0;i<24;i++){
    const time=duration*i/24+.01;
    await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});
    const canvas=document.createElement('canvas');canvas.width=width===1440?356:135;canvas.height=width===1440?223:292;
    canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
    const figure=document.createElement('figure');figure.style='margin:0;background:white;display:flex;flex-direction:column;align-items:center';figure.append(canvas);const caption=document.createElement('figcaption');caption.textContent=time.toFixed(2)+' s';figure.append(caption);document.querySelector('main').append(figure);
   }
  },width);
  await page.screenshot({path:`${dir}/review-${width}.png`,fullPage:true});
  const marks=JSON.parse(await fs.readFile(`${dir}/flow-${width}.json`,'utf8'));
  await page.evaluate(async ({width,ready,open})=>{
   const video=document.querySelector('video');document.querySelector('main').replaceChildren();
   const start=Math.max(0,ready-1.4),end=Math.min(video.duration-.02,open+.4);
   for(let i=0;i<24;i++){
    const time=start+(end-start)*i/23;
    await new Promise(resolve=>{video.onseeked=resolve;video.currentTime=time;});
    const canvas=document.createElement('canvas');canvas.width=width===1440?356:135;canvas.height=width===1440?223:292;
    canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
    const figure=document.createElement('figure');figure.style='margin:0;background:white;display:flex;flex-direction:column;align-items:center';figure.append(canvas);const caption=document.createElement('figcaption');caption.textContent=time.toFixed(2)+' s';figure.append(caption);document.querySelector('main').append(figure);
   }
  },{width,...marks});
  await page.screenshot({path:`${dir}/opening-${width}.png`,fullPage:true});
  await page.close();
 }
}finally{await browser.close();}

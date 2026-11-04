import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const tag=process.argv[2]||'final-local';
if(!/^[a-z0-9-]+$/.test(tag))throw Error('Invalid evidence tag');
const dir='docs/lotus-art/proofs';await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 for(const [state,width,height] of [['overview',1440,900],['perch',1440,900],['overview',390,844],['forme',390,844]]){
  const page=await browser.newPage({viewport:{width:width*2,height:height+70}});
  const before=await fs.readFile(`evidence/lotus-art/before/${state}-${width}.png`);
  const after=await fs.readFile(`evidence/lotus-art/${tag}/${state}-${width}.png`);
  await page.setContent(`<body style="margin:0;background:#f4f1ea;color:#292823;font:16px Arial"><main style="display:grid;grid-template-columns:1fr 1fr"><section><p style="margin:24px">До · ${width} × ${height}</p><img width="${width}" height="${height}" src="data:image/png;base64,${before.toString('base64')}"></section><section><p style="margin:24px">После · ${width} × ${height}</p><img width="${width}" height="${height}" src="data:image/png;base64,${after.toString('base64')}"></section></main>`);
  await page.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
  await page.screenshot({path:`${dir}/compare-${state}-${width}.png`,fullPage:true});await page.close();
 }
 for(const pose of [0,25,50,75,100])await fs.copyFile(`evidence/lotus-art/final-local/bloom-${pose}.png`,`${dir}/bloom-${pose}.png`);
}finally{await browser.close();}

/* global Image */
import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';

// Small navigation previews are resized from the actual project captures.
// The full-resolution images remain unchanged in project previews and cases.
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const records=[];
try {
  const page=await browser.newPage();
  for(const id of ['perch','selvedge','forme']) {
    const source=`docs/originals/${id}.png`,bytes=await readFile(source);
    const result=await page.evaluate(async data=>{
      const image=new Image();image.src=data;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=320;canvas.height=Math.round(image.height*320/image.width);
      const context=canvas.getContext('2d');context.imageSmoothingQuality='high';context.drawImage(image,0,0,canvas.width,canvas.height);
      return {url:canvas.toDataURL('image/webp',.94),width:canvas.width,height:canvas.height};
    },`data:image/png;base64,${bytes.toString('base64')}`);
    const output=Buffer.from(result.url.split(',')[1],'base64'),file=`public/assets/${id}-petal.webp`;
    await writeFile(file,output);
    records.push({source,sourceSHA256:createHash('sha256').update(bytes).digest('hex'),file,width:result.width,height:result.height,bytes:output.length});
  }
  await writeFile('docs/lotus-audit/petal-thumbnails.json',JSON.stringify(records,null,2)+'\n');console.log(records);
} finally {await browser.close();}

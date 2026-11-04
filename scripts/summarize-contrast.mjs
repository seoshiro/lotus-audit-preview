import { Buffer } from 'node:buffer';
import fs from 'node:fs/promises';
const file=process.argv[2]||'evidence/lotus-contrast/contrast-report.json';
const report=JSON.parse(await fs.readFile(file,'utf8')),groups=[];
function walk(suite){for(const spec of suite.specs||[])for(const test of spec.tests)for(const result of test.results)for(const a of result.attachments||[])if(a.name==='actual-background-contrast'){const viewport=Number(spec.title.match(/at (\d+)/)[1]);groups.push({viewport,status:result.status,states:JSON.parse(Buffer.from(a.body,'base64').toString())});}for(const child of suite.suites||[])walk(child);}
walk(report);
const summary=groups.map(group=>{const rows=group.states.flatMap(s=>s.rows),labels=rows.filter(x=>x.id.startsWith('petal-'));return {width:group.viewport,status:group.status,states:group.states.length,measuredTextElements:rows.length,minimum:Math.min(...rows.map(x=>x.minimum)),petalMinimum:Math.min(...labels.map(x=>x.minimum)),failures:rows.filter(x=>x.minimum<4.5||!x.samples).length};});
const result={method:'Rendered foreground/transparent-text difference mask samples the real composited background under glyphs. WCAG luminance, actual text color and ancestor opacity. No empty padding or thumbnail-border samples.',conditions:'Installed Chrome 156, Windows, hardware AMD WebGL. Reduced-motion stable poses. Mobile sizes are viewport emulation, not physical phones.',summary,groups};
const output=process.argv[3]||'evidence/lotus-contrast/contrast-results.json';await fs.writeFile(output,JSON.stringify(result,null,2));console.log(summary);

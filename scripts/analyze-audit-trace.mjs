import fs from 'node:fs/promises';
const dir=process.argv[2]||'evidence/lotus-audit/performance';const report=JSON.parse(await fs.readFile(`${dir}/report.json`,'utf8'));
for(const r of report.reports){
 const t=JSON.parse(await fs.readFile(`${dir}/trace-${r.viewport.width}.json`,'utf8')).traceEvents;
 const mark=name=>t.find(e=>e.name===name&&e.cat==='blink.user_timing');
 const ready=mark('model-ready'),open=mark('opening-complete'),start=mark('rapid-start'),end=mark('rapid-complete');
 const origin=ready.ts-ready.args.data.startTime*1000;
 const windows=[['startup',origin,ready.ts],['opening',ready.ts,open.ts],['rapid-selection',start.ts,end.ts]];
 r.presentation=windows.map(([name,a,b])=>{
  const events=t.filter(e=>e.pid===ready.pid&&e.ts>=a&&e.ts<=b);
  const present=[...new Set(events.filter(e=>e.name==='AnimationFrame::Presentation').map(e=>e.ts))].sort((x,y)=>x-y);
  const intervals=present.slice(1).map((v,i)=>(v-present[i])/1000).sort((x,y)=>x-y);
  const drops=events.filter(e=>e.name==='DroppedFrame');
  return {phase:name,durationMs:(b-a)/1000,presentedAnimationFrames:present.length,presentationIntervalMs:{p50:intervals[Math.floor(intervals.length*.5)],p95:intervals[Math.floor(intervals.length*.95)],max:intervals.at(-1),over33ms:intervals.filter(v=>v>33.33).length},drawFrames:new Set(events.filter(e=>e.name==='DrawFrame').map(e=>e.args.frameSeqId)).size,dropSignals:new Set(drops.map(e=>e.args.frameSeqId)).size,partialUpdateSignals:new Set(drops.filter(e=>e.args.hasPartialUpdate).map(e=>e.args.frameSeqId)).size,longTasks:r.longTasks.filter(e=>e.start>=(a-origin)/1000&&e.start<(b-origin)/1000)};
 });
 delete r.traceEventCounts;
}
report.method='Chrome trace AnimationFrame::Presentation feedback scoped to the page renderer and marked phases; unique DrawFrame / DroppedFrame sequence IDs also counted. Partial-update signals are reported separately and are not silently treated as entirely missed frames. Startup includes deliberately idle network waiting and is not a steady-state FPS score. Headless compositor measurements, not a physical-screen or physical-phone certification. Raw traces retained locally.';
await fs.writeFile(`${dir}/summary.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));

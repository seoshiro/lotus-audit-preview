import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { allPages, aliases } from './page-manifest.ts';
const root = resolve("dist"),
  records = [];
for (const file of allPages) {
  const html = await readFile(`dist/${file}`, "utf8");
  if (!html.includes("Content-Security-Policy"))
    throw Error(`No production CSP: ${file}`);
  if (!html.includes('<main id="main"'))
    throw Error(`Missing static content: ${file}`);
  const alias = aliases.find(p => p.file === file);
  if (alias && !html.includes(`data-redirect="${alias.target}"`)) throw Error(`Missing legacy redirect: ${file}`);
  const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((url) => !url.startsWith("https:") && !url.startsWith("mailto:") && !url.startsWith("#"));
  for (const url of urls) {
    const resolved = new URL(url, `https://example.test/portfolio/${file}`);
    const root404 = file === '404.html' && url.startsWith('/');
    if (!root404 && !resolved.pathname.startsWith("/portfolio/"))
      throw Error(`Subpath escape: ${url}`);
    const target = resolve(root, resolved.pathname.slice(root404 ? 1 : "/portfolio/".length));
    await stat(target);
  }
  records.push({ file, localReferences: urls.length, ok: true });
}
await mkdir("evidence", { recursive: true });
await writeFile("evidence/artifact.json", JSON.stringify(records, null, 2));
if (!(await readFile('dist/index.html','utf8')).includes('id="soft-root"')) {
const glb=await readFile('dist/models/lotus.glb');
if(glb.readUInt32LE(0)!==0x46546c67||glb.readUInt32LE(4)!==2)throw Error('Invalid glTF binary');
if(glb.byteLength>5*1024*1024)throw Error('Lotus model exceeds the verified asset budget');
const model=JSON.parse(glb.subarray(20,20+glb.readUInt32LE(12)).toString('utf8'));
const hinges=model.nodes.filter(n=>/^Lotus_Hinge_[0-4]$/.test(n.name||''));
if(hinges.length!==5)throw Error('The release must contain five independent petal hinges');
if((model.buffers||[]).some(b=>b.uri)||(model.images||[]).length)throw Error('Unexpected external model resource');
for(const asset of ['assets/lotus-poster.webp','assets/lotus-open.webp','fonts/CormorantGaramond-OFL.txt','licenses/three-MIT.txt'])await stat(`dist/${asset}`);
await mkdir('evidence/lotus',{recursive:true});
await writeFile('evidence/lotus/model-artifact.json',JSON.stringify({bytes:glb.byteLength,hinges:hinges.map(h=>h.name),externalResources:0,ok:true},null,2));
} else { await import('./verify-soft-artifact.mjs'); }
console.log(records);

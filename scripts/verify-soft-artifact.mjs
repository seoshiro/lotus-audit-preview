import { readFile,stat,mkdir,writeFile } from 'node:fs/promises';
const records=[];
for(const name of ['candidate','mobile']) {
  const file=`dist/models/soft-lotus-${name}.glb`, data=await readFile(file);
  if(data.readUInt32LE(0)!==0x46546c67||data.readUInt32LE(4)!==2)throw Error(`Invalid GLB ${file}`);
  if(data.length>3*1024*1024)throw Error(`Asset exceeds 3 MiB ${file}`);
  const gltf=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString('utf8'));
  const names=['perch','selvedge','forme','about','contact'];
  for(const id of names) {
    const node=gltf.nodes.find(n=>n.name===`Petal_${id}`),anchor=gltf.nodes.find(n=>n.name===`Anchor_${id}`);
    const mesh=node&&gltf.meshes[node.mesh];
    if(!node||!anchor||!mesh?.extras?.targetNames?.includes('Bloom')||!mesh.extras.targetNames.includes('Focus'))throw Error(`Missing semantic/morph contract ${id}`);
  }
  const triangles=gltf.meshes.reduce((sum,m)=>sum+m.primitives.reduce((n,p)=>n+gltf.accessors[p.indices].count/3,0),0);
  if(triangles>(name==='mobile'?30000:80000))throw Error('Geometry exceeds target budget');
  if(gltf.buffers.some(b=>b.uri)||gltf.images?.length)throw Error('Unexpected external model resource');
  records.push({file,bytes:data.length,triangles,petals:5,morphs:['Bloom','Focus'],compression:gltf.extensionsRequired,ok:true});
}
for(const name of ['bud-desktop','bud-mobile','open-desktop','open-mobile'])await stat(`dist/models/soft-lotus-${name}.png`);
await mkdir('evidence/lotus-v2',{recursive:true});
await writeFile('evidence/lotus-v2/release-models.json',JSON.stringify(records,null,2));
console.log(records);

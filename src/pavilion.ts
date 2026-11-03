import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {environmentInfo} from './environment-info.ts';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {projects,type ProjectId as CurrentProjectId} from './content.ts';
// Archived pavilion implementation: its eight exhibits predate the lotus release.
type ProjectId = Exclude<CurrentProjectId, 'iter'|'ayqyn'|'sidereal'>;

export type Exhibit = ProjectId|'about';
export type View = 'overview'|'objects'|'tools';
export interface Pavilion {focus:(id:Exhibit)=>void; view:(view:View)=>void; dispose:()=>void}
const locations: Record<Exhibit,[number,number,number]> = {
  lumen:[-3.2,1.72,1.55],reson:[0,2,-0.6],perch:[3.25,1.5,1.2],orbit:[-4.5,2,-2.9],
  forme:[1.25,2.8,-3.84],selvedge:[3.25,2.8,-3.84],guidecheck:[1.25,1.15,-3.84],archiveguard:[3.25,1.15,-3.84],about:[-1.5,1.05,3.6],
};
export async function startPavilion(onActivate:(id:Exhibit)=>void,entered:boolean):Promise<Pavilion|null> {
  const canvas=document.querySelector<HTMLCanvasElement>('#gallery-canvas'),stage=canvas?.parentElement;
  if(!canvas||!stage) return null;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const saver=!!(navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData;
  let renderer:T.WebGLRenderer;
  try {renderer=new T.WebGLRenderer({canvas,antialias:!saver,powerPreference:'low-power'});} catch {return null;}
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;
  renderer.toneMappingExposure=0.82;
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=T.PCFShadowMap;
  const scene=new T.Scene();
  scene.background=new T.Color('#eae8df');
  scene.fog=new T.Fog('#eae8df',22,50);
  const camera=new T.PerspectiveCamera(43,1,0.1,65);
  const yieldMain=()=>new Promise<void>(resolve=>setTimeout(resolve,0));
  await yieldMain();
  // Decode the baked half-float studio illumination. No runtime PMREM render passes.
  const illumination=new Image();illumination.src='assets/pavilion-environment.png';
  await illumination.decode();const packed=document.createElement('canvas');packed.width=illumination.width;packed.height=illumination.height;
  const ctx=packed.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(illumination,0,0);
  const rgba=ctx.getImageData(0,0,packed.width,packed.height).data,bytes=new Uint8Array(environmentInfo.length);
  for(let i=0;i<bytes.length;i++)bytes[i]=rgba[Math.floor(i/3)*4+i%3];
  const environment=new T.DataTexture(new Uint16Array(bytes.buffer),environmentInfo.width,environmentInfo.height,T.RGBAFormat,T.HalfFloatType);
  environment.mapping=T.CubeUVReflectionMapping;environment.minFilter=T.LinearFilter;environment.magFilter=T.LinearFilter;environment.generateMipmaps=false;environment.needsUpdate=true;
  scene.environment=environment;scene.environmentIntensity=0.38;await yieldMain();
  const textures:T.Texture[]=[];
  const geometry=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();
  let seed=91;
  const random=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  function texture(kind:'stone'|'wood'|'fabric') {
    const cv=document.createElement('canvas');cv.width=cv.height=256;
    const ctx=cv.getContext('2d');if(!ctx)throw Error('Texture canvas unavailable');
    ctx.fillStyle=kind==='stone'?'#ddd5c4':kind==='wood'?'#b79a75':'#8b8877';ctx.fillRect(0,0,256,256);
    if(kind==='fabric') {
      for(let i=0;i<256;i+=4){ctx.fillStyle=i%8?'#777565':'#a5a18c';ctx.fillRect(i,0,1,256);ctx.fillRect(0,i,256,1);}
    } else {
      for(let i=0;i<8500;i++){
        const v=kind==='wood'?random()*18:random()*25;
        ctx.fillStyle=`rgba(${kind==='wood'?'43,26,13':'120,108,86'},${v/180})`;
        ctx.fillRect(random()*256,random()*256,kind==='wood'?1:random()*2,kind==='wood'?15+random()*80:1);
      }
      if(kind==='wood'){for(let i=0;i<30;i++){ctx.strokeStyle='rgba(80,55,28,.045)';ctx.beginPath();ctx.ellipse(random()*256,random()*256,3+random()*3,30+random()*60,0,0,Math.PI*2);ctx.stroke();}}
    }
    const map=new T.CanvasTexture(cv);map.wrapS=map.wrapT=T.RepeatWrapping;map.colorSpace=T.SRGBColorSpace;
    map.repeat.set(kind==='fabric'?4:2,kind==='fabric'?4:2);textures.push(map);return map;
  }
  const stoneMap=texture('stone'),woodMap=texture('wood'),fabricMap=texture('fabric');
  const materialCache=new Map<string,T.MeshStandardMaterial>();
  function mat(color:string,roughness=0.7,metalness=0,map?:T.Texture){const key=`${color}|${roughness}|${metalness}|${map?.uuid}`;const cached=materialCache.get(key);if(cached)return cached;const m=new T.MeshStandardMaterial({color,roughness,metalness,...(map?{map}:{})});materials.add(m);materialCache.set(key,m);return m;}
  const plaster=mat('#ede9de'),stone=mat('#f0e9d9',0.86,0,stoneMap),wood=mat('#c5a77e',0.55,0,woodMap),dark=mat('#292b26',0.37,0.3),metal=mat('#a8a294',0.3,0.8),fabric=mat('#b8b298',0.85,0,fabricMap),ivory=mat('#e8e5d9',0.8),green=mat('#596447',0.8);
  function mesh(g:T.BufferGeometry,m:T.Material,parent:T.Object3D=scene){geometry.add(g);const x=new T.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;parent.add(x);return x;}
  function box(w:number,h:number,d:number,m:T.Material,pos:[number,number,number],parent:T.Object3D=scene,round=0){const g=round?new RoundedBoxGeometry(w,h,d,2,round):new T.BoxGeometry(w,h,d);const x=mesh(g,m,parent);x.position.set(...pos);return x;}
  function cyl(r:number,h:number,m:T.Material,pos:[number,number,number],parent:T.Object3D=scene,r2=r){const x=mesh(new T.CylinderGeometry(r,r2,h,48),m,parent);x.position.set(...pos);return x;}
  function ring(r:number,t:number,m:T.Material,pos:[number,number,number],parent:T.Object3D){const x=mesh(new T.TorusGeometry(r,t,8,64),m,parent);x.rotation.x=Math.PI/2;x.position.set(...pos);return x;}
  function leaf(parent:T.Object3D,pos:[number,number,number],length:number,angle:number){
    const positions:number[]=[],uv:number[]=[],indices:number[]=[];
    for(let i=0;i<=8;i++){const t=i/8,width=Math.sin(Math.PI*t)*length*.17;for(const side of [-1,1]){positions.push(side*width,t*length,Math.sin(Math.PI*t)*length*.16);uv.push((side+1)/2,t);}}
    for(let i=0;i<8;i++){const j=i*2;indices.push(j,j+1,j+2,j+1,j+3,j+2);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
    const m=mat('#6c7850',.8);m.side=T.DoubleSide;const x=mesh(g,m,parent);x.position.set(...pos);x.rotation.z=angle;x.rotation.y=angle*1.7;return x;
  }
  const shadowCv=document.createElement('canvas');shadowCv.width=shadowCv.height=128;const shadowCtx=shadowCv.getContext('2d')!;const gradient=shadowCtx.createRadialGradient(64,64,9,64,64,64);gradient.addColorStop(0,'rgba(44,38,21,.36)');gradient.addColorStop(.45,'rgba(44,38,21,.17)');gradient.addColorStop(1,'rgba(44,38,21,0)');shadowCtx.fillStyle=gradient;shadowCtx.fillRect(0,0,128,128);const shadowTex=new T.CanvasTexture(shadowCv);textures.push(shadowTex);
  const shadowMat=new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false});materials.add(shadowMat);
  function contactShadow(parent:T.Object3D,w:number,d:number,y:number){const x=mesh(new T.PlaneGeometry(w,d),shadowMat,parent);x.rotation.x=-Math.PI/2;x.position.y=y;x.castShadow=false;x.receiveShadow=false;}
  function label(text:string,w:number,h:number,parent:T.Object3D,pos:[number,number,number],rotate=0,bg='#ece8dc',ink='#34382e') {
    const cv=document.createElement('canvas');cv.width=1024;cv.height=256;
    const ctx=cv.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle=ink;ctx.font='500 98px Arial';const size=Math.min(98,Math.floor(980/ctx.measureText(text).width*98));ctx.font=`500 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,136);
    const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;textures.push(t);
    const m=new T.MeshBasicMaterial({map:t});materials.add(m);
    const x=mesh(new T.PlaneGeometry(w,h),m,parent);x.castShadow=false;x.position.set(...pos);x.rotation.x=rotate;return x;
  }
  const plaqueText=(id:ProjectId)=>`${String(projects.findIndex(p=>p.id===id)+1).padStart(2,'0')}  /  ${projects.find(p=>p.id===id)!.name}`;
  // A pavilion open toward the visitor, with a deep window bay and a timber ceiling rhythm.
  box(17,0.22,30,stone,[0,-0.13,9.8]);
  box(17,5.4,0.25,plaster,[0,2.6,-4.5]);
  box(0.28,5.4,2.5,plaster,[7.1,2.6,-3.25]);
  box(0.22,0.6,11,stone,[-7.1,0.2,0.5]);
  box(0.22,0.5,11,plaster,[-7.1,4.85,0.5]);
  for(const z of [-4.4,-1.7,1,3.7,6.4])box(0.2,4.3,0.13,wood,[-7.1,2.55,z]);
  for(const y of [0.55,4.5])box(0.18,0.07,11,wood,[-7.12,y,0.5]);
  // Bright exterior reveals the real window opening; no opaque wall behind the glass.
  box(0.15,5,20,mat('#e4e9dd'),[-11,2,-2]);
  box(7,0.1,20,mat('#c3cbb7'),[-10,-0.3,-2]);
  // Continuous ceiling and lintels connect the timber ribs to their supports.
  box(14.4,0.12,12.5,plaster,[0,5.24,1.55]);
  for(const x of [-7.1,7.1])box(0.24,0.25,12.5,wood,[x,4.98,1.55]);
  for(const z of [-4.55,7.8])box(14.4,0.25,0.22,wood,[0,4.98,z]);
  for(const x of [-7.1,7.1])box(0.18,4.8,0.18,wood,[x,2.5,7.8]);
  for(let i=0;i<12;i++)box(0.1,0.18,12.1,wood,[-6+i*1.12,5.11,1.55]);
  for(let i=0;i<24;i++)box(0.06,4.7,0.12,wood,[5.15+i*0.075,2.35,-4.28]);
  for(let i=-6;i<=6;i+=2)box(0.009,0.004,13,mat('#cec6b5'),[i,0,1.8]);
  for(let i=-3;i<=8;i+=2)box(14,0.004,0.009,mat('#cec6b5'),[0,0,i]);
  label('seoshiro / PROJECT PAVILION',4.2,0.6,scene,[-2.7,3.9,-4.35]);
  label('INDEPENDENT WORK · 01—08',3.6,0.34,scene,[-2.7,3.38,-4.34]);
  const hemi=new T.HemisphereLight('#f2f6ee','#b6a38c',1.4);scene.add(hemi);
  const sun=new T.DirectionalLight('#fff0d5',2.4);sun.position.set(-9,4.1,3.5);sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-10;sun.shadow.camera.right=10;sun.shadow.camera.top=9;sun.shadow.camera.bottom=-9;sun.shadow.normalBias=0.035;sun.shadow.bias=-0.00015;sun.shadow.camera.near=0.5;sun.shadow.camera.far=35;scene.add(sun);
  const fill=new T.DirectionalLight('#eef2f3',0.65);fill.position.set(6,6,4);scene.add(fill);
  const exhibits:T.Group[]=[];
  function exhibit(id:Exhibit,pos:[number,number,number]){const g=new T.Group();g.userData.exhibit=id;g.position.set(...pos);scene.add(g);exhibits.push(g);return g;}
  function plinth(parent:T.Group,w:number,h:number,d:number){contactShadow(parent,w*1.8,d*1.8,.008);box(w,h,d,stone,[0,h/2,0],parent,0.02);box(w+0.07,0.065,d+0.07,stone,[0,h+0.03,0],parent,0.015);contactShadow(parent,w*.95,d*.95,h+.064);}
  // LUMEN: machined barrel, focus ridges, internal aperture and recessed glass.
  const lens=exhibit('lumen',[-3.2,0,1.1]);plinth(lens,1.65,1.12,1.65);
  const lensBody=new T.Group();lensBody.position.y=1.2;lensBody.rotation.z=-0.16;lens.add(lensBody);
  const points=[[0.42,0],[0.46,0.08],[0.46,0.24],[0.5,0.28],[0.5,0.53],[0.47,0.57],[0.47,0.78],[0.51,0.82],[0.51,0.91],[0.43,0.97],[0.36,0.97],[0.34,0.82]].map(([r,y])=>new T.Vector2(r,y));
  mesh(new T.LatheGeometry(points,64),dark,lensBody);
  for(let i=0;i<23;i++)ring(0.499,0.007,mat('#363930',0.7),[0,0.3+i*0.01,0],lensBody);
  for(const y of [0.08,0.25,0.57,0.82,0.92])ring(y>0.8?0.508:0.465,0.009,metal,[0,y,0],lensBody);
  cyl(0.345,0.025,mat('#263632',0.14,0.65),[0,0.88,0],lensBody);
  const glass=new T.MeshPhysicalMaterial({color:'#527569',roughness:0.08,metalness:0.28,clearcoat:1,clearcoatRoughness:0.06});materials.add(glass);
  cyl(0.355,0.013,glass,[0,0.94,0],lensBody);
  for(let i=0;i<8;i++){const blade=box(0.13,0.012,0.3,metal,[Math.sin(i*Math.PI/4)*0.11,0.917,Math.cos(i*Math.PI/4)*0.11],lensBody);blade.rotation.y=i*Math.PI/4+0.3;}
  label('LUMEN  /  50 mm',0.55,0.13,lensBody,[0,0.67,0.474],0,'#292b26','#e0ddcb');
  label(plaqueText('lumen'),1.15,0.2,lens,[0,0.91,0.831]);
  await yieldMain();
  // RESON: softly rounded timber cabinet, woven grille, rear depth and a control dial.
  const speaker=exhibit('reson',[0,0,-0.7]);plinth(speaker,1.6,0.92,1.55);
  box(1.05,1.7,0.8,wood,[0,1.83,0],speaker,0.12);
  box(0.86,1.49,0.045,fabric,[0,1.83,0.42],speaker,0.08);
  const driver=cyl(0.29,0.014,mat('#605f50'),[0,1.8,0.452],speaker);driver.rotation.x=Math.PI/2;
  const cone=cyl(0.19,0.019,mat('#777564'),[0,1.8,0.465],speaker);cone.rotation.x=Math.PI/2;
  box(0.83,1.44,0.012,new T.MeshStandardMaterial({map:fabricMap,color:'#cec7ae',transparent:true,opacity:0.94,roughness:1}),[0,1.83,0.48],speaker,0.07);
  const dial=cyl(0.09,0.045,metal,[0.31,2.713,0.16],speaker);dial.rotation.z=0.08;
  box(0.25,0.012,0.075,dark,[-0.19,2.686,0.2],speaker,0.01);
  label('RESON',0.42,0.105,speaker,[0,1.19,0.502],0,'#aaa58d','#3f4134');
  label(plaqueText('reson'),1.16,0.2,speaker,[0,0.73,0.787]);
  await yieldMain();
  // PERCH: a deliberate open miniature, with walls, sofa cushions, rug, lamp, books and table.
  const perch=exhibit('perch',[3.15,0,1.1]);plinth(perch,2.55,0.78,2.1);
  box(2.25,0.08,1.83,wood,[0,0.86,0],perch);
  box(2.2,1.05,0.075,ivory,[0,1.41,-0.85],perch);
  box(0.075,1.05,1.78,ivory,[-1.08,1.41,0],perch);
  box(1.25,0.018,1.17,mat('#c0ba9e'),[0.07,0.91,0.05],perch);
  box(1.31,0.34,0.58,mat('#809076'),[0.1,1.12,-0.43],perch,0.06);
  box(1.31,0.33,0.12,green,[0.1,1.33,-0.65],perch,0.025);
  for(const x of [-0.25,0.4])box(0.59,0.08,0.42,fabric,[x,1.315,-0.4],perch,0.025);
  for(const x of [-0.57,0.77])box(0.12,0.24,0.55,green,[x,1.35,-0.43],perch,0.035);
  const table=cyl(0.35,0.055,wood,[0.16,1.18,0.32],perch);table.scale.z=0.78;
  for(const x of [-0.08,0.4])box(0.035,0.26,0.035,dark,[x,1.04,0.32],perch);
  for(let i=0;i<3;i++)box(0.21,0.025,0.13,mat(['#ded6c0','#887759','#c8caaa'][i]),[0.1,1.225+i*0.025,0.31],perch);
  cyl(0.085,0.05,metal,[-0.82,0.95,-0.47],perch);cyl(0.01,0.63,metal,[-0.82,1.28,-0.47],perch);
  cyl(0.13,0.15,ivory,[-0.82,1.6,-0.47],perch,0.2);
  box(0.59,0.43,0.025,wood,[0.45,1.6,-0.79],perch);
  box(0.5,0.34,0.028,mat('#bcbfa2'),[0.45,1.6,-0.769],perch);
  cyl(0.12,0.2,mat('#b39b75'),[0.86,1.02,0.65],perch,0.09);
  for(let i=0;i<7;i++){const stem=cyl(.007,.23,green,[.86+Math.sin(i)*.04,1.24,.65+Math.cos(i)*.04],perch);stem.rotation.z=Math.sin(i)*.25;leaf(perch,[.86+Math.sin(i)*.05,1.17,.65+Math.cos(i)*.05],.3+random()*.12,Math.sin(i)*.65);}
  label(plaqueText('perch'),1.45,0.21,perch,[0,0.58,1.062]);
  await yieldMain();
  // ORBIT: a miniature satellite with articulated solar arrays on a brass orbital arm.
  const orbit=exhibit('orbit',[-4.6,0,-2.9]);plinth(orbit,1.65,1.13,1.4);
  const arm=mesh(new T.TorusGeometry(0.63,0.022,8,64,Math.PI*1.5),metal,orbit);arm.position.y=1.86;arm.rotation.z=0.4;
  box(0.38,0.42,0.38,metal,[0,1.92,0],orbit,0.025);
  const solar=mat('#45595d',0.35,0.5);
  for(const side of [-1,1]){box(0.07,0.03,0.03,metal,[side*0.25,1.94,0],orbit);box(0.53,0.025,0.42,solar,[side*0.54,1.94,0],orbit);for(let i=0;i<5;i++)box(0.007,0.028,0.42,metal,[side*0.54-0.21+i*0.1,1.94,0],orbit);}
  const dish=mesh(new T.SphereGeometry(0.14,20,12,0,Math.PI*2,0,Math.PI*0.45),ivory,orbit);dish.position.set(0,2.23,0);dish.rotation.z=-0.4;
  label(plaqueText('orbit'),1.1,0.18,orbit,[0,0.94,0.711]);
  await yieldMain();
  // Actual tool screenshots mounted behind timber frames. Texture loading schedules a single repaint.
  let invalidate=()=>{};
  const loader=new T.TextureLoader();
  for(const id of ['forme','selvedge','guidecheck','archiveguard'] as ProjectId[]) {
    const pos=locations[id],g=exhibit(id,[pos[0],pos[1],-4.17]);
    box(1.7,1.12,0.1,wood,[0,0,0],g,0.018);
    box(1.58,0.99,0.07,ivory,[0,0,0.07],g);
    const t=loader.load(`assets/${id}-preview.webp`,()=>invalidate(),undefined,()=>{});t.colorSpace=T.SRGBColorSpace;textures.push(t);
    const m=new T.MeshBasicMaterial({map:t});materials.add(m);const screen=mesh(new T.PlaneGeometry(1.5,0.92),m,g);screen.position.z=0.113;screen.castShadow=false;
    label(id==='guidecheck'?'GuideCheck':id==='archiveguard'?'ArchiveGuard':id.toUpperCase(),1.36,0.17,g,[0,-0.7,0.12]);
  }
  const name=exhibit('about',[-1.5,0,3.1]);
  box(1.7,0.12,0.8,wood,[0,0.77,0],name,0.025);
  for(const x of [-0.65,0.65])box(0.055,0.73,0.55,wood,[x,0.365,0],name);
  const plaque=box(1.24,0.37,0.045,metal,[0,1.015,0],name,0.02);plaque.rotation.x=-0.3;
  label('Beibars Ileskhan',1.15,0.27,name,[0,1.02,0.045],-0.3,'#c9c2ae');
  // Small architectural details give scale without adding unrelated personal claims.
  box(1.8,0.36,0.62,wood,[5.3,0.5,2.5],scene,0.06);
  for(const x of [4.65,5.95])box(0.06,0.37,0.48,metal,[x,0.19,2.5]);
  const plantpot=cyl(0.34,0.6,stone,[5.85,0.31,-2.35]);plantpot.rotation.z=0.03;
  contactShadow(scene,1.7,1.7,.008);shadowMat.opacity=.8;
  for(let i=0;i<13;i++){const x=5.85+Math.sin(i)*.13,z=-2.35+Math.cos(i)*.13;const stem=cyl(.015,.7,green,[x,.75,z]);stem.rotation.z=Math.sin(i)*.35;leaf(scene,[x,.65+random()*.3,z],.8+random()*.45,Math.sin(i)*.9);}
  // Batch compatible static geometry per exhibit/material, preserving the click ownership.
  function batch(parent:T.Object3D){for(const child of [...parent.children])if(child instanceof T.Group)batch(child);const groups=new Map<string,T.Mesh[]>();for(const child of parent.children){if(!(child instanceof T.Mesh)||Array.isArray(child.material)||child.material.transparent)continue;const key=child.material.uuid;const list=groups.get(key)||[];list.push(child);groups.set(key,list);}for(const list of groups.values()){if(list.length<3)continue;const parts=list.map(m=>{m.updateMatrix();const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);return g;});const joined=mergeGeometries(parts);parts.forEach(g=>g.dispose());if(!joined)continue;const combined=mesh(joined,list[0].material as T.Material,parent);combined.castShadow=list.some(m=>m.castShadow);combined.receiveShadow=list.some(m=>m.receiveShadow);list.forEach(m=>parent.remove(m));}}
  batch(scene);await yieldMain();
  const target=new T.Vector3(),goalPos=new T.Vector3(),goalTarget=new T.Vector3(),startPos=new T.Vector3(),startTarget=new T.Vector3();
  let frame=0,transitionStart=0,visible=true,disposed=false,transition=false,frames=0;
  let selectedView:View|'focus'='overview',focused:Exhibit|null=null,previousMobile:boolean|null=null;
  const objectIds=['orbit','lumen','reson','perch'] as Exhibit[];
  function solidBounds(g:T.Group){const b=new T.Box3();g.updateMatrixWorld(true);g.traverse(o=>{if(o instanceof T.Mesh&&!Array.isArray(o.material)&&!o.material.transparent){o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox!.clone().applyMatrix4(o.matrixWorld));}});return b;}
  const bounds=exhibits.filter(g=>objectIds.includes(g.userData.exhibit)).map(g=>({id:g.userData.exhibit as Exhibit,box:solidBounds(g)}));
  const corners=(b:T.Box3)=>[...Array(8)].map((_,i)=>new T.Vector3(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z));
  function fitPhone(p:number[],t:number[],fov:number){const probe=new T.PerspectiveCamera(fov,camera.aspect,.1,65);const points=bounds.flatMap(b=>corners(b.box));const fitted=[...p];for(let n=0;n<80;n++){probe.position.set(...fitted as [number,number,number]);probe.lookAt(new T.Vector3(...t));probe.updateMatrixWorld();if(points.every(point=>{const q=point.clone().project(probe);return Math.abs(q.x)<.87&&Math.abs(q.y)<.87;}))break;fitted[2]+=.2;}return fitted;}
  const overview=()=>window.innerWidth<700?{p:[0,3.4,13.8],t:[0,1.85,-0.5],fov:47}:{p:[6.3,3.65,10.2],t:[-0.2,1.85,-0.7],fov:43};
  function move(p:number[],t:number[],initial=false){startPos.copy(camera.position);startTarget.copy(target);goalPos.set(p[0],p[1],p[2]);goalTarget.set(t[0],t[1],t[2]);transitionStart=performance.now();transition=!reduced.matches&&!saver;if(initial&&!entered&&transition)camera.position.add(new T.Vector3(0,0.4,1.2));if(!transition){camera.position.copy(goalPos);target.copy(goalTarget);}invalidate();}
  function updateHotspots(){
    const rect=stage!.getBoundingClientRect(),toolIds=['forme','selvedge','guidecheck','archiveguard'];
    const placed:{x:number;y:number;w:number;h:number}[]=[];
    const ids=(Object.keys(locations) as Exhibit[]).sort((a,b)=>new T.Vector3(...locations[b]).project(camera).y-new T.Vector3(...locations[a]).project(camera).y);
    for(const id of ids){
      const a=stage!.querySelector<HTMLAnchorElement>(`[data-exhibit="${id}"]`);if(!a)continue;
      const projected=new T.Vector3(...locations[id]).project(camera);
      const wrongView=selectedView==='tools'?!toolIds.includes(id):toolIds.includes(id);
      a.hidden=wrongView||projected.z>1||Math.abs(projected.x)>1||Math.abs(projected.y)>1;if(a.hidden)continue;
      const w=a.offsetWidth,h=a.offsetHeight,x=Math.max(w/2+8,Math.min(rect.width-w/2-8,(projected.x*.5+.5)*rect.width));
      let y=Math.max(8,Math.min(rect.height-h-8,(-projected.y*.5+.5)*rect.height+25));
      for(let n=0;n<8;n++){const overlap=placed.find(b=>x+w/2+6>b.x-b.w/2&&x-w/2-6<b.x+b.w/2&&y+h+6>b.y&&y-6<b.y+b.h);if(!overlap)break;y=overlap.y+overlap.h+8;if(y+h>rect.height-8)y=Math.max(8,overlap.y-h-8);}
      a.style.left=`${x}px`;a.style.top=`${y}px`;placed.push({x,y,w,h});
    }
    const objectBounds=bounds.map(b=>{const points=corners(b.box).map(p=>p.project(camera));return {id:b.id,left:Math.min(...points.map(p=>p.x*.5+.5)),right:Math.max(...points.map(p=>p.x*.5+.5)),top:Math.min(...points.map(p=>-p.y*.5+.5)),bottom:Math.max(...points.map(p=>-p.y*.5+.5))};});
    canvas!.dataset.objectBounds=JSON.stringify(objectBounds);
  }
  function draw(now:number){frame=0;if(disposed||!visible||document.hidden)return;if(transition){const fraction=Math.min(1,(now-transitionStart)/950),eased=1-Math.pow(1-fraction,3);camera.position.lerpVectors(startPos,goalPos,eased);target.lerpVectors(startTarget,goalTarget,eased);transition=fraction<1;}camera.lookAt(target);renderer.render(scene,camera);updateHotspots();canvas!.dataset.frames=String(++frames);canvas!.dataset.triangles=String(renderer.info.render.triangles);canvas!.dataset.calls=String(renderer.info.render.calls);if(transition)frame=requestAnimationFrame(draw);}
  invalidate=()=>{if(!frame&&!disposed&&visible&&!document.hidden)frame=requestAnimationFrame(draw);};
  function resize(){const r=stage!.getBoundingClientRect();const ratio=Math.min(window.devicePixelRatio||1,saver?1:1.5,Math.sqrt(1700000/(r.width*r.height)));renderer.setPixelRatio(ratio);renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();const mobile=r.width<700;if(previousMobile!==null){if(selectedView==='focus'&&focused)focus(focused);else view(selectedView as View);}previousMobile=mobile;invalidate();}
  function view(v:View){selectedView=v;if(v==='overview'){const o=overview();camera.fov=o.fov;move(window.innerWidth<700?fitPhone(o.p,o.t,o.fov):o.p,o.t);}else if(v==='objects'){camera.fov=43;move(window.innerWidth<700?fitPhone([0,3.2,12.5],[0,1.5,0.4],43):[6,3.4,7.8],[0,1.5,0.4]);}else{camera.fov=window.innerWidth<700?66:50;move([2.3,2.1,-.5],[2.3,2,-4.1]);}camera.updateProjectionMatrix();}
  function focus(id:Exhibit){selectedView='focus';focused=id;const p=locations[id];camera.fov=43;camera.updateProjectionMatrix();move([p[0]+(id==='perch'?2.2:1.7),p[1]+1.3,p[2]+3.5],p);}
  const ray=new T.Raycaster(),pointer=new T.Vector2();
  function pick(e:PointerEvent){if(e.button!==0)return;const r=canvas!.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(exhibits,true)[0];if(!hit)return;let object:T.Object3D|null=hit.object;while(object&&!object.userData.exhibit)object=object.parent;if(object)onActivate(object.userData.exhibit as Exhibit);}
  const observer=new ResizeObserver(resize);observer.observe(stage);
  const intersection=new IntersectionObserver(items=>{visible=items[0].isIntersecting;if(visible)invalidate();else{cancelAnimationFrame(frame);frame=0;}});intersection.observe(stage);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();};
  const lost=(e:Event)=>{e.preventDefault();stage!.closest('.pavilion')?.classList.remove('gallery-ready');stage!.closest('.pavilion')?.classList.add('gallery-unavailable');stage!.querySelector<HTMLElement>('.gallery-status')!.hidden=true;document.querySelector<HTMLElement>('.gallery-toolbar')!.hidden=true;document.querySelector<HTMLElement>('.gallery-fallback')!.hidden=false;};
  canvas.addEventListener('pointerup',pick);canvas.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',visibility);const reduceChange=()=>{transition=false;camera.position.copy(goalPos);target.copy(goalTarget);invalidate();};reduced.addEventListener('change',reduceChange);
  resize();const o=overview();camera.fov=o.fov;camera.updateProjectionMatrix();camera.position.set(o.p[0],o.p[1]+0.3,o.p[2]+1.3);target.set(...o.t as [number,number,number]);move(window.innerWidth<700?fitPhone(o.p,o.t,o.fov):o.p,o.t,true);
  camera.lookAt(target);
  if(renderer.extensions.has('KHR_parallel_shader_compile'))await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
  stage.closest('.pavilion')?.classList.add('gallery-ready');stage.querySelector<HTMLElement>('.gallery-status')!.hidden=true;document.querySelector<HTMLElement>('.gallery-toolbar')!.hidden=false;document.querySelector<HTMLElement>('.gallery-fallback')!.hidden=true;
  return {focus,view,dispose:()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',reduceChange);canvas.removeEventListener('pointerup',pick);canvas.removeEventListener('webglcontextlost',lost);geometry.forEach(g=>g.dispose());scene.traverse(o=>{if(o instanceof T.Mesh){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>materials.add(m));}});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();}};
}

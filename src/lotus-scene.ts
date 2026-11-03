import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {selectedIds} from './lotus-copy.ts';

export interface LotusScene {update(progress:number,motion:boolean):void;select(project:string):void;dispose():void}
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
export function petalAngle(progress:number,index:number){return smooth((progress-.18-index*.025)/.52)*1.3264502315;}

export async function startLotus(onSelect:(project:string)=>void):Promise<LotusScene|null>{
  const viewport=document.querySelector<HTMLElement>('.lotus-viewport');
  const hero=document.querySelector<HTMLElement>('.hero-model-anchor');
  const work=document.querySelector<HTMLElement>('.work-model-anchor');
  const workSection=document.getElementById('work');
  if(!viewport||!hero||!work||!workSection)return null;
  let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});}catch{return null;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.6));
  renderer.setClearColor(0,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(31,1,.1,100);
  const pmrem=new THREE.PMREMGenerator(renderer);
  const room=new RoomEnvironment();
  const environment=pmrem.fromScene(room,.05);room.dispose();scene.environment=environment.texture;
  scene.environmentIntensity=.9;
  const key=new THREE.DirectionalLight(0xfff4e4,1.6);key.position.set(-3,5,4);scene.add(key);
  const fill=new THREE.DirectionalLight(0xf3f6ff,.8);fill.position.set(5,3,-3);scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xfff7ea,0x54504a,.7));
  const group=new THREE.Group();scene.add(group);
  let disposed=false,contextLost=false,frame=0,progress=0,moving=true,frozenProgress=0,active='perch',hover=-1;
  let px=0,py=0,width=0,height=0,framesLeft=1;
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  let gltf;
  try{gltf=await new GLTFLoader().loadAsync(new URL('models/lotus.glb',window.location.href).href);}catch{environment.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();return null;}
  const model=gltf.scene;group.add(model);
  const closedBounds=new THREE.Box3().setFromObject(model),size=closedBounds.getSize(new THREE.Vector3());
  const scale=3.6/size.y;model.scale.multiplyScalar(scale);model.position.y-=closedBounds.min.y*scale;
  const hinges=Array.from({length:5},(_,i)=>model.getObjectByName(`Lotus_Hinge_${i}`));
  if(hinges.some(h=>!h)){model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});environment.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();return null;}
  const petals:THREE.Mesh[][]=hinges.map((h,i)=>{const meshes:THREE.Mesh[]=[];h!.traverse(o=>{if(o instanceof THREE.Mesh){o.userData.petal=i;const materials=(Array.isArray(o.material)?o.material:[o.material]).map(mat=>mat.clone());o.material=Array.isArray(o.material)?materials:materials[0];for(const mat of materials){if(mat instanceof THREE.MeshStandardMaterial){mat.envMapIntensity=1.1;mat.userData.originalColor=mat.color.clone();}}meshes.push(o);}});return meshes;});
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=128;shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d')!;
  const gradient=ctx.createRadialGradient(64,64,3,64,64,64);gradient.addColorStop(0,'rgba(20,17,12,.22)');gradient.addColorStop(.35,'rgba(20,17,12,.12)');gradient.addColorStop(.75,'rgba(20,17,12,0)');gradient.addColorStop(1,'rgba(20,17,12,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.6,3.6),new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity:.9}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.06;scene.add(shadow);
  viewport.replaceChildren(renderer.domElement);viewport.hidden=false;
  const canvas=renderer.domElement;
  canvas.setAttribute('aria-hidden','true');
  const controller=new AbortController();const {signal}=controller;
  function hideFallback(){viewport!.hidden=true;document.body.classList.remove('lotus-ready');document.body.classList.add('lotus-unavailable');const note=document.querySelector<HTMLElement>('.scene-fallback');if(note)note.hidden=false;}
  function draw(){
    frame=0;if(disposed||contextLost||document.hidden)return;
    const a=hero!.getBoundingClientRect(),b=work!.getBoundingClientRect(),wr=workSection!.getBoundingClientRect();
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const transfer=smooth((window.innerHeight-wr.top)/(window.innerHeight*.75));
    const target={left:THREE.MathUtils.lerp(a.left,b.left,transfer),top:THREE.MathUtils.lerp(a.top,b.top,transfer),width:THREE.MathUtils.lerp(a.width,b.width,transfer),height:THREE.MathUtils.lerp(a.height,b.height,transfer)};
    const visible=target.top+target.height>0&&target.top<window.innerHeight&&wr.bottom>100;
    viewport!.hidden=!visible;
    if(!visible)return;
    viewport!.style.left=`${target.left}px`;viewport!.style.top=`${target.top}px`;viewport!.style.width=`${target.width}px`;viewport!.style.height=`${target.height}px`;
    if(Math.abs(width-target.width)>1||Math.abs(height-target.height)>1){width=target.width;height=target.height;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
    const openness=transfer>.99?1:moving?progress:frozenProgress;
    hinges.forEach((h,i)=>{h!.rotation.z=reduced?(transfer>.3?-1.3264502315:0):-petalAngle(openness,i);});
    const lift=smooth((openness-.2)/.6);
    // Keep the open navigation surface still under the pointer: a hover must
    // identify the same rigid petal that receives the ensuing click.
    const tilt=moving&&!reduced&&openness<.75;
    group.rotation.y=.07+(tilt?px*.07:0);
    group.rotation.x=tilt?py*.025:0;
    camera.position.set(1.3+3.6*lift,2.3+4.4*lift,7.5+1.3*lift);
    camera.lookAt(0,1.75-.55*lift,0);
    shadow.scale.setScalar(1+lift*.25);(shadow.material as THREE.MeshBasicMaterial).opacity=1-.65*lift;
    petals.forEach((meshes,i)=>{for(const mesh of meshes){for(const material of(Array.isArray(mesh.material)?mesh.material:[mesh.material])){if(material instanceof THREE.MeshStandardMaterial){const original=material.userData.originalColor as THREE.Color;material.color.copy(original);const chosen=(hover>=0?hover===i:selectedIds[i%3]===active)&&transfer>.7;if(chosen){material.color.lerp(new THREE.Color(0xd8c4a3),.2);material.emissive.setRGB(.025,.016,.006);}else material.emissive.setRGB(0,0,0);}}}});
    renderer.render(scene,camera);viewport!.dataset.progress=progress.toFixed(3);viewport!.dataset.petals='5';viewport!.dataset.renderCalls=String(renderer.info.render.calls);
    if(framesLeft>0){framesLeft--;frame=requestAnimationFrame(draw);}
  }
  function request(){if(disposed)return;framesLeft=2;if(!frame)frame=requestAnimationFrame(draw);}
  function pick(e:PointerEvent){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(petals.flat(),false)[0];return typeof hit?.object.userData.petal==='number'?hit.object.userData.petal as number:-1;}
  canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const rect=canvas.getBoundingClientRect();px=(e.clientX-rect.left)/rect.width-.5;py=(e.clientY-rect.top)/rect.height-.5;hover=pick(e);viewport.dataset.hoveredPetal=String(hover);canvas.style.cursor=progress>.75&&hover>=0?'pointer':'default';request();},{signal});
  canvas.addEventListener('pointerleave',()=>{px=0;py=0;hover=-1;viewport.dataset.hoveredPetal='-1';request();},{signal});
  canvas.addEventListener('click',e=>{if(progress<.75)return;const petal=pick(e as PointerEvent);if(petal>=0)onSelect(selectedIds[petal%3]);},{signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;hideFallback();},{signal});
  document.addEventListener('visibilitychange',request,{signal});window.addEventListener('resize',request,{signal});
  request();
  return {update(p,m){if(moving&&!m)frozenProgress=progress;progress=clamp(p);moving=m;request();},select(project){active=project;request();},dispose(){disposed=true;controller.abort();if(frame)cancelAnimationFrame(frame);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const mat of(Array.isArray(o.material)?o.material:[o.material]))mat.dispose();}});shadowTexture.dispose();environment.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();viewport.hidden=true;}};
}

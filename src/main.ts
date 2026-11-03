import {copy,validLocale,projectById,type Locale} from './content.ts';
import {renderPage} from './render.ts';
import {lotusCopy,selectedIds} from './lotus-copy.ts';
import type {LotusScene} from './lotus-scene.ts';

const id=projectById(document.body.dataset.project||'')?.id||null;
const query=new URL(window.location.href);
let stored:string|null=null;
try{stored=localStorage.getItem('seoshiro-portfolio-language-v1');}catch{/* Optional preference. */}
const browserLocale=validLocale(navigator.language.split('-')[0]);
let locale:Locale=validLocale(query.searchParams.get('lang'))||validLocale(stored)||browserLocale||'ru';
let scene:LotusScene|null=null;
let generation=0;
let controller:AbortController|null=null;
let observer:IntersectionObserver|null=null;
let active=(selectedIds as readonly string[])[0];
let motion=!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let scrollFrame=0;
let selectionIntent:{id:string;until:number}|null=null;

function rememberContext(){try{sessionStorage.setItem('lotus-return-context',JSON.stringify({y:window.scrollY,active}));}catch{/* Navigation still works. */}}
function setActive(next:string){
  active=next;document.body.dataset.activeProject=next;scene?.select(next);
  document.querySelectorAll<HTMLElement>('[data-select]').forEach(a=>a.setAttribute('aria-current',String(a.dataset.select===next)));
}
function activateProject(next:string){
  const target=document.getElementById(`project-${next}`);
  if(!target)return;
  selectionIntent={id:next,until:performance.now()+2500};
  setActive(next);
  const hash=`#project-${next}`;
  if(location.hash!==hash)history.pushState(null,'',hash);
  target.scrollIntoView({behavior:motion?'smooth':'instant',block:'start'});
}
function syncActiveProject(){
  if(selectionIntent){
    const element=document.getElementById(`project-${selectionIntent.id}`);
    const target=element?.getBoundingClientRect();
    const offset=(parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0)+(element?parseFloat(getComputedStyle(element).scrollMarginTop)||0:0);
    if(target&&Math.abs(target.top-offset)<12)selectionIntent=null;
    else if(performance.now()<selectionIntent.until)return;
    else selectionIntent=null;
  }
  const line=window.innerHeight*.4;
  const cards=[...document.querySelectorAll<HTMLElement>('.featured-project')].map(el=>({id:el.dataset.projectId!,rect:el.getBoundingClientRect()}));
  const current=cards.find(c=>c.rect.top<=line&&c.rect.bottom>line)||cards.filter(c=>c.rect.top>90&&c.rect.top<window.innerHeight*.8).sort((a,b)=>a.rect.top-b.rect.top)[0];
  if(current&&current.id!==active)setActive(current.id);
}
function syncScene(){
  scrollFrame=0;
  const unfold=document.querySelector<HTMLElement>('.unfold');
  const sticky=document.querySelector<HTMLElement>('.unfold-sticky');
  if(!unfold||!sticky)return;
  const p=Math.max(0,Math.min(1,-unfold.getBoundingClientRect().top/Math.max(1,unfold.offsetHeight-window.innerHeight)));
  const dark=Math.max(0,Math.min(1,(p-.4)/.4));
  sticky.style.setProperty('--scene-dark',String(dark));
  sticky.style.setProperty('--hero-out',String(Math.max(0,1-p*4)));
  sticky.style.setProperty('--phase-in',String(Math.max(0,Math.min(1,(p-.22)*5))));
  sticky.classList.toggle('is-dark',dark>.57);
  const header=document.querySelector('.header');
  const work=document.getElementById('work')!.getBoundingClientRect();
  const contact=document.getElementById('contact')!.getBoundingClientRect();
  header?.classList.toggle('on-dark',(unfold.getBoundingClientRect().bottom>90&&dark>.55)||(work.top<90&&work.bottom>90)||(contact.top<90&&contact.bottom>90));
  const explore=document.querySelector<HTMLAnchorElement>('.explore-link');if(explore)explore.tabIndex=p>.25?-1:0;
  const heroCopy=document.querySelector<HTMLElement>('.hero-copy');if(heroCopy)heroCopy.style.pointerEvents=p>.25?'none':'auto';
  const phase=document.querySelector<HTMLElement>('.phase-copy');
  if(phase){phase.style.pointerEvents=p>.3?'auto':'none';phase.setAttribute('aria-hidden',String(p<=.3));const link=phase.querySelector<HTMLAnchorElement>('a');if(link)link.tabIndex=p>.3?0:-1;}
  syncActiveProject();
  scene?.update(p,motion);
}
function queueScene(){if(!scrollFrame)scrollFrame=requestAnimationFrame(syncScene);}
function closeMenu(restore=false){
  const wasOpen=document.querySelector('.header')?.classList.contains('menu-open');
  document.querySelector('.header')?.classList.remove('menu-open');
  const button=document.querySelector<HTMLButtonElement>('.menu-toggle');
  button?.setAttribute('aria-expanded','false');button?.setAttribute('aria-label',lotusCopy[locale].menu);
  if(restore&&wasOpen)button?.focus({preventScroll:true});
}
function updateMotion(){const b=document.querySelector<HTMLButtonElement>('.motion-toggle');if(b){b.setAttribute('aria-pressed',String(motion));b.setAttribute('aria-label',motion?lotusCopy[locale].pause:lotusCopy[locale].resume);b.querySelector('.motion-icon')!.textContent=motion?'Ⅱ':'▷';}syncScene();}
async function enhance(){
  const current=++generation;
  controller?.abort();controller=new AbortController();const {signal}=controller;
  observer?.disconnect();
  document.documentElement.lang=locale;
  document.title=id?`${projectById(id)!.name} — Beibars Ileskhan`:copy[locale].title;
  for(const selector of ['meta[name="description"]','meta[property="og:description"]'])document.querySelector(selector)?.setAttribute('content',id?copy[locale].project[id].summary:copy[locale].description);
  document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
  document.querySelectorAll<HTMLButtonElement>('[data-locale]').forEach(b=>b.addEventListener('click',()=>switchLanguage(validLocale(b.dataset.locale||null)!),{signal}));
  const menu=document.querySelector<HTMLButtonElement>('.menu-toggle');
  menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';document.querySelector('.header')?.classList.toggle('menu-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?lotusCopy[locale].close:lotusCopy[locale].menu);},{signal});
  document.querySelectorAll('.header nav a').forEach(a=>a.addEventListener('click',()=>closeMenu(),{signal}));
  window.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu(true);},{signal});
  document.querySelectorAll<HTMLImageElement>('img').forEach(img=>{const fail=()=>{img.classList.add('image-failed');if(!img.alt)return;const note=document.createElement('span');note.className='image-error';note.textContent=copy[locale].imageFailed;img.after(note);};img.addEventListener('error',fail,{once:true,signal});});
  if(id)return;
  document.querySelectorAll<HTMLAnchorElement>('[data-case]').forEach(a=>a.addEventListener('click',rememberContext,{signal}));
  document.querySelectorAll<HTMLAnchorElement>('[data-select]').forEach(a=>a.addEventListener('click',e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();activateProject(a.dataset.select!);},{signal}));
  observer=new IntersectionObserver(()=>syncActiveProject(),{rootMargin:'-15% 0px -40% 0px',threshold:[0,.1,.3,.5]});
  document.querySelectorAll('.featured-project').forEach(el=>observer!.observe(el));
  document.querySelector('.motion-toggle')?.addEventListener('click',()=>{motion=!motion;updateMotion();},{signal});
  window.addEventListener('scroll',queueScene,{passive:true,signal});
  window.addEventListener('wheel',()=>{selectionIntent=null;},{passive:true,signal});
  window.addEventListener('touchstart',()=>{selectionIntent=null;},{passive:true,signal});
  window.addEventListener('resize',queueScene,{passive:true,signal});
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{motion=!e.matches;updateMotion();},{signal});
  updateMotion();setActive(active);
  try{
    const {startLotus}=await import('./lotus-scene.ts');
    if(current!==generation)return;
    const next=await startLotus(activateProject);
    if(current!==generation){next?.dispose();return;}
    scene=next;if(scene){document.body.classList.add('lotus-ready');setActive(active);syncScene();}
  }catch{/* Poster and ordinary navigation remain available. */}
  if(!scene){document.body.classList.add('lotus-unavailable');const note=document.querySelector<HTMLElement>('.scene-fallback');if(note)note.hidden=false;}
}
function switchLanguage(next:Locale){
  if(next===locale)return;
  const y=window.scrollY;scene?.dispose();scene=null;generation++;
  document.body.classList.remove('lotus-ready','lotus-unavailable');
  locale=next;document.getElementById('app')!.innerHTML=renderPage(locale,id);
  const url=new URL(window.location.href);url.searchParams.set('lang',locale);history.replaceState(null,'',url);
  try{localStorage.setItem('seoshiro-portfolio-language-v1',locale);}catch{/* Optional preference. */}
  window.scrollTo({top:y,behavior:'instant'});
  void enhance();document.querySelector<HTMLButtonElement>(`[data-locale="${locale}"]`)?.focus({preventScroll:true});
}
if(locale!=='ru')document.getElementById('app')!.innerHTML=renderPage(locale,id);
void enhance();
if(!id&&query.searchParams.get('return')==='1'){
  query.searchParams.delete('return');history.replaceState(null,'',query);
  try{const context=JSON.parse(sessionStorage.getItem('lotus-return-context')||'null');if(context&&typeof context.y==='number'){active=context.active;void document.fonts.ready.then(()=>{requestAnimationFrame(()=>{window.scrollTo({top:context.y,behavior:'instant'});setActive(active);syncScene();});});}}catch{/* Fragment gives a useful fallback. */}
}
window.addEventListener('pageshow',()=>{if(!id)queueScene();});
window.addEventListener('pagehide',e=>{if(!e.persisted){controller?.abort();observer?.disconnect();scene?.dispose();if(scrollFrame)cancelAnimationFrame(scrollFrame);}});

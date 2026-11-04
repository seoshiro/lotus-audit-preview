import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import Lenis from 'lenis';
import { softLotusAsset, softLotusContract } from './asset.ts';
import { petalIds, type PetalId, type SceneState } from './state.ts';

export interface SceneRuntime {
  update(state: SceneState): void;
  dispose(): void;
}

// One GSAP ticker owns scroll input, animation and rendering. There is no
// renderer RAF loop and no continuously changing value in React state.
export function createRuntime(host: HTMLElement, labels: HTMLElement, onChoose: (id: PetalId) => void,
  onModel: (ready: boolean) => void): SceneRuntime {
  let disposed = false;
  let contextLost = false;
  let introduced = false;
  try { introduced = sessionStorage.getItem('soft-lotus-intro-v2') === '1'; } catch { /* Optional. */ }
  let dirty = true;
  let width = 1;
  let height = 1;
  let hovered = -1;
  let scroll = 0;
  let state: SceneState | null = null;
  let previousView = 'overview';
  let resource: THREE.Object3D | null = null;
  let press: { index: number; x: number; y: number; scroll: number; pointer: number } | null = null;
  const abort = new AbortController();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  const flower = new THREE.Group();
  scene.add(flower);
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0x9a928a, 2));
  const key = new THREE.DirectionalLight(0xfff3ee, 3.2);
  key.position.set(-4, 7, 5); scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8eeed, 1.4);
  fill.position.set(5, 2, -3); scene.add(fill);
  const pose = { bloom: introduced ? 1 : 0, turn: 0, emphasis: 0, reading: 0 };
  const anchors: THREE.Object3D[] = [];
  const pickTargets: THREE.Mesh[] = [];
  const placeholders: THREE.Group[] = [];
  const projected = new THREE.Vector3();
  const pointer = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5));
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.append(renderer.domElement);
  } catch { host.dataset.webgl = 'unavailable'; }

  // Explicitly temporary wireframe markers. They verify anchor/input geometry,
  // and must never be accepted or published as the generated soft lotus.
  function makeWireframe() {
    for (let i = 0; i < 5; i++) {
      const socket = new THREE.Group();
      socket.rotation.y = i * Math.PI * 2 / 5;
      const petal = new THREE.Group();
      socket.add(petal); flower.add(socket); placeholders.push(petal);
      const shape = new THREE.Shape();
      shape.moveTo(0, 0); shape.bezierCurveTo(-0.75, 0.8, -0.95, 1.7, 0, 2.8);
      shape.bezierCurveTo(0.95, 1.7, 0.75, 0.8, 0, 0);
      const outline = new THREE.BufferGeometry().setFromPoints(shape.getPoints(32).map(p => new THREE.Vector3(p.x, p.y, 0)));
      petal.add(new THREE.LineLoop(outline, new THREE.LineBasicMaterial({ color: 0x9a827b })));
      const surface = new THREE.Mesh(new THREE.ShapeGeometry(shape, 24), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false }));
      surface.userData.petal = i; petal.add(surface); pickTargets.push(surface);
      const anchor = new THREE.Object3D(); anchor.position.set(0, 1.85, 0.07);
      petal.add(anchor); anchors.push(anchor);
    }
    host.dataset.asset = 'temporary-wireframe';
  }

  async function load() {
    if (!renderer || !softLotusAsset.url) { makeWireframe(); onModel(false); return; }
    try {
      const gltf = await new GLTFLoader().loadAsync(softLotusAsset.url, event => {
        if (!disposed) host.dataset.loadBytes = event.lengthComputable ? `${event.loaded}/${event.total}` : 'unknown-total';
      });
      if (disposed) { disposeObject(gltf.scene); return; }
      const nodes = softLotusContract.petalNodes.map(name => gltf.scene.getObjectByName(name));
      const anchorNodes = softLotusContract.anchorNodes.map(name => gltf.scene.getObjectByName(name));
      if (nodes.some(n => !n) || anchorNodes.some(n => !n)) { disposeObject(gltf.scene); throw Error('The candidate does not satisfy the five-petal asset contract.'); }
      resource = gltf.scene; flower.add(resource);
      nodes.forEach((node, index) => node!.traverse(object => {
        if (object instanceof THREE.Mesh) { object.userData.petal = index; pickTargets.push(object); }
      }));
      anchors.push(...anchorNodes as THREE.Object3D[]);
      await renderer.compileAsync(scene, camera);
      if (disposed) return;
      host.dataset.asset = softLotusAsset.state;
      onModel(true);
    } catch {
      if (disposed) return;
      if (resource) { flower.remove(resource); disposeObject(resource); resource = null; }
      anchors.length = 0; pickTargets.length = 0;
      makeWireframe(); onModel(false);
    }
    dirty = true;
  }

  const lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.15,
    prevent: node => node.closest('[data-native-scroll]') !== null });
  lenis.on('scroll', event => { scroll = event.progress; dirty = true; });

  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    renderer?.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix(); dirty = true;
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize();

  function beforeTick(time: number) { if (!disposed && !document.hidden) lenis.raf(time * 1000); }
  function draw() {
    if (disposed || contextLost || document.hidden || !state || !width || !height) return;
    const frameState = state;
    const moving = gsap.isTweening(pose);
    if (!dirty && !moving && !lenis.isScrolling) return;
    dirty = false;
    const started = performance.now();
    const narrow = width < 700;
    flower.rotation.y = pose.turn + (state.view === 'overview' ? scroll * 0.28 : 0);
    flower.position.set(narrow ? 0 : -pose.reading * 2.7, -0.65, 0);
    const scale = narrow ? 1 - pose.reading * 0.55 : 1 - pose.reading * 0.24;
    flower.scale.setScalar(scale);
    placeholders.forEach((node, i) => { node.rotation.x = -pose.bloom * (1.05 + i * 0.022); });
    resource?.traverse(object => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
        const index = object.morphTargetDictionary[softLotusContract.morphTarget];
        if (index !== undefined) object.morphTargetInfluences[index] = pose.bloom;
      }
    });
    camera.position.set(0, 3.2 + pose.bloom * 3.8, narrow ? 12.8 : 10.6 - pose.emphasis * 0.4);
    camera.lookAt(0, 0.55, 0); camera.updateMatrixWorld(); flower.updateMatrixWorld(true);
    anchors.forEach((anchor, index) => {
      const el = labels.querySelector<HTMLElement>(`[data-anchor="${petalIds[index]}"]`);
      if (!el) return;
      anchor.getWorldPosition(projected); projected.project(camera);
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%)`;
      el.style.visibility = pose.bloom > 0.6 && frameState.view !== 'case' ? 'visible' : 'hidden';
    });
    renderer?.render(scene, camera);
    host.dataset.bloom = pose.bloom.toFixed(3);
    host.dataset.renderCpuMs = (performance.now() - started).toFixed(2);
    host.dataset.drawCalls = String(renderer?.info.render.calls || 0);
    host.dataset.triangles = String(renderer?.info.render.triangles || 0);
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(beforeTick, false, true);
  gsap.ticker.add(draw);
  document.addEventListener('visibilitychange', () => { dirty = true; }, { signal: abort.signal });

  function pick(event: PointerEvent) {
    const rect = host.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    ray.setFromCamera(pointer, camera);
    return ray.intersectObjects(pickTargets, false)[0]?.object.userData.petal ?? -1;
  }
  host.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || state?.view === 'case') return;
    hovered = pick(event); host.style.cursor = hovered >= 0 ? 'pointer' : '';
  }, { signal: abort.signal });
  host.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || state?.view === 'case') return;
    press = { index: pick(event), x: event.clientX, y: event.clientY, scroll: window.scrollY, pointer: event.pointerId };
  }, { signal: abort.signal });
  host.addEventListener('pointerup', event => {
    const start = press; press = null;
    if (!start || start.index < 0 || start.pointer !== event.pointerId || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8 || Math.abs(window.scrollY - start.scroll) > 8) return;
    if (pick(event) === start.index) onChoose(petalIds[start.index]);
  }, { signal: abort.signal });
  host.addEventListener('pointercancel', () => { press = null; }, { signal: abort.signal });
  renderer?.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault(); contextLost = true; host.dataset.webgl = 'lost'; onModel(false);
  }, { signal: abort.signal });
  void load();

  function disposeObject(object: THREE.Object3D) {
    object.traverse(node => { if (node instanceof THREE.Mesh || node instanceof THREE.Line) {
      node.geometry.dispose(); (Array.isArray(node.material) ? node.material : [node.material]).forEach(material => material.dispose());
    } });
  }
  return {
    update(next) {
      state = next;
      const index = next.active ? petalIds.indexOf(next.active) : 0;
      const angle = -index * Math.PI * 2 / 5;
      const nearestTurn = pose.turn + Math.atan2(Math.sin(angle - pose.turn), Math.cos(angle - pose.turn));
      const open = introduced || next.model !== 'pending' || next.active !== null;
      gsap.to(pose, { bloom: open ? 1 : 0, turn: next.active ? nearestTurn : pose.turn,
        emphasis: next.active ? 1 : 0, reading: next.view === 'case' ? 1 : 0,
        duration: next.reducedMotion ? 0 : !introduced && open && !next.active ? 1.1 : 0.65, ease: 'power3.inOut', overwrite: true,
        onUpdate: () => { dirty = true; }, onComplete: () => {
          dirty = true;
          if (state?.model === 'ready') { introduced = true; try { sessionStorage.setItem('soft-lotus-intro-v2', '1'); } catch { /* Optional. */ } }
        } });
      if (next.view === 'case') lenis.stop(); else if (previousView === 'case') lenis.start();
      previousView = next.view; dirty = true;
    },
    dispose() {
      disposed = true; abort.abort(); observer.disconnect(); lenis.destroy();
      gsap.ticker.remove(beforeTick); gsap.ticker.remove(draw); gsap.killTweensOf(pose);
      disposeObject(flower); renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
    },
  };
}

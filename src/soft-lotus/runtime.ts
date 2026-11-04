import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
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
  let hoverEvent: PointerEvent | null = null;
  let scroll = 0;
  let state: SceneState | null = null;
  let previousView = 'overview';
  let resource: THREE.Object3D | null = null;
  let press: { index: number; x: number; y: number; scroll: number; pointer: number } | null = null;
  const abort = new AbortController();
  const loadingManager = new THREE.LoadingManager();
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 80);
  const inspectionValue = import.meta.env.MODE === 'soft-preview' ? new URL(location.href).searchParams.get('pose') : null;
  const inspectionPose = inspectionValue !== null && Number.isFinite(Number(inspectionValue)) ? THREE.MathUtils.clamp(Number(inspectionValue), 0, 1) : null;
  const flower = new THREE.Group();
  scene.add(flower);
  scene.add(new THREE.HemisphereLight(0xfffbf5, 0xc5bcae, 2.6));
  const key = new THREE.DirectionalLight(0xfff8f3, 2.0);
  key.position.set(-3, 9, 4); scene.add(key);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.1, far: 20 });
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 4;
  key.shadow.intensity = 0.6;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ color: 0x8b7d70, opacity: 0.12 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.65; ground.receiveShadow = true; scene.add(ground);
  const fill = new THREE.DirectionalLight(0xe8eeed, 0.7);
  fill.position.set(5, 2, -3); scene.add(fill);
  const pose = { bloom: introduced ? 1 : 0, turn: 0, emphasis: 0, reading: 0 };
  const petalFocus = petalIds.map(() => ({ value: 0 }));
  const anchors: THREE.Object3D[] = [];
  const labelElements = petalIds.map(id => labels.querySelector<HTMLElement>(`[data-anchor="${id}"]`));
  const morphMeshes: THREE.Mesh[] = [];
  const pickTargets: THREE.Mesh[] = [];
  const projected = new THREE.Vector3();
  const pointer = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  let renderer: THREE.WebGLRenderer | null = null;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.25 : 1.5));
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.append(renderer.domElement);
  } catch { host.dataset.webgl = 'unavailable'; }

  async function load() {
    if (!renderer || !softLotusAsset.url) { host.dataset.asset = 'fallback'; onModel(false); return; }
    const timeout = window.setTimeout(() => loadingManager.abort(), 20000);
    try {
      const assetURL = innerWidth < 700 ? softLotusAsset.mobileUrl || softLotusAsset.url : softLotusAsset.url;
      const gltf = await new GLTFLoader(loadingManager).setMeshoptDecoder(MeshoptDecoder).loadAsync(assetURL, event => {
        if (!disposed) host.dataset.loadBytes = event.lengthComputable ? `${event.loaded}/${event.total}` : 'unknown-total';
      });
      if (disposed) { disposeObject(gltf.scene); return; }
      const nodes = softLotusContract.petalNodes.map(name => gltf.scene.getObjectByName(name));
      const anchorNodes = softLotusContract.anchorNodes.map(name => gltf.scene.getObjectByName(name));
      if (nodes.some(n => !n) || anchorNodes.some(n => !n)) { disposeObject(gltf.scene); throw Error('The candidate does not satisfy the five-petal asset contract.'); }
      resource = gltf.scene; flower.add(resource);
      resource.traverse(object => { if (object instanceof THREE.Mesh) {
        // Thin, morphing petals retain their form shading and cast on the ground.
        // Receiving their own shadow map caused visible acne at mid-bloom.
        object.castShadow = true; object.receiveShadow = false;
        if (object.morphTargetDictionary?.[softLotusContract.morphTarget] !== undefined) morphMeshes.push(object);
      } });
      if (morphMeshes.length !== 5) throw Error('Each petal needs its own Bloom morph.');
      nodes.forEach((node, index) => node!.traverse(object => {
        if (object instanceof THREE.Mesh) { object.userData.petal = index; pickTargets.push(object); }
      }));
      anchors.push(...anchorNodes as THREE.Object3D[]);
      anchors.forEach(anchor => { anchor.userData.openPosition = anchor.position.clone(); });
      await renderer.compileAsync(scene, camera);
      if (disposed) return;
      host.dataset.asset = softLotusAsset.state;
      host.dataset.assetUrl = assetURL;
      onModel(true);
    } catch {
      if (disposed) return;
      if (resource) { flower.remove(resource); disposeObject(resource); resource = null; }
      anchors.length = 0; pickTargets.length = 0; morphMeshes.length = 0;
      host.dataset.asset = 'fallback'; onModel(false);
    } finally { clearTimeout(timeout); }
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

  function beforeTick(time: number) {
    if (disposed || document.hidden) return;
    lenis.raf(time * 1000);
    if (hoverEvent) { hovered = pick(hoverEvent); hoverEvent = null; host.style.cursor = hovered >= 0 ? 'pointer' : ''; }
  }
  function draw() {
    if (disposed || contextLost || document.hidden || !state || !width || !height) return;
    const frameState = state;
    const moving = gsap.isTweening(pose) || gsap.isTweening(petalFocus);
    if (!dirty && !moving && !lenis.isScrolling) return;
    dirty = false;
    const started = performance.now();
    const narrow = width < 700;
    flower.rotation.y = pose.turn + (state.view === 'overview' && !state.reducedMotion && !narrow ? scroll * 0.12 : 0);
    flower.position.set(narrow ? 0 : -pose.emphasis * 1.2 - pose.reading * 1.8, narrow ? 0.7 + pose.emphasis * 1.0 : height < 650 ? -0.35 : -0.65, 0);
    const mobileFit = Math.min(width / 390, height / 750) * 844 / height;
    const scale = (narrow ? 0.46 * mobileFit * (1 - pose.reading * 0.55) : (0.88 - pose.reading * 0.2) * (height < 650 ? 0.85 : 1)) * (0.65 + 0.35 * pose.bloom);
    flower.scale.setScalar(scale);
    ground.position.y = flower.position.y + 0.015 * scale;
    morphMeshes.forEach(object => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
        const index = object.morphTargetDictionary[softLotusContract.morphTarget];
        if (index !== undefined) object.morphTargetInfluences[index] = pose.bloom;
        const focusIndex = object.morphTargetDictionary.Focus;
        if (focusIndex !== undefined) object.morphTargetInfluences[focusIndex] = petalFocus[object.userData.petal]?.value * pose.bloom ** 3 || 0;
      }
    });
    camera.position.set(0, 3.2 + pose.bloom * 4.3, narrow ? 12.8 : 10.6 - pose.emphasis * 0.4);
    camera.lookAt(0, narrow ? 0.6 : 0.75, 0); camera.updateMatrixWorld(); flower.updateMatrixWorld(true);
    anchors.forEach((anchor, index) => {
      if (anchor.userData.closed_position_yup && anchor.userData.openPosition) {
        anchor.position.fromArray(anchor.userData.closed_position_yup).lerp(anchor.userData.openPosition, pose.bloom);
        const focus = petalFocus[index].value * pose.bloom ** 3;
        anchor.position.x *= 1 + focus * 0.18; anchor.position.z *= 1 + focus * 0.18; anchor.position.y += focus * 0.12;
        anchor.updateMatrixWorld();
      }
      const el = labelElements[index];
      if (!el) return;
      anchor.getWorldPosition(projected); projected.project(camera);
      const x = (projected.x * 0.5 + 0.5) * width;
      const y = (-projected.y * 0.5 + 0.5) * height;
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%)`;
      el.style.visibility = pose.bloom > 0.6 && frameState.view !== 'case' ? 'visible' : 'hidden';
      el.dataset.active = String(frameState.active === petalIds[index]);
      el.style.opacity = frameState.active && frameState.active !== petalIds[index] ? '0.48' : String(THREE.MathUtils.smoothstep(pose.bloom, 0.65, 1));
    });
    renderer?.render(scene, camera);
    host.dataset.bloom = pose.bloom.toFixed(3);
    host.dataset.animating = String(moving);
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
    hoverEvent = event;
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
      if (state?.reducedMotion !== next.reducedMotion) {
        lenis.options.smoothWheel = !next.reducedMotion;
        if (next.reducedMotion) lenis.scrollTo(window.scrollY, { immediate: true, force: true });
      }
      state = next;
      const index = next.active ? petalIds.indexOf(next.active) : 0;
      const angle = next.active && anchors[index]?.userData.selection_turn_degrees !== undefined
        ? THREE.MathUtils.degToRad(anchors[index].userData.selection_turn_degrees) : -index * Math.PI * 2 / 5;
      const nearestTurn = pose.turn + Math.atan2(Math.sin(angle - pose.turn), Math.cos(angle - pose.turn));
      const open = introduced || next.model !== 'pending' || next.active !== null;
      gsap.to(petalFocus, { value: (i: number) => next.active && i === index ? 1 : 0,
        duration: next.reducedMotion || document.documentElement.dataset.input === 'keyboard' ? 0 : 0.55,
        ease: 'power3.inOut', overwrite: true, onUpdate: () => { dirty = true; } });
      gsap.to(pose, { bloom: open ? 1 : 0, turn: next.active ? nearestTurn : pose.turn,
        emphasis: next.active ? 1 : 0, reading: next.view === 'case' ? 1 : 0,
        duration: next.reducedMotion || document.documentElement.dataset.input === 'keyboard' ? 0 : !introduced && open && !next.active ? 1.1 : 0.55, ease: 'power3.inOut', overwrite: true,
        onUpdate: () => { dirty = true; }, onComplete: () => {
          dirty = true;
          if (state?.model === 'ready') { introduced = true; try { sessionStorage.setItem('soft-lotus-intro-v2', '1'); } catch { /* Optional. */ } }
        } });
      if (next.view === 'case') lenis.stop(); else if (previousView === 'case') lenis.start();
      previousView = next.view; dirty = true;
      if (inspectionPose !== null) { gsap.killTweensOf(pose); pose.bloom = inspectionPose; pose.turn = 0; pose.reading = 0; dirty = true; }
    },
    dispose() {
      disposed = true; abort.abort(); loadingManager.abort(); observer.disconnect(); lenis.destroy();
      gsap.ticker.remove(beforeTick); gsap.ticker.remove(draw); gsap.killTweensOf(pose); gsap.killTweensOf(petalFocus);
      disposeObject(flower); disposeObject(ground); key.shadow.dispose(); renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
    },
  };
}

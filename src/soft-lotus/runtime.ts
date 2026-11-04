import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { gsap } from 'gsap';
import { softLotusAsset, softLotusContract } from './asset.ts';
import { petalIds, type PetalId, type SceneState } from './state.ts';

export interface SceneRuntime {
  update(state: SceneState): void;
  dispose(): void;
}
export type LoadProgress = { phase: 'transfer' | 'prepare'; loaded: number; total: number | null };

// One GSAP ticker owns pointer updates, animation and rendering. There is no
// renderer RAF loop and no continuously changing value in React state.
export function createRuntime(host: HTMLElement, labels: HTMLElement, onChoose: (id: PetalId) => void,
  onModel: (ready: boolean) => void, onProgress: (progress: LoadProgress) => void): SceneRuntime {
  let disposed = false;
  let contextLost = false;
  let introduced = false;
  try { introduced = sessionStorage.getItem('soft-lotus-intro-v2') === '1'; } catch { /* Optional. */ }
  let dirty = true;
  let width = 1;
  let height = 1;
  let hovered = -1;
  let hoverEvent: PointerEvent | null = null;
  let state: SceneState | null = null;
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
  scene.add(new THREE.HemisphereLight(0xfff9ee, 0xaaa28f, 1.8));
  const key = new THREE.DirectionalLight(0xfff1e1, 2.6);
  key.position.set(-4, 7, 3); scene.add(key);
  key.castShadow = true; key.shadow.mapSize.set(512, 512);
  key.shadow.blurSamples = 8;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.1, far: 20 });
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 4;
  key.shadow.intensity = 0.6;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ color: 0x776c59, opacity: 0.19 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.65; ground.receiveShadow = true; scene.add(ground);
  const fill = new THREE.DirectionalLight(0xdfe9e7, 0.35);
  fill.position.set(5, 2, -3); scene.add(fill);
  const pose = { bloom: introduced ? 1 : 0, turn: 0, emphasis: 0, reading: 0 };
  const petalFocus = petalIds.map(() => ({ value: 0 }));
  const petalHover = petalIds.map(() => ({ value: 0 }));
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
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.append(renderer.domElement);
  } catch { host.dataset.webgl = 'unavailable'; }

  async function load() {
    if (!renderer || !softLotusAsset.url) { host.dataset.asset = 'fallback'; onModel(false); return; }
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      if (disposed) return;
      timedOut = true; loadingManager.abort(); flower.visible = false;
      host.dataset.asset = 'fallback'; onModel(false); dirty = true;
    }, 20000);
    try {
      const assetURL = innerWidth < 700 ? softLotusAsset.mobileUrl || softLotusAsset.url : softLotusAsset.url;
      const gltf = await new GLTFLoader(loadingManager).setMeshoptDecoder(MeshoptDecoder).loadAsync(assetURL, event => {
        if (!disposed && !timedOut && !contextLost) {
          host.dataset.loadBytes = event.lengthComputable ? `${event.loaded}/${event.total}` : 'unknown-total';
          onProgress({ phase: event.lengthComputable && event.loaded >= event.total ? 'prepare' : 'transfer', loaded: event.loaded, total: event.lengthComputable ? event.total : null });
        }
      });
      if (disposed || timedOut || contextLost) { disposeObject(gltf.scene); return; }
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
      onProgress({ phase: 'prepare', loaded: 0, total: null });
      await renderer.compileAsync(scene, camera);
      if (disposed) return;
      if (timedOut || contextLost) throw Error('Scene preparation was interrupted.');
      // The shadow pass has its own programs. Submit it while the matching bud
      // poster is still visible, then wait for actual GPU completion rather
      // than moving that first-frame cost into the opening animation.
      dirty = true;
      draw();
      const context = renderer.getContext();
      const gl = context instanceof WebGL2RenderingContext ? context : null;
      const fence = gl?.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (gl && fence) {
        gl.flush();
        await new Promise<void>(resolve => {
          const check = () => {
            if (disposed || timedOut || contextLost || gl.clientWaitSync(fence, 0, 0) !== gl.TIMEOUT_EXPIRED) { gl.deleteSync(fence); resolve(); }
            else window.setTimeout(check, 4);
          };
          check();
        });
      }
      if (disposed) return;
      if (timedOut || contextLost) throw Error('GPU preparation was interrupted.');
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

  // This scene is one screen. Readers use native scrolling; no artificial
  // document height or Lenis instance exists solely to rotate the flower.

  function resize() {
    width = host.clientWidth; height = host.clientHeight;
    if (!width || !height) return;
    renderer?.setSize(width, height, false);
    camera.aspect = width / height; camera.updateProjectionMatrix(); dirty = true;
  }
  const observer = new ResizeObserver(resize); observer.observe(host); resize();

  function beforeTick() {
    if (disposed || document.hidden) return;
    if (hoverEvent) { setHover(pick(hoverEvent)); hoverEvent = null; }
  }
  function setHover(index: number) {
    if (hovered === index) return;
    hovered = index; host.style.cursor = index >= 0 ? 'pointer' : '';
    gsap.to(petalHover, { value: (i: number) => !state?.reducedMotion && state?.view === 'overview' && i === index ? .16 : 0, duration: .25, overwrite: true, onUpdate: () => { dirty = true; } });
  }
  function draw() {
    if (disposed || contextLost || document.hidden || !state || !width || !height) return;
    const frameState = state;
    const moving = gsap.isTweening(pose) || gsap.isTweening(petalFocus) || gsap.isTweening(petalHover);
    if (!dirty && !moving) return;
    dirty = false;
    const started = performance.now();
    const narrow = width < 700;
    flower.rotation.y = pose.turn;
    flower.position.set(narrow ? 0 : -pose.emphasis * 1.2 - pose.reading * 1.8, narrow ? (height < 700 ? -1.4 : -.9) * (1 - pose.emphasis) + pose.emphasis * 1.7 : (height < 650 ? -.65 : -.95) + pose.emphasis * .3, 0);
    const mobileFit = Math.min(width / 390, height / 750) * 844 / height;
    const scale = (narrow ? 0.46 * mobileFit * (1 - pose.reading * 0.55) : (0.70 + pose.emphasis * .14 - pose.reading * 0.2) * (height < 650 ? 0.85 : 1)) * (0.65 + 0.35 * pose.bloom);
    flower.scale.setScalar(scale);
    ground.position.y = flower.position.y + 0.015 * scale;
    morphMeshes.forEach(object => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
        const index = object.morphTargetDictionary[softLotusContract.morphTarget];
        if (index !== undefined) object.morphTargetInfluences[index] = pose.bloom;
        const focusIndex = object.morphTargetDictionary.Focus;
        if (focusIndex !== undefined) object.morphTargetInfluences[focusIndex] = ((petalFocus[object.userData.petal]?.value || 0) + (petalHover[object.userData.petal]?.value || 0)) * pose.bloom ** 3;
      }
    });
    camera.position.set(0, 3.2 + pose.bloom * 2.5, narrow ? 12.8 : 10.6 - pose.emphasis * 0.4);
    camera.lookAt(0, narrow ? 0.6 : 0.75, 0); camera.updateMatrixWorld(); flower.updateMatrixWorld(true);
    anchors.forEach((anchor, index) => {
      if (anchor.userData.closed_position_yup && anchor.userData.openPosition) {
        anchor.position.fromArray(anchor.userData.closed_position_yup).lerp(anchor.userData.openPosition, pose.bloom);
        const focus = (petalFocus[index].value + petalHover[index].value) * pose.bloom ** 3;
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
    if (contextLost || state?.model !== 'ready') return -1;
    const rect = host.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
    ray.setFromCamera(pointer, camera);
    return ray.intersectObjects(pickTargets, false)[0]?.object.userData.petal ?? -1;
  }
  host.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || state?.view === 'case') return;
    hoverEvent = event;
  }, { signal: abort.signal });
  host.addEventListener('pointerleave', () => setHover(-1), { signal: abort.signal });
  labels.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return;
    const id = (event.target as HTMLElement).closest<HTMLElement>('[data-anchor]')?.dataset.anchor;
    setHover(petalIds.indexOf(id as PetalId));
  }, { signal: abort.signal });
  labels.addEventListener('pointerleave', () => setHover(-1), { signal: abort.signal });
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
      if (next.view !== 'overview' || next.reducedMotion) { gsap.killTweensOf(petalHover); petalHover.forEach(value => { value.value = 0; }); hovered = -1; }
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
      dirty = true;
      if (inspectionPose !== null) { gsap.killTweensOf(pose); pose.bloom = inspectionPose; pose.turn = 0; pose.reading = 0; dirty = true; }
    },
    dispose() {
      disposed = true; abort.abort(); loadingManager.abort(); observer.disconnect();
      gsap.ticker.remove(beforeTick); gsap.ticker.remove(draw); gsap.killTweensOf(pose); gsap.killTweensOf(petalFocus); gsap.killTweensOf(petalHover);
      disposeObject(flower); disposeObject(ground); key.shadow.dispose(); renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
    },
  };
}

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { gsap } from 'gsap';
import { ConvexGeometry } from 'three/addons/geometries/ConvexGeometry.js';
import { softLotusAsset, softLotusContract } from './asset.ts';
import { petalIds, type PetalId, type SceneState } from './state.ts';
import { createReadingLayout } from './reading-layout.ts';

export interface SceneRuntime {
  update(state: SceneState): void;
  setCatalog(open: boolean, reduced: boolean): void;
  dispose(): void;
}
export type LoadProgress = { phase: 'transfer' | 'prepare'; loaded: number; total: number | null };

// One GSAP ticker owns pointer updates, animation and rendering. There is no
// renderer RAF loop and no continuously changing value in React state.
export function createRuntime(host: HTMLElement, labels: HTMLElement, onChoose: (id: PetalId) => void,
  onModel: (ready: boolean) => void, onProgress: (progress: LoadProgress) => void): SceneRuntime {
  let disposed = false;
  let contextLost = false;
  let warming = false;
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
  const decoration = new THREE.Group(); scene.add(decoration);
  const drift = { elapsed: introduced ? 12 : 0 };
  let driftTween: gsap.core.Tween | null = null;
  let decorationGeometry: THREE.BufferGeometry | null = null;
  const decorationCorners: THREE.Vector3[] = [];
  const decorationPoint = new THREE.Vector3();
  scene.add(new THREE.HemisphereLight(0xfffbf1, 0xc0b2a0, 1.1));
  const key = new THREE.DirectionalLight(0xfff1df, 2.5);
  key.position.set(-3, 9, -2); scene.add(key);
  key.castShadow = true; key.shadow.mapSize.set(512, 512);
  key.shadow.blurSamples = 8;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.1, far: 20 });
  key.shadow.normalBias = 0.035;
  key.shadow.radius = 5;
  key.shadow.intensity = 0.55;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.ShadowMaterial({ color: 0x766e5b, opacity: 0.075 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.65; ground.receiveShadow = true; scene.add(ground);
  const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 128;
  const shadowContext = shadowCanvas.getContext('2d')!;
  const contactGradient = shadowContext.createRadialGradient(64, 64, 0, 64, 64, 64);
  contactGradient.addColorStop(0, '#665d45aa'); contactGradient.addColorStop(.28, '#665d4555'); contactGradient.addColorStop(1, '#665d4500');
  shadowContext.fillStyle = contactGradient; shadowContext.fillRect(0, 0, 128, 128);
  const contactMap = new THREE.CanvasTexture(shadowCanvas);
  const contact = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), new THREE.MeshBasicMaterial({ map: contactMap, transparent: true, opacity: .35, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2; scene.add(contact);
  const fill = new THREE.DirectionalLight(0xe7eff1, 0.8);
  fill.position.set(3, 4, 6); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xfff9eb, 1.1);
  rim.position.set(5, 3, -3); scene.add(rim);
  const pose = { bloom: introduced ? 1 : 0, turn: -0.18, emphasis: 0, reading: 0 };
  const catalog = { depth: 0 };
  let catalogOpen = false;
  const petalFocus = petalIds.map(() => ({ value: 0 }));
  const petalHover = petalIds.map(() => ({ value: 0 }));
  const anchors: THREE.Object3D[] = [];
  const labelElements = petalIds.map(id => labels.querySelector<HTMLElement>(`[data-anchor="${id}"]`));
  const morphMeshes: THREE.Mesh[] = [];
  const pickTargets: THREE.Mesh[] = [];
  const readingCorners: THREE.Vector3[] = [];
  const readingLayout = createReadingLayout();
  const readingHighlights: { mesh: THREE.Mesh; amount: { value: number } }[] = [];
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
      morphMeshes.forEach(mesh => {
        const optics = mesh.geometry.getAttribute('uv1');
        if (optics) mesh.geometry.setAttribute('petalOptics', optics);
        const materials = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map(material => material.clone());
        mesh.material = Array.isArray(mesh.material) ? materials : materials[0];
        materials.forEach(material => {
          if (!(material instanceof THREE.MeshStandardMaterial) || !optics) return;
          material.roughness = 0.74;
          if (material instanceof THREE.MeshPhysicalMaterial) material.specularIntensity = .25;
          const readingSelection = { value: 0 };
          readingHighlights.push({ mesh, amount: readingSelection });
          material.onBeforeCompile = shader => {
            shader.uniforms.readingSelection = readingSelection;
            shader.vertexShader = 'attribute vec2 petalOptics; varying vec2 vPetalOptics;\n' + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nvPetalOptics = petalOptics;');
            shader.fragmentShader = 'uniform float readingSelection; varying vec2 vPetalOptics;\n' + shader.fragmentShader;
            shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.52, 0.35, 0.19), readingSelection * 0.40);');
            shader.fragmentShader = shader.fragmentShader.replace('#include <lights_fragment_end>', `#include <lights_fragment_end>
              float thinEdge = max(pow(vPetalOptics.y, 3.0), smoothstep(0.55, 1.0, vPetalOptics.x));
              float throughLight = pow(max(0.0, dot(-normal, directionalLights[0].direction)), 1.35);
              float grazingLight = pow(1.0 - abs(dot(normal, geometryViewDir)), 3.0);
              reflectedLight.indirectDiffuse += diffuseColor.rgb * vec3(1.0, 0.77, 0.64) * ((0.18 + thinEdge * 0.65) * throughLight + thinEdge * grazingLight * 0.10);
            `);
          };
          material.customProgramCacheKey = () => 'lotus-thin-petal-reading-v2';
          material.needsUpdate = true;
        });
      });
      // Separate, non-interactive pieces use the same adapted source surface.
      // The five navigation petals stay attached to the flower throughout.
      const original = resource.getObjectByName('Decor_Petal') as THREE.Mesh;
      if (!original?.isMesh) throw Error('Decorative source is missing.');
      original.visible = false;
      decorationGeometry = original.geometry.clone();
      const decorationOptics = decorationGeometry.getAttribute('uv1');
      if (decorationOptics) decorationGeometry.setAttribute('petalOptics', decorationOptics);
      const positions = decorationGeometry.getAttribute('position');
      const openBox = new THREE.Box3(); const point = new THREE.Vector3();
      for (let i = 0; i < positions.count; i++) {
        point.fromBufferAttribute(positions, i);
        openBox.expandByPoint(point);
      }
      const center = openBox.getCenter(new THREE.Vector3());
      decorationGeometry.translate(-center.x, -center.y, -center.z);
      openBox.translate(center.negate());
      for (const x of [openBox.min.x, openBox.max.x]) for (const y of [openBox.min.y, openBox.max.y]) for (const z of [openBox.min.z, openBox.max.z]) decorationCorners.push(new THREE.Vector3(x,y,z));
      for (let i = 0; i < 3; i++) {
        const piece = new THREE.Mesh(decorationGeometry, original.material);
        piece.castShadow = true; piece.frustumCulled = false; decoration.add(piece);
      }
      nodes.forEach((node, index) => node!.traverse(object => {
        if (object instanceof THREE.Mesh) { object.userData.petal = index; pickTargets.push(object); }
      }));
      anchors.push(...anchorNodes as THREE.Object3D[]);
      anchors.forEach(anchor => { anchor.userData.openPosition = anchor.position.clone(); });
      // Build one convex envelope from the actual closed/open focused surfaces.
      // Its compact boundary avoids both oversized box fits and per-frame scans.
      flower.updateMatrixWorld(true);
      const envelopePoints: THREE.Vector3[] = [], vertex = new THREE.Vector3();
      const inverse = flower.matrixWorld.clone().invert(), localMatrix = new THREE.Matrix4();
      resource.traverse(object => {
        if (!(object instanceof THREE.Mesh) || object === original) return;
        const saved = object.morphTargetInfluences?.slice();
        localMatrix.multiplyMatrices(inverse, object.matrixWorld);
        for (const bloom of [0, 1]) {
          if (object.morphTargetDictionary && object.morphTargetInfluences) {
            object.morphTargetInfluences[object.morphTargetDictionary.Bloom] = bloom;
            if (object.morphTargetDictionary.Focus !== undefined) object.morphTargetInfluences[object.morphTargetDictionary.Focus] = 1;
          }
          for (let i = 0; i < object.geometry.getAttribute('position').count; i++) envelopePoints.push(object.getVertexPosition(i, vertex).applyMatrix4(localMatrix).clone());
        }
        if (saved && object.morphTargetInfluences) object.morphTargetInfluences.splice(0, saved.length, ...saved);
      });
      const envelope = new ConvexGeometry(envelopePoints), boundary = envelope.getAttribute('position');
      const unique = new Set<string>();
      for (let i = 0; i < boundary.count; i++) {
        vertex.fromBufferAttribute(boundary, i);
        const key = `${vertex.x},${vertex.y},${vertex.z}`;
        if (!unique.has(key)) { unique.add(key); readingCorners.push(vertex.clone()); }
      }
      envelope.dispose();
      onProgress({ phase: 'prepare', loaded: 0, total: null });
      await renderer.compileAsync(scene, camera);
      if (disposed) return;
      if (timedOut || contextLost) throw Error('Scene preparation was interrupted.');
      // The shadow pass has its own programs. Submit it while the matching bud
      // poster is still visible, then wait for actual GPU completion rather
      // than moving that first-frame cost into the opening animation.
      dirty = true;
      warming = true;
      draw();
      warming = false;
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
      if (!introduced && !state?.reducedMotion) driftTween = gsap.to(drift, { elapsed: 12, duration: 12, ease: 'none', onUpdate: () => { dirty = true; } });
      if (catalogOpen) driftTween?.pause();
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
    if (catalogOpen) return;
    if (hovered === index) return;
    hovered = index; host.style.cursor = index >= 0 ? 'pointer' : '';
    gsap.to(petalHover, { value: (i: number) => !state?.reducedMotion && state?.view === 'overview' && i === index ? .16 : 0, duration: .25, overwrite: true, onUpdate: () => { dirty = true; } });
  }
  function draw() {
    if (disposed || contextLost || document.hidden || !state || !width || !height || (state.model === 'pending' && !warming)) return;
    const frameState = state;
    const flowerMoving = gsap.isTweening(pose) || gsap.isTweening(petalFocus) || gsap.isTweening(petalHover);
    const catalogMoving = gsap.isTweening(catalog);
    const moving = flowerMoving || catalogMoving || gsap.isTweening(drift);
    if (!dirty && !moving) return;
    dirty = false;
    const started = performance.now();
    const narrow = width <= 700;
    flower.rotation.y = pose.turn;
    flower.position.set(narrow ? 0 : 1.25 * (1 - pose.emphasis) - pose.emphasis * 1.25, narrow ? (height < 500 ? 0 : -0.7) : -.22, 0);
    let scale = (narrow ? .95 * (width <= 360 ? 1.06 : 1.09) * width / height * (1 - .10 * pose.emphasis) * (1 - pose.reading * .55) : (.79 + pose.emphasis * .01) * (height < 650 ? .82 : 1)) * (.65 + .35 * pose.bloom);
    flower.scale.setScalar(scale);
    camera.position.set(0, 3.7 + pose.bloom * 1.45 + (narrow ? pose.emphasis * 1.9 : 0), (narrow ? 12.3 : 10.4) + catalog.depth * .8);
    camera.lookAt(0, narrow ? .8 : .83, 0); camera.updateMatrixWorld();
    if (narrow) {
      const rail = width <= 360 || height <= 700 ? height * .27 : THREE.MathUtils.clamp(height * .32, 180, 310);
      const targetY = THREE.MathUtils.lerp(height * .62, 64 + rail * .5, pose.emphasis);
      projected.set(0, 1 - targetY / height * 2, .5).unproject(camera).sub(camera.position);
      const distance = -camera.position.z / projected.z;
      flower.position.set(.10 * (1 - pose.emphasis), camera.position.y + projected.y * distance - (1.5 - .4 * pose.bloom) * scale, 0);
      host.dataset.contentBoundary = (64 + rail).toFixed(2);
    }
    if (!narrow && readingCorners.length && pose.emphasis > 0) {
      // A tall desktop viewport also needs a whole selected flower beside the
      // preview. Blend this constraint in before the reader starts its motion.
      const compact = THREE.MathUtils.smoothstep(1.45 - width / height, 0, .25) * pose.emphasis;
      if (compact > 0) {
        const fit = readingLayout.fit(readingCorners, camera, pose.turn, width, height, width * .36);
        flower.position.lerp(fit.position, compact);
        scale = THREE.MathUtils.lerp(scale, fit.scale, compact);
        flower.scale.setScalar(scale);
      }
    }
    if (!narrow && readingCorners.length && pose.reading > 0) {
      const reader = document.querySelector<HTMLElement>('.case-reader');
      const panelWidth = reader?.offsetWidth || Math.min(width * .72, 1040);
      const fit = readingLayout.fit(readingCorners, camera, pose.turn, width, height, panelWidth);
      flower.position.lerp(fit.position, pose.reading);
      scale = THREE.MathUtils.lerp(scale, fit.scale, pose.reading);
      flower.scale.setScalar(scale);
      host.parentElement?.style.setProperty('--reading-caption-y', `${fit.captionY}px`);
      host.parentElement?.style.setProperty('--reading-column', `${fit.column}px`);
    }
    host.parentElement?.style.setProperty('--reading-progress', String(THREE.MathUtils.smoothstep(pose.reading, .85, 1)));
    readingHighlights.forEach(({ mesh, amount }) => { amount.value = pose.reading * (petalFocus[mesh.userData.petal]?.value || 0); });
    ground.position.y = flower.position.y + 0.015 * scale;
    contact.position.set(flower.position.x, ground.position.y + .002, flower.position.z); contact.scale.setScalar(scale);
    decoration.visible = frameState.model === 'ready' && frameState.view === 'overview' && !frameState.reducedMotion;
    if (decoration.visible) decoration.children.forEach((piece, index) => {
      const progress = THREE.MathUtils.clamp((drift.elapsed - index * 2.2) / 4.6, 0, 1);
      const remaining = 1 - progress;
      const size = (.12 + index * .012) * scale;
      piece.scale.setScalar(size);
      piece.rotation.set(.12 + Math.sin(progress * 9 + index) * remaining * .8, [-.5, 1.5, 2.4][index] + remaining * .8, .08 + Math.sin(progress * 13 + index) * remaining * .65);
      let floorOffset = Infinity;
      decorationCorners.forEach(corner => { decorationPoint.copy(corner).applyEuler(piece.rotation); floorOffset = Math.min(floorOffset, decorationPoint.y * size); });
      piece.position.set(flower.position.x + ([-3.6, 3.5, 2.1][index] + Math.sin(progress * 5 + index) * remaining * .45) * scale,
        ground.position.y - floorOffset + remaining ** 2 * 3.8 + .004,
        ([2.4, 1.0, 3.4][index] + remaining * .3) * scale);
      piece.visible = drift.elapsed > index * 2.2;
    });
    morphMeshes.forEach(object => {
      if (object instanceof THREE.Mesh && object.morphTargetDictionary && object.morphTargetInfluences) {
        const index = object.morphTargetDictionary[softLotusContract.morphTarget];
        if (index !== undefined) object.morphTargetInfluences[index] = pose.bloom;
        const focusIndex = object.morphTargetDictionary.Focus;
        if (focusIndex !== undefined) object.morphTargetInfluences[focusIndex] = ((petalFocus[object.userData.petal]?.value || 0) + (petalHover[object.userData.petal]?.value || 0)) * pose.bloom ** 3;
      }
    });
    flower.updateMatrixWorld(true);
    if (readingCorners.length) {
      const bounds = readingLayout.project(readingCorners, camera, flower.matrixWorld, width, height);
      host.dataset.flowerBounds = JSON.stringify([bounds.min.x, bounds.min.y, bounds.max.x, bounds.max.y].map(value => Number(value.toFixed(2))));
    }
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
    host.dataset.animating = String(flowerMoving || catalogMoving);
    host.dataset.pose = JSON.stringify([pose.bloom, pose.turn, pose.emphasis, pose.reading].map(value => Number(value.toFixed(5))));
    host.dataset.catalogDepth = catalog.depth.toFixed(5);
    host.dataset.renderCpuMs = (performance.now() - started).toFixed(2);
    host.dataset.drawCalls = String(renderer?.info.render.calls || 0);
    host.dataset.triangles = String(renderer?.info.render.triangles || 0);
    host.dataset.decor = decoration.visible && !catalogOpen ? (drift.elapsed < 12 ? 'falling' : 'settled') : 'paused';
  }
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add(beforeTick, false, true);
  gsap.ticker.add(draw);
  document.addEventListener('visibilitychange', () => { dirty = true; }, { signal: abort.signal });

  function pick(event: PointerEvent) {
    if (contextLost || catalogOpen || state?.view === 'case' || state?.model !== 'ready') return -1;
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
    setCatalog(open, reduced) {
      catalogOpen = open;
      host.dataset.animating = 'true';
      // Freeze the base pose instead of completing its tweens. The independent
      // camera offset can reverse without altering bloom, selection or rotation.
      for (const tween of gsap.getTweensOf([pose, ...petalFocus, ...petalHover])) {
        if (open) tween.pause(); else tween.resume();
      }
      if (open || state?.view !== 'overview' || state?.reducedMotion) driftTween?.pause();
      else driftTween?.resume();
      gsap.to(catalog, { depth: open && !reduced ? 1 : 0, duration: reduced ? 0 : .6,
        ease: 'power3.inOut', overwrite: true, onUpdate: () => { dirty = true; } });
      dirty = true;
    },
    update(next) {
      state = next;
      // Invalidate synchronously: observers must not mistake the previous
      // settled frame for completion of a newly requested pose.
      host.dataset.animating = 'true';
      if (catalogOpen || next.view !== 'overview' || next.reducedMotion) driftTween?.pause();
      else driftTween?.resume();
      if (next.view !== 'overview' || next.reducedMotion) { gsap.killTweensOf(petalHover); petalHover.forEach(value => { value.value = 0; }); hovered = -1; }
      const index = next.active ? petalIds.indexOf(next.active) : 0;
      const angle = next.active && anchors[index]?.userData.selection_turn_degrees !== undefined
        ? THREE.MathUtils.degToRad(anchors[index].userData.selection_turn_degrees) : next.active ? -index * Math.PI * 2 / 5 : -.18;
      const nearestTurn = pose.turn + Math.atan2(Math.sin(angle - pose.turn), Math.cos(angle - pose.turn));
      const open = introduced || next.model !== 'pending' || next.active !== null;
      gsap.to(petalFocus, { value: (i: number) => next.active && i === index ? 1 : 0,
        duration: next.reducedMotion ? 0 : 0.55,
        ease: 'power3.inOut', overwrite: true, onUpdate: () => { dirty = true; } });
      gsap.to(pose, { bloom: open ? 1 : 0, turn: nearestTurn,
        emphasis: next.active ? 1 : 0, reading: next.view === 'case' ? 1 : 0,
        duration: next.reducedMotion ? 0 : !introduced && open && !next.active ? 1.1 : next.view === 'overview' ? .65 : .55, ease: 'power3.inOut', overwrite: true,
        onUpdate: () => { dirty = true; }, onComplete: () => {
          dirty = true;
          if (state?.model === 'ready') { introduced = true; try { sessionStorage.setItem('soft-lotus-intro-v2', '1'); } catch { /* Optional. */ } }
        } });
      if (catalogOpen) for (const tween of gsap.getTweensOf([pose, ...petalFocus, ...petalHover])) tween.pause();
      dirty = true;
      if (inspectionPose !== null) { gsap.killTweensOf(pose); pose.bloom = inspectionPose; pose.turn = -.18; pose.reading = 0; dirty = true; }
    },
    dispose() {
      disposed = true; abort.abort(); loadingManager.abort(); observer.disconnect();
      gsap.ticker.remove(beforeTick); gsap.ticker.remove(draw); gsap.killTweensOf(pose); gsap.killTweensOf(catalog); gsap.killTweensOf(petalFocus); gsap.killTweensOf(petalHover); driftTween?.kill(); decorationGeometry?.dispose();
      disposeObject(flower); disposeObject(ground); disposeObject(contact); contactMap.dispose(); key.shadow.dispose(); renderer?.dispose(); renderer?.forceContextLoss(); renderer?.domElement.remove();
    },
  };
}

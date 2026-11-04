import { useEffect, useLayoutEffect, useReducer, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { gsap } from 'gsap';
import { copy, dimensions, pageHref, projects, validLocale, type Locale } from '../content.ts';
import { sceneCopy } from './copy.ts';
import { caseLabels, caseNotes, projectLabels } from '../case-notes.ts';
import { softLotusAsset } from './asset.ts';
import { RevealText } from './RevealText.tsx';
import { useIntroReflow } from './useIntroReflow.ts';
import { createRuntime, type SceneRuntime, type LoadProgress } from './runtime.ts';
import { createSceneState, isFeatured, petalIds, routeFromURL, routeURL, sceneReducer, type FeaturedId, type PetalId, type SceneEvent, type SceneState } from './state.ts';

function preferredLocale(): Locale {
  try { const saved = validLocale(localStorage.getItem('seoshiro-portfolio-language-v1')); if (saved) return saved; } catch { /* Optional. */ }
  return validLocale(navigator.language.split('-')[0]) || 'ru';
}

function Reader({ state, onBack, onReturnFocus }: { state: SceneState; onBack: () => void; onReturnFocus: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const backRef = useRef(onBack); backRef.current = onBack;
  const focusRef = useRef(onReturnFocus); focusRef.current = onReturnFocus;
  const id = state.active as FeaturedId;
  const p = projects.find(p => p.id === id)!;
  const c = copy[state.locale], t = c.project[id], s = sceneCopy[state.locale];
  const open = state.view === 'case';
  const note = caseNotes[state.locale][id]!, words = caseLabels[state.locale];
  const [shared, setShared] = useState<'idle' | 'copied' | 'manual'>('idle');
  useEffect(() => setShared('idle'), [id, state.locale]);
  async function share() {
    try { await navigator.clipboard.writeText(new URL(pageHref(id, state.locale, false), location.href).href); setShared('copied'); }
    catch { setShared('manual'); }
  }
  function containTab(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]')].filter(el => el.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  useLayoutEffect(() => {
    const el = dialog.current!;
    const reduced = state.reducedMotion;
    gsap.killTweensOf(el);
    if (open) {
      const fresh = !el.open;
      if (el.open && !el.matches(':modal')) el.close();
      if (!el.open) el.showModal();
      el.inert = false; el.removeAttribute('aria-hidden');
      if (fresh) gsap.set(el, { opacity: reduced ? 0 : 1, xPercent: reduced ? 0 : 100, y: 0 });
      heading.current?.focus({ preventScroll: true });
      gsap.to(el, { opacity: 1, xPercent: 0, y: 0, duration: reduced ? .14 : .55, ease: 'power3.inOut' });
    } else if (el.open) {
      el.inert = true; el.setAttribute('aria-hidden', 'true');
      if (el.matches(':modal')) { el.close(); el.show(); }
      focusRef.current();
      gsap.to(el, { opacity: reduced ? 0 : 1, xPercent: reduced ? 0 : 100, y: 0, duration: reduced ? .14 : .55, ease: 'power3.inOut', onComplete: () => { el.close(); focusRef.current(); } });
    }
    return () => { gsap.killTweensOf(el); };
  }, [open, state.reducedMotion]);
  return <dialog ref={dialog} className="case-reader" aria-labelledby="reader-title" data-native-scroll onKeyDown={containTab} onCancel={event => { event.preventDefault(); backRef.current(); }}>
    <div className="reader-top"><button type="button" onClick={onBack}>← {s.return}</button><span>{p.name}</span></div>
    <article>
      <p className="eyebrow">{t.category}</p>
      <h2 id="reader-title" ref={heading} tabIndex={-1}>{p.name}</h2>
      <p className="reader-summary">{t.summary}</p>
      <div className="reader-links"><a className="primary-action" href={p.live} target="_blank" rel="noreferrer">{words.demo} ↗</a><a href={p.source} target="_blank" rel="noreferrer">{c.source} ↗</a><button type="button" onClick={share}>{shared === 'copied' ? words.copied : words.share}</button></div>
      {shared === 'manual' && <label className="share-manual">{words.copyFailed}<input readOnly value={new URL(pageHref(id, state.locale, false), location.href).href} onFocus={event => event.currentTarget.select()} /></label>}
      <figure><img src={`assets/${id}.webp`} width={dimensions[id].main[0]} height={dimensions[id].main[1]} alt={t.alt} /><figcaption>{t.caption}</figcaption></figure>
      <section><h3>{words.problem}</h3><p>{note.problem}</p></section>
      <section><p className="eyebrow">{c.role}</p><p>{note.role}</p><p className="reader-stack">{p.stack.join(' · ')}</p></section>
      <section><h3>{c.input}</h3><p>{t.input}</p><h3>{c.output}</h3><p>{t.output}</p></section>
      <section><h3>{words.choices}</h3><ol>{note.choices.map((decision, i) => <li key={i}>{decision}</li>)}</ol></section>
      <section><h3>{words.fix}</h3><p>{note.fix}</p><a href={p.evidence} target="_blank" rel="noreferrer">{c.evidence} ↗</a></section>
      <section><h3>{words.scenario}</h3><p>{note.scenario}</p><a className="primary-action" href={p.live} target="_blank" rel="noreferrer">{words.demo} ↗</a></section>
      <figure><img loading="lazy" src={`assets/${id}-detail.webp`} width={dimensions[id].detail[0]} height={dimensions[id].detail[1]} alt={t.detailAlt} /></figure>
      <section><h3>{c.boundaries}</h3><p>{t.limit}</p><a href={p.evidence} target="_blank" rel="noreferrer">{c.evidence} ↗</a></section>
      <button type="button" className="reader-return" onClick={onBack}>← {s.return}</button>
    </article>
  </dialog>;
}

export function App() {
  const [workOpen, setWorkOpen] = useState(false);
  const workDialog = useRef<HTMLDialogElement>(null);
  const workClose = useRef<HTMLButtonElement>(null);
  const workOpenRef = useRef(workOpen); workOpenRef.current = workOpen;
  const workReturn = useRef<HTMLElement | null>(null);
  const [loadProgress, setLoadProgress] = useState<LoadProgress>({ phase: 'transfer', loaded: 0, total: null });
  const [state, dispatch] = useReducer(sceneReducer, undefined, () => createSceneState(routeFromURL(new URL(location.href), preferredLocale()), matchMedia('(prefers-reduced-motion: reduce)').matches));
  const current = useRef(state); current.current = state;
  const host = useRef<HTMLDivElement>(null);
  useIntroReflow(host, state.locale);
  const labels = useRef<HTMLElement>(null);
  const runtime = useRef<SceneRuntime | null>(null);
  const preview = useRef<HTMLElement>(null);
  const previewMotion = useRef<gsap.core.Tween[]>([]);
  const lastPreview = useRef<PetalId | null>(state.active);
  if (state.active) lastPreview.current = state.active;
  const previewId = state.active || lastPreview.current;
  const petalOrigin = useRef<{ image: DOMRect; title: DOMRect } | null>(null);
  const navigation = useRef<(event: SceneEvent, replace?: boolean) => void>(() => {});
  const pendingFocus = useRef<string | null>(null);
  const c = copy[state.locale], s = sceneCopy[state.locale];
  const activeProject = isFeatured(state.active) ? projects.find(p => p.id === state.active)! : null;
  const previewProject = isFeatured(previewId) ? projects.find(p => p.id === previewId)! : null;
  const previewCopy = previewProject ? c.project[previewProject.id] : null;

  useEffect(() => {
    if (state.model !== 'ready') return;
    // Decode the three real product previews during the opening, without
    // delaying model readiness or fetching any case/detail image.
    for (const id of ['perch','selvedge','forme']) {
      const image = new Image(); image.decoding = 'async'; image.fetchPriority = 'low'; image.src = `assets/${id}.webp`;
      void image.decode().catch(() => { /* The visible image retains its thumbnail background. */ });
    }
  }, [state.model]);

  function navigate(event: SceneEvent, replace = false) {
    pendingFocus.current = null;
    setWorkOpen(false);
    const next = sceneReducer(current.current, event);
    const depth = Number(history.state?.softLotusDepth || 0);
    history[replace ? 'replaceState' : 'pushState']({ softLotus: true, softLotusDepth: replace ? depth : depth + 1 }, '', routeURL(new URL(location.href), next));
    current.current = next;
    dispatch(event);
  }
  navigation.current = navigate;
  function flushPendingFocus() {
    if (!pendingFocus.current || workOpenRef.current || document.querySelector('dialog:modal')) return;
    const element = document.getElementById(pendingFocus.current);
    if (!element || element.closest('[inert]') || getComputedStyle(element).visibility === 'hidden') return;
    element.focus({ preventScroll: true });
    if (document.activeElement === element) pendingFocus.current = null;
  }
  function restoreFocus() {
    const source = current.current.returnFocus;
    // A direct URL has a synthetic petal source, which can be absent in the
    // no-WebGL/mobile view. The semantic index is its reliable destination.
    pendingFocus.current = source && !source.startsWith('petal-') ? source : `index-${current.current.active || 'perch'}`;
    flushPendingFocus();
  }
  function back() {
    if (history.state?.softLotus && history.state.softLotusDepth > 0) history.back();
    else navigate({ type: 'back' }, true);
  }
  function focusNavigation(id: PetalId | null) {
    const petal = document.getElementById(`petal-${id}`);
    const visible = petal && petal.getClientRects().length > 0 && getComputedStyle(petal).visibility !== 'hidden';
    (visible ? petal : document.getElementById(`index-${id}`))?.focus({ preventScroll: true });
  }
  function rememberPetal(id: PetalId) {
    const button = document.getElementById(`petal-${id}`);
    const anchor = button?.getBoundingClientRect();
    if (!anchor || anchor.width === 0) { petalOrigin.current = null; return; }
    const image = button?.querySelector('img')?.getBoundingClientRect();
    petalOrigin.current = { image: image?.width ? image : new DOMRect(anchor.x, anchor.y, 68, 42), title: button?.querySelector('span')?.getBoundingClientRect() || anchor };
  }
  function select(event: MouseEvent<HTMLButtonElement>, id: PetalId) { rememberPetal(id); setWorkOpen(false); navigate({ type: 'select', id, source: event.currentTarget.id }); }

  function openWork(trigger: HTMLElement) {
    pendingFocus.current = null;
    workReturn.current = trigger;
    setWorkOpen(true);
  }
  function goHome(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
    event.preventDefault();
    if (current.current.view !== 'overview') navigate({ type: 'overview' });
  }
  function containWorkTab(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button,a[href]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  useLayoutEffect(() => {
    const dialog = workDialog.current!;
    const stage = host.current!.parentElement!;
    const reduced = state.reducedMotion;
    const header = dialog.querySelector('.work-browser-header');
    const rows = dialog.querySelectorAll('#work-list>a');
    delete stage.dataset.workSettled;
    runtime.current?.setCatalog(workOpen, reduced);
    const timeline = gsap.timeline();
    if (workOpen) {
      stage.dataset.catalogPhase = 'opening';
      const fresh = !dialog.open;
      if (dialog.open && !dialog.matches(':modal')) dialog.close();
      if (!dialog.open) dialog.showModal();
      dialog.inert = false; dialog.removeAttribute('aria-hidden');
      dialog.dataset.phase = 'opening';
      if (fresh) {
        gsap.set(dialog, { opacity: 0 });
        gsap.set([header, ...rows], { opacity: 0, y: reduced ? 0 : 12 });
      }
      workClose.current?.focus({ preventScroll: true });
      timeline.to(dialog, { opacity: 1, duration: reduced ? .14 : .48, ease: 'power2.inOut' }, 0)
        .to(header, { opacity: 1, y: 0, duration: reduced ? .07 : .28, ease: 'power2.out' }, reduced ? .07 : .16)
        .to(rows, { opacity: 1, y: 0, duration: reduced ? .07 : .26, stagger: reduced ? 0 : { amount: .12 }, ease: 'power2.out' }, reduced ? .07 : .22)
        .call(() => { if (workOpenRef.current) { dialog.dataset.phase = 'open'; stage.dataset.catalogPhase = 'open'; stage.dataset.workSettled = 'true'; } });
    } else if (dialog.open) {
      stage.dataset.catalogPhase = 'closing';
      // Release the native modal immediately, leaving a non-interactive visual
      // exit. A second click can reverse the current tween without a reset.
      dialog.inert = true; dialog.setAttribute('aria-hidden', 'true'); dialog.dataset.phase = 'closing';
      if (dialog.matches(':modal')) { dialog.close(); dialog.show(); }
      const target = workReturn.current;
      const available = target && !target.closest('[inert]') && target.getClientRects().length > 0;
      pendingFocus.current = available ? target.id : 'index-all';
      flushPendingFocus();
      timeline.to([header, ...rows], { opacity: 0, y: reduced ? 0 : 8, duration: reduced ? .07 : .16, ease: 'power2.in' }, 0)
        .to(dialog, { opacity: 0, duration: reduced ? .14 : .34, ease: 'power2.inOut' }, reduced ? 0 : .10)
        .call(() => {
          if (workOpenRef.current) return;
          const active = document.activeElement as HTMLElement | null;
          const keep = active && active !== document.body && !dialog.contains(active) ? active : null;
          dialog.close(); dialog.dataset.phase = 'closed'; stage.dataset.catalogPhase = 'closed';
          // Native close can restore its previous focus. Retain any newer user
          // choice, otherwise restore the now-visible invoking control.
          const destination = keep || (available ? target : document.getElementById('index-all'));
          if (destination && !destination.closest('[inert]')) {
            if (keep) { keep.focus({ preventScroll: true }); pendingFocus.current = null; }
            else { pendingFocus.current = destination.id; flushPendingFocus(); }
          }
        });
    }
    return () => { timeline.kill(); };
  }, [workOpen, state.reducedMotion]);

  useEffect(() => {
    history.replaceState({ softLotus: true, softLotusDepth: Number(history.state?.softLotusDepth || 0) }, '', routeURL(new URL(location.href), current.current));
    const controller = new AbortController();
    document.addEventListener('keydown', () => { document.documentElement.dataset.input = 'keyboard'; }, { signal: controller.signal });
    document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'pointer'; }, { signal: controller.signal });
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', event => dispatch({ type: 'motion', reduced: event.matches }), { signal: controller.signal });
    const restoreRoute = () => {
      pendingFocus.current = null;
      setWorkOpen(false);
      const route = routeFromURL(new URL(location.href), current.current.locale);
      history.replaceState(history.state, '', routeURL(new URL(location.href), route));
      current.current = sceneReducer(current.current, { type: 'route', route });
      dispatch({ type: 'route', route });
    };
    window.addEventListener('popstate', restoreRoute, { signal: controller.signal });
    window.addEventListener('hashchange', restoreRoute, { signal: controller.signal });
    window.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || workOpenRef.current || current.current.view !== 'selected') return;
      const source = current.current.active;
      navigation.current({ type: 'overview' });
      queueMicrotask(() => focusNavigation(source));
    }, { signal: controller.signal });
    const instance = createRuntime(host.current!, labels.current!, id => { rememberPetal(id); navigation.current({ type: 'select', id, source: `petal-${id}` }); }, ready => dispatch({ type: 'model', status: ready ? 'ready' : 'failed' }), setLoadProgress);
    runtime.current = instance; instance.update(current.current);
    return () => { controller.abort(); instance.dispose(); runtime.current = null; };
  }, []);

  useLayoutEffect(() => {
    runtime.current?.update(state);
    document.documentElement.lang = state.locale;
    document.title = `${c.name} — ${s.headline}`;
    document.body.dataset.view = state.view;
    document.body.dataset.petal = state.active || '';
    document.body.dataset.model = state.model;
    document.body.dataset.reducedMotion = String(state.reducedMotion);
    try { localStorage.setItem('seoshiro-portfolio-language-v1', state.locale); } catch { /* Optional. */ }
  }, [state, c.name, s.headline]);

  useLayoutEffect(() => {
    const stage = host.current!.parentElement!;
    const intro = stage.querySelector('.scene-introduction');
    const home = state.view === 'overview' && !workOpen;
    const selected = state.view === 'selected' && !workOpen;
    const reduced = state.reducedMotion;
    const labelView = state.view === 'overview' ? 'overview' : 'selected';
    stage.dataset.labelView ||= labelView;
    const changingLabels = stage.dataset.labelView !== labelView;
    const readerLeaving = stage.dataset.uiView === 'case' && state.view === 'selected';
    stage.dataset.uiView = state.view;
    if (changingLabels && home && innerWidth <= 700) gsap.set(labels.current, { '--labels-reveal': 0 });
    const timeline = gsap.timeline({ onUpdate: flushPendingFocus, onComplete: flushPendingFocus });
    const catalogLeaving = stage.dataset.catalogPhase === 'closing';
    const revealAt = catalogLeaving ? reduced ? .07 : .20 : home && previewId && !reduced ? .34 : 0;
    timeline.to(intro, { autoAlpha: home ? 1 : 0, y: reduced || home ? 0 : -8, duration: reduced ? home ? .14 : .07 : home ? .25 : .16, ease: 'power2.out' }, home ? revealAt : 0);
    if (changingLabels) timeline.to(labels.current, { '--labels-reveal': 0, duration: reduced ? 0 : .12 }, 0)
      .call(() => { stage.dataset.labelView = labelView; }, [], reduced ? 0 : .12);
    timeline.to(labels.current, { '--labels-reveal': workOpen || state.view === 'case' ? 0 : 1, duration: reduced ? workOpen ? .07 : .14 : workOpen ? .16 : .3 }, readerLeaving && !reduced ? .2 : catalogLeaving ? revealAt : changingLabels && !reduced ? home ? .3 : .13 : 0);
    const emphasis = JSON.parse(host.current?.dataset.pose || '[0,0,0,0]')[2] as number;
    const needsLift = selected && state.model === 'ready' && innerWidth <= 700 && !reduced && emphasis < .88;
    const previewAt = Math.max(selected && catalogLeaving ? revealAt : 0, needsLift ? .36 : 0, readerLeaving && !reduced ? .2 : 0);
    const previewDuration = reduced ? .14 : !selected ? .2 : innerWidth <= 700 ? .24 : .3;
    if (preview.current) timeline.to(preview.current, { autoAlpha: selected ? 1 : 0, y: reduced || selected ? 0 : 8, duration: previewDuration, ease: 'power2.out' }, previewAt);
    return () => { timeline.kill(); };
  }, [state.view, state.active, state.model, state.reducedMotion, workOpen, previewId]);

  useLayoutEffect(() => {
    if (!preview.current) return;
    const reduced = state.reducedMotion || document.documentElement.dataset.input === 'keyboard';
    const interrupted = previewMotion.current.some(tween => tween.isActive());
    previewMotion.current.forEach(tween => tween.kill());
    previewMotion.current = [];
    const panel = preview.current;
    panel.dataset.transitioning = 'true';
    for (const selector of ['.preview-product', '.preview-title'] as const) {
      const element = panel.querySelector<HTMLElement>(selector);
      if (!element) continue;
      const origin = selector === '.preview-product' ? petalOrigin.current?.image : petalOrigin.current?.title;
      if (!reduced && origin && !interrupted && state.model === 'ready') {
        const rect = element.getBoundingClientRect();
        const x = rect.x - Number(gsap.getProperty(element, 'x'));
        const y = rect.y - Number(gsap.getProperty(element, 'y'));
        // A single scale preserves the product's aspect ratio. Its thumbnail may
        // have a different crop; it must never stretch the image or its title.
        const scale = Math.min(origin.width / element.offsetWidth, origin.height / element.offsetHeight);
        gsap.set(element, { x: origin.x + (origin.width - element.offsetWidth * scale) / 2 - x, y: origin.y + (origin.height - element.offsetHeight * scale) / 2 - y, scale, opacity: .55 });
      }
      previewMotion.current.push(gsap.to(element, { x: 0, y: 0, scale: 1, opacity: 1, duration: reduced ? 0 : .65, ease: 'power3.inOut', clearProps: 'transform,opacity', onComplete: () => { delete panel.dataset.transitioning; } }));
    }
    petalOrigin.current = null;
    // Opening the HTML reader does not kill the in-flight image tween. A rapid
    // return therefore finds either its current pose or the completed image.
  }, [state.active, state.reducedMotion, state.model, previewId]);
  useLayoutEffect(() => () => { previewMotion.current.forEach(tween => tween.kill()); }, []);

  const petalName = (id: PetalId) => isFeatured(id) ? id.toUpperCase() : s[id];
  const percent = loadProgress.phase === 'transfer' && loadProgress.total ? Math.min(99, Math.floor(loadProgress.loaded / loadProgress.total * 100)) : undefined;
  const loadLabel = loadProgress.phase === 'prepare' ? s.prepare : s.transfer;
  return <>
    <a className="soft-skip" href="#scene-index">{s.skip}</a>
    <header className="soft-header" inert={state.view === 'case'}><a href={`?lang=${state.locale}`} className="signature" onClick={goHome}>BEIBARS</a><div className="soft-languages" role="group" aria-label={c.language}>{(['ru', 'en', 'kk'] as Locale[]).map(locale => <button key={locale} type="button" lang={locale} aria-pressed={locale === state.locale} onClick={() => navigate({ type: 'locale', locale }, true)}>{locale.toUpperCase()}</button>)}</div></header>
    <main id="main">
    {softLotusAsset.state !== 'accepted' && <p className="prototype-note">{state.locale === 'ru' ? 'Предпросмотр · проверка Tripo-модели' : state.locale === 'kk' ? 'Алдын ала көрініс · Tripo моделін тексеру' : 'Preview · Tripo model under review'}</p>}
      <div className="soft-stage" data-view={state.view} data-work-open={workOpen} aria-busy={state.model === 'pending'} inert={state.view === 'case'}>
        <div className="lotus-atmosphere" aria-hidden="true" />
        <div className="botanical-shadow" aria-hidden="true" />
        <div ref={host} className="soft-canvas" />
        <p className="reading-lotus-caption" aria-hidden="true">{previewId ? petalName(previewId) : ''}</p>
        <div className="paper-grain" aria-hidden="true" />
        {state.model !== 'ready' && <picture className="scene-poster" aria-hidden="true"><source media="(max-width:700px)" srcSet={`models/soft-lotus-${state.model === 'failed' ? (state.view === 'selected' ? 'selected' : 'open') : 'bud'}-mobile.png`} /><img src={`models/soft-lotus-${state.model === 'failed' ? (state.view === 'selected' ? 'selected' : 'open') : 'bud'}-desktop.png`} alt="" /></picture>}
        <div className="scene-introduction" inert={state.view !== 'overview' || workOpen}><p className="eyebrow">{c.eyebrow}</p><RevealText text={s.headline} reduced={state.reducedMotion} /><p className="hero-offer">{s.intro}</p><div className="hero-actions"><button id="hero-work" type="button" aria-expanded={workOpen} aria-controls="work-browser" aria-haspopup="dialog" onClick={event => openWork(event.currentTarget)}>{s.work} ↓</button><button type="button" onClick={() => navigate({ type: 'select', id: 'contact' })}>{s.discuss} ↗</button></div><p className="scene-hint">{state.model === 'failed' ? s.fallbackHint : s.hint}</p></div>
        <nav ref={labels} className="petal-labels" aria-label={s.scene}>{petalIds.map(id => <div key={id} data-anchor={id}><button id={`petal-${id}`} type="button" aria-pressed={state.active === id} onClick={event => select(event, id)}>{isFeatured(id) && <img src={`assets/${id}-petal.webp`} alt="" width="320" height={Math.round(320 * dimensions[id].main[1] / dimensions[id].main[0])} />}<span>{petalName(id)} <span aria-hidden="true">↗</span></span></button></div>)}</nav>
        {previewId && <aside ref={preview} className="petal-preview" aria-labelledby="preview-title" inert={state.view !== 'selected' || workOpen} aria-hidden={state.view !== 'selected' || workOpen}><button type="button" className="preview-close" aria-label={s.close} onClick={() => { const id = state.active; navigate({ type: 'overview' }); queueMicrotask(() => focusNavigation(id)); }}>{s.close}</button>
          <p className="eyebrow">{s.preview}</p><RevealText id="preview-title" tag="h2" text={petalName(previewId)} reduced={state.reducedMotion} className="preview-title" />
          {previewProject && previewCopy ? <><p className="preview-subtitle">{s[previewProject.id as FeaturedId]}</p><img className="preview-product" style={{backgroundImage:`url(assets/${previewProject.id}-petal.webp)`,backgroundSize:"contain",backgroundRepeat:"no-repeat",backgroundPosition:"center"}} src={`assets/${previewProject.id}.webp`} width={dimensions[previewProject.id].main[0]} height={dimensions[previewProject.id].main[1]} alt={previewCopy.alt} /><p>{previewCopy.summary}</p><div className="preview-actions"><button id={`preview-case-${previewProject.id}`} type="button" onClick={() => navigate({ type: 'read', id: previewProject.id as FeaturedId, source: `preview-case-${previewProject.id}` })}>{s.read} →</button><a className="primary-action" href={previewProject.live} target="_blank" rel="noreferrer">{s.demo} ↗</a></div></> : previewId === 'about' ? <><p>{s.aboutWork}</p></> : <><p>{s.contactText}</p><div className="contact-actions"><a className="primary-action" href="https://t.me/tserriednichs" target="_blank" rel="noreferrer">{s.discuss} · Telegram ↗</a><a href="mailto:beibars.ileskhan2405@gmail.com">beibars.ileskhan2405@gmail.com</a><a href="https://github.com/seoshiro" target="_blank" rel="noreferrer">GitHub ↗</a></div></>}
        </aside>}
        {state.model === 'pending' && <div className="ink-loading" data-phase={loadProgress.phase}>
          <svg viewBox="0 0 260 30" aria-hidden="true">
            <defs>
              <filter id="ink-fray" x="-5%" y="-30%" width="110%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".07 .65" numOctaves="2" seed="9" result="fibres"/><feDisplacementMap in="SourceGraphic" in2="fibres" scale="2.1" xChannelSelector="R" yChannelSelector="G"/></filter>
              <filter id="ink-bleed"><feGaussianBlur stdDeviation=".65"/></filter>
              <clipPath id="ink-reveal"><rect className="ink-reveal" width={percent === undefined ? 260 : percent * 2.6} height="30"/></clipPath>
              <linearGradient id="ink-density"><stop stopColor="#414537" stopOpacity=".48"/><stop offset=".6" stopColor="#30362b" stopOpacity=".76"/><stop offset="1" stopColor="#1d251d"/></linearGradient>
              <path id="ink-stroke" d="M3 13Q12 8 24 11L48 9 69 11 85 8 104 9 126 7 143 10 162 8 179 10 202 8 225 10 247 9 258 12 256 18 240 19 222 17 203 20 185 18 164 20 145 18 124 20 106 18 85 20 66 18 44 20 23 18 5 19Z"/>
            </defs>
            <path className="ink-track" d="M4 15H256"/>
            <g clipPath="url(#ink-reveal)">
              <use href="#ink-stroke" fill="#525641" opacity=".22" filter="url(#ink-bleed)" className="ink-absorption"/>
              <g filter="url(#ink-fray)"><use href="#ink-stroke" className="ink-fill"/><ellipse cx={percent === undefined ? 249 : Math.max(5,percent * 2.6-5)} cy="14" rx="7" ry="4.4" fill="#20281e" opacity=".6"/></g>
              <path className="ink-fibres" d="M4 12L79 13 116 11 179 13 248 12M6 17L60 16 113 17 168 15 239 17"/>
            </g>
          </svg>
          <p role="status">{loadLabel}{percent !== undefined ? ` · ${percent}%` : ''}</p><progress className="scene-loading" aria-label={loadLabel} max={100} value={percent} />
        </div>}
        <div className="scene-bottom"><div><p role="status">{state.model === 'failed' ? s.fallback : state.model === 'ready' ? s.ready : ''}</p></div><button type="button" aria-pressed={state.reducedMotion} onClick={() => dispatch({ type: 'motion', reduced: !state.reducedMotion })}>{s.motion}</button></div>
      </div>
      <nav id="scene-index" className="scene-index" inert={state.view === 'case'} aria-label={`${s.scene} - ${s.all}`}><span id="work" />{petalIds.map((id, index) => <button id={`index-${id}`} type="button" key={id} aria-pressed={state.active === id} onClick={event => select(event, id)}><span>0{index + 1}</span> {petalName(id)}</button>)}<button id="index-all" type="button" aria-haspopup="dialog" aria-expanded={workOpen} aria-controls="work-browser" onClick={event => openWork(event.currentTarget)}>{s.all}</button></nav>
      <dialog ref={workDialog} id="work-browser" className="work-browser" aria-labelledby="work-browser-title" data-native-scroll onKeyDown={containWorkTab} onCancel={event => { event.preventDefault(); event.stopPropagation(); setWorkOpen(false); }} onClose={event => { if (!event.currentTarget.open && !workOpenRef.current) setWorkOpen(false); }}>
        <div className="work-browser-shell">
          <header className="work-browser-header"><h2 id="work-browser-title">{s.all}</h2><button ref={workClose} type="button" className="work-browser-close" onClick={() => setWorkOpen(false)}>{s.closeWork} <span aria-hidden="true">×</span></button></header>
          <div id="work-list">{projects.map(p => <a key={p.id} href={pageHref(p.id, state.locale, false)}><img src={`assets/${p.id}.webp`} alt="" loading="lazy" width={dimensions[p.id].main[0]} height={dimensions[p.id].main[1]} /><span><strong>{p.name} <span aria-hidden="true">↗</span></strong><small>{projectLabels[state.locale][p.id]}</small></span></a>)}</div>
        </div>
      </dialog>
      {activeProject && <Reader state={state} onBack={back} onReturnFocus={restoreFocus} />}
    </main>
  </>;
}

import { useEffect, useLayoutEffect, useReducer, useRef, type KeyboardEvent, type MouseEvent } from 'react';
import { gsap } from 'gsap';
import { copy, dimensions, pageHref, projects, validLocale, type Locale } from '../content.ts';
import { sceneCopy } from './copy.ts';
import { softLotusAsset } from './asset.ts';
import { RevealText } from './RevealText.tsx';
import { createRuntime, type SceneRuntime } from './runtime.ts';
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
  function containTab(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex="0"]')].filter(el => el.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }
  useLayoutEffect(() => {
    const el = dialog.current!;
    gsap.killTweensOf(el);
    if (open) {
      if (!el.open) el.showModal();
      heading.current?.focus({ preventScroll: true });
      gsap.fromTo(el, { opacity: 0, y: state.reducedMotion ? 0 : 24 }, { opacity: 1, y: 0, duration: state.reducedMotion ? 0 : 0.28, ease: 'power2.out' });
    } else if (el.open) {
      gsap.to(el, { opacity: 0, y: state.reducedMotion ? 0 : 18, duration: state.reducedMotion ? 0 : 0.22, ease: 'power2.in', onComplete: () => { el.close(); focusRef.current(); } });
    }
    return () => { gsap.killTweensOf(el); };
  }, [open, state.reducedMotion]);
  return <dialog ref={dialog} className="case-reader" aria-labelledby="reader-title" data-native-scroll onKeyDown={containTab} onCancel={event => { event.preventDefault(); backRef.current(); }}>
    <div className="reader-top"><button type="button" onClick={onBack}>← {s.return}</button><span>{p.name}</span></div>
    <article>
      <p className="eyebrow">{t.category}</p>
      <h2 id="reader-title" ref={heading} tabIndex={-1}>{p.name}</h2>
      <p className="reader-summary">{t.summary}</p>
      <div className="reader-links"><a href={p.live} target="_blank" rel="noreferrer">{c.live} ↗</a><a href={p.source} target="_blank" rel="noreferrer">{c.source} ↗</a><a href={pageHref(id, state.locale, false)}>{s.direct} ↗</a></div>
      <figure><img src={`assets/${id}.webp`} width={dimensions[id].main[0]} height={dimensions[id].main[1]} alt={t.alt} /><figcaption>{t.caption}</figcaption></figure>
      <section><p className="eyebrow">{c.role}</p><p>{c.roleText}</p><p className="reader-stack">{p.stack.join(' · ')}</p></section>
      <section><h3>{c.input}</h3><p>{t.input}</p><h3>{c.output}</h3><p>{t.output}</p></section>
      <section><h3>{c.engineering}</h3><ol>{t.decisions.map((decision, i) => <li key={i}>{decision}</li>)}</ol></section>
      <figure><img loading="lazy" src={`assets/${id}-detail.webp`} width={dimensions[id].detail[0]} height={dimensions[id].detail[1]} alt={t.detailAlt} /></figure>
      <section><h3>{c.boundaries}</h3><p>{t.limit}</p><a href={p.evidence} target="_blank" rel="noreferrer">{c.evidence} ↗</a></section>
      <button type="button" className="reader-return" onClick={onBack}>← {s.return}</button>
    </article>
  </dialog>;
}

export function App() {
  const [state, dispatch] = useReducer(sceneReducer, undefined, () => createSceneState(routeFromURL(new URL(location.href), preferredLocale()), matchMedia('(prefers-reduced-motion: reduce)').matches));
  const current = useRef(state); current.current = state;
  const host = useRef<HTMLDivElement>(null);
  const labels = useRef<HTMLElement>(null);
  const runtime = useRef<SceneRuntime | null>(null);
  const preview = useRef<HTMLElement>(null);
  const navigation = useRef<(event: SceneEvent, replace?: boolean) => void>(() => {});
  const c = copy[state.locale], s = sceneCopy[state.locale];
  const activeProject = isFeatured(state.active) ? projects.find(p => p.id === state.active)! : null;
  const activeCopy = activeProject ? c.project[activeProject.id] : null;

  function navigate(event: SceneEvent, replace = false) {
    const next = sceneReducer(current.current, event);
    const depth = Number(history.state?.softLotusDepth || 0);
    history[replace ? 'replaceState' : 'pushState']({ softLotus: true, softLotusDepth: replace ? depth : depth + 1 }, '', routeURL(new URL(location.href), next));
    dispatch(event);
  }
  navigation.current = navigate;
  function restoreFocus() {
    const target = current.current.returnFocus;
    const element = target ? document.getElementById(target) : null;
    const visible = element && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
    // Direct URLs have no invoking control. The semantic index is available
    // even while projected labels are hidden or waiting for the next draw.
    (visible ? element : document.getElementById(`index-${current.current.active || 'perch'}`))?.focus({ preventScroll: true });
  }
  function back() {
    if (history.state?.softLotus && history.state.softLotusDepth > 0) history.back();
    else navigate({ type: 'back' }, true);
  }
  function select(event: MouseEvent<HTMLButtonElement>, id: PetalId) { navigate({ type: 'select', id, source: event.currentTarget.id }); }

  useEffect(() => {
    history.replaceState({ softLotus: true, softLotusDepth: Number(history.state?.softLotusDepth || 0) }, '', routeURL(new URL(location.href), current.current));
    const controller = new AbortController();
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', event => dispatch({ type: 'motion', reduced: event.matches }), { signal: controller.signal });
    window.addEventListener('popstate', () => dispatch({ type: 'route', route: routeFromURL(new URL(location.href), current.current.locale) }), { signal: controller.signal });
    window.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || current.current.view !== 'selected') return;
      const source = current.current.active;
      navigation.current({ type: 'overview' });
      queueMicrotask(() => document.getElementById(`petal-${source}`)?.focus({ preventScroll: true }));
    }, { signal: controller.signal });
    const instance = createRuntime(host.current!, labels.current!, id => navigation.current({ type: 'select', id, source: `petal-${id}` }), ready => dispatch({ type: 'model', status: ready ? 'ready' : 'failed' }));
    runtime.current = instance; instance.update(current.current);
    return () => { controller.abort(); instance.dispose(); runtime.current = null; };
  }, []);

  useLayoutEffect(() => {
    runtime.current?.update(state);
    document.documentElement.lang = state.locale;
    document.title = `Lotus V2 preview — ${c.name}`;
    document.body.dataset.view = state.view;
    document.body.dataset.petal = state.active || '';
    document.body.dataset.model = state.model;
    try { localStorage.setItem('seoshiro-portfolio-language-v1', state.locale); } catch { /* Optional. */ }
  }, [state, c.name]);

  useLayoutEffect(() => {
    if (!preview.current || state.view !== 'selected') return;
    const tween = gsap.fromTo(preview.current, { opacity: 0, y: state.reducedMotion ? 0 : 14 }, { opacity: 1, y: 0, duration: state.reducedMotion ? 0 : 0.28, ease: 'power2.out' });
    return () => { tween.kill(); };
  }, [state.active, state.view, state.reducedMotion]);

  const petalName = (id: PetalId) => isFeatured(id) ? id.toUpperCase() : s[id];
  return <>
    <a className="soft-skip" href="#scene-index">{s.skip}</a>
    <header className="soft-header"><a href="soft-lotus.html" className="signature">BEIBARS</a><div className="soft-languages" role="group" aria-label={c.language}>{(['ru', 'en', 'kk'] as Locale[]).map(locale => <button key={locale} type="button" lang={locale} aria-pressed={locale === state.locale} onClick={() => navigate({ type: 'locale', locale }, true)}>{locale.toUpperCase()}</button>)}</div></header>
    {softLotusAsset.state !== 'accepted' && <p className="prototype-note">{s.prototype}</p>}
    <main id="soft-main">
      <div className="soft-stage" data-view={state.view}>
        <div ref={host} className="soft-canvas" />
        <div className="scene-introduction" aria-hidden={state.view !== 'overview'}><p className="eyebrow">{c.eyebrow}</p><RevealText text={s.headline} reduced={state.reducedMotion} /><p>{s.hint}</p></div>
        <nav ref={labels} className="petal-labels" aria-label={s.scene}>{petalIds.map(id => <div key={id} data-anchor={id}><button id={`petal-${id}`} type="button" aria-pressed={state.active === id} onClick={event => select(event, id)}>{isFeatured(id) && <img src={`assets/${id}.webp`} alt="" width="144" height="88" />}<span>{petalName(id)} <span aria-hidden="true">↗</span></span></button></div>)}</nav>
        {state.view === 'selected' && state.active && <aside ref={preview} className="petal-preview" aria-labelledby="preview-title"><button type="button" className="preview-close" aria-label={s.close} onClick={() => { const id = state.active; navigate({ type: 'overview' }); queueMicrotask(() => document.getElementById(`petal-${id}`)?.focus({ preventScroll: true })); }}>×</button>
          <p className="eyebrow">{s.preview}</p><RevealText id="preview-title" tag="h2" text={petalName(state.active)} reduced={state.reducedMotion} className="preview-title" />
          {activeProject && activeCopy ? <><img src={`assets/${activeProject.id}.webp`} alt={activeCopy.alt} width={dimensions[activeProject.id].main[0]} height={dimensions[activeProject.id].main[1]} /><p>{activeCopy.summary}</p><div className="preview-actions"><button id={`preview-case-${activeProject.id}`} type="button" onClick={() => navigate({ type: 'read', id: activeProject.id as FeaturedId, source: `preview-case-${activeProject.id}` })}>{s.read} →</button><a href={activeProject.live} target="_blank" rel="noreferrer">{c.live} ↗</a></div></> : state.active === 'about' ? <><p>{c.aboutText}</p><p>{c.roleText}</p></> : <><p>{s.contactText}</p><a href="https://github.com/seoshiro" target="_blank" rel="noreferrer">GitHub ↗</a></>}
        </aside>}
        <div className="scene-bottom"><div><p role="status">{state.model === 'pending' ? s.loading : state.model === 'failed' ? s.fallback : s.ready}</p>{state.model === 'pending' && <progress className="scene-loading" aria-label={s.loading} />}</div><button type="button" aria-pressed={state.reducedMotion} onClick={() => dispatch({ type: 'motion', reduced: !state.reducedMotion })}>{s.motion}</button></div>
      </div>
      <nav id="scene-index" className="scene-index" aria-label={s.scene}>{petalIds.map((id, index) => <button id={`index-${id}`} type="button" key={id} aria-pressed={state.active === id} onClick={event => select(event, id)}><span>0{index + 1}</span> {petalName(id)}</button>)}<details><summary>{s.all}</summary><div>{projects.map(p => <a key={p.id} href={pageHref(p.id, state.locale, false)}>{p.name} ↗</a>)}</div></details></nav>
      <div className="scene-scroll-space" aria-hidden="true" />
      {activeProject && <Reader state={state} onBack={back} onReturnFocus={restoreFocus} />}
    </main>
  </>;
}

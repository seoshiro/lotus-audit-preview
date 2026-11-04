import { useEffect, useLayoutEffect, useReducer, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { gsap } from 'gsap';
import { copy, dimensions, pageHref, projects, validLocale, type Locale } from '../content.ts';
import { sceneCopy } from './copy.ts';
import { caseLabels, caseNotes, projectLabels } from '../case-notes.ts';
import { softLotusAsset } from './asset.ts';
import { RevealText } from './RevealText.tsx';
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
    const reduced = state.reducedMotion || document.documentElement.dataset.input === 'keyboard';
    gsap.killTweensOf(el);
    if (open) {
      if (!el.open) { el.showModal(); gsap.set(el, { opacity: 0, y: reduced ? 0 : 24 }); }
      heading.current?.focus({ preventScroll: true });
      gsap.to(el, { opacity: 1, y: 0, duration: reduced ? 0 : 0.28, ease: 'power3.out' });
    } else if (el.open) {
      gsap.to(el, { opacity: 0, y: reduced ? 0 : 18, duration: reduced ? 0 : 0.2, ease: 'power3.out', onComplete: () => { el.close(); focusRef.current(); } });
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
  const workSummary = useRef<HTMLElement>(null);
  const workReturn = useRef<HTMLElement | null>(null);
  const [loadProgress, setLoadProgress] = useState<LoadProgress>({ phase: 'transfer', loaded: 0, total: null });
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
    current.current = next;
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
  function focusNavigation(id: PetalId | null) {
    const petal = document.getElementById(`petal-${id}`);
    const visible = petal && petal.getClientRects().length > 0 && getComputedStyle(petal).visibility !== 'hidden';
    (visible ? petal : document.getElementById(`index-${id}`))?.focus({ preventScroll: true });
  }
  function select(event: MouseEvent<HTMLButtonElement>, id: PetalId) { setWorkOpen(false); navigate({ type: 'select', id, source: event.currentTarget.id }); }

  useEffect(() => {
    history.replaceState({ softLotus: true, softLotusDepth: Number(history.state?.softLotusDepth || 0) }, '', routeURL(new URL(location.href), current.current));
    const controller = new AbortController();
    document.addEventListener('keydown', () => { document.documentElement.dataset.input = 'keyboard'; }, { signal: controller.signal });
    document.addEventListener('pointerdown', () => { document.documentElement.dataset.input = 'pointer'; }, { signal: controller.signal });
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    media.addEventListener('change', event => dispatch({ type: 'motion', reduced: event.matches }), { signal: controller.signal });
    const restoreRoute = () => {
      const route = routeFromURL(new URL(location.href), current.current.locale);
      history.replaceState(history.state, '', routeURL(new URL(location.href), route));
      current.current = sceneReducer(current.current, { type: 'route', route });
      dispatch({ type: 'route', route });
    };
    window.addEventListener('popstate', restoreRoute, { signal: controller.signal });
    window.addEventListener('hashchange', restoreRoute, { signal: controller.signal });
    window.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || current.current.view !== 'selected') return;
      const source = current.current.active;
      navigation.current({ type: 'overview' });
      queueMicrotask(() => focusNavigation(source));
    }, { signal: controller.signal });
    const instance = createRuntime(host.current!, labels.current!, id => navigation.current({ type: 'select', id, source: `petal-${id}` }), ready => dispatch({ type: 'model', status: ready ? 'ready' : 'failed' }), setLoadProgress);
    runtime.current = instance; instance.update(current.current);
    return () => { controller.abort(); instance.dispose(); runtime.current = null; };
  }, []);

  useLayoutEffect(() => {
    if (state.view !== 'overview') setWorkOpen(false);
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
    if (!preview.current || state.view !== 'selected') return;
    const tween = gsap.fromTo(preview.current, { opacity: 0, y: state.reducedMotion ? 0 : 14 }, { opacity: 1, y: 0, duration: state.reducedMotion ? 0 : 0.28, ease: 'power2.out' });
    return () => { tween.kill(); };
  }, [state.active, state.view, state.reducedMotion]);

  const petalName = (id: PetalId) => isFeatured(id) ? id.toUpperCase() : s[id];
  const percent = loadProgress.phase === 'transfer' && loadProgress.total ? Math.min(99, Math.floor(loadProgress.loaded / loadProgress.total * 100)) : undefined;
  const loadLabel = loadProgress.phase === 'prepare' ? s.prepare : s.transfer;
  return <>
    <a className="soft-skip" href="#scene-index">{s.skip}</a>
    <header className="soft-header"><a href={`?lang=${state.locale}`} className="signature">BEIBARS</a><div className="soft-languages" role="group" aria-label={c.language}>{(['ru', 'en', 'kk'] as Locale[]).map(locale => <button key={locale} type="button" lang={locale} aria-pressed={locale === state.locale} onClick={() => navigate({ type: 'locale', locale }, true)}>{locale.toUpperCase()}</button>)}</div></header>
    <main id="main">
    {softLotusAsset.state !== 'accepted' && <p className="prototype-note">{state.locale === 'ru' ? 'Предпросмотр · проверка Tripo-модели' : state.locale === 'kk' ? 'Алдын ала көрініс · Tripo моделін тексеру' : 'Preview · Tripo model under review'}</p>}
      <div className="soft-stage" data-view={state.view} aria-busy={state.model === 'pending'}>
        <div ref={host} className="soft-canvas" />
        <div className="paper-grain" aria-hidden="true" />
        {state.model === 'ready' && !state.reducedMotion && state.view === 'overview' && <div className="petal-drift" aria-hidden="true"><i /><i /><i /></div>}
        {state.model !== 'ready' && <picture className="scene-poster" aria-hidden="true"><source media="(max-width:700px)" srcSet={`models/soft-lotus-${state.model === 'failed' ? 'open' : 'bud'}-mobile.png`} /><img src={`models/soft-lotus-${state.model === 'failed' ? 'open' : 'bud'}-desktop.png`} alt="" /></picture>}
        <div className="scene-introduction" inert={state.view !== 'overview'}><p className="eyebrow">{c.eyebrow}</p><RevealText text={s.headline} reduced={state.reducedMotion} /><p className="hero-offer">{s.intro}</p><div className="hero-actions"><button id="hero-work" type="button" aria-expanded={workOpen} aria-controls="work-list" onClick={event => { workReturn.current = event.currentTarget; setWorkOpen(true); workSummary.current?.focus({ preventScroll: true }); }}>{s.work} ↓</button><button type="button" onClick={() => navigate({ type: 'select', id: 'contact' })}>{s.discuss} ↗</button></div><p className="scene-hint">{state.model === 'failed' ? s.fallbackHint : s.hint}</p></div>
        <nav ref={labels} className="petal-labels" aria-label={s.scene}>{petalIds.map(id => <div key={id} data-anchor={id}><button id={`petal-${id}`} type="button" aria-pressed={state.active === id} onClick={event => select(event, id)}>{isFeatured(id) && <img src={`assets/${id}-petal.webp`} alt="" width="320" height={Math.round(320 * dimensions[id].main[1] / dimensions[id].main[0])} />}<span>{petalName(id)} <span aria-hidden="true">↗</span></span></button></div>)}</nav>
        {state.view === 'selected' && state.active && <aside ref={preview} className="petal-preview" aria-labelledby="preview-title"><button type="button" className="preview-close" aria-label={s.close} onClick={() => { const id = state.active; navigate({ type: 'overview' }); queueMicrotask(() => focusNavigation(id)); }}>{s.close}</button>
          <p className="eyebrow">{s.preview}</p><RevealText id="preview-title" tag="h2" text={petalName(state.active)} reduced={state.reducedMotion} className="preview-title" />
          {activeProject && activeCopy ? <><p className="preview-subtitle">{s[activeProject.id as FeaturedId]}</p><img className="preview-product" src={`assets/${activeProject.id}.webp`} width={dimensions[activeProject.id].main[0]} height={dimensions[activeProject.id].main[1]} alt={activeCopy.alt} /><p>{activeCopy.summary}</p><div className="preview-actions"><button id={`preview-case-${activeProject.id}`} type="button" onClick={() => navigate({ type: 'read', id: activeProject.id as FeaturedId, source: `preview-case-${activeProject.id}` })}>{s.read} →</button><a className="primary-action" href={activeProject.live} target="_blank" rel="noreferrer">{s.demo} ↗</a></div></> : state.active === 'about' ? <><p>{s.aboutWork}</p></> : <><p>{s.contactText}</p><div className="contact-actions"><a className="primary-action" href="https://t.me/tserriednichs" target="_blank" rel="noreferrer">{s.discuss} · Telegram ↗</a><a href="mailto:beibars.ileskhan2405@gmail.com">beibars.ileskhan2405@gmail.com</a><a href="https://github.com/seoshiro" target="_blank" rel="noreferrer">GitHub ↗</a></div></>}
        </aside>}
        {state.model === 'pending' && <div className="ink-loading" data-phase={loadProgress.phase}>
          <svg viewBox="0 0 240 20" aria-hidden="true"><defs><clipPath id="ink-edge"><path d="M1 9Q9 6 19 8T41 7Q53 5 69 7T98 6Q114 4 131 7T158 6Q171 5 185 7T218 7L239 9 236 13Q224 12 211 14T185 13Q172 15 156 13T127 14Q112 15 97 13T71 14Q57 15 42 13T17 13L3 12Z"/></clipPath><linearGradient id="ink-density"><stop stopColor="#353a32" stopOpacity=".45"/><stop offset=".82" stopColor="#353a32" stopOpacity=".8"/><stop offset="1" stopColor="#242a23"/></linearGradient></defs><path className="ink-track" d="M3 10H237"/><g clipPath="url(#ink-edge)"><rect className="ink-fill" width={percent === undefined ? 240 : percent * 2.4} height="20"/><path className="ink-fibres" d="M0 8h240M0 12h240M0 15h240"/></g></svg>
          <p role="status">{loadLabel}{percent !== undefined ? ` · ${percent}%` : ''}</p><progress className="scene-loading" aria-label={loadLabel} max={100} value={percent} />
        </div>}
        <div className="scene-bottom"><div><p role="status">{state.model === 'failed' ? s.fallback : state.model === 'ready' ? s.ready : ''}</p></div><button type="button" aria-pressed={state.reducedMotion} onClick={() => dispatch({ type: 'motion', reduced: !state.reducedMotion })}>{s.motion}</button></div>
      </div>
      <nav id="scene-index" className="scene-index" aria-label={`${s.scene} — ${s.all}`}><span id="work" />{petalIds.map((id, index) => <button id={`index-${id}`} type="button" key={id} aria-pressed={state.active === id} onClick={event => select(event, id)}><span>0{index + 1}</span> {petalName(id)}</button>)}<details open={workOpen} onToggle={event => setWorkOpen(event.currentTarget.open)} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setWorkOpen(false); (workReturn.current || workSummary.current)?.focus({ preventScroll: true }); } }}><summary ref={workSummary} onClick={() => { workReturn.current = workSummary.current; }}>{s.all}</summary><div id="work-list">{projects.map(p => <a key={p.id} href={pageHref(p.id, state.locale, false)}><strong>{p.name} ↗</strong><small>{projectLabels[state.locale][p.id]}</small></a>)}</div></details></nav>
      {activeProject && <Reader state={state} onBack={back} onReturnFocus={restoreFocus} />}
    </main>
  </>;
}

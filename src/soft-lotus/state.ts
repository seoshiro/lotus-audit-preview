import { validLocale, type Locale } from '../content.ts';

export const petalIds = ['perch', 'selvedge', 'forme', 'about', 'contact'] as const;
export type PetalId = typeof petalIds[number];
export type FeaturedId = Extract<PetalId, 'perch' | 'selvedge' | 'forme'>;
export type View = 'overview' | 'selected' | 'case';
export type ResourceState = 'pending' | 'ready' | 'failed';

export interface SceneState {
  locale: Locale;
  view: View;
  active: PetalId | null;
  model: ResourceState;
  reducedMotion: boolean;
  revision: number;
  returnFocus: string | null;
}

export type SceneEvent =
  | { type: 'select'; id: PetalId; source?: string }
  | { type: 'read'; id: FeaturedId; source?: string }
  | { type: 'back' }
  | { type: 'overview' }
  | { type: 'locale'; locale: Locale }
  | { type: 'model'; status: ResourceState }
  | { type: 'motion'; reduced: boolean }
  | { type: 'route'; route: SceneRoute };

export interface SceneRoute { locale: Locale; view: View; active: PetalId | null }

export function isPetal(value: unknown): value is PetalId {
  return typeof value === 'string' && (petalIds as readonly string[]).includes(value);
}

export function isFeatured(value: unknown): value is FeaturedId {
  return value === 'perch' || value === 'selvedge' || value === 'forme';
}

export function routeFromURL(url: URL, fallback: Locale): SceneRoute {
  const value = url.searchParams.get('petal');
  const active = isPetal(value) ? value : null;
  return {
    locale: validLocale(url.searchParams.get('lang')) || fallback,
    active,
    view: active ? url.searchParams.get('view') === 'case' && isFeatured(active) ? 'case' : 'selected' : 'overview',
  };
}

export function routeURL(url: URL, state: SceneRoute): URL {
  const next = new URL(url);
  next.searchParams.set('lang', state.locale);
  if (state.active) next.searchParams.set('petal', state.active);
  else next.searchParams.delete('petal');
  if (state.view === 'case') next.searchParams.set('view', 'case');
  else next.searchParams.delete('view');
  return next;
}

export function createSceneState(route: SceneRoute, reducedMotion = false): SceneState {
  return { ...route, model: 'pending', reducedMotion, revision: 0, returnFocus: route.active ? `petal-${route.active}` : null };
}

// Discrete navigation is independent of readiness and continuous animation.
// A delayed asset cannot overwrite a selection, locale, or browser-Back result.
export function sceneReducer(state: SceneState, event: SceneEvent): SceneState {
  const next = { ...state, revision: state.revision + 1 };
  switch (event.type) {
    case 'select':
      return { ...next, active: event.id, view: 'selected', returnFocus: event.source || `petal-${event.id}` };
    case 'read':
      return { ...next, active: event.id, view: 'case', returnFocus: event.source || `petal-${event.id}` };
    case 'back':
      return { ...next, view: state.view === 'case' ? 'selected' : 'overview', active: state.view === 'case' ? state.active : null };
    case 'overview':
      return { ...next, view: 'overview', active: null };
    case 'locale':
      return { ...next, locale: event.locale };
    case 'model':
      return { ...next, model: event.status };
    case 'motion':
      return { ...next, reducedMotion: event.reduced };
    case 'route':
      return { ...next, ...event.route, returnFocus: state.view === 'case' && event.route.view === 'selected' && event.route.active === state.active ? state.returnFocus : event.route.active ? `petal-${event.route.active}` : state.returnFocus };
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { createSceneState, sceneReducer, routeFromURL, routeURL } from '../src/soft-lotus/state.ts';

const initial = () => createSceneState({ locale: 'ru', view: 'overview', active: null });

test('Legacy section links migrate without losing language or poisoning later navigation', () => {
  for (const lang of ['ru', 'en', 'kk'] as const) for (const id of ['contact', 'about'] as const) {
    const old = new URL(`https://example.test/index.html?lang=${lang}#${id}`);
    const route = routeFromURL(old, 'ru');
    assert.deepEqual(route, { locale: lang, view: 'selected', active: id });
    const migrated = routeURL(old, route);
    assert.equal(migrated.hash, '');
    assert.equal(migrated.searchParams.get('petal'), id);
    assert.equal(routeFromURL(routeURL(migrated, { ...route, active: null, view: 'overview' }), 'ru').active, null);
  }
});

test('An early project selection survives late model readiness and failure', () => {
  for (const status of ['ready', 'failed'] as const) {
    const selected = sceneReducer(initial(), { type: 'select', id: 'perch', source: 'petal-perch' });
    const result = sceneReducer(selected, { type: 'model', status });
    assert.equal(result.view, 'selected');
    assert.equal(result.active, 'perch');
    assert.equal(result.returnFocus, 'petal-perch');
    assert.equal(result.model, status);
  }
});

test('Case close restores the selected petal and preserves locale and focus origin', () => {
  let state = sceneReducer(initial(), { type: 'read', id: 'perch', source: 'preview-case-perch' });
  state = sceneReducer(state, { type: 'locale', locale: 'kk' });
  state = sceneReducer(state, { type: 'back' });
  assert.equal(state.active, 'perch');
  assert.equal(state.view, 'selected');
  assert.equal(state.locale, 'kk');
  assert.equal(state.returnFocus, 'preview-case-perch');
  state = sceneReducer(state, { type: 'back' });
  assert.equal(state.active, null);
  assert.equal(state.view, 'overview');
});

test('Rapid input and history restoration cannot revive the previous case', () => {
  let state = sceneReducer(initial(), { type: 'read', id: 'perch' });
  state = sceneReducer(state, { type: 'select', id: 'forme' });
  state = sceneReducer(state, { type: 'route', route: { locale: 'en', active: null, view: 'overview' } });
  state = sceneReducer(state, { type: 'model', status: 'ready' });
  assert.equal(state.active, null);
  assert.equal(state.view, 'overview');
  assert.equal(state.locale, 'en');
  assert.equal(state.revision, 4);
});

test('Direct preview URLs validate petals and preserve case and language on round trip', () => {
  const route = routeFromURL(new URL('https://example.test/soft-lotus.html?petal=selvedge&view=case&lang=kk'), 'ru');
  assert.deepEqual(route, { locale: 'kk', view: 'case', active: 'selvedge' });
  assert.deepEqual(routeFromURL(routeURL(new URL('https://example.test/soft-lotus.html'), route), 'en'), route);
  assert.deepEqual(routeFromURL(new URL('https://example.test/?petal=unknown&view=case&lang=invalid'), 'ru'), { locale: 'ru', active: null, view: 'overview' });
  assert.equal(routeFromURL(new URL('https://example.test/?petal=about&view=case'), 'en').view, 'selected');
});

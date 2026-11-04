# Soft Lotus V2 — preparation, not a finished release

Working branch: `feat/soft-lotus-v2`. Production still uses `81da4e53946c62f37ecc71ccd59ab11161f4fc19`. A separate `soft-lotus.html` entry is built only in the `soft-preview` mode and is not included in the normal release.

The main V2 brief was read completely through Library (148 lines, 34,922 bytes). The archive has not yet been unpacked: the current required Library helper failed on Windows with `AttributeError: module 'os' has no attribute 'setxattr'`. Neither target file was installed. Library cannot render ZIP text, and the named source document/storyboard were not found as standalone Library files. No existing WSL distribution was available. The helper was not patched, its metadata requirements were not bypassed, and no raw signed-URL download was substituted.

Consequently `SOURCES_AND_SETUP.md` and `SOFT_LOTUS_STORYBOARD.png` still require supported access. The current layout is provisional; it is not a visual interpretation accepted against the unseen storyboard.

## What exists

- Separate React scene shell and state reducer for overview, selected petal and one case reader.
- All five entries: PERCH, SELVEDGE, FORME, About and Contact. Three complete readers reuse real copy, screenshots, source/evidence URLs and explicit AI-assisted role from the existing content model.
- RU/EN/KK, retained direct case links, ordinary alternative navigation, native dialog focus containment, Escape, browser Back and focus restoration.
- Discrete state remains independent of late asset readiness, failure and continuous animation.
- One GSAP ticker coordinates Lenis before scene/anchor rendering. No per-frame React state. Canvas dimensions change through ResizeObserver, not during the transition between page sections.
- Reviewed, narrow adaptation of the official React Bits SplitText registry for word entrances, font readiness and cleanup. No hover springs, extra RAF loop or looping letters.
- Explicit temporary wireframe markers and a visible prototype label. `src/soft-lotus/asset.ts` has no final URL or generation ID. The old metallic model is not reused as the new model.

## Run and verify

```sh
npm ci --ignore-scripts
npm run build:soft-preview
npm run preview:soft
```

Open `http://127.0.0.1:5318/soft-lotus.html?lang=ru`.

```sh
npm run test:soft-state
node node_modules/@playwright/test/cli.js test --config playwright.soft.config.ts
```

Four state checks and five Chrome browser checks pass, including the first PERCH route, all five entries in three languages, mobile case reading, axe, no-JavaScript direct case access and a direct Kazakh case route at 320px without WebGL. The latter found and verified fixes for Tab containment and focus restoration when projected labels are not yet visible. Nine existing content/pose unit checks and all 40 production HTML artifact checks also pass. Lint, typecheck, normal production build and the separate preview build pass. No V2 CI or deployment has been run.

These verify the free interface scaffold only. The two accompanying screenshots were visually inspected for readable real content and controls. Their wireframe and panels are provisional, not an accepted design. These checks do not accept a soft model, its loading handoff, five bloom samples, final camera composition or production performance. Those checks require the real generated asset.

## Required before release

1. Read the archive source/setup document and inspect the storyboard.
2. Install the seven specifically approved skill sources only after the pending authorization, then apply their relevant instructions. Do not run React Bits `rb-add.mjs` or Design DNA scripts.
3. Receive the single approved Higgsfield/Tripo master petal and its job ID, exact settings, original output and actual charge. No generation has been launched here.
4. Inspect the source geometry and prepare five distinct petals, soft deformation, anchors, UV/normals, editable Blender source and optimized desktop/mobile GLBs.
5. Evaluate that actual model in this scene at closed, 25%, 50%, 75%, open and selected states, then record the complete scenario. Correct a specific defect before considering any further generation.
6. Finish spatial preview transitions, mobile composition, loading/fallback, typography and motion against the approved reference. Profile the final production asset on named hardware and explicitly distinguish phone emulation.
7. Complete full desktop/mobile, fallback, slow loading, language, keyboard, zoom, links, build and CI checks before switching the production entry or deploying.

Backup: remote `backup/pre-soft-lotus-v2-2026-11-04` at `81da4e53946c62f37ecc71ccd59ab11161f4fc19`, plus verified complete-history `../portfolio-before-soft-lotus-v2.bundle`. No other project repository was changed.

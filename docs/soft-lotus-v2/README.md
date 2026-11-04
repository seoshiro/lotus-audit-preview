# Soft Lotus V2

Working branch: `feat/soft-lotus-v2`. Production builds now use the actual Tripo flower. The execution agent accepted the actual model after visual review and local fixes; independent parent QA is recorded separately.

## Sources and implementation

The full V2 brief (148 lines) and extracted setup (62 lines) were read through Library. The actual 1536 x 1024 storyboard was viewed in Chrome's normal Space viewer. The archive's required Windows helper failed with `os.setxattr`; no helper or metadata bypass was used. Parent-supplied standalone copies resolved setup and storyboard access.

All seven approved skill directions were installed from pinned commits with Git blob hash validation, read and applied. See [sources and budget](SOURCES-AND-COSTS.md), [storyboard observations](STORYBOARD-REVIEW.md), [design profile](design-dna.json) and [model provenance](MODEL.md).

One Tripo master was repaired locally in Blender and made into five continuous Bloom/Focus petals. Desktop: 61,954 triangles / 2,024,228 bytes. Mobile: 24,614 triangles / 847,496 bytes. Editable Blender source and unchanged generated source are retained. One generation cost 6 of the authorized 60 credits; no additional paid operation was launched.

## Behavior

- Loading, bloom, petal selection, case reading and return share one flower and one GSAP frame clock.
- PERCH, SELVEDGE, FORME, About and Contact all work; actual screenshots, live/source/evidence links and honest AI-assisted role are retained.
- RU/EN/KK, browser Back, Escape, focus restoration, reduced motion, native dialogs, failed assets, lost WebGL context and no-JavaScript navigation are supported.
- All eleven standalone cases and legacy English/Kazakh addresses remain available.

## Run and verify

```sh
npm ci --ignore-scripts
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
node scripts/serve.mjs dist 5319
```

For fixed bloom samples, build `npm run build:soft-preview`, serve `dist-soft` on 5318 and run `node scripts/capture-soft-lotus.mjs`. The pose inspector is absent from production. `node scripts/measure-soft-flow.mjs` records real production transitions and all five selections at four viewport sizes. Phone viewports are emulated, not physical devices.

[QA.md](QA.md) records local checks separately from independent parent visual review. Current browser screenshots are in `proofs/`. Older `art/soft-lotus/proofs/candidate-*.png` document a superseded local iteration.

Rollback: remote `backup/pre-soft-lotus-v2-2026-11-04` at `81da4e53946c62f37ecc71ccd59ab11161f4fc19`, plus verified complete-history `../portfolio-before-soft-lotus-v2.bundle`. No neighboring project was changed.

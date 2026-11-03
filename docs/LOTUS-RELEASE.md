# Lotus portfolio release

The new presentation replaces the previous presentation on `seoshiro.github.io`, retaining all eleven real case URLs and the existing repository history. The old workflow deployed `portfolio-constellation` at `bdffb0e339ac92eb24a8ea80152a76fc44528d46`; its ITER, AYQYN and SIDEREAL content and exact screenshots were recovered as documented in `legacy-case-migration.md`. That separate repository is untouched. The pre-release main revision is preserved on `backup/pre-lotus-2026-11-03` at `4c8a892da5e10de01746821be8e8b648dc5c66ed`.

## Result

- One original 3D lotus with five rigid solid petals, independently transformed at their base hinges. Closed, opening and open states use the same GLB; no screen images or video impersonate its interaction.
- Pearl ceramic, satin silver, quiet champagne hardware, local serif/sans typography, and an ivory-to-graphite scroll episode.
- PERCH, SELVEDGE and FORME presented with actual application captures. Their live editing, persistence, comparison and export paths were checked separately; see `content-audit-lotus.md`.
- A sticky desktop project index, actual raycast petal selection, ordinary text links, three languages, complete HTML cases, context-preserving return, and a mobile menu with Escape/focus return.
- Useful posters and content before model readiness, under blocked storage, without JavaScript, with denied WebGL, after a failed GLB request and after WebGL context loss.

## Verification

Local lint, TypeScript, nine content/transition tests, production build, all 40 static artifact pages and the model artifact checks pass. The artifact contains twelve canonical content pages, 24 translated EN/KK compatibility pages, three credits pages and a custom 404. Browser results and recordings are described in `lotus-browser-tests.md`; that file records the final run and its scope. Independent visual review compared the first screen, unfolding, work, about and contact against the supplied concepts. Concrete corrections included petal shape/clearance, light intensity, camera framing, active-project arbitration and the work-column composition.

The model audit checked watertight petals and no petal-petal triangle intersections in 63 sampled synchronous/staggered states. Hardware has intentional assembled overlap; this is an artistic mechanism. Browser checks additionally verify actual petal picking, not only the text navigation.

The final CI checks this repository's exact workflow revision and deploys only its verified `dist` artifact. The live `/version.json` and `portfolio-build` meta tag identify the published source revision. A successful local build alone is not a claim that Pages has deployed; the handoff reports the actual workflow/deployment status.

## Assets and measured limits

| Asset | Bytes | Source / review |
| --- | ---: | --- |
| `models/lotus.glb` | 1,592,952 | Original offline Blender mesh, accepted after silhouette, clearance and material checks |
| `assets/lotus-poster.webp` | 25,476 | Same accepted closed render, 1200px with transparency |
| `assets/lotus-open.webp` | 36,962 | Same accepted open render, 1200px with transparency |
| Cormorant Garamond WOFF2 | 209,428 | Official Google Fonts source, locally compressed with all 3,241 glyphs retained |

The optional scene bundle includes Three.js and GLTFLoader (about 161 KB gzip); the content/navigation bundle is about 35 KB gzip. All fonts, images and model data are local. Rendering is requested for scroll, resize, visibility and interaction changes; there is no perpetual idle render loop. The pixel ratio is capped at 1.6. Local performance observations are saved under `docs/lotus-preview/performance.json` and explained in the browser notes; they do not establish mobile-device FPS, public-network performance or a Lighthouse score.

Physical phones, Safari/Firefox and native browser zoom were not tested. The four viewport checks are Chrome emulation. The layout and model deliberately reinterpret the concept's photographic rendering while preserving its materials, five-petal mechanism and editorial direction. The contact destination is the confirmed public GitHub profile; no unverified email or nonfunctional form was added.

## Costs and dependencies

Generation/API expense: **0 credits, $0**. Higgsfield was queried read-only: Pro, 610 credits. No trial was activated, no purchase was made and no subscription or quota was changed. The complete model, renders, encoding and recordings were produced with free local tools.

Vite was patched from 7.3.6 to 7.3.7 after its development-server advisory was found. `npm audit --omit=dev` reported no production advisories. Eleven moderate development-tool reports remain in the inherited ESLint/minimatch chain; they are not delivered as application runtime code. No blanket major-version downgrade or forced dependency replacement was applied.

## Continue learning

Follow `src/lotus-copy.ts` -> `src/render.ts` -> `src/main.ts` -> `src/lotus-scene.ts`. Text/content, HTML, interaction state and 3D each have their own responsibility. `source-assets/lotus/lotus-original.blend` is editable; the node/axis contract and deterministic rebuild commands are in `lotus-model.md`.

Rollback uses a normal revert of the Lotus source release and its workflow, retaining history. The backup branch preserves the previous workflow and its pinned constellation revision. Avoid a force-push or changing any other project repository.

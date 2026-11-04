# BEIBARS / LOTUS

[Portfolio](https://seoshiro.github.io/) · [GitHub profile](https://github.com/seoshiro)

A soft five-petal lotus is the interface for Beibars Ileskhan's portfolio. The same actual 3D flower connects loading, bloom, project selection and return. PERCH, SELVEDGE and FORME use real application screenshots and complete HTML case readers; About and Contact occupy the other two petals.

RU/EN/KK, keyboard navigation, reduced motion, asset/WebGL failure and static no-JavaScript links are supported. All eleven standalone cases and old language addresses remain available. The copy describes Beibars's AI-assisted role honestly.

## Development

Node 24; no runtime API key, backend, analytics or remote font service.

```sh
npm ci --ignore-scripts
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run test:browser
npm run preview
```

The ordinary preview serves `dist` on localhost:5317. Release browser tests serve it on 5319. Windows tests use installed Chrome; CI installs Chromium.

## Source map

- `src/soft-lotus/`: React state, continuous Three.js flower, GSAP/Lenis timing, typography and accessible navigation.
- `src/content.ts`: actual project facts, screenshots, evidence and translated cases.
- `scripts/soft-page.ts`: useful static homepage; `scripts/generate.ts`: all 40 HTML routes.
- `art/soft-lotus/`: unchanged Tripo master, editable Blender source, preparation and geometry audits.
- `public/models/soft-lotus-*.glb`: compressed desktop/mobile models; same-model posters for loading/failure.
- `tests/soft-lotus.browser.ts`: 13 complete browser scenarios, including all legacy cases and actual mesh picking.
- `.github/workflows/publish.yml`: checks the exact source revision before publishing to GitHub Pages.

[Implementation, provenance and budget](docs/soft-lotus-v2/README.md) · [Model](docs/soft-lotus-v2/MODEL.md) · [Verification and limitations](docs/soft-lotus-v2/QA.md)

One Tripo H3.1 generation cost 6 credits out of the authorized 60-credit project allowance. The remaining work was local code/model preparation. No further generation or purchase was needed. Fonts and reused component notices remain in `public/licenses/`.

## History and recovery

The former rigid-lotus implementation remains in Git history and its source folders for traceability. It is superseded by V2. Backup `backup/pre-soft-lotus-v2-2026-11-04` preserves commit `81da4e53946c62f37ecc71ccd59ab11161f4fc19`; the original pre-lotus backup is also retained. No unrelated project repository was modified.

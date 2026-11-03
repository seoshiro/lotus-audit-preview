# Lotus browser verification

The browser suite uses the integrated static build at the configured local preview origin. It does not visit project demos, send contact messages, or use paid services.

## Coverage

- Home at 1440 × 900, 1024 × 768, 390 × 844, and 360 × 800, in EN/RU/KK: real headings, posters, three featured cases, eight archive cases, anchor navigation, and horizontal overflow.
- Every case route in all three languages: actual screenshot dimensions, honest role, practical limits, live/source/evidence links, canonical URL, and ordinary HTML navigation.
- Language switching while browsing SELVEDGE: active project, scroll position, focused language button, localized copy, and persisted preference.
- Ordinary wheel input, fast scene seeks, reverse scrolling, mid-scene reload, and resize on desktop and mobile. Progress assertions inspect observable scene state and require forward/reverse changes; they do not assert a screenshot's appearance.
- Work anchor and visible phase shortcut, text project index, actual pointer raycasting against two visible petals, explicit case return, browser Back, mobile menu, Escape/focus return, and keyboard skip/index paths.
- System reduced motion, failed/pending GLB, denied WebGL, actual WebGL context loss when exposed by the installed browser, disabled JavaScript, blocked storage, and unsupported browser language.
- All eleven case pages at 360px in each locale; axe scans of localized homes/work, selected case pages, and the open mobile menu.
- Both legacy locale home routes and all 22 English/Kazakh case redirects preserve language and hash. All 24 locale aliases retain translated content without JavaScript, including home → case → next → back navigation. Credits, license files, and the static 404 retain working navigation.
- No uncaught runtime errors, no third-party runtime requests, and protected source paths on the local preview server.

The independent node tests in `tests/lotus.test.ts` check bounded progress, smooth monotonic opening, a real stagger among five petals, and deterministic reverse poses.

## Commands

From `portfolio/`, after the integrated production build:

```sh
node --experimental-strip-types --test tests/lotus.test.ts
node node_modules/@playwright/test/cli.js test
node scripts/measure-lotus.mjs
```

The package-level unit test command includes `tests/lotus.test.ts`. The Playwright configuration starts the static preview server and uses installed Chrome on Windows. CI can use its configured Playwright Chromium. Run the timing script with the preview already running, after other automated browser checks have finished.

## Evidence

The suite writes ignored local artifacts under `evidence/lotus/browser/`:

- `hero-{width}x{height}.png` and `work-{width}x{height}.png` for the four required viewports.
- `failed-model-work.png` and `pending-model-work.png`.
- `petal-picking.png` after real pointer selection.
- `sequence-{1440|390}-{closed|open|selected|about}.png`.
- `lotus-1440x900.webm` and `lotus-390x844.webm`: short real-browser forward/reverse scroll and project-selection sequences.

These screenshots and recordings are evidence for review, not pixel-match assertions. Mobile recordings use an emulated viewport, not a physical phone. Axe checks do not certify accessibility; browser behavior, visual quality, and model geometry still require independent review.

Evidence capture waits until scroll and canvas bounds remain stable across three polling intervals. Petal scans use only visible, pointer-reachable canvas coordinates. Earlier interaction regression traces are preserved under `evidence/lotus/regressions/`.

`evidence/lotus/performance.json` records the actual Windows/Chrome/Node/GPU environment, navigation and paint timings, initial resource transfers, and requestAnimationFrame callback intervals during one wheel-scroll progression per viewport. It uses fresh isolated contexts at 1440 × 900 and 390 × 844, unthrottled local loopback, and no synthetic score. Callback intervals are scheduling observations, not verified rendered FPS or public-network performance.

Native browser zoom at 200% has not been verified by this suite. The suite checks actual narrow-screen layout and makes no enlarged-text or native-zoom claim. Physical phones, Safari, Firefox, and screen-reader behavior were not checked by this browser run.

## Current result

The final corrected-build run passed **30 of 30 browser tests, with zero skips, in 2.1 minutes** on 3 November 2026 UTC. It includes all 33 canonical localized case routes, all 33 narrow-screen case checks, 22 enhanced legacy case redirects, and all 24 legacy locale pages without JavaScript. Both real petal selection and keyboard index activation passed. The required screenshots and both WebM recordings were refreshed from this build after scroll settlement.

Test definitions and the measurement script passed targeted ESLint and full TypeScript checking. All three transition unit tests passed. The earlier two interaction regression traces remain under `evidence/lotus/regressions/`; no test assertions were removed to accept those failures.

## Isolated local timing observation

After the full suite finished, `node scripts/measure-lotus.mjs` ran by itself against the same static build. Environment: Windows 10.0.26200, Node 24.18.0, headless Chrome 156.0.8078.76, AMD Ryzen 5 7535HS, AMD Radeon Graphics through ANGLE D3D11, 12 logical CPUs, 15 GiB reported RAM. No network or CPU throttling was applied. Each viewport used a fresh isolated context; this was local loopback, not a public-hosting or physical-phone measurement.

| Viewport | First contentful paint | Load event end | Initial subresource transfer | rAF interval median / p95 | Longest observed interval |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1440 × 900 | 308 ms | 228.6 ms | 2,790,454 bytes | 7.0 / 13.3 ms | 14.2 ms |
| 390 × 844 | 172 ms | 250.3 ms | 2,827,716 bytes | 7.0 / 7.4 ms | 14.2 ms |

The HTML navigation transfer was an additional 17,208 bytes for each viewport. Scroll sampling lasted about 2.2 seconds per viewport, with 298 and 310 rAF callbacks respectively, ending at scene progress 1.000. Neither sample contained a callback interval over 50 ms. These are single-session scheduling observations, not rendered FPS, a Lighthouse score, a guarantee of smoothness on other hardware, or evidence of public-network load speed. Raw navigation, paint, per-resource, GPU, and cadence values are retained in `evidence/lotus/performance.json`.

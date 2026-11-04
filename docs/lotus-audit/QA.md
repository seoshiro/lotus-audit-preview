# LOTUS audit preview verification — 4 November 2026

Historical preview record for `b46d69d`. The [independent-review follow-up](FOLLOWUP.md) supersedes the work CTA behavior and first-opening limitation below and records the later release verification. Production status in this record refers to that preview checkpoint.

This is an isolated review build, not an announcement that production was replaced or that every device is certified.

## Revision and rollback

- Preview: <https://seoshiro.github.io/lotus-audit-preview/?lang=ru>
- Source revision: `b46d69d9e1492e8252829c6c319eb42b5a493ba9`.
- Draft production PR: <https://github.com/seoshiro/seoshiro.github.io/pull/3>.
- Preview CI: <https://github.com/seoshiro/lotus-audit-preview/actions/runs/41831684497>.
- Production PR CI: <https://github.com/seoshiro/seoshiro.github.io/actions/runs/41831687596>.
- Unchanged production: `6d94ef874c2f4e8a6ec4b8de7b92b88c6a5b7078` at <https://seoshiro.github.io/>.
- Backup branch: `backup/pre-lotus-audit-2026-11-04`. A verified full-history Git bundle is also retained outside the checkout. No history was rewritten or unrelated project changed.

The full owner audit was obtained through supported message search after direct message reading returned a temporary-context error. All 18,841 characters were read; the shorter delegation summary was not used as a substitute.

## Functional and content checks

Lint, TypeScript, 11 content/state tests, production build and reference checks for all 40 generated HTML pages passed locally and in CI. All 17 browser scenarios passed locally on the final source (57.8 seconds) and in both final CI runs. The full suite also passed against published `400e1ea` in installed Chrome (1.5 minutes); after the GPU-preparation correction, the five affected loading/cache/PERCH/mobile/context-loss scenarios passed again against published `b46d69d` (19.1 seconds). HTML build metadata, `version.json`, both GLBs and both open posters were verified against the checkout; [published-files.json](published-files.json) records hashes and the unchanged production revision. No browser page errors were observed during the final public screenshot pass.

The build keeps two non-fatal warnings: the intentionally separate classic `locale-boot.js` is copied from public assets rather than bundled, and the dynamically loaded Three/GLTF chunk exceeds Vite's 500 kB uncompressed warning threshold.

The 17 browser scenarios cover:

- RU/EN/KK static localization before the application bundle is available; legacy `#about` / `#contact`, locale URLs, direct case URLs, Back and Forward.
- Loading, the same flower's opening, PERCH selection, reader, Escape, exact trigger-focus restoration and return; every other petal and all eleven standalone cases.
- Actual mesh picking, rejected drag selections, rapid repeated input, cached revisit, reduced motion and keyboard controls.
- Model request failure, WebGL context loss, WebGL unavailable, no JavaScript and copy-link failure.
- Axe checks in the exercised overview, selected and reader states; narrow-screen bounds and short-preview overflow. This is scoped automation, not a screen-reader certification.

Public Telegram and email exactly match the owner's confirmations. All eleven external demo URLs returned HTTP 200; this revision did not repeat exhaustive functional tests inside those separate applications. PERCH/SELVEDGE/FORME explanations are grounded in their repositories and documented corrections, with truthful AI-assisted authorship and explicit limitations.

## Visual and continuous-motion evidence

Actual loaded geometry was inspected at 0/25/50/75/100% bloom, not inferred from a loading poster. See the five `proofs/bloom-*.png` captures. Both export audits sample 21 bloom poses and 25 focused poses: zero inter-petal intersections, zero boundary edges and zero nonmanifold edges. Editable Blender source and the original Tripo GLB are retained.

Overview and all five selected states were checked at 1440 × 900, 1165 × 747, 390 × 844, 320 × 640 and 720 × 450. At the very short landscape size the selected content legitimately scrolls; it is not an empty full-page scroll. At the other four sizes short previews fit without redundant scrolling. The final fallback correction keeps the longer Kazakh status above the two-row mobile navigation.

Public screenshots: [desktop overview](proofs/overview-1440.png), [phone overview](proofs/overview-390.png), [PERCH at 1165 × 747](proofs/perch-1165.png), [English fallback](proofs/fallback-en-1165.png), [Kazakh fallback](proofs/fallback-kk-390.png), [confirmed contact](proofs/fallback-contact-390.png).

Continuous [desktop](proofs/flow-1440.webm) and [phone-viewport](proofs/flow-390.webm) recordings cover loading, bloom, all five selections, rapid switching, the PERCH reader, scroll, Escape and return on the published preview. Recordings use installed Chrome with a cold cache and simulated 3 Mbps down / 2 Mbps up / 70 ms latency. Video capture itself adds overhead, so timing measurements use a separate pass without recording. Frame sheets are review aids; the complete WebM files preserve the transitions between them. Dense opening sheets show 24 consecutive samples around the actual opening, separate from the full-flow review sheets.

Fallback captures explicitly wait for the open-poster image to decode. The EN and KK posters have no baked labels or screenshots; actual navigation remains in HTML. Proportions are preserved with `object-fit: contain`. The small decorative petals derive from the existing geometry, do not intercept input and disappear in reading and reduced-motion states.

Dense video review caught a transient preparation frame underneath the transparent bud poster. The final correction hides the canvas while preparation is pending and applies the actual initial pose before the GPU fence. Only the deliberate warm-up frame is submitted while preparation is pending, preventing redundant frames from accumulating on a software GPU. Loading, cache, mobile, PERCH and context-loss tests were repeated; the first frame is now the prepared bud rather than an unposed warm-up render.

The intermediate CI run caught two 5-second model-readiness assertion timeouts. Readiness checks now allow the existing 20-second application loading limit, while post-readiness interaction assertions retain their ordinary timeouts. A separate local SwiftShader run confirmed first readiness in 3.65 seconds and a repeat visit in 1.43 seconds with bloom already at 1.000. This is a software-renderer functional check, not a replacement for the hardware/public performance measurements below.

## Public performance method

Measurements use the deployed URL, installed headless Chrome 156.0.8078.76 on Windows 11 Home, AMD Ryzen 5 7535HS (12 logical processors), 15 GiB system RAM and ANGLE AMD Radeon Graphics / D3D11. Viewports are 1440 × 900 and 390 × 844. Each uses a fresh context, disabled browser cache, simulated 10 Mbps down / 5 Mbps up / 40 ms latency, and no CPU throttle.

Chrome traces include compositor, GPU and main-thread events. `AnimationFrame::Presentation` feedback is scoped to the page renderer and marked startup, opening and rapid-selection windows. Unique DrawFrame/DroppedFrame sequence IDs and partial-update signals are retained separately. CPU render-call duration and RAF frequency are not used as a substitute for delivered-frame measurements. Startup includes idle network waiting and is not reported as steady-state FPS.

| Final public pass | 1440 × 900 | 390 × 844 |
| --- | ---: | ---: |
| Model ready after navigation | 3.00 s | 2.01 s |
| Opening complete after navigation | 3.99 s | 3.01 s |
| LCP (text, not complete 3D) | 0.57 s | 0.61 s |
| CLS | 0.0023 | 0.0166 |
| Long tasks during startup | 2; max 133 ms | 1; max 73 ms |
| Long tasks during opening / rapid selection | 0 / 0 | 0 / 0 |
| Opening presentation interval p95 / maximum | 7.15 / 76.51 ms | 7.18 / 69.75 ms |
| Rapid-selection interval p95 / maximum | 7.18 / 27.78 ms | 7.16 / 14.12 ms |
| Intervals over 33.33 ms during opening / rapid selection | 1 / 0 | 1 / 0 |

The single longer first-opening interval remains a real measurement limitation. A separate earlier public pass measured 97 ms desktop / 49 ms mobile, so it is not hidden by quoting only p95 or the newest sample. GPU warm-up moved initial shadow-program work into the preparation state, but did not eliminate every first-opening presentation gap. The trace showed GPU raster work near that event; its exact source has not been isolated. No further blind lighting or shadow changes were made to chase one number. This does not support a claim of perfectly smooth first-load motion.

Exact results, including DrawFrame, dropped-frame and partial-update signals, are stored in [performance-summary.json](performance-summary.json). Large raw traces remain local rather than inflating the repository. These intervals reflect this headless compositor's cadence, not a promise of 140 FPS or performance on a physical phone.

## Remaining limits and release status

Physical Android/iOS devices, Safari/WebKit and a screen reader were unavailable. Phone dimensions here are viewport emulation on the Windows GPU, not a physical-phone performance claim. Continuous motion was reviewed, but no claim of perfect frame delivery on every device is made. Headless compositor measurements cannot certify a physical display.

The preview remains separate from production for independent visual review. This report does not silently convert passing functional tests into acceptance of every visual criterion.

## Cost

No new paid generation, subscription, purchase or paid hosting. Known Higgsfield spend remains **6 / 60 credits**, from the existing Tripo job `4ccf52ab-d439-444b-ad96-3011e8a11578`; 54 credits remain. All model refinements, the paper/ink effects and decoration in this revision were made locally.

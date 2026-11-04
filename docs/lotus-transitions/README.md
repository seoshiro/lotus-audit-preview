# Continuous LOTUS transitions — 2026-11-04

Preview: https://seoshiro.github.io/lotus-audit-preview/?lang=ru

Recording: https://seoshiro.github.io/lotus-audit-preview/proofs/lotus-transitions/

## Change

The existing full-screen eleven-project catalog is preserved. Its 600 ms overlapping entrance fades the introduction and labels, retreats the camera independently of the frozen base flower pose, then reveals the heading and lightly staggered rows. Closing reverses from current values; the base pose resumes without losing bloom, rotation, selection, or the project underneath.

BEIBARS now handles an ordinary unmodified click through the existing URL/history state. Its real href remains available for modified clicks, new tabs and no-JavaScript use. Both BEIBARS and the preview return control reuse the loaded canvas and GLB. The panel fades out, the flower returns to the overview orientation/position over 650 ms, then the introduction and labels reappear. The retained preview is inert and hidden from assistive technology while leaving. Labels change their thumbnail layout while faded out.

Interrupted tweens are killed without reverting their values. The native catalog releases modality at the start of its visual exit, so rapid reopening can reverse the current state. Focus returns on the first visible frame, including a keyboard dismissal of the HTML reader. Reduced motion uses a 140 ms fade and no camera retreat or row translation.

## Evidence and checks

- ESLint, TypeScript, eleven content/state tests, production build and all forty page artifact checks passed.
- All 21 browser tests passed on installed Chrome, including RU/EN/KK, 320/390/1440 widths, touch, focus, Escape, Back/Forward, direct URLs, model failure, context loss, no JavaScript and accessibility checks.
- New regression checks verify exact base pose before/under/after the catalog, three interrupted reopen cycles, one canvas identity, unchanged performance time origin, one GLB request, no loader on either return action, restored overview angle, and reduced-motion camera depth zero.
- The two continuous 25 fps recordings include all three transitions, selected-project preservation, rapid reversals, HTML case return, browser Back and reduced motion. The recordings were inspected as successive frames sampled every 65 ms around each transition. Recording is separate from performance measurement.
- Existing Tripo geometry, real project content, contacts, language routes and the production site are preserved. This task spent no generation credits; known cumulative spend remains 6 of 60.

## Performance conditions and limits

See `performance-local.json`. Actual WebGL renderer: AMD Radeon / ANGLE Direct3D11, Chrome 156.0.8078.76, Windows 11 Home, Ryzen 5 7535HS. Cold browser cache, simulated 10 Mbps down / 5 Mbps up / 40 ms latency; no CPU throttle. Trace-based AnimationFrame::Presentation feedback is scoped to the page renderer, with compositor draw/drop signals reported separately. No video or screenshots during the timed pass. These are headless compositor measurements, not physical display certification.

| Phase | Desktop P95 / max interval | Phone viewport P95 / max interval |
|---|---:|---:|
| Catalog open | 13.9 / 27.8 ms | 13.9 / 13.9 ms |
| Catalog close | 7.1 / 34.3 ms | 7.2 / 40.9 ms |
| Return home | 7.1 / 13.9 ms | 7.2 / 14.0 ms |
| Rapid reversals | 7.2 / 13.9 ms | 7.1 / 13.9 ms |

No >50 ms main-thread long tasks occurred during these four transition windows. There was one >33 ms presentation interval during each catalog-close window; the report does not claim perfectly uninterrupted motion. Cold startup still included 283/114 ms desktop and 51 ms phone-viewport long tasks before model readiness. Network waiting and startup are reported separately, not turned into a misleading FPS score.

Physical Android/iPhone and Safari were unavailable. The mobile layout/touch checks use Chrome emulation on the same Windows hardware.

## Supplied recording limitation

The reattached Library item `libfile_c85c39ef5bbc81918a6ada6247d0e033` was resolved. Its supported materialization failed on Windows with `AttributeError: module 'os' has no attribute 'setxattr'`; Library read supplied no readable video content. No raw-download bypass was used. The supplied recording itself was not viewed, and the exact 13-second comparison remains unavailable. Implementation and validation follow the user's detailed description, with the new recordings supplied for review.

## Rollback

The pre-transition source is retained as `backup/pre-lotus-transitions-2026-11-04` at `fd6af7a748450fee0840a2e4d898d7a68816d9df`. The previous publicly deployed preview was `cd2ad1f502c22ea1fe1ac1cfd57b4b41c5142f02`. Production remains `6e18031700ae46a1689e48f23ee1ecb6149da860`. Work continues on `feat/lotus-art-direction` and the separate preview repository; PR #4 remains draft.

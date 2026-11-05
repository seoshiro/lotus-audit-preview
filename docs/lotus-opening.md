# LOTUS: a separate 3.2-second opening

Scope: preview only, after `46e5290`. The model, morph geometry, materials, lighting, background/label contrast, settled camera and existing project/reader transitions are retained. Backup: `backup/pre-lotus-opening-2026-11-05`. Production remains unchanged.

The renderer reports readiness only after the GLB is downloaded, decoded, compiled and its initial GPU work completes. The existing transfer/prepare indicator then disappears. A separate GSAP timeline holds the bud for 0.4 seconds, unfolds it for 2.2 seconds, and settles the remaining 3% with labels/product thumbnails over 0.6 seconds. Five morph weights have 50 ms offsets contained within the unfolding interval. The camera/scale follows the same overall opening envelope. Total duration is 3.2 seconds; loading speed does not stretch or compress it.

Tap/click on the scene, Escape and the localized skip button complete the current pose in 180 ms. That input is consumed before petal selection. Navigating directly to a project or opening the gallery also ends the intro; scene identity and session completion survive project, reader, gallery and history returns. Locale changes cannot restart the timeline. Reduced motion prepares the open pose before its first visible frame and uses only a 180 ms appearance. Repeat visits in the same tab use that short appearance too. The model still has to load honestly if it is not cached. Focus moves to the project navigation if the focused skip control disappears on completion.

`tests/lotus-opening.browser.ts` covers delayed real GLB transfer, actual wall-clock duration, stationary bud, staggered morphs and final-phase label reveal on desktop/mobile, Escape/touch/keyboard skips, early project/gallery navigation and history without remounting the canvas, reduced motion, session visits, language changes and focus retention. Existing tests cover fallback, all routes/languages, continuous transitions, reader fitting, typography and contrast. The initial reduced-motion test caught a stale closed-bud warmup frame; preparing its open pose before warmup fixed it.

The proof page `proofs/lotus-opening/` contains uncut ordinary-speed first-entrance recordings and timing metadata. Recordings use installed headless Chrome on Windows, hardware AMD Radeon WebGL through ANGLE Direct3D11, fresh contexts/cache, no CPU or network throttle, at 1440×900 and touch-emulated 390×844. The video is 25 fps and is not a physical-display performance benchmark. Physical Android/iPhone and Safari remain untested. Intermediate frames of both recordings were visually reviewed separately from assertions.

No paid generation. Known project spend remains 6 of 60 Higgsfield credits.

Final recording timings: desktop 3198.8 ms, mobile viewport 3200.8 ms; the opening began 5.4 ms / 2.1 ms after the runtime reported model readiness. These are wall-clock animation durations, not FPS measurements.

Quiet appearances keep surface input available. The surface regression explicitly waits for model readiness: reduced motion now prewarms an open flower while the canvas is still hidden behind the real loading state. An open morph value alone is not a readiness signal.

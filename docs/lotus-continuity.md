# LOTUS transition continuity — 2026-11-04

Preview: https://seoshiro.github.io/lotus-audit-preview/?lang=ru

Separate calm, rapid and petal-to-reader recordings, desktop and phone: https://seoshiro.github.io/lotus-audit-preview/proofs/lotus-continuity/

## Observed defects and corrections

The supplied previous desktop recording was inspected as successive frames around 16.5 seconds. After PERCH's reader closed, the flower crossed the left viewport boundary and the product image remained a narrow strip. The catalog exit also showed gallery text and the main headline together.

- Catalog text now clears before the scene text returns. The paper layer, camera retreat and return still overlap in time, and the underlying bloom, rotation and selected petal are retained. Reversals keep their current values. Reduced motion uses short fades.
- Product images and titles use one uniform scale. Separate X/Y scaling had distorted the aspect ratio. Opening the HTML reader no longer kills an incomplete image tween; a quick return finds its ongoing or completed position. Rapid project changes continue the active motion instead of restarting from a different thumbnail.
- The shared reader now uses the actual remaining screen area. A compact convex envelope is computed once from the existing GLB's open/closed/focused geometry. Camera projection fits that envelope proportionally into the free left column, with margins and a centered caption. The existing flower, material, camera and canvas are retained. A restrained warm tint identifies the selected petal. This is applied to PERCH, SELVEDGE and FORME together; the other eight standalone HTML cases retain their reading layout.
- Reader and flower use the same 550 ms easing. Escape no longer silently substitutes a panel fade while the flower moves. Closing releases the modal into a non-interactive visual exit, allowing an interrupted transition to reverse from its current position. During reading, background controls are inert, the exploration instruction is hidden, and pointer picking is disabled. Mobile gives the full width to the readable case and its return control. Open-reader resizing refits the model to the measured column.
- Tall desktop windows also constrain the selected flower to the preview's free column, so closing the reader at 800 × 900 does not return to a clipped pose. This constraint blends with the existing selection motion and does not change the wide-screen composition.
- Frame review caught the fixed header painting over the exiting non-modal reader. The reader now retains its stacking layer until it leaves. Its caption fades before the selected petal labels return, preventing duplicate labels during the handoff.
- The mobile flower is enlarged by 6% at widths up to 360 px and 9% above that breakpoint, with a small centering correction and clearer 11 px petal labels. Its ordinary overview is slightly higher. A near-edge candidate was corrected before delivery.
- Visual review also caught project text appearing underneath the mobile flower during its initial lift. The panel now waits for that area to clear, including a project switch during the lift. The existing canvas and HTML reader remain mounted.

The clipped italic headline was fixed and published separately in `b9961013831c28cad964548a478f013851e0546a`; its pixel comparisons and all three language tests are retained. See [the typography report](lotus-type.md).

## Verification

`tests/lotus-continuity.browser.ts` samples actual animation frames through ordinary and reversed transitions. It checks that legible gallery and scene text do not compete, that every product transform preserves equal X/Y scale, that early case entry cannot strand the image, and that mobile panel text waits for the flower's lift even after a mid-motion project change. Reader checks cover all three shared cases in RU/EN/KK, widths 1917, 1440, 1165, 800, 390 and 320 px, resizing while open, projected model bounds at intermediate frames, Escape/history reversals, focus, retained canvas, reduced motion and model failure. Existing tests retain coverage of the standalone cases, contacts, context loss and touch selection.

`scripts/record-continuity.mjs` creates six separate continuous 25 fps recordings. Desktop and touch-emulated mobile each have a calm flow, a rapid-action flow and a dedicated reader flow through all three projects. `scripts/review-continuity.mjs` extracts successive frames around every important transition, including reader return. The wall-time action marks are approximate relative to the encoded video's start; review windows include a lead-in. These recordings are not used as a performance benchmark.

The trace measurement helper now also marks the early reader-return interval. It records real Chrome compositor presentation feedback and long tasks separately from video capture, with cold cache, simulated 10/5 Mbps and 40 ms latency, and no CPU throttling. Exact run results are reported with the published revision; no smoothness claim is inferred from a single RAF counter or CPU render time.

## Limits and rollback

Windows 11, Chrome 156.0.8078.76, AMD Radeon hardware WebGL through ANGLE Direct3D11. Mobile uses Chrome viewport/touch emulation; physical Android/iPhone and Safari were unavailable. No new model generation or paid operation. Known project total remains 6 / 60 Higgsfield credits.

Rollback for this iteration: `backup/pre-lotus-continuity-2026-11-04` at `b9961013831c28cad964548a478f013851e0546a`. Production remains `6e18031700ae46a1689e48f23ee1ecb6149da860`. Only the feature branch and the separate preview repository are updated.

# Independent-review follow-up

This follow-up addresses the owner's independent review of the audit preview: the work CTA previously moved focus without opening anything, and the first bloom had a 70–77 ms presentation interval. It supplements the earlier [QA record](QA.md); it does not erase its measured limitations.

## Work action

The main action now opens the complete list of eleven real projects and places focus on its expanded summary. Enter and Space activate it; Tab enters the links; Escape closes the list and returns focus to the invoking control. The native summary remains usable independently. The mobile list is positioned within the viewport rather than extending beyond its left edge.

The RU/EN/KK action is tested with the keyboard, with normal rendering and with model failure at 390 × 844 and 320 × 640. The open list also passes the scoped axe check. Before the application loads, and without JavaScript, the action is an ordinary localized link to the real PERCH case.

## First-opening investigation

The long interval occurred when HTML thumbnail images first appeared over the petals. Keeping the complete Three.js scene but hiding the labels removed the interval. Keeping the text labels and hiding only their images did the same. Resizing the images helped but was insufficient. Removing their CSS perspective and blurred shadow removed the remaining interval in a subsequent diagnostic pass.

| Local diagnostic | Maximum opening interval, desktop | Phone viewport |
| --- | ---: | ---: |
| Original full scene | 83.51 ms | 55.65 ms |
| Same scene, labels hidden | 13.88 ms | 7.19 ms |
| Text labels retained, thumbnail images hidden | 13.93 ms | 7.51 ms |
| Resized thumbnails, original effects | 69.60 ms | 34.76 ms |
| Resized thumbnails, perspective/shadow removed | 20.86 ms | 7.31 ms |
| Final normal scene, no diagnostic overrides | 20.91 ms | 7.21 ms |

The evidence localizes the expensive first raster/compositing work to thumbnail presentation. It does not establish a particular undocumented GPU-driver function as the cause. [Diagnostic measurements](first-bloom-investigation.json) retain the compositor feedback and dropped/partial-update signals.

The shipped fix uses 320-pixel navigation thumbnails resized from the original project captures, totaling 29,430 bytes. Their [source hashes and dimensions](petal-thumbnails.json) are retained. They face the viewer directly, without the expensive CSS perspective and soft box shadow. Full-resolution selected previews and case images are unchanged. No geometry, material, scene lighting, animation duration, petal count or shadow quality was reduced to obtain this result. The real scene and the readable project images were visually checked together after the change.

## Verification and publication

Candidate source: `9e5f9469c0d8dff34fc7480b6b3fb199b40f90dd`. Lint, TypeScript, 11 content/state tests, production build, all 40 artifact pages and 18 browser scenarios pass locally. The additional scenario covers the work CTA and its open-list accessibility. All 18 scenarios also passed on the public preview in installed Chrome. Both [preview CI](https://github.com/seoshiro/lotus-audit-preview/actions/runs/41836385153) and [production PR CI](https://github.com/seoshiro/seoshiro.github.io/actions/runs/41836373951) passed. The [published-file verification](published-followup-files.json) confirms the exact source revision and seven asset hashes, with no page errors in the four-viewport screenshot pass. Production was still the backed-up baseline at this checkpoint.

Public preview: <https://seoshiro.github.io/lotus-audit-preview/?lang=ru>. Production release is tracked by [PR #3](https://github.com/seoshiro/seoshiro.github.io/pull/3); the final merge revision and production checks are reported in the delivery message.

### Final public motion measurement

Windows 11 Home, AMD Ryzen 5 7535HS, Radeon 0x1681 through ANGLE Direct3D11, installed headless Chrome 156.0.8078.76. Fresh context/cold browser cache, simulated 10 Mbps down / 5 Mbps up / 40 ms latency, no CPU throttle. The mobile result is a 390 x 844 viewport on the same computer; desktop is 1440 x 900. Timed passes contain no screenshot recording or concurrent browser test work.

| Public candidate | Desktop | Phone viewport |
| --- | ---: | ---: |
| Model ready | 2.967 s | 1.877 s |
| Opening presentation interval p95 | 7.176 ms | 7.180 ms |
| Opening presentation interval max | 14.136 ms | 20.857 ms |
| Opening intervals over 33 ms | 0 | 0 |
| Opening dropped / partial-update signals | 0 / 0 | 0 / 0 |
| Rapid selection interval max | 20.662 ms | 20.827 ms |
| Rapid selection intervals over 33 ms | 0 | 0 |
| Rapid selection dropped / partial-update signals | 3 / 3 | 3 / 3 |
| LCP | 640 ms | 608 ms |
| CLS | 0.0023 | 0.0166 |

[Full public measurements](public-followup-performance.json) retain page-renderer-scoped Chrome AnimationFrame::Presentation feedback, unique DrawFrame/DroppedFrame IDs, partial updates, marks and main-thread long tasks. No long tasks occurred during opening or rapid selection. Startup still includes network waiting and model preparation: desktop long tasks were 124 and 112 ms, mobile 71 ms, before readiness. Startup presentation maxima of 365 and 250 ms include deliberately idle waiting and are not steady-state animation scores. The fix removes the previously observed first-opening interval in this pass; it does not claim a universal frame-rate guarantee or zero startup work.

### Continuous visual review

The public candidate was recorded continuously through cold loading, opening, all five selections, rapid switching, PERCH reader, return and overview. Separate recording used simulated 3 Mbps down / 2 Mbps up / 70 ms latency; video cadence is 25 fps and is not the performance measurement. Both videos were decoded and their full-flow and dense-opening frame sheets reviewed. The five petal surfaces stay continuous, the gathered bud opens into the same model, selected project captures remain readable, and reader/return transitions complete without a replacement flower or stale project content.

- Desktop: [continuous video](followup-proofs/flow-1440.webm), [full-flow sheet](followup-proofs/review-1440.png), [dense opening](followup-proofs/opening-1440.png), [recording metadata](followup-proofs/flow-1440.json).
- Mobile viewport: [continuous video](followup-proofs/flow-390.webm), [full-flow sheet](followup-proofs/review-390.png), [dense opening](followup-proofs/opening-390.png), [recording metadata](followup-proofs/flow-390.json).
- Visible work action: [RU desktop](followup-proofs/work-1440-ru.png), [KK 390 px](followup-proofs/work-390-kk.png), [EN 320 px](followup-proofs/work-320-en.png). The complete eleven-item list scrolls when needed; its bounds remain inside the viewport.

Earlier [QA](QA.md) retains the separate five-pose browser inspection and geometry audit. Geometry is unchanged by this follow-up. The parent's independent review accepted fallback, contact, routes, languages and PERCH before the two follow-up issues were addressed.

Physical phones, Safari/WebKit and a screen reader remain unavailable. A Chrome viewport is not a physical-phone certification, and one successful timing pass is not a guarantee for every GPU or load condition. All previously preserved source assets and rollback history remain available.

No new generation, purchase, subscription or paid hosting: known project spend remains 6 of the authorized 60 Higgsfield credits.

# LOTUS: contrast in the existing scene

Scope: current preview branch only. The original Tripo geometry, morphs, camera, project assets and all reading/navigation transitions are retained. No generation or additional credits.

## Changes

- A broad cool grey wash follows the actual projected flower bounds. It stays behind the same flower in overview, selection and the desktop reading pose. One fixed gradient surface is moved with a compositor transform; its dimensions/background are not repainted per frame.
- Existing lights are balanced with a higher side key, slightly lower fill and a cooler hemisphere ground. Material roughness, thin-edge shader and gentle contact shadow are retained. Petal self-shadow reception remains disabled: the earlier acne is not reintroduced.
- Petal names use opaque warm #433A33, including unselected names after another project is selected. Selection also uses 700 weight. The selected About label is lifted 14 px away from the foreshortened dark edge, including the longer Kazakh wording. Selected names scale down gently on narrower desktop widths so longer translations stay within the light petal surface. The lower navigation retains its underline and uses a darker selected colour.
- The hero hint now uses the intended secondary colour. Its old higher-specificity last-child rule overrode that colour and measured about 4.3:1 on the new background.

## Review and evidence

The first lighting candidate made undersides too dark. The key was raised and fill softened before acceptance; no model or camera changes were used to hide that defect. The selected-label underline was rejected after the actual-background probe found that it crossed a shadowed petal edge.

The comparison page at `proofs/lotus-contrast/` contains 14 unretouched before/after pairs (1440x900 and 390x844; overview, three selected projects and three readers). Before is published preview fb2d80e. Each pair has exactly matching runtime pose and projected geometry bounds. Reduced motion freezes decorative movement for comparable stills. The mobile reader intentionally occupies the whole screen.

`tests/contrast-probe.ts` captures the rendered screen and then the same screen with only the measured text transparent. It samples composited background pixels at actual glyph positions of fully visible text elements, including WebGL, paper grain and gradients, accounts for ancestor opacity, and evaluates WCAG luminance contrast. The difference mask excludes empty button padding and thumbnail borders. Decoding happens in an empty test page because production CSP deliberately disallows data-URL images; the site's policy is not relaxed. These measurements complement visual inspection and accessibility checks.

The browser regression covers all five entries and RU/EN/KK at 1440x900, 1165x747, 390x844 and 320x640. It requires at least 4.5:1 for sampled text and verifies visible ink and fully opaque settled petal names. The existing tests continue to cover animated reveals, rapid reversals, shared reader fitting, resizing, keyboard/focus/history, reduced motion and fallback.

Conditions: installed Chrome 156 on Windows 11, AMD Radeon hardware WebGL via ANGLE Direct3D11. Mobile dimensions/touch are emulated. Physical Android/iPhone and Safari are unavailable; those devices are not certified by these tests. Still-image comparison is not a performance measurement.

## Final verification

The first candidate passed all 35 local scenarios, but Linux CI found four glyph samples at 4.359–4.417:1. The petal ink was therefore deepened slightly from #4A413A to #433A33 rather than weakening the 4.5:1 criterion. The other 31 CI scenarios passed.

A separate local production-build trace used cold cache, simulated 10/5 Mbps and 40 ms latency, no CPU throttling and no video/screenshot capture. Transition presentation P95 ranged 7.018–13.924 ms. Maximum interval was 34.785 ms on desktop and 33.864 ms at the phone viewport, both at catalog close; one >33 ms interval each. No >50 ms main-thread long tasks occurred in the transition windows. Cold model preparation before opening contained tasks up to 256 ms desktop / 67 ms phone viewport. The trace includes renderer-scoped presentation feedback, draw/drop signals and long tasks; it is not a single-RAF or CPU-render proxy. Full conditions and values are preserved in the proof page performance JSON.

The final ink shade passed all four local contrast scenarios again: 108 states / 978 elements, minimum 4.803:1 overall. Petal-label minima were 5.380 / 5.529 / 5.704 / 5.162:1 at widths 1440 / 1165 / 390 / 320. The exact CI trouble spots were additionally reproduced with forced SwiftShader in installed Windows Chrome; all four targeted cases passed with overall minima 4.803–4.976:1. This software-renderer check supplements the hardware check and does not claim to be Linux. The verify job allows 20 minutes for browser installation plus the expanded suite; no test assertion or individual test timeout was relaxed.

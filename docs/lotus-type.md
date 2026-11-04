# LOTUS italic mask correction — 2026-11-04

Preview: https://seoshiro.github.io/lotus-audit-preview/?lang=ru

Comparison: https://seoshiro.github.io/lotus-audit-preview/proofs/lotus-type/

## Confirmed cause

On the previous public preview (`bf533c483ec39edb70d15f36cc6242d922e37c80`), SplitText wrapped each word in an inline `overflow: clip` mask. At 1440 × 900, the actual headline font was italic 92.16 px SoftSerif with an 84.7872 px line-height. The mask matched that tight line box; italic glyph ink extended outside it. Removing only the overflow restored the missing descenders and slanted edges. This was not a failed font request or a missing character.

The clipping surface now has .16 em top, .18 em horizontal and .22 em bottom space, with equal negative margins. The original word rectangles, line breaks and leading are unchanged at ordinary size. The word-reveal animation remains clipped and keeps its existing duration, stagger and cleanup. Padding is used instead of relying on `overflow-clip-margin` support. Long enlarged words can wrap. No font or asset was replaced.

Text enlarged to 200% exposed overlap with the mobile flower labels. When the introduction outgrows the composition, a measured reading surface provides native scrolling and hides the duplicate graphical petal controls. The persistent project index remains available. Returning to ordinary text size restores the scene composition. The WebGL canvas is retained.

## Regression coverage

`tests/lotus-type.browser.ts` compares actual screenshots of the same glyphs with clipping enabled and disabled. The captures must match at 400 ms, after settling, and at 200% headline size, in RU/EN/KK at 1440 × 900, 1165 × 747, 390 × 844 and 320 × 640. The early 100 ms frame must still show an active entrance. A negative control reinstates the original tight mask and must visibly lose ink; it also verifies unchanged word geometry. The animation clock is controlled only for these typography comparisons, not used as a performance measurement.

Additional tests double all introduction text at 390 × 844, 320 × 640 and 720 × 450, exercise keyboard access to the catalog and return focus, verify no horizontal overflow or collision with the footer, and restore normal text size. Rapid language changes and reduced motion verify one complete accessible heading with correct cleanup.

The 720 × 450 viewport represents the CSS layout space of a 1440 × 900 window at 200% browser zoom; it is not a claim that a physical browser zoom control or device was operated. Actual 200% font-size enlargement is applied separately in the tests.

## Environment and limits

Local release verification passed: ESLint, TypeScript, eleven content/state tests, production build, forty page artifact checks, and all twenty-five browser scenarios (including the three new typography regressions). The headline bounding rectangles before/after were identical on the captured 1440 × 900 and 390 × 844 screens.

Installed Chrome 156 on Windows 11, hardware WebGL through AMD Radeon / ANGLE Direct3D11. Full-screen screenshots use the actual loaded scene; typography-only comparison crops hide surrounding graphics. Mobile checks are Chrome viewport emulation. Physical Android/iPhone and Safari were unavailable. This correction does not establish new animation-performance measurements.

The supplied Library image resolved as `image(20261104-173216).png` (573 × 557), but the tool returned metadata without viewable pixels. The parent's direct image description was used, and the defect was independently reproduced on the live preview.

Backup: `backup/pre-type-mask-2026-11-04` at `bf533c483ec39edb70d15f36cc6242d922e37c80`. Only the preview repository and feature branch are updated. Production remains `6e18031700ae46a1689e48f23ee1ecb6149da860`. No paid operation; cumulative known spend remains 6 / 60 Higgsfield credits.

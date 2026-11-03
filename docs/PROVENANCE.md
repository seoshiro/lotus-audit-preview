# Content and asset provenance

Public GitHub profile: https://github.com/seoshiro. Working identity supplied by the parent: Beibars Ileskhan / seoshiro, localized as Бейбарс Илесхан and Бейбарыс Ілесхан. No private contact details were used. No claim of sole manual authorship, employment, paid clients, project revenue, awards, or independently certified accessibility is made.

## Project evidence inspected on 1 October 2026

| Project | Source revision | Repository evidence |
| --- | --- | --- |
| PERCH | `952559edaf2d036d9e2205d733cfbd6a220b5a78` | README, `docs/ARCHITECTURE.md`, `docs/AUDITS.md`, model and renderer source; fresh live studio and comparison captures |
| FORME | `d3760d8fb69f77e3cf41dd5ef911506f7552c67c` | README, `docs/ENGINEERING.md`, `ASSETS.md`, `docs/asset-provenance.json`, source files, media screenshots |
| SELVEDGE | `3ddd86854e1b89d87425f120a4bb186cf8fd42e1` | README, architecture, provenance and verification notes; original workroom/gallery screenshots |
| GuideCheck | `205836afe5ebc86adea7a5e56e21d25e00682c1b` | README, `VALIDATION.md`, `QA.md`, source, real browser workspace screenshots |
| ArchiveGuard | `510929f0155367aa9f2d4422fd7ad8308c413aab` | README, validation, design and third-party notes, source, actual conflict/export screenshots |

Read-only clones are in the sibling `sources/` folder. SELVEDGE was inspected in its existing neighboring checkout. Neither neighboring source repository was modified.

## Screenshots

All portfolio project screens are actual repository captures. Original PNGs are preserved in `docs/originals/`; production WebP versions live in `public/assets/`. No fake product screen, private file, or competitor screenshot was created.

- FORME: `docs/media/editor.png` and `docs/media/design-kit.png`. Source code/screens are MIT; the demo includes Unsplash photography covered by the source project's retained provenance and free Unsplash license. These images are used as screenshots of the real application, not as a stock-photo service.
- PERCH: `scripts/capture-perch.mjs` captures the actual deployed furnished demo at 1440 × 1000, then creates an independent copy, changes its sofa width, and captures the native comparison dialog at 980 × 620. The app's original parametric assets and code are MIT. Full PNGs are retained; WebP copies use quality 0.87 with no cropping. No source project was modified.
- SELVEDGE: `docs/gallery/02-studio.png` and `03-revisions.png`. Original garment illustration and After Hours artwork, with synthetic project data, MIT.
- GuideCheck: `evidence/guidecheck-desktop.png` and `guidecheck-mobile.png`. Original synthetic Atlas demo data in the real workspace.
- ArchiveGuard: `docs/screenshots/desktop-conflict.png` and `desktop-export.png`. Real application with original synthetic archive fixtures.

`scripts/optimize-assets.mjs` creates WebP copies at quality 0.87, preserving screenshots' color/layout. It crops only these specific images:

- GuideCheck gallery: x0, y180, 1440 × 1050, emphasizing the guide and comparison.
- ArchiveGuard gallery: x30, y1180, 1220 × 820, emphasizing the metadata conflict and explicit decisions.
- GuideCheck case detail: x0, y2600, 390 × 870, emphasizing the mobile human-review form.

No content is added to those crops. Full desktop screenshots remain available on the case pages. Dimensions, byte sizes, and crop coordinates are recorded in `docs/assets.json`.

## Fonts and original graphics

ORBIT was added on 2 October 2026 from source revision `3da05ace8efabbca99ecaeb494387a4692b0e305`. Its main and construction screenshots were captured from the actual verified production preview at 1440 × 1000. Original PNGs are retained in `docs/originals/orbit.png` and `orbit-detail.png`; the three production WebP files use quality 0.9 without cropping or added content. The spacecraft and schematic Earth are original parametric geometry and illustration. No generated mock screen or external rendering service was used. See [orbit-integration.md](orbit-integration.md).

- Manrope variable TTF copied from FORME's vendored Google Fonts asset. SIL OFL 1.1; license retained at `public/fonts/Manrope-OFL.txt`.
- IBM Plex Sans Regular and Medium WOFF2 copied from ArchiveGuard's official vendored IBM font package. SIL OFL 1.1; license retained at `public/fonts/IBMPlexSans-LICENSE.txt`. Used across all three locales in the Lotus release.
- Favicon, wordmark treatment, layout, CSS interactions, and parametric ribbon geometry were created for this portfolio. The ribbon is simple mathematical geometry, rendered locally with Canvas2D; no image-generation or paid rendering service was used.

## References

The parent provided research on Dennis Snellenberg, Rauno Freiberg, Emil Kowalski, Brittany Chiang, and Lynn Fisher. Their work informed hierarchy, clarity, and restrained interaction principles. No source code, screenshots, logos, or other site assets were copied.

The current Lotus release bundles Three.js for its optional WebGL enhancement; the MIT license is retained in `public/licenses/three-MIT.txt`. All versions are pinned in `package-lock.json`. Earlier audit results above describe their dated releases, not the current dependency state.

## Lotus release, 3 November 2026

The new original Blender model, its geometry checks, source files and free asset ledger are documented in `lotus-model.md`. No concept screen is embedded as the page. The three featured screenshots were retained from real working applications and rechecked against live project flows; see `content-audit-lotus.md`. Cormorant Garamond was obtained from the official google/fonts repository and compressed locally to WOFF2 without dropping glyphs; its OFL license is in `public/fonts/CormorantGaramond-OFL.txt`. Both active font families cover the Latin, Cyrillic and Kazakh characters used in this portfolio. Manrope is retained as a historical vendored asset and is no longer requested by the Lotus page.

Transparent Blender posters were encoded locally with Sharp as 1200px WebP, quality 90 and alpha quality 100. This is encoding of the same accepted model render, not another generated variant. Higgsfield was checked read-only (Pro, 610 credits); no generation, trial activation or purchase occurred.

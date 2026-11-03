# Restored public cases

Checked 2026-11-03T20:38:19.587Z.

ITER, AYQYN, and SIDEREAL were public case studies in the prior deployed source. They are restored to the eleven-project collection with their original live/source/evidence URLs, English/Russian/Kazakh text, and actual screenshots.

## Source of truth

- [Pinned portfolio source](https://github.com/seoshiro/portfolio-constellation/tree/bdffb0e339ac92eb24a8ea80152a76fc44528d46), commit `bdffb0e339ac92eb24a8ea80152a76fc44528d46`.
- [Project metadata](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/src/data/projects.ts).
- [Localized project copy](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/src/data/new-copy.ts).
- [Original screenshot assets](https://github.com/seoshiro/portfolio-constellation/tree/bdffb0e339ac92eb24a8ea80152a76fc44528d46/public/assets).
- [Original credits](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/credits.html).

The source was fetched read-only to `../prior-portfolio-source` and checked out at the pinned commit. No source remote was changed.

The nine original static pages were read and checked for language, canonical URL, case title, screenshot references, and intrinsic image dimensions:

- [projects/iter.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/projects/iter.html)
- [en/projects/iter.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/en/projects/iter.html)
- [kk/projects/iter.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/kk/projects/iter.html)
- [projects/ayqyn.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/projects/ayqyn.html)
- [en/projects/ayqyn.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/en/projects/ayqyn.html)
- [kk/projects/ayqyn.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/kk/projects/ayqyn.html)
- [projects/sidereal.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/projects/sidereal.html)
- [en/projects/sidereal.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/en/projects/sidereal.html)
- [kk/projects/sidereal.html](https://github.com/seoshiro/portfolio-constellation/blob/bdffb0e339ac92eb24a8ea80152a76fc44528d46/kk/projects/sidereal.html)

## Content and behavior preserved

All ten existing ProjectCopy fields are retained for each locale, with exactly three implementation decisions. AYQYN's additional source context is appended to its caption to preserve the existing interface: Codex assisted the code/interface/materials; the supplied YOLO and MediaPipe models were not trained by the team. The shared truthful AI-assisted role text is unchanged.

ITER remains an educational navigator for a fictitious building, without a claim of certified physical accessibility. AYQYN remains a local proctoring prototype whose observations require human review; its browser replay does not measure camera accuracy. SIDEREAL retains its four-bar/three-voice scope and stated export/device limits. No claims, impact metrics, employment, or awards were added.

The existing pageHref helper still explicitly includes `?lang=en`, `?lang=ru`, or `?lang=kk` for every generated case link. Compatibility aliases and build inputs are integrated separately by the parent implementation.

## Exact asset copies

The six original WebP files are byte-for-byte copies, without generation, cropping, recompression, or color changes. The pinned source has no separate preview files; each new `-preview.webp` is a byte-for-byte duplicate of its original cover. Dimensions below were read from the actual files with sharp, rather than inferred from markup.

| Local file in public/assets | Pixels | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `iter.webp` | 1440 × 1000 | 85000 | `46e93398a20613e4dba96ae6f78477ffc64468ab242050c6d24ed0908a37540f` |
| `iter-preview.webp` | 1440 × 1000 | 85000 | `46e93398a20613e4dba96ae6f78477ffc64468ab242050c6d24ed0908a37540f` |
| `iter-detail.webp` | 1440 × 1000 | 90378 | `3dd0b95d52ee305dab7fdfca4e45b8d46c1e8496d5a415dbd5a3c628d538f6dd` |
| `ayqyn.webp` | 1800 × 1200 | 132374 | `a955087afda2ead4f06dd575b8b6c246719f2935e2da657c8ab9c398d7e293bf` |
| `ayqyn-preview.webp` | 1800 × 1200 | 132374 | `a955087afda2ead4f06dd575b8b6c246719f2935e2da657c8ab9c398d7e293bf` |
| `ayqyn-detail.webp` | 1800 × 1200 | 103160 | `d96ea2926d71895db024764f770f26d32b79bc7844f05d178a0dd5a1c0d71fea` |
| `sidereal.webp` | 1920 × 1080 | 63350 | `16f0bfd90a77219147ec3ccfd7e7635531bdd68d90b611f5f39f2da2b95bed69` |
| `sidereal-preview.webp` | 1920 × 1080 | 63350 | `16f0bfd90a77219147ec3ccfd7e7635531bdd68d90b611f5f39f2da2b95bed69` |
| `sidereal-detail.webp` | 390 × 844 | 27512 | `0bc66227c9880710a61f895d0b5b23af9b56f2b5956fcfb7ea0b337dd27fbc69` |

The screenshot images were visually inspected. AYQYN's cover is the real v0.2.4 test-profile review screen, using a licensed test photo rather than exam participant data. Its visible smartphone photograph is James Sutton's [Smartphone photographer (Unsplash)](https://commons.wikimedia.org/wiki/File:Smartphone_photographer_(Unsplash).jpg), CC0-1.0. [Media provenance](https://github.com/seoshiro/ayqyn-local/blob/main/docs/media/provenance.json) and the [fixture attribution catalog](https://github.com/seoshiro/ayqyn-local/blob/main/web/fixtures/attribution.json) document the actual capture process and fixture sources. Screenshots contain the original application interfaces and their original language; surrounding case content is localized.

## Link checks

Read-only HTTPS GET checks returned HTTP 200:

| Project | Public application | Returned title |
| --- | --- | --- |
| ITER | https://iter-navigator.vercel.app/ | Iter — учебный навигатор |
| AYQYN | https://seoshiro.github.io/ayqyn-local/replay/ | AYQYN · Локальный прокторинг |
| SIDEREAL | https://seoshiro.github.io/sidereal/ | SIDEREAL — musical observatory |

The GitHub connector also successfully read the linked [ITER README](https://github.com/seoshiro/iter-navigator/blob/main/README.md), [AYQYN localization QA](https://github.com/seoshiro/ayqyn-local/blob/main/docs/LOCALIZATION_QA.md), and [SIDEREAL QA](https://github.com/seoshiro/sidereal/blob/main/docs/QA.md). HTTP success confirms reachability at check time, not a fresh functional audit of those applications. No public messages were submitted and no camera, microphone, or model inference was started.

## Local verification

- Targeted ESLint for `src/content.ts`: passed.
- Migration assertions: passed for eleven unique project records, all nine exact localized copies (including the preserved AYQYN context), three decisions per translation, explicit-language links in both link nesting modes, and source-identical bytes for all nine assets.
- Typecheck initially identified the parent-owned `src/pavilion.ts` coordinate record as missing the three new project IDs. That integration was reported to the parent; final build, artifact, compatibility-route, and browser checks belong to the complete implementation.

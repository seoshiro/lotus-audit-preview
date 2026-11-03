# BEIBARS / LOTUS

[Live portfolio](https://seoshiro.github.io/) · [GitHub profile](https://github.com/seoshiro)

An ivory and graphite portfolio for Beibars Ileskhan, an AI-assisted product creator. A single original mechanical lotus unfolds with normal page scrolling. Five rigid ceramic and silver petals rotate at their base hinges; the same model moves into the selected-work index. Ordinary HTML links provide every route independently of the canvas.

The selected projects are **PERCH**, **SELVEDGE**, and **FORME**, using their actual application captures. Eight additional projects remain in the expandable archive. All eleven existing full HTML case URLs and their EN/KK addresses are preserved. Legacy language routes retain translated static content without JavaScript and otherwise continue to an explicit locale URL. The copy distinguishes Beibars's direction, tool integration and visual review from AI-assisted implementation, and acknowledges that independent coding is an ongoing learning process.

## Run locally

Node 24 is used by the release workflow.

```sh
npm ci --ignore-scripts
npm run dev
```

Production preview and verification:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run preview
npm run test:browser
```

The preview serves only `dist` on `127.0.0.1:5317`. Install the Playwright Chromium browser for Linux CI; the local Windows configuration uses installed Chrome. No backend, analytics, remote font service, paid generation, or runtime API key is required.

## Read the code

| File | Responsibility |
| --- | --- |
| `src/lotus-copy.ts` | Page copy in RU, EN and KK; three featured project IDs |
| `src/content.ts` | Real project facts, case narratives, evidence links and image dimensions |
| `src/render.ts` | Semantic home and complete case-page HTML |
| `scripts/generate.ts` | Generates readable Russian static pages before bundling |
| `src/main.ts` | Language preferences, navigation context, active project and progressive enhancement |
| `src/lotus-scene.ts` | One WebGL scene, model loading, base-hinge transforms, camera, picking and disposal |
| `src/style.css`, `src/case.css` | Shared materials, responsive layout and case typography |
| `source-assets/lotus/` | Original Blender source, deterministic scripts and geometry audit |
| `.github/workflows/publish.yml` | Verifies this exact repository revision, then publishes its artifact to Pages |

Start with the copy and renderer. Then follow `enhance()` in `main.ts` into `startLotus()`. The model contract is documented in [lotus-model.md](docs/lotus-model.md). The normalized scroll progress belongs only to the introductory section; no wheel or touch scrolling is intercepted.

## Access and recovery

RU/EN/KK switches retain scroll position and project selection; the chosen language is stored locally. Full case navigation stores return context in session storage. The mobile menu supports Escape and returns focus to its button. Reduced motion shortens the introduction and uses still poses. A manual motion control pauses the current unfolding pose.

Text and real project links render before the model. A failed GLB, denied WebGL or lost context leaves the transparent model posters and useful content available. JavaScript-disabled visitors receive the complete static page and native case navigation. No synthetic progress indicator or dependency on a video is used.

## Assets and verification

The original GLB is about 1.52 MiB and has exactly five independently transformable hinges. The editable `.blend`, generator, proof renders and collision audit are versioned outside the deployed public directory. The two 1200px WebP posters total about 62 KB. Cormorant Garamond and IBM Plex Sans are hosted locally with their OFL licenses; the full Latin/Cyrillic/Kazakh glyph coverage was checked. All reference screens were studied as concepts, never embedded in place of an interface.

See [content audit](docs/content-audit-lotus.md), [browser checks](docs/lotus-browser-tests.md), and [release notes](docs/LOTUS-RELEASE.md) for concrete checks and limits. Viewport emulation is not a physical-phone test. Historical design notes remain in `docs`; the Lotus release supersedes the earlier pavilion/constellation presentation.

## Previous version

The pre-Lotus repository revision is preserved at `backup/pre-lotus-2026-11-03` (`4c8a892da5e10de01746821be8e8b648dc5c66ed`) and in a local Git bundle. Its workflow pinned the earlier `portfolio-constellation` source; that separate repository is untouched. Rollback can use a regular revert of the Lotus release commit and the restored workflow, retaining the full history. Do not force-push or delete other repositories.

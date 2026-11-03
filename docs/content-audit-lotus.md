# Lotus portfolio content audit

Checked 3 November 2026 (UTC). Scope: `src/content.ts`, the portfolio brief, public project repositories, and the live demonstrations below. The release contains eleven cases: the original eight records plus ITER, AYQYN, and SIDEREAL restored from the pinned prior public portfolio. Their exact copy and screenshot provenance are recorded in [Restored public cases](legacy-case-migration.md). Existing case IDs, exported types, dimensions, metadata, links, and image assets are preserved. No remote source, deployment, or project data was changed by this audit.

## Positioning

The brief describes Beibars's role as AI-assisted product creation: define tasks, select and connect tools, direct AI, and evaluate the visual result. Independent coding and deeper technical understanding are skills he is learning.

The EN, RU, and KK metadata, hero, case-study role, about text, process, and footer now say this explicitly. “Developer / interface maker” was replaced. The case studies describe implementation behavior without claiming Beibars manually wrote all code or independently engineered every subsystem. PERCH's geometry is called procedural, and its existing screenshots are no longer described as freshly captured in this audit. No employment, clients, commercial results, experience duration, awards, testimonials, or impact metrics were added. GitHub remains the confirmed contact channel.

## Recommended primary cases

Use **PERCH → SELVEDGE → FORME** for the main sequence. All three have a working public demo, inspectable source, actual screenshots in this portfolio, useful end-to-end actions, and stated practical limits. The other eight case pages remain available in the archive.

| Case | Source checked | Supported product story | Boundary retained |
| --- | --- | --- | --- |
| PERCH | [README](https://github.com/seoshiro/perch-studio/blob/main/README.md), [model](https://github.com/seoshiro/perch-studio/blob/main/src/model.ts), [application](https://github.com/seoshiro/perch-studio/blob/main/src/App.tsx), [package](https://github.com/seoshiro/perch-studio/blob/main/package.json) | React/TypeScript/Three.js; linked plan and room views, twelve furniture types, local layout alternatives, JSON/SVG/PNG/report outputs. | Rectangular-room furnishing study; illustrative materials and fit checks; browser-local storage; no construction/safety certification or cloud collaboration. |
| SELVEDGE | [README](https://github.com/seoshiro/selvedge-studio/blob/main/README.md), [storage](https://github.com/seoshiro/selvedge-studio/blob/main/src/storage.ts), [exports](https://github.com/seoshiro/selvedge-studio/blob/main/src/export.ts), [package](https://github.com/seoshiro/selvedge-studio/blob/main/package.json) | React/TypeScript; artwork placement, colorways, named revision comparison, IndexedDB saves, Canvas PNG and raster PDF visual proofs. | Visual proof, with production dimensions, colors, and printing to be confirmed with a printer. |
| FORME | [README](https://github.com/seoshiro/forme-studio/blob/main/README.md), [storage](https://github.com/seoshiro/forme-studio/blob/main/src/storage.ts), [exports](https://github.com/seoshiro/forme-studio/blob/main/src/exports.ts), [package](https://github.com/seoshiro/forme-studio/blob/main/package.json) | React/TypeScript; reference library, editable moodboard, design kit, worker image processing, IndexedDB, validated project archives. | Fixed 1400 × 1000 board, single-browser data, Russian live interface, no cloud collaboration or infinite canvas. |

These are implementation facts from the current source, not a claim of unaided personal authorship. Historical test totals in those repositories were not copied into portfolio claims.

## Live checks performed in this audit

Installed headless Chrome, isolated temporary browser contexts, 1440 × 1000 viewport. All four public pages returned HTTP 200 and produced no uncaught page errors during the checks. Initial sandbox DNS failure was resolved by running the same read-only checks with network access.

| Demo | Actions checked | Observed result |
| --- | --- | --- |
| [PERCH](https://seoshiro.github.io/perch-studio/) | Select sofa; change width 2.2 → 2.5 m; undo/redo; reload; duplicate layout; compare; export JSON. | Width persisted after reload; comparison showed two plans; exported JSON contained two layouts and seven items in the first layout. |
| [SELVEDGE](https://seoshiro.github.io/selvedge-studio/) | Change print width to 28 cm; reload; save and compare a named revision; export JSON, PNG, and PDF. | Placement persisted; comparison showed two garment views; JSON contained three variants and two revisions; PNG signature and PDF header valid (851,621 and 465,385 bytes). |
| [FORME](https://forme-studio-coral.vercel.app/) | Create a local collection; add and edit a board note; reload; export PNG and `.forme` archive. | Edited note persisted; PNG signature and 1400 × 1000 dimensions verified; project archive had ZIP signature (40,282-byte PNG, 815-byte archive). |
| [ITER](https://iter-navigator.vercel.app/) | Open published application; inspect initial controls and route result. | 3D/2D controls, route conditions, closure simulation, text steps, and initial 40 m model route visible. No journal message was sent. |

The primary checks used temporary local browser data only. Downloads were examined in temporary browser storage and were not added as portfolio assets. They establish the listed actions in Chrome, not full application correctness, accessibility certification, physical-phone behavior, or performance scores. The portfolio's own responsive and browser verification is separate.

## Brief candidates

- **ITER Navigator is retained as an archive case.** Its [README](https://github.com/seoshiro/iter-navigator/blob/main/README.md) and [package](https://github.com/seoshiro/iter-navigator/blob/main/package.json) describe React/TypeScript/Three.js graph routing and the Vercel → Render → Neon journal. The live planner loaded successfully. Its building and accessibility data are fictional, route distances belong to an educational graph, and the journal is unverified user text. No claim of safe real-world navigation should be made. A later audit of the pinned prior deployment recovered its existing localized case and actual screenshots; those were restored with AYQYN and SIDEREAL to preserve the public collection and old URLs. See [migration evidence](legacy-case-migration.md).
- **AssetControl's current public repository is [seoshiro/AssetControl](https://github.com/seoshiro/AssetControl)**. The [README](https://github.com/seoshiro/AssetControl/blob/main/README.md) describes an equipment lifecycle diploma MVP, local Docker demo, roles, assignment/return, repairs, finance, inventory, reporting, and audit history. [Frontend](https://github.com/seoshiro/AssetControl/blob/main/frontend/package.json) and [backend](https://github.com/seoshiro/AssetControl/blob/main/backend/package.json) confirm React/TypeScript and Express/Prisma. The reviewed README provides localhost demonstration addresses. A current public hosted demonstration and matching assets were not established here, so it is deferred rather than presented as verified production software.
- **AituDesk** is not added: no independently checked ready case or source assets were required for the selected three.

## Preserved archive

README and package checks also confirmed the broad positioning and stack of [ORBIT](https://github.com/seoshiro/orbit-studio), [RESON](https://github.com/seoshiro/reson-studio), [LUMEN](https://github.com/seoshiro/lumen-lens), [GuideCheck](https://github.com/seoshiro/guidecheck), and [ArchiveGuard](https://github.com/seoshiro/archiveguard). Their existing case data and screenshots are retained. Their narrow boundaries remain visible: educational orbital model; illustrative speaker construction; illustrative optical object; human review statements; JPEG sample preflight. Their full live workflows were not rerun during this content audit.

ITER, AYQYN, and SIDEREAL bring the archive to eight cases and the complete collection to eleven. Their original localized case text, actual images, and live/source/evidence URLs were recovered from commit `bdffb0e339ac92eb24a8ea80152a76fc44528d46` of the prior public portfolio, with source and byte checks documented in [Restored public cases](legacy-case-migration.md). AYQYN's replay is a human-reviewed prototype, not a camera-accuracy benchmark; SIDEREAL keeps its stated musical/export limits. The restoration adds no unaided coding, real-world safety, accuracy, commercial, or impact claims.

## Local validation

- `node node_modules/eslint/bin/eslint.js src/content.ts` passed.
- A direct import/assertion check passed for the complete EN/RU/KK key shape, eleven project entries per locale, three decisions per project, and explicit AI wording in each locale's role text.
- The integrated browser pass checked all eleven cases and locale compatibility routes; its 30 passing checks and verification scope are documented in [Lotus browser verification](lotus-browser-tests.md). Full build and artifact results belong to the release verification record.

No paid service, generated asset, credential, backend message, deployment, or publication was used for this audit.

# LOTUS audit revision — isolated preview

The complete owner audit dated 4 November 2026 was read, including the acceptance criteria and the distinction between fallback observations and unverified 3D behavior.

Production baseline: `6d94ef874c2f4e8a6ec4b8de7b92b88c6a5b7078`.
Backup: `backup/pre-lotus-audit-2026-11-04`; a verified full-history bundle is retained outside the repository. Revision branch: `feat/lotus-audit-preview`. The separate `seoshiro/lotus-audit-preview` repository hosts review builds; pushing it cannot deploy the production repository.

## Changes

- Legacy `#about` / `#contact` URLs migrate to semantic petal routes. Standalone case navigation now uses those routes directly; language, history and focus are preserved.
- The first screen names Beibars and the actual work: AI-assisted interactive websites and web-product prototypes. The owner explicitly confirmed the public Telegram and email used in Contact.
- PERCH, SELVEDGE and FORME show their intended task, individual product choices and tradeoffs, a documented correction, a complete workflow and an honest AI-assisted role. This content is shared by the reader and standalone cases in RU/EN/KK. No interviews, commercial results, before/after images or manual coding claims were invented.
- Selected projects include real, larger product screenshots and distinct case/demo actions. Readers emphasize the demo and offer a copyable case URL with a selectable-field fallback when clipboard access fails. All eleven projects have explanatory text in the work menu.
- The existing Tripo master was locally adapted in Blender: smaller connected center, gathered bases, individually raised rear petals, deeper cupping, warm base color and blush edges. The directional key, fill, camera and grounded soft shadow were reviewed together. Petals still do not receive their own shadow map; VSM blurs only the cast ground shadow, avoiding the prior self-shadow acne.
- Measured GLB transfer drives the ink stroke when total size is known. Download completion changes to an indeterminate material-preparation stage; there is no invented overall percentage or forced delay. Failure exposes complete lightweight navigation. A cached session skips the introduction.
- One static paper texture and diffuse cool light pool support the scene. Three small decorative sprites come from the same Tripo petal, fall and settle at the margins, do not receive pointer input, and disappear outside overview or with reduced motion. No extra animation engine or paid asset was added.
- Empty scroll height removed. The one-screen scene does not intercept wheel input; readers scroll natively. Lenis remains pinned in the chosen stack but is not instantiated merely to manufacture scrolling.
- Fallback posters are transparent captures of the actual model, with all HTML labels removed. `object-fit: contain` preserves proportions. All fallback navigation is real HTML.

## Evidence and boundaries

Verification baseline: 11 content/state tests, 17 browser scenarios, typecheck, lint, production build and all 40 artifact pages. Browser checks include legacy routes in all languages, early static localization before the application loads, actual mesh picking, rapid input, all eleven standalone cases, no-JavaScript content, model failure, context loss, fallback sizing, clipboard failure and focus restoration. Axe checks cover the tested overview, selected and reader states; they do not establish complete accessibility conformance. Exact public revision and results are recorded in [QA.md](QA.md).

Both Blender audits check 21 opening samples and 25 focused samples, with zero inter-petal intersections. Each mesh has zero boundary or nonmanifold edges. Desktop: 61,954 triangles / 2,037,816 bytes; mobile: 24,614 triangles / 853,848 bytes. The original GLB remains unchanged (SHA-256 `e68a7f0d8c5391c0f5fe73bd52abe9569a5aba675716a893dbd1fb7c5d43edb0`). Editable `.blend`, export scripts and both GLBs are retained.

The five actual in-browser opening poses were inspected after model readiness, not by relying on the loading poster. Final published-preview measurements and continuous-motion review are recorded in `QA.md` after deployment. CPU render-call time and RAF intervals alone are not treated as frame-delivery measurements. Physical phones, Safari and assistive-technology certification are outside the available test environment.

Known layout boundary: at a very short 720 × 450 landscape viewport the selected content uses a real internal scroll area. At 320 × 640, 390 × 844, 1165 × 747 and 1440 × 900 the tested short previews fit without a redundant scrollbar.

Costs: no new generation. Existing Tripo job `4ccf52ab-d439-444b-ad96-3011e8a11578` cost 6 Higgsfield credits; total known spend remains 6 of the authorized 60. No subscription, purchase or paid hosting was activated.

## Content sources checked for this revision

- [PERCH README](https://github.com/seoshiro/perch-studio/blob/main/README.md), [architecture](https://github.com/seoshiro/perch-studio/blob/main/docs/ARCHITECTURE.md), [audit corrections](https://github.com/seoshiro/perch-studio/blob/main/docs/AUDITS.md).
- [SELVEDGE README](https://github.com/seoshiro/selvedge-studio/blob/main/README.md), [upload correction and verification](https://github.com/seoshiro/selvedge-studio/blob/main/docs/VERIFICATION.md).
- [FORME README](https://github.com/seoshiro/forme-studio/blob/main/README.md), [engineering and scoped verification](https://github.com/seoshiro/forme-studio/blob/main/docs/ENGINEERING.md).

Descriptions explain choices observable in the delivered products and their documented consequences. They do not claim undocumented personal research or attribute every automated check to a manual action by the owner.

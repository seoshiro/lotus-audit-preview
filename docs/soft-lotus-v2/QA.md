# V2 verification record

Historical V2 baseline. The subsequent [LOTUS audit revision](../lotus-audit/QA.md) supersedes the layout, performance and contact status described here; the owner has since confirmed Telegram and email for the isolated audit preview.

2026-11-04. This records execution-agent checks. Independent parent visual QA is separate and is not claimed here.

## Visual inspection and decisions

The actual generated source was viewed from four angles. The composed five-petal flower was then inspected in the browser at 0/25/50/75/100% bloom, in selected PERCH, SELVEDGE, FORME, About and Contact, and through case/return. Real screenshots are used throughout. The original generated surface was accepted after local Blender seam repair and shaping; no second generation was used.

Specific defects found and corrected: glossy material and overly separated initial petals; a tiny duplicated source seam; mobile closed-petal intersections caused by using a reduced profile; self-shadow acne halfway through morphing; stale SplitText headings when switching projects; oversized screenshot anchors at 720 x 450; a low-contrast caption; duplicate landmark names; static featured links that initially used the wrong project ordering.

Final surface is matte ivory with restrained blush edges. Closed petal seams remain visible by design. Project screenshots are semantic HTML projected to real 3D anchors, not texture-baked into the geometry. All five petals curve continuously; the case reader is HTML. The model was locally accepted only after these visual checks.

## Automated verification

- Lint, TypeScript and 10 content/state tests.
- Production build and 40 HTML artifact checks, including every local resource and both optimized model contracts.
- Browser scenarios cover the complete PERCH flow and exact focus return; all five selections in RU/EN/KK including updated headings; native reader accessibility; no JavaScript; WebGL denial and context loss; pending/failed models; reduced-motion changes; repeated mobile selection; axe at 1440, 320 and 720 widths; all eleven real cases in three languages at 360px; all legacy EN/KK case and home addresses and static locale pages.
- A separate bare-surface test checks actual raycasting and drag cancellation, outside the HTML petal labels.
- Blender audit: five manifold petals, no boundary edges, no inter-petal intersections at 21 bloom samples or the per-petal focus samples. These are discrete geometric checks, not a substitute for visual motion review.

## Performance and scope

Measured in headless Chrome 156.0.8078.76 on Windows, ANGLE AMD Radeon Graphics / Direct3D11. Production flow was sampled at 1440x900, 390x844, 320x640 and 720x450. Active RAF median was about 7ms and p95 about 7.2ms in this environment. These are scheduling intervals, not a physical-phone FPS guarantee. The canvas retained one backing size throughout each flow; no per-frame canvas resize was observed. No uncaught page errors were recorded. Startup long tasks reached 138ms on desktop and 56–58ms in the emulated smaller viewports.

Desktop GLB: 61,954 triangles, 2,024,228 bytes. Mobile: 24,614 triangles, 847,496 bytes. Network timings are localhost measurements and do not represent public/mobile network loading. The Three.js loader chunk is about 621kB uncompressed / 157kB gzip; Vite reports its standard large-chunk advisory. No new external runtime calls or analytics were added.

Physical phone testing, Safari/Firefox and actual browser 200% zoom have not been claimed. The narrow/short layout was tested directly at 720x450 in addition to phone viewports. Automated accessibility checks do not replace assistive-technology user testing.

Current proof captures are in `proofs/`. Detailed local frame records are in `evidence/lotus-v2/release-review/performance.json`; source and geometry audits are under `art/soft-lotus/`. Publication and exact deployed revision are recorded in the final handoff, not inferred from these local tests.

## Independent review follow-up

The production React title still contained `Lotus V2 preview`; it now uses the owner's name and localized headline, with a browser assertion after every language change. The static page title was already a portfolio title.

WebGL-disabled fallback at 1165x747 had faded artwork, an inaccurate petal-selection hint and an unnecessarily constrained preview. The fallback now keeps the poster at full opacity, presents a stronger semantic menu, explicitly directs visitors to that menu, hides inactive projected controls and disables mesh picking. Short previews fit without internal scrolling at 1165x747, 390x844 and 320x640. Mobile fallback positions the artwork above a taller text panel; closing a preview returns keyboard focus to its visible menu control. Normal 3D navigation remains separate from this failure state.

The four short entries (three projects and Contact) are covered in RU/EN/KK at all three sizes, including axe and exact focus return. The suite now has 14 browser scenarios. Screenshots are in `proofs/fallback-*.png`.

Contact review: the supplied original and V2 briefs and the pre-lotus content source provide GitHub as the confirmed channel. No direct email, telephone or messenger contact was established from those materials. Git author metadata is not treated as permission to publish a contact address. The Contact entry therefore retains the existing GitHub link.

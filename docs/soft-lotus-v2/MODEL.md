# Soft lotus: source and editable model

The flower uses the actual Tripo H3.1 master petal from job `4ccf52ab-d439-444b-ad96-3011e8a11578` (12k, untextured). One generation cost 6 Higgsfield credits. No additional generation was needed for this candidate. The project allowance is 60 credits including these 6; the parent coordinates the ledger and future operations.

Original, unchanged: `art/soft-lotus/source/tripo-4ccf52ab-original.glb`, 369,380 bytes. SHA-256: `e68a7f0d8c5391c0f5fe73bd52abe9569a5aba675716a893dbd1fb7c5d43edb0`.

The AI reference and generated master provide the petal surface. Local Blender work removes one detached fragment, repairs a small duplicated seam, builds five distinct copies, adds soft vertex colors and continuous `Bloom` and `Focus` shape keys, and exports semantic anchors. This is not an image replacing a 3D interface. Project images are actual screenshots already used by the portfolio; the central stamen is locally authored geometry.

## Deliverables

- `art/soft-lotus/soft-lotus-editable.blend`: editable desktop flower, five petals, shape keys and materials.
- `art/soft-lotus/build_flower.py`: authored, reproducible Blender preparation and audit.
- `public/models/soft-lotus-candidate.glb`: desktop, 2,024,228 bytes.
- `public/models/soft-lotus-mobile.glb`: mobile, 847,496 bytes.
- Four `soft-lotus-{bud,open}-{desktop,mobile}.png` posters: renders of this same model in the site, for loading and accessible fallback.

Both GLBs use bundled EXT_meshopt_compression, with no remote decoder, textures or model fetches. The desktop guide is 80k triangles; mobile is 30k; the production artifact check calculates the exact geometry count and enforces these limits and a 3 MiB asset limit. Shadow passes are not included in that geometry count.

## Geometry and motion checks

`candidate-audit.json` and `mobile-audit.json` record five manifold petals, zero boundary edges and zero nonmanifold edges. Twenty-one bloom poses and five focus poses per petal were checked for inter-petal intersections. All recorded checks are clear. These discrete geometric checks complement, rather than replace, visual inspection of continuous animation in the website.

One GSAP ticker advances Lenis, the continuous flower pose, projected HTML anchors and Three.js rendering. The five `Petal_*` and `Anchor_*` nodes are validated at load. The flower opens over 1.1 seconds; selection retargets the current pose over 0.55 seconds. Keyboard selection and reduced motion resolve immediately. The canvas does not resize per animation frame; idle frames do not render.

The source proof images show the generated petal. Older `art/soft-lotus/proofs/candidate-*.png` show an earlier local iteration and are **not release screenshots**. Current in-site captures are under `evidence/lotus-v2/`. The desktop filename retains its original candidate name for provenance; the runtime marks the locally reviewed model as accepted. Deployment must not be inferred from this document.

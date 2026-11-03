# Original mechanical lotus

The lotus is an original, locally authored Blender mesh. It uses no downloaded geometry, third-party textures, image-to-3D service, paid API, or generated video. The seven supplied concept images informed the shape and material direction; none is embedded into the asset.

## Files

| File | Purpose |
| --- | --- |
| `public/models/lotus.glb` | Browser asset, glTF 2.0, Y-up, closed rest pose |
| `public/assets/lotus-poster.png` | Transparent 1200 × 1200 closed fallback |
| `public/assets/lotus-open.png` | Transparent 1200 × 1200 open fallback |
| `source-assets/lotus/lotus-original.blend` | Editable original, Z-up; proof lights/camera/floor included |
| `source-assets/lotus/generate_lotus.py` | Complete deterministic geometry/material/export/render generator |
| `source-assets/lotus/polish_lotus.py` | Material/light correction after reviewing the first proofs |
| `source-assets/lotus/audit_lotus.py` | Read-only exported-coordinate, triangle, node and motion audit |
| `source-assets/lotus/proofs/closed.png`, `mid.png`, `open.png` | Final grounded proof renders |
| `source-assets/lotus/proofs/draft-01-*.png` | First inspected result, retained as review evidence |
| `source-assets/lotus/geometry-checks.json` | Shell topology and sampled motion bounds |
| `source-assets/lotus/export-audit.json` | Export structure, exact Y-up bounds and collision results |

The `.blend`, generator and proofs stay outside deployed `public`.

## Geometry and motion contract

Exactly five rigid petals surround a compact sphere. Each petal is one closed solid with an outer ceramic surface, inner silver surface and rounded connecting rim. Thickness is 0.046 model units. Each has 6,162 mesh vertices and 6,160 quad faces; every shell has zero open boundary edges and zero non-manifold edges. The complete exported asset has 80,980 triangles and six materials, with no textures, skins or animation clips. GLB size is approximately 1.52 MiB.

```text
Lotus_Root
├── Lotus_Core
├── Lotus_Base / Lotus_Base_Silver_Lip / Lotus_Base_Graphite_Foot
└── Lotus_Socket_0 … Lotus_Socket_4       fixed radial yaw
    ├── Lotus_Bracket_i_0 / 1            fixed hinge cheeks
    ├── Lotus_PinCap_i_0 / 1             fixed caps
    ├── Lotus_PinInset_i_0 / 1           fixed recesses
    └── Lotus_Hinge_i                    the animated pivot
        ├── Lotus_Petal_i_Ceramic_Silver_Solid
        ├── Lotus_MovingPin_i
        └── Lotus_Heel_i
```

Each shell's glTF mesh contains three material primitives. `GLTFLoader` may expose the primitives as mesh children below the named shell group. Traverse descendants to find their materials. The shell remains a single watertight solid in Blender.

All five `Lotus_Hinge_i` nodes have identity rest rotations and local translation `[0.5, 0.48, 0]`. Their socket parents hold the fixed radial yaw. The hinge's local axes in the GLB are +X radially outward, +Y up and +Z tangential. Apply **local Z rotation from 0 to −1.3264502315156905 radians** (0 to −76°), leaving socket rotations and hinge translations intact:

```ts
hinge.rotation.z = -1.3264502315156905 * opening;
```

`opening` is clamped to 0…1. No vertex deformation, morphing, scaling of individual petals or image replacement is required. The Blender authoring equivalent is positive local Y rotation.

## Materials and light

| Surface | Base sRGB | Metalness | Roughness |
| --- | --- | --- | --- |
| Pearl ceramic outside | `#F4F1EA` | 0.025 | 0.21 |
| Satin silver inside | `#B8B7B2` | 0.94 | 0.32 |
| Rounded silver rim | `#D5D1C9` | 0.82 | 0.25 |
| Champagne hinge/base | `#BFA179` | 0.78 | 0.35 |
| Silver core | `#CECBC4` | 0.87 | 0.36 |
| Graphite pin recess | `#48463F` | 0.73 | 0.33 |

The ceramic uses a small clearcoat. The silver has glTF anisotropy strength 0.35. Material colors are converted from sRGB to linear before export. No emissions or neon are present. Metallic surfaces need an environment map with broad light/dark reflection shapes; a uniformly bright ambient environment washes out their separation from ceramic. The Blender proof studio uses four softboxes, restrained ambient light and a neutral floor. Proof lights/floor/camera are excluded from the GLB. Transparent fallback images exclude the floor.

## Exact exported bounds

Coordinates below are glTF/Three.js Y-up, with the unscaled `Lotus_Root` at the origin. The complete model includes the fixed foot; its minimum Y is 0.0275.

| Pose | Min X/Y/Z | Max X/Y/Z | Size X/Y/Z |
| --- | --- | --- | --- |
| Closed | −1.110680, 0.027500, −1.110399 | 1.110680, 3.152903, 1.110774 | 2.221360, 3.125403, 2.221173 |
| Mid, 0.52 | −1.951624, 0.027500, −1.805738 | 1.951623, 2.836095, 2.002302 | 3.903247, 2.808595, 3.808040 |
| Open | −2.838739, 0.027500, −2.431487 | 2.838738, 1.585374, 2.983974 | 5.677477, 1.557874, 5.415460 |

The uppermost petal rises slightly at the start of opening, reaching Y≈3.1901 around progress 0.15. Frame the closed shape around Y=1.52 with an orthographic view height around 3.9. The fully open shape needs a view height around 7.0 with a raised camera. Blend camera/scale continuously as opening progresses. The open X span is about 2.56 times the closed span.

Example proof cameras in Three.js coordinates: closed `(0.6, 3.7, 9)` looking at `(0, 1.52, 0)`; open `(5.8, 8, 9)` looking at `(0, 0.9, 0)`. Adjust for the canvas aspect ratio.

## What was checked

- Read the complete brief, project `AGENTS.md`, premium-product-craft, and visually inspected all seven references before modeling.
- Inspected the first closed/open renders. Corrected the overly exposed pedestal, narrow upper petal profile, crowded apex rims and hinge caps crossing the lower ceramic silhouette.
- A triangle collision check found hidden basal tail intersections during early motion. Moving pivots outward and narrowing the basal neck removed these intersections without deforming petals.
- Blender `BVHTree` checked all ten petal pairs in 63 motion states: 21 synchronous, 21 forward stagger and 21 reverse stagger. Zero intersecting petal pairs remained. The stagger used a 0.03 phase offset per petal over the full 0…1 range.
- Checked each assembled petal is watertight and manifold. Across 21 synchronous poses, no petal vertex crosses the ground plane; minimum petal Y is 0.10725.
- Independently decoded the GLB, counted its triangles, checked hinge names/rest transforms/materials, and transformed actual exported vertex positions to obtain the Y-up bounds above.
- Visually inspected the corrected closed, intermediate and open proof renders and transparent fallbacks. Browser lighting remains a separate integration check; Blender appearance does not prove matching browser appearance.

These checks cover the moving shells against one another. Mechanical caps/barrels/cheeks have intentional assembled overlap; this is an artistic mechanism, not a manufacturing/CAD tolerance simulation. No performance claim is inferred from the polygon count. Runtime performance and browser interaction belong to the app checks.

## Rebuild

Blender 5.2.2 LTS was used. From the repository root in PowerShell:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background --python '.\source-assets\lotus\generate_lotus.py'
```

Read-only audit:

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.2\blender.exe' --background '.\source-assets\lotus\lotus-original.blend' --python '.\source-assets\lotus\audit_lotus.py'
```

## Asset ledger

| Asset/work | Source | Cost/credits | Review decision |
| --- | --- | --- | --- |
| Master petal, five instances, core and hinge geometry | Original deterministic Blender Python | $0; no service credits | Accepted after profile, base, apex and collision corrections |
| GLB and `.blend` | Local Blender export/save | $0 | Node/topology/export audit passed |
| Closed/mid/open proofs and transparent PNGs | Local Cycles, 1200 × 1200, deterministic seed 7 | $0 | Reviewed; satin reflection contrast corrected |

There were no paid generation calls, subscription changes, external asset purchases or third-party mesh licenses.

## Web delivery encoding

The accepted transparent PNGs remain as original renders. The page requests the same 1200px renders encoded locally to `lotus-poster.webp` (25,476 bytes) and `lotus-open.webp` (36,962 bytes), quality 90 / alpha quality 100. This retains the same geometry, composition and transparency. Browser material and camera checks are recorded separately in the release notes.

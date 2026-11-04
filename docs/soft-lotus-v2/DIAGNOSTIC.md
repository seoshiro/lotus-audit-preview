# V1 production diagnostic

Measured 2026-11-04 at 07:11 UTC against the local production build of `81da4e53946c62f37ecc71ccd59ab11161f4fc19`, with working WebGL and the real V1 model. Chrome 156.0.8078.76, Windows 10.0.26200, Ryzen 5 7535HS, AMD Radeon through ANGLE D3D11. 390 x 844 is viewport emulation, not a phone.

| Viewport / phase | Observed time | Canvas width/height assignments | Layout reads | Observed long tasks |
| --- | ---: | ---: | ---: | ---: |
| 1440 x 900 / opening | 1576 ms | 0 | 224 | 0 |
| 1440 x 900 / transfer to index | 1579 ms | 26 | 230 | 0 |
| 390 x 844 / opening | 1577 ms | 0 | 224 | 0 |
| 390 x 844 / transfer to index | 1555 ms | 24 | 224 | 0 |

Instrumentation counted canvas backing-store dimension assignments, layout-read calls and PerformanceObserver long tasks during scripted wheel input. It also sampled rAF callback scheduling: p95 7.3–13.6 ms, maximum 14.6 ms in these short samples, with none over 50 ms. These are not rendered FPS, GPU frame-time measurements or proof of smoothness on the user's device. Instrumentation itself adds some work.

The user's reported lag was not conclusively reproduced here. A concrete inefficient mechanism was confirmed: moving the canvas from the hero to the index repeatedly resizes its backing store. Source inspection also found a scroll RAF feeding a separate rendering RAF, multiple layout reads in each draw, and a full scene rebuild on language change. Their contribution to the user's lag remains an inference, not a proven diagnosis.

V2 keeps one canvas fixed in the viewport, uses a shared ticker, projects HTML labels after scene transforms, and retains the scene during language changes. Final performance must be measured again using the generated geometry; comparing the temporary zero-triangle wireframe with V1 would be misleading.

Raw local data and instrumented script: `evidence/lotus-v2/baseline/v1-production.json` and `evidence/lotus-v2/baseline-v1.mjs`.

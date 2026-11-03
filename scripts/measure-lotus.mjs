import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import os from "node:os";

const target = new URL(process.env.PREVIEW_URL || "http://127.0.0.1:5317");
if (!["127.0.0.1", "localhost", "[::1]"].includes(target.hostname)) {
  throw new Error("This measurement is restricted to the local portfolio preview.");
}
const output = resolve("evidence/lotus/performance.json");
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const results = {
  recordedAt: new Date().toISOString(),
  environment: {
    os: os.platform() + " " + os.release(),
    node: process.version,
    chrome: browser.version(),
    cpu: os.cpus()[0]?.model,
    logicalCpus: os.cpus().length,
    memoryGiB: Math.round(os.totalmem() / 1024 ** 3),
    headless: true,
    target: target.origin,
    network: "Unthrottled local loopback; fresh isolated browser context per viewport.",
    mobile: "390px viewport emulation only; no physical phone measurement.",
  },
  limits: [
    "Paint and resource timings describe this local Chrome session, not a public network.",
    "requestAnimationFrame intervals describe callback scheduling during wheel input; they are not verified rendering FPS.",
    "No Lighthouse score, network throttling, CPU throttling or physical-device claim.",
  ],
  measurements: [],
};
try {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    try {
      const page = await context.newPage();
      await page.goto(new URL("/?lang=ru", target).href, { waitUntil: "load" });
      await page.waitForSelector("body.lotus-ready", { timeout: 20000 });
      await page.evaluate(async () => { await globalThis.document.fonts.ready; });
      await page.waitForFunction(() =>
        globalThis.document.querySelector(".lotus-viewport")?.getAttribute("data-petals") === "5",
      );
      const initial = await page.evaluate(() => {
        const navigation = globalThis.performance.getEntriesByType("navigation")[0];
        const paints = globalThis.performance.getEntriesByType("paint")
          .map((entry) => ({ name: entry.name, startTimeMs: entry.startTime }));
        const resources = globalThis.performance.getEntriesByType("resource").map((entry) => ({
          path: new URL(entry.name).pathname,
          type: entry.initiatorType,
          durationMs: entry.duration,
          transferBytes: entry.transferSize,
          encodedBytes: entry.encodedBodySize,
          decodedBytes: entry.decodedBodySize,
        }));
        const canvas = globalThis.document.querySelector(".lotus-viewport canvas");
        const gl = canvas?.getContext("webgl2");
        const debug = gl?.getExtension("WEBGL_debug_renderer_info");
        return {
          navigation: {
            ttfbMs: navigation.responseStart - navigation.requestStart,
            domInteractiveMs: navigation.domInteractive,
            domContentLoadedMs: navigation.domContentLoadedEventEnd,
            loadEventMs: navigation.loadEventEnd,
            transferBytes: navigation.transferSize,
            encodedBytes: navigation.encodedBodySize,
            decodedBytes: navigation.decodedBodySize,
          },
          paints,
          resources,
          resourcesTotalTransferBytes: resources.reduce((sum, entry) => sum + entry.transferBytes, 0),
          resourcesTotalEncodedBytes: resources.reduce((sum, entry) => sum + entry.encodedBytes, 0),
          webglRenderer: debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl?.getParameter(gl.RENDERER),
        };
      });
      const distance = await page.locator(".unfold").evaluate((el) => el.clientHeight - globalThis.innerHeight);
      await page.evaluate(() => {
        const state = { running: true, timestamps: [] };
        globalThis.lotusCadenceProbe = state;
        const sample = (time) => {
          if (!state.running) return;
          state.timestamps.push(time);
          globalThis.requestAnimationFrame(sample);
        };
        globalThis.requestAnimationFrame(sample);
      });
      await page.mouse.move(10, viewport.height - 20);
      for (let step = 0; step < 16; step++) {
        await page.mouse.wheel(0, distance / 16);
        await page.waitForTimeout(120);
      }
      const cadence = await page.evaluate(() => {
        const state = globalThis.lotusCadenceProbe;
        state.running = false;
        const intervals = state.timestamps.slice(1).map((time, i) => time - state.timestamps[i]);
        const sorted = [...intervals].sort((a, b) => a - b);
        const percentile = (p) => sorted[Math.max(0, Math.ceil(sorted.length * p) - 1)] ?? null;
        return {
          callbacks: state.timestamps.length,
          sampleDurationMs: state.timestamps.at(-1) - state.timestamps[0],
          medianIntervalMs: percentile(0.5),
          p95IntervalMs: percentile(0.95),
          longestIntervalMs: sorted.at(-1) ?? null,
          intervalsOver50Ms: intervals.filter((value) => value > 50).length,
          finalSceneProgress: globalThis.document.querySelector(".lotus-viewport")?.getAttribute("data-progress"),
        };
      });
      results.measurements.push({ viewport, ...initial, scrollCadence: cadence });
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
await mkdir(resolve("evidence/lotus"), { recursive: true });
await writeFile(output, JSON.stringify(results, null, 2) + "\n");
console.log(JSON.stringify({
  output,
  environment: results.environment,
  measurements: results.measurements.map((entry) => ({
    viewport: entry.viewport,
    webglRenderer: entry.webglRenderer,
    navigation: entry.navigation,
    paints: entry.paints,
    resourcesTotalTransferBytes: entry.resourcesTotalTransferBytes,
    resourcesTotalEncodedBytes: entry.resourcesTotalEncodedBytes,
    scrollCadence: entry.scrollCadence,
  })),
}, null, 2));

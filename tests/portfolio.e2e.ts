import { test, expect, type Page, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { copy, locales, projects, dimensions, type Locale } from "../src/content.ts";
import { lotusCopy, selectedIds } from "../src/lotus-copy.ts";

const evidence = resolve("evidence/lotus/browser");
const sizes = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 360, height: 800 },
];
const localURL = (info: TestInfo) =>
  String(info.project.use.baseURL || "http://127.0.0.1:5317");
const body = (page: Page) => page.locator("body");
const progress = async (page: Page) =>
  Number(await page.locator(".lotus-viewport").getAttribute("data-progress"));
const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

async function settled(page: Page) {
  let previous = "";
  let stable = 0;
  await expect.poll(async () => {
    const position = await page.evaluate(() => {
      const scene = document.querySelector<HTMLElement>(".lotus-viewport");
      const rect = scene && !scene.hidden ? scene.getBoundingClientRect() : null;
      return [window.scrollY, rect?.x || 0, rect?.y || 0, rect?.width || 0, rect?.height || 0]
        .map((value) => Math.round(value * 10) / 10).join(",");
    });
    stable = position === previous ? stable + 1 : 0;
    previous = position;
    return stable;
  }, { intervals: [50], timeout: 5000 }).toBeGreaterThanOrEqual(3);
}

async function fonts(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}
async function ready(page: Page) {
  await expect(body(page)).toHaveClass(/lotus-ready/, { timeout: 20000 });
  await expect(page.locator(".lotus-viewport canvas")).toHaveCount(1);
}
async function openHome(page: Page, locale: Locale = "en") {
  await page.goto("/?lang=" + locale);
  await fonts(page);
  await ready(page);
}
async function sceneRange(page: Page) {
  return page.locator(".unfold").evaluate((el) => ({
    top: el.getBoundingClientRect().top + window.scrollY,
    distance: el.clientHeight - window.innerHeight,
  }));
}
async function seekScene(page: Page, value: number) {
  const range = await sceneRange(page);
  expect(range.distance, "The normal scene has a real scroll interval.").toBeGreaterThan(0);
  await page.evaluate(
    (y) => window.scrollTo({ top: y, behavior: "instant" }),
    range.top + range.distance * value,
  );
  await expect
    .poll(async () => Math.abs((await progress(page)) - value))
    .toBeLessThan(0.025);
}
async function chooseProject(page: Page, id: string) {
  await page.locator('[data-select="' + id + '"]').click();
  await settled(page);
  await expect(body(page)).toHaveAttribute("data-active-project", id);
  await expect(page.locator('[data-select="' + id + '"]')).toHaveAttribute(
    "aria-current",
    "true",
  );
}
async function noOverflow(page: Page, label: string) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
    label,
  ).toBe(true);
}
async function screenshot(page: Page, name: string, fullPage = false) {
  await settled(page);
  await mkdir(evidence, { recursive: true });
  await page.screenshot({ path: resolve(evidence, name + ".png"), fullPage });
}

for (const size of sizes) {
  test("Home fits " + size.width + "×" + size.height + " in EN/RU/KK", async ({ page }) => {
    await page.setViewportSize(size);
    for (const locale of locales) {
      await openHome(page, locale);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".hero-tagline")).toHaveText(lotusCopy[locale].tagline);
      await expect(page.locator(".about-intro")).toHaveText(lotusCopy[locale].aboutText);
      await expect(page.locator(".featured-project")).toHaveCount(selectedIds.length);
      await expect(page.locator(".project-card")).toHaveCount(projects.length);
      await expect.poll(() => page.locator(".hero-model-anchor img").evaluate(
        (img) => (img as HTMLImageElement).naturalWidth,
      )).toBeGreaterThan(0);
      await expect(page.locator(".lotus-viewport")).toHaveAttribute("data-petals", "5");
      const heading = await page.locator("h1").boundingBox();
      expect(heading).not.toBeNull();
      expect(heading!.x).toBeGreaterThanOrEqual(0);
      expect(heading!.x + heading!.width).toBeLessThanOrEqual(size.width + 1);
      await noOverflow(page, size.width + " " + locale + " home");
      if (locale === "en") await screenshot(page, "hero-" + size.width + "x" + size.height);
      await page.locator(".explore-link").click();
      await expect(page.locator("#work-title")).toBeInViewport();
      await expect(page.locator(".featured-project").first()).toBeInViewport();
      await noOverflow(page, size.width + " " + locale + " work");
      if (locale === "en") await screenshot(page, "work-" + size.width + "x" + size.height);
    }
  });
}

test("Every full case retains localized facts, real assets, source links and canonical URL", async ({ page }) => {
  for (const locale of locales) {
    for (const project of projects) {
      const response = await page.goto("/projects/" + project.id + ".html?lang=" + locale);
      expect(response?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toHaveText(project.name + ".");
      await expect(page.locator(".case-context")).toContainText(copy[locale].roleText);
      await expect(page.locator(".case-details")).toContainText(copy[locale].project[project.id].limit);
      await expect(page.locator(".case-cover img")).toHaveJSProperty(
        "naturalWidth",
        dimensions[project.id].main[0],
      );
      await expect(page.locator(".case-actions a").first()).toHaveAttribute("href", project.live);
      await expect(page.locator(".case-actions a").nth(1)).toHaveAttribute("href", project.source);
      await expect(page.locator(".case-details a")).toHaveAttribute("href", project.evidence);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        "https://seoshiro.github.io/projects/" + project.id + ".html",
      );
      await expect(page.locator("canvas")).toHaveCount(0);
      await noOverflow(page, locale + " " + project.id);
    }
  }
});

test("Language switches preserve scroll, active project, focus and stored preference", async ({ page }) => {
  await openHome(page);
  await chooseProject(page, "selvedge");
  await page.locator("#project-selvedge .project-links").scrollIntoViewIfNeeded();
  await expect(body(page)).toHaveAttribute("data-active-project", "selvedge");
  const y = await scrollY(page);
  for (const locale of ["ru", "kk", "en"] as Locale[]) {
    await page.locator('[data-locale="' + locale + '"]').click();
    await ready(page);
    await fonts(page);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator('[data-locale="' + locale + '"]')).toBeFocused();
    await expect(page.locator('[data-locale="' + locale + '"]')).toHaveAttribute("aria-pressed", "true");
    await expect(body(page)).toHaveAttribute("data-active-project", "selvedge");
    await expect(page.locator("#project-selvedge .project-summary")).toHaveText(copy[locale].project.selvedge.summary);
    await expect.poll(async () => Math.abs((await scrollY(page)) - y)).toBeLessThan(5);
  }
  await page.locator('[data-locale="kk"]').click();
  await page.goto("/");
  await ready(page);
  await expect(page.locator("html")).toHaveAttribute("lang", "kk");
});

for (const size of [sizes[0], sizes[2]]) {
  test("Natural, fast and reverse scrolling stay synchronized at " + size.width + "px", async ({ page }) => {
    await page.setViewportSize(size);
    await openHome(page);
    const range = await sceneRange(page);
    await page.mouse.move(12, size.height - 20);
    await page.mouse.wheel(0, range.distance * 0.3);
    await expect.poll(() => progress(page)).toBeGreaterThan(0.1);
    const first = await progress(page);
    await page.mouse.wheel(0, range.distance * 0.3);
    await expect.poll(() => progress(page)).toBeGreaterThan(first + 0.1);
    const forward = await progress(page);
    await page.mouse.wheel(0, -range.distance * 0.2);
    await expect.poll(() => progress(page)).toBeLessThan(forward - 0.05);
    await seekScene(page, 0.95);
    await seekScene(page, 0.1);
    await seekScene(page, 0.55);
    const y = await scrollY(page);
    await page.reload();
    await ready(page);
    await expect.poll(async () => Math.abs((await scrollY(page)) - y)).toBeLessThan(5);
    await expect.poll(async () => Math.abs((await progress(page)) - 0.55)).toBeLessThan(0.035);
    await page.setViewportSize({ width: size.width, height: size.height - 100 });
    await seekScene(page, 0.7);
    await seekScene(page, 0);
    await expect(page.locator(".hero-copy")).toBeInViewport();
  });
}

test("Work anchor bypasses the scene and project links drive a clear active selection", async ({ page }) => {
  await openHome(page);
  await page.locator(".explore-link").click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator("#work-title")).toBeInViewport();
  const y = await scrollY(page);
  expect(y).toBeGreaterThan((await sceneRange(page)).distance);
  for (const id of selectedIds) {
    await chooseProject(page, id);
    await expect(page.locator("#project-" + id)).toBeInViewport();
    await expect(page.locator(".work-index [aria-current='true']")).toHaveCount(1);
  }
  await page.locator(".archive summary").click();
  await expect(page.locator(".archive-project")).toHaveCount(projects.length - selectedIds.length);
  for (const card of await page.locator(".archive-project").all()) await expect(card).toBeVisible();
  await seekScene(page, 0.65);
  const phaseLink = page.locator(".phase-copy").getByRole("link");
  await expect(phaseLink).toBeVisible();
  await phaseLink.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#work-title")).toBeInViewport();
});

test("Visible lotus petals select real projects through pointer raycasting", async ({ page }) => {
  await page.setViewportSize(sizes[0]);
  await openHome(page);
  await page.locator(".explore-link").click();
  await expect(page.locator("#work-title")).toBeInViewport();
  await settled(page);
  await expect.poll(() => progress(page)).toBeGreaterThan(0.95);
  const viewport = page.locator(".lotus-viewport");
  const canvas = viewport.locator("canvas");
  const picked = new Set<string>();
  for (let selection = 0; selection < 2; selection++) {
    await expect(canvas).toBeVisible();
    await expect(canvas).toBeInViewport();
    const box = (await canvas.boundingBox())!;
    const screen = page.viewportSize()!;
    const visible = {
      left: Math.max(0, box.x),
      top: Math.max(0, box.y),
      right: Math.min(screen.width, box.x + box.width),
      bottom: Math.min(screen.height, box.y + box.height),
    };
    let hit: { x: number; y: number; petal: number; project: string } | null = null;
    for (const y of [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]) {
      for (const x of [0.18, 0.28, 0.38, 0.5, 0.62, 0.72, 0.82]) {
        const point = {
          x: visible.left + (visible.right - visible.left) * x,
          y: visible.top + (visible.bottom - visible.top) * y,
        };
        const reachable = await page.evaluate(({ x, y }) => {
          const element = document.elementFromPoint(x, y);
          return element?.tagName === "CANVAS" && !!element.closest(".lotus-viewport");
        }, point);
        if (!reachable) continue;
        await page.mouse.move(point.x, point.y);
        await page.evaluate(() => new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ));
        const value = await viewport.getAttribute("data-hovered-petal");
        const petal = value === null ? -1 : Number(value);
        const project = selectedIds[petal % selectedIds.length];
        if (petal >= 0 && project && !picked.has(project)) {
          hit = { ...point, petal, project };
          break;
        }
      }
      if (hit) break;
    }
    expect(hit, "Two distinct project petals must be reachable in the visible model.").not.toBeNull();
    await expect(canvas).toHaveCSS("cursor", "pointer");
    await page.mouse.click(hit!.x, hit!.y);
    await expect(body(page)).toHaveAttribute("data-active-project", hit!.project);
    await expect(page.locator('[data-select="' + hit!.project + '"]')).toHaveAttribute("aria-current", "true");
    await expect(page.locator("#project-" + hit!.project)).toBeInViewport();
    await settled(page);
    await expect(body(page)).toHaveAttribute("data-active-project", hit!.project);
    picked.add(hit!.project);
  }
  expect(picked.size).toBe(2);
  await screenshot(page, "petal-picking");
});

test("Full case and browser Back restore portfolio position and active project", async ({ page }) => {
  await openHome(page, "ru");
  for (const id of selectedIds) {
    await chooseProject(page, id);
    const link = page.locator("#project-" + id + " .case-link");
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page.locator("h1")).toHaveText(projects.find((p) => p.id === id)!.name + ".");
    const saved = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("lotus-return-context") || "null") as { y: number; active: string } | null,
    );
    expect(saved?.active).toBe(id);
    await page.locator(".back-link").click();
    await ready(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(body(page)).toHaveAttribute("data-active-project", id);
    await expect.poll(async () => Math.abs((await scrollY(page)) - saved!.y)).toBeLessThan(6);
    await page.locator("#project-" + id + " .case-link").click();
    await expect(page.locator(".case-header")).toBeVisible();
    const previous = await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("lotus-return-context") || "null") as { y: number },
    );
    await page.goBack();
    await ready(page);
    await expect(body(page)).toHaveAttribute("data-active-project", id);
    await expect.poll(async () => Math.abs((await scrollY(page)) - previous.y)).toBeLessThan(6);
  }
});

test("Mobile menu supports keyboard activation, Escape, focus return and real section links", async ({ page }) => {
  await page.setViewportSize(sizes[2]);
  await openHome(page, "ru");
  const menu = page.locator(".menu-toggle");
  const nav = page.locator("#main-navigation");
  await expect(menu).toBeVisible();
  await expect(nav).not.toBeVisible();
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(nav).toBeVisible();
  await nav.locator("a").first().focus();
  await page.keyboard.press("Tab");
  await expect(nav.locator("a").nth(1)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(nav).not.toBeVisible();
  await expect(menu).toBeFocused();
  await page.keyboard.press("Enter");
  await nav.locator('a[href="#about"]').click();
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#about-title")).toBeInViewport();
  await noOverflow(page, "Mobile menu navigation");
});

test("Skip link and project index provide a keyboard path independent of the model", async ({ page }) => {
  await openHome(page);
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  const projectLink = page.locator('[data-select="forme"]');
  await projectLink.focus();
  await page.keyboard.press("Enter");
  await settled(page);
  await expect(body(page)).toHaveAttribute("data-active-project", "forme");
  await expect(page.locator("#project-forme")).toBeInViewport();
  await expect(projectLink).toHaveAttribute("aria-current", "true");
});

test("Reduced motion shortens the scene and preserves direct controls and work access", async ({ page }) => {
  await page.setViewportSize(sizes[2]);
  await openHome(page);
  const normal = await page.locator(".unfold").evaluate((el) => el.clientHeight);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".motion-toggle")).toHaveAttribute("aria-pressed", "false");
  await expect.poll(() => page.locator(".unfold").evaluate((el) => el.clientHeight)).toBeLessThan(normal);
  await expect(page.locator(".phase-copy")).not.toBeVisible();
  await page.locator(".explore-link").click();
  await expect(page.locator("#work-title")).toBeInViewport();
  await chooseProject(page, "forme");
  await expect(page.locator("#project-forme")).toBeInViewport();
  await page.goto("/?lang=kk");
  await ready(page);
  await expect(page.locator(".motion-toggle")).toHaveAttribute("aria-pressed", "false");
  await page.locator(".motion-toggle").click();
  await expect(page.locator(".motion-toggle")).toHaveAttribute("aria-pressed", "true");
  await page.locator(".motion-toggle").click();
  await expect(page.locator(".motion-toggle")).toHaveAttribute("aria-pressed", "false");
});

test("Failed GLB keeps posters, case pages and contact usable", async ({ page }) => {
  await page.route("**/models/lotus.glb", (route) => route.abort("failed"));
  await page.goto("/?lang=ru");
  await expect(body(page)).toHaveClass(/lotus-unavailable/);
  await expect(page.locator(".scene-fallback")).toHaveText(lotusCopy.ru.fallback);
  await expect(page.locator(".hero-model-anchor img")).toBeVisible();
  await page.locator(".explore-link").click();
  await expect(page.locator("#work-title")).toBeInViewport();
  await expect(page.locator(".featured-project")).toHaveCount(3);
  await expect(page.locator(".contact-link")).toHaveAttribute("href", "https://github.com/seoshiro");
  await screenshot(page, "failed-model-work");
  await page.locator("#project-perch .case-link").click();
  await expect(page.locator("h1")).toHaveText("PERCH.");
  await expect(page.locator(".case-details")).toContainText(copy.ru.project.perch.limit);
});

test("A pending GLB never blocks reading, anchor navigation or project selection", async ({ page }) => {
  let release!: () => void;
  let requested!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const seen = new Promise<void>((resolve) => { requested = resolve; });
  await page.route("**/models/lotus.glb", async (route) => {
    requested();
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/?lang=en", { waitUntil: "domcontentloaded" });
    await seen;
    await expect(page.locator(".hero-tagline")).toHaveText(lotusCopy.en.tagline);
    await expect(page.locator(".hero-model-anchor img")).toBeVisible();
    await expect(body(page)).not.toHaveClass(/lotus-ready/);
    await page.locator(".explore-link").click();
    await expect(page.locator("#work-title")).toBeInViewport();
    await chooseProject(page, "selvedge");
    await expect(page.locator("#project-selvedge")).toBeInViewport();
    await screenshot(page, "pending-model-work");
    release();
    await ready(page);
    await expect(body(page)).toHaveAttribute("data-active-project", "selvedge");
  } finally {
    release();
  }
});

test("WebGL denial retains useful fallback navigation", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type, ...args) {
      if (type === "webgl" || type === "webgl2") return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await page.goto("/?lang=en");
  await expect(body(page)).toHaveClass(/lotus-unavailable/);
  await expect(page.locator(".scene-fallback")).toBeVisible();
  await page.locator(".explore-link").click();
  await expect(page.locator("#work-title")).toBeInViewport();
  await chooseProject(page, "forme");
  await page.locator("#project-forme .case-link").click();
  await expect(page.locator("h1")).toHaveText("FORME.");
});

test("Actual WebGL context loss returns to the poster without losing content", async ({ page }) => {
  await openHome(page);
  const supported = await page.locator(".lotus-viewport canvas").evaluate((canvas) => {
    const gl = (canvas as HTMLCanvasElement).getContext("webgl2");
    const extension = gl?.getExtension("WEBGL_lose_context");
    extension?.loseContext();
    return !!extension;
  });
  test.skip(!supported, "This Chrome installation does not expose WEBGL_lose_context.");
  await expect(body(page)).toHaveClass(/lotus-unavailable/);
  await expect(page.locator(".scene-fallback")).toBeVisible();
  await expect(page.locator(".hero-model-anchor img")).toBeVisible();
  await page.locator(".explore-link").click();
  await expect(page.locator(".featured-project")).toHaveCount(selectedIds.length);
  await expect(page.locator("#work-title")).toBeInViewport();
});

test("Static HTML remains useful with JavaScript disabled", async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: localURL(info) });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".project-card")).toHaveCount(projects.length);
    await expect(page.locator(".hero-model-anchor img")).toBeVisible();
    await page.locator(".explore-link").click();
    await expect(page.locator("#work-title")).toBeInViewport();
    await page.locator(".archive summary").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".archive-project").first()).toBeVisible();
    await page.locator("#project-perch .case-link").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("h1")).toHaveText("PERCH.");
    await expect(page.locator(".case-context")).toContainText(copy.ru.roleText);
    await expect(page.locator(".case-details")).toContainText(copy.ru.project.perch.limit);
    await expect(page.locator(".case-actions a").first()).toHaveAttribute(
      "href",
      projects.find((p) => p.id === "perch")!.live,
    );
  } finally {
    await context.close();
  }
});

test("Storage denial and unsupported language retain localized navigation", async ({ browser }, info) => {
  const context = await browser.newContext({ locale: "fr-FR", baseURL: localURL(info) });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { get() { throw Error("denied"); } });
      Object.defineProperty(window, "sessionStorage", { get() { throw Error("denied"); } });
    });
    await page.goto("/?lang=unsupported");
    await ready(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "ru");
    await page.locator('[data-locale="kk"]').click();
    await ready(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "kk");
    await page.locator(".explore-link").click();
    await page.locator("#project-perch .case-link").click();
    await expect(page.locator("h1")).toHaveText("PERCH.");
    await page.locator(".back-link").click();
    await ready(page);
    await expect(page.locator("#work-title")).toBeInViewport();
  } finally {
    await context.close();
  }
});

test("Explicit English survives case, next, back and brand links with Russian preferences and blocked storage", async ({ browser }, info) => {
  const context = await browser.newContext({ locale: "ru-RU", baseURL: localURL(info) });
  try {
    const page = await context.newPage();
    await page.addInitScript(() => {
      Object.defineProperty(window, "localStorage", { get() { throw Error("denied"); } });
      Object.defineProperty(window, "sessionStorage", { get() { throw Error("denied"); } });
    });
    await page.goto("/?lang=en");
    await ready(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.locator("#project-perch .case-link").click();
    await expect(page).toHaveURL(/\/projects\/perch\.html\?lang=en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator(".case-context")).toContainText(copy.en.roleText);
    const next = projects[(projects.findIndex((p) => p.id === "perch") + 1) % projects.length];
    await page.locator(".next-project").click();
    await expect(page).toHaveURL(new RegExp("/projects/" + next.id + "\\.html\\?lang=en$"));
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1")).toHaveText(next.name + ".");
    await page.locator(".back-link").click();
    await ready(page);
    await expect(page).toHaveURL(/\/index\.html\?lang=en#work$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("#work-title")).toBeInViewport();
    await page.locator(".header .wordmark").click();
    await ready(page);
    await expect(page).toHaveURL(/\/index\.html\?lang=en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  } finally {
    await context.close();
  }
});

test("Narrow 360px case pages retain complete localized content and controls", async ({ page }) => {
  await page.setViewportSize(sizes[3]);
  for (const locale of locales) {
    for (const project of projects) {
      await page.goto("/projects/" + project.id + ".html?lang=" + locale);
      await fonts(page);
      await expect(page.locator("h1")).toHaveText(project.name + ".");
      await expect(page.locator(".case-details")).toContainText(copy[locale].project[project.id].limit);
      await expect(page.locator(".case-context")).toContainText(copy[locale].roleText);
      const title = (await page.locator("h1").boundingBox())!;
      expect(title.x).toBeGreaterThanOrEqual(0);
      expect(title.x + title.width).toBeLessThanOrEqual(sizes[3].width + 1);
      await expect(page.locator(".menu-toggle")).toBeVisible();
      await expect(page.locator(".case-actions a")).toHaveCount(2);
      await noOverflow(page, locale + " " + project.id + " at360px");
    }
  }
});

test("Legacy English and Kazakh home URLs preserve their locale and hash while canonicalizing", async ({ page }) => {
  for (const locale of ["en", "kk"] as const) {
    await page.goto("/" + locale + "/#work");
    await ready(page);
    const url = new URL(page.url());
    expect(url.pathname).toBe("/index.html");
    expect(url.searchParams.get("lang")).toBe(locale);
    expect(url.hash).toBe("#work");
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("#work-title")).toBeInViewport();
    await expect(page.locator(".project-card")).toHaveCount(projects.length);
  }
});

test("All legacy English and Kazakh case routes redirect to the same translated case", async ({ page }) => {
  for (const locale of ["en", "kk"] as const) {
    for (const project of projects) {
      await page.goto("/" + locale + "/projects/" + project.id + ".html#legacy-proof");
      await expect(page).toHaveURL(new RegExp("/projects/" + project.id + "\\.html\\?lang=" + locale + "#legacy-proof$"));
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toHaveText(project.name + ".");
      await expect(page.locator(".case-context")).toContainText(copy[locale].roleText);
      await expect(page.locator(".case-details")).toContainText(copy[locale].project[project.id].limit);
      await expect(page.locator(".case-cover img")).toHaveJSProperty("naturalWidth", dimensions[project.id].main[0]);
    }
  }
});

test("Legacy locale pages remain fully translated and navigable with JavaScript disabled", async ({ browser }, info) => {
  const context = await browser.newContext({ javaScriptEnabled: false, locale: "ru-RU", baseURL: localURL(info) });
  try {
    const page = await context.newPage();
    for (const locale of ["en", "kk"] as const) {
      await page.goto("/" + locale + "/");
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator(".hero-tagline")).toHaveText(lotusCopy[locale].tagline);
      await expect(page.locator(".about-intro")).toHaveText(lotusCopy[locale].aboutText);
      await expect(page.locator(".project-card")).toHaveCount(projects.length);
      await expect(page.locator('meta[http-equiv="refresh"]')).toHaveCount(0);
      for (const project of projects) {
        const response = await page.goto("/" + locale + "/projects/" + project.id + ".html");
        expect(response?.status()).toBe(200);
        expect(new URL(page.url()).pathname).toBe("/" + locale + "/projects/" + project.id + ".html");
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("h1")).toHaveText(project.name + ".");
        await expect(page.locator(".case-context")).toContainText(copy[locale].roleText);
        await expect(page.locator(".case-details")).toContainText(copy[locale].project[project.id].limit);
        await expect(page.locator(".case-cover img")).toHaveJSProperty("naturalWidth", dimensions[project.id].main[0]);
      }
      await page.goto("/" + locale + "/");
      await page.locator("#project-perch .case-link").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("h1")).toHaveText("PERCH.");
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await page.locator(".next-project").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).not.toHaveText("PERCH.");
      await page.locator(".back-link").focus();
      await page.keyboard.press("Enter");
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("#work-title")).toBeInViewport();
    }
  } finally {
    await context.close();
  }
});

test("Localized credits, license files and the static 404 retain useful navigation", async ({ page, request }) => {
  for (const [path, locale, heading] of [
    ["/credits.html", "ru", "Источники и материалы"],
    ["/en/credits.html", "en", "Sources and materials"],
    ["/kk/credits.html", "kk", "Дереккөздер мен материалдар"],
  ] as const) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("h1")).toHaveText(heading);
    const work = page.locator(".case-actions a");
    expect(new URL((await work.getAttribute("href"))!, page.url()).searchParams.get("lang")).toBe(locale);
    const licenses = page.locator('a[href$=".txt"]');
    await expect(licenses).toHaveCount(3);
    for (const anchor of await licenses.all()) {
      const url = new URL((await anchor.getAttribute("href"))!, page.url());
      expect(url.origin).toBe(new URL(page.url()).origin);
      const license = await request.get(url.href);
      expect(license.status()).toBe(200);
      expect((await license.text()).length).toBeGreaterThan(100);
    }
    await work.click();
    await ready(page);
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    await expect(page.locator("#work-title")).toBeInViewport();
  }
  const response = await page.goto("/404.html");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveText("Page not found.");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
  await expect(page.locator("main a")).toHaveAttribute("href", "https://seoshiro.github.io/");
  expect((await request.get("/missing-portfolio-proof.html")).status()).toBe(404);
});

test("Axe checks localized homes, selected cases and the open mobile menu", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const locale of locales) {
    await openHome(page, locale);
    expect((await new AxeBuilder({ page }).analyze()).violations, locale + " home").toEqual([]);
    await page.locator(".explore-link").click();
    expect((await new AxeBuilder({ page }).analyze()).violations, locale + " work").toEqual([]);
  }
  for (const id of selectedIds) {
    await page.goto("/projects/" + id + ".html?lang=ru");
    expect((await new AxeBuilder({ page }).analyze()).violations, id + " case").toEqual([]);
  }
  await page.setViewportSize(sizes[2]);
  await openHome(page, "ru");
  await page.locator(".menu-toggle").click();
  expect((await new AxeBuilder({ page }).analyze()).violations, "mobile menu").toEqual([]);
});

test("Runtime stays local and uncaught-error free; preview protects source files", async ({ page, request }, info) => {
  const errors: string[] = [];
  const external: string[] = [];
  const origin = new URL(localURL(info)).origin;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (req) => {
    if (/^https?:/.test(req.url()) && new URL(req.url()).origin !== origin) external.push(req.url());
  });
  await openHome(page);
  await seekScene(page, 0.75);
  await page.locator(".header nav a").first().click();
  await chooseProject(page, "forme");
  await page.locator('[data-locale="ru"]').click();
  await ready(page);
  await page.locator("#project-forme .case-link").click();
  await expect(page.locator(".case-header")).toBeVisible();
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
  if (!process.env.LIVE_URL) {
    for (const path of ["/src/content.ts", "/package.json", "/.git/config"]) {
      expect((await request.get(path)).status()).toBe(404);
    }
    const response = await request.get("/");
    expect(response.headers()["content-security-policy"]).toContain("connect-src 'self'");
  }
});

for (const size of [sizes[0], sizes[2]]) {
  test("Record lotus progression at " + size.width + "×" + size.height, async ({ browser }, info) => {
    await mkdir(evidence, { recursive: true });
    const context = await browser.newContext({
      baseURL: localURL(info),
      viewport: size,
      recordVideo: { dir: resolve(evidence, "raw-video"), size },
    });
    const page = await context.newPage();
    const video = page.video()!;
    try {
      await openHome(page, "ru");
      await screenshot(page, "sequence-" + size.width + "-closed");
      await page.waitForTimeout(350);
      const range = await sceneRange(page);
      await page.mouse.move(10, size.height - 20);
      for (let i = 0; i < 8; i++) {
        await page.mouse.wheel(0, range.distance / 8);
        await page.waitForTimeout(130);
      }
      await expect.poll(() => progress(page)).toBeGreaterThan(0.9);
      await screenshot(page, "sequence-" + size.width + "-open");
      await page.waitForTimeout(350);
      await page.mouse.wheel(0, -range.distance * 0.4);
      await expect.poll(() => progress(page)).toBeLessThan(0.8);
      await page.waitForTimeout(300);
      if (size.width < 700) {
        await page.locator(".menu-toggle").click();
        await page.locator('#main-navigation a[href="#work"]').click();
      } else {
        await page.locator(".header nav a").first().click();
      }
      await chooseProject(page, "selvedge");
      await expect(page.locator("#project-selvedge")).toBeInViewport();
      await screenshot(page, "sequence-" + size.width + "-selected");
      await page.waitForTimeout(350);
      await page.locator("#about").scrollIntoViewIfNeeded();
      await screenshot(page, "sequence-" + size.width + "-about");
      await page.waitForTimeout(350);
    } finally {
      await context.close();
      await video.saveAs(resolve(evidence, "lotus-" + size.width + "x" + size.height + ".webm"));
    }
  });
}

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  copy,
  locales,
  projects,
  validLocale,
  pageHref,
} from "../src/content.ts";
import { renderPage, escape } from "../src/render.ts";
test("Locale selection rejects malformed or unsupported preferences", () => {
  for (const value of [null, "EN", "fr", "<script>", "../../en", ""])
    assert.equal(validLocale(value), null);
  for (const value of locales) assert.equal(validLocale(value), value);
});
test("Every locale has complete project evidence and descriptive copy", () => {
  for (const l of locales) {
    assert.deepEqual(Object.keys(copy[l]).sort(), Object.keys(copy.en).sort());
    for (const p of projects) {
      const t = copy[l].project[p.id];
      assert.deepEqual(
        Object.keys(t).sort(),
        Object.keys(copy.en.project[p.id]).sort(),
      );
      for (const value of Object.values(t)) {
        if (Array.isArray(value)) assert.equal(value.length, 3);
        else assert.ok(value.length > 10);
      }
      assert.match(p.live, /^https:\/\//);
      assert.match(p.source, /^https:\/\/github.com\/seoshiro\//);
    }
  }
});
test("Static home and case pages expose real work and explicit limitations in every locale", () => {
  for (const l of locales) {
    const home = renderPage(l, null);
    assert.equal(
      (home.match(/class="project-card /g) || []).length,
      projects.length,
    );
    assert.ok(home.includes('id="main"'));
    assert.ok(home.includes('id="work"'));
    for (const p of projects) {
      const page = renderPage(l, p.id);
      assert.ok(page.includes(escape(copy[l].project[p.id].limit)));
      assert.ok(page.includes(p.evidence));
      assert.ok(page.includes(p.live));
      assert.ok(page.includes(p.source));
      assert.ok(page.includes('rel="noopener noreferrer"'));
    }
  }
});
test("Links preserve locale and resolve correctly from home or case directory", () => {
  assert.equal(pageHref("forme", "en", false), "projects/forme.html?lang=en");
  assert.equal(pageHref("forme", "ru", true), "forme.html?lang=ru");
  assert.equal(pageHref(null, "kk", true), "../index.html?lang=kk");
});
test("HTML escaping prevents content from creating executable markup", () => {
  assert.equal(
    escape('<script src="x">&\'test'),
    "&lt;script src=&quot;x&quot;&gt;&amp;&#39;test",
  );
});
test("Project descriptions retain the narrow product and human evidence boundaries", () => {
  assert.match(copy.en.project.guidecheck.limit, /human statements/);
  assert.match(copy.en.project.archiveguard.limit, /JPEG sample preflight/);
  assert.match(copy.en.project.selvedge.limit, /visual proof/);
  assert.match(copy.en.project.forme.limit, /single-browser/);
  assert.match(copy.en.project.perch.limit, /rectangular rooms/);
  assert.match(copy.en.project.perch.limit, /not a construction or safety document/);
  assert.match(copy.en.project.perch.limit, /No cloud sync/);
  assert.ok(
    !/years of|clients|award-winning|trusted by|revenue/i.test(copy.en.intro),
  );
});

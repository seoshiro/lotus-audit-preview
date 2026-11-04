import {
  copy,
  projects,
  dimensions,
  pageHref,
  type Locale,
  type ProjectId,
} from "./content.ts";
import { caseNotes, caseLabels } from './case-notes.ts';
import {lotusCopy, selectedIds} from './lotus-copy.ts';
export function escape(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
const lines = (s: string) => escape(s).replace(/\n/g, "<br>");
const external = (url: string, label: string, cls = "text-link") =>
  `<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a>`;
const caseTitle = (name: string) => {
  const words = name.split(/(?=[A-Z][a-z])/);
  return words
    .map(
      (word, index) =>
        `<span class="case-title-word">${escape(word)}${index === words.length - 1 ? '<span class="brand-dot">.</span>' : ""}</span>`,
    )
    .join("<wbr>");
};
function renderLotusHome(locale: Locale, header: string, footer: string) {
  const c=copy[locale], l=lotusCopy[locale];
  const selected=selectedIds.map(id=>projects.find(p=>p.id===id)!);
  const remaining=projects.filter(p=>!selectedIds.some(id=>id===p.id));
  const icons=[`<circle cx="24" cy="24" r="17"/><circle cx="36" cy="12" r="4" fill="currentColor"/>`,`<path d="m24 5 19 11-19 11L5 16Z M5 28l19 11 19-11"/>`,`<path d="M24 40C9 38 6 28 6 19c11 0 16 7 18 21Zm0 0c15-2 18-12 18-21-11 0-16 7-18 21Zm0 0C11 30 14 16 24 6c10 10 13 24 0 34Z"/>`];
  const cards=selected.map((p,i)=>{const t=c.project[p.id];return `<article id="project-${p.id}" class="project-card featured-project" data-project-id="${p.id}"><a class="project-visual image-shell" href="${pageHref(p.id,locale,false)}" data-case="${p.id}" aria-label="${escape(p.name)} — ${c.caseStudy}"><img src="assets/${p.id}.webp" width="${dimensions[p.id].main[0]}" height="${dimensions[p.id].main[1]}" alt="${escape(t.alt)}" loading="lazy"></a><div class="project-meta"><span class="eyebrow">0${i+1} / ${escape(t.category.replace(/^\d+\s*\/\s*/,''))}</span><span class="eyebrow">${p.stack.slice(0,2).join(' · ')}</span></div><h3>${p.name}</h3><p class="project-hook">${l.projectHints[i]}</p><p class="project-summary">${escape(t.summary)}</p><div class="project-links"><a class="text-link case-link" href="${pageHref(p.id,locale,false)}" data-case="${p.id}">${c.caseStudy}<span aria-hidden="true">↗</span></a>${external(p.live,c.live)}</div></article>`}).join('');
  return `${header}<main id="main" tabindex="-1"><section class="unfold" aria-labelledby="hero-title"><div class="unfold-sticky"><div class="hero-ghost" aria-hidden="true"></div><div class="hero-copy"><p class="eyebrow">${escape(c.eyebrow)}</p><h1 id="hero-title">${l.hero}<span class="brand-dot">.</span></h1><p class="hero-tagline">${l.tagline}</p><p class="hero-intro">${l.intro}</p><a class="text-link explore-link" href="#work">${c.viewWork}<span aria-hidden="true">→</span></a></div><div class="phase-copy" aria-hidden="true"><p class="eyebrow">01 / ${l.scroll}</p><h2>${l.phase}<span class="brand-dot">.</span></h2><p>${l.phaseNote}</p><a class="text-link" href="#work" tabindex="-1">${c.viewWork}<span aria-hidden="true">→</span></a></div><div class="hero-model-anchor"><img class="lotus-poster" src="assets/lotus-poster.webp" alt="" width="1000" height="1100" fetchpriority="high"></div><div class="hero-bottom"><span class="scroll-note"><span aria-hidden="true"></span>${l.scroll}</span><button class="motion-toggle" type="button" aria-pressed="true" aria-label="${l.pause}"><span class="motion-icon" aria-hidden="true">Ⅱ</span><span>${l.motion}</span></button><span class="scene-counter" aria-hidden="true">01 / INTRO</span></div></div></section><section id="work" class="work dark-section" aria-labelledby="work-title"><div class="work-layout"><aside class="work-index"><div class="work-heading"><p class="eyebrow">01 — 03 / ${c.work}</p><h2 id="work-title">${l.selected}<span class="brand-dot">.</span></h2><p>${l.selectedNote}</p></div><nav aria-label="${l.selected}">${selected.map((p,i)=>`<a href="#project-${p.id}" data-select="${p.id}" aria-current="${i===0?'true':'false'}"><span>0${i+1}</span>${p.name}<span class="index-arrow" aria-hidden="true">↗</span></a>`).join('')}</nav><div class="work-model-anchor"><img class="lotus-poster" src="assets/lotus-open.webp" alt="" width="1000" height="850" loading="lazy"></div><p class="lotus-hint">${l.lotus}</p></aside><div class="featured-list">${cards}</div></div><details class="archive"><summary>${l.archive}<span aria-hidden="true">+</span></summary><div class="archive-list">${remaining.map(p=>`<article class="project-card archive-project"><a data-case="${p.id}" href="${pageHref(p.id,locale,false)}"><span class="eyebrow">${escape(c.project[p.id].category)}</span><h3>${p.name}<span aria-hidden="true">↗</span></h3><p>${escape(c.project[p.id].summary)}</p></a></article>`).join('')}</div></details></section><section id="about" class="about" aria-labelledby="about-title"><div class="about-main"><p class="eyebrow">02 / ${l.aboutLabel}</p><h2 id="about-title">${l.about}<span class="brand-dot">.</span></h2><p class="about-intro">${l.aboutText}</p><p class="about-signature">BEIBARS <span>/</span> seoshiro</p></div><div class="about-object" aria-hidden="true"><img src="assets/lotus-open.webp" width="1000" height="850" loading="lazy" alt=""></div><ol class="process">${l.process.map((title,i)=>`<li><svg viewBox="0 0 48 48" aria-hidden="true">${icons[i]}</svg><h3>${title}</h3><p>${l.processText[i]}</p></li>`).join('')}</ol></section><section id="contact" class="contact dark-section" aria-labelledby="contact-title"><p class="eyebrow">03 / ${c.contact}</p><div class="contact-layout"><div><h2 id="contact-title">${l.contact}<span class="brand-dot">.</span></h2><p>${l.contactNote}</p><a class="contact-link" href="https://github.com/seoshiro" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a></div><img class="contact-lotus" src="assets/lotus-open.webp" width="1000" height="850" alt="" loading="lazy"></div>${footer}</section><div class="lotus-viewport" role="img" aria-label="${l.lotus}" hidden></div><p class="scene-fallback" role="status" hidden>${l.fallback}</p></main>`;
}
export function renderPage(locale: Locale, id: ProjectId | null) {
  const c = copy[locale],
    nested = !!id,
    root = nested ? "../" : "",
    home = pageHref(null, locale, nested);
  const l = lotusCopy[locale];
  const header = `<a class="skip" href="#main">${c.skip}</a><header class="header"><a class="wordmark" href="${home}" aria-label="BEIBARS — ${escape(c.name)}">BEIBARS</a><nav id="main-navigation" aria-label="${c.work}"><a href="${id ? home : ""}#work">${c.work}</a><a href="${id ? `${home}&petal=about` : "#about"}">${c.about}</a><a href="${id ? `${home}&petal=contact` : "#contact"}">${c.contact}</a></nav><div class="header-tools"><div class="languages" role="group" aria-label="${c.language}">${(["ru", "en", "kk"] as Locale[]).map((lang) => `<button type="button" data-locale="${lang}" aria-pressed="${lang === locale}" aria-label="${{ en: "English", ru: "Русский", kk: "Қазақша" }[lang]}" lang="${lang}">${lang.toUpperCase()}</button>`).join("")}</div><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="${l.menu}"><span></span><span></span></button></div></header>`;
  const footer = `<footer class="footer"><a class="wordmark" href="${home}">BEIBARS</a><p>${l.footer}</p><a class="top-link" href="#main">${l.top} <span aria-hidden="true">↑</span></a></footer>`;
  if (id) {
    const p = projects.find((p) => p.id === id)!,
      t = c.project[id], note = caseNotes[locale][id], labels = caseLabels[locale],
      next = projects[(projects.indexOf(p) + 1) % projects.length];
    return `${header}<main id="main" tabindex="-1"><section class="case-header"><a class="back-link" href="${home}${home.includes("?") ? "&" : "?"}return=1#work">${c.back}</a><div class="case-meta"><span class="eyebrow">${t.category}</span><span class="eyebrow">${String(projects.indexOf(p) + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}</span></div><h1>${caseTitle(p.name)}</h1><div class="case-intro"><h2>${lines(t.title)}</h2><div><p>${t.summary}</p><div class="case-actions">${external(p.live, labels.demo, "pill-link")}${external(p.source, c.source)}</div></div></div></section><figure class="case-cover image-shell" style="--project-color:${p.color}"><img src="${root}assets/${id}.webp" alt="${escape(t.alt)}" width="${dimensions[id].main[0]}" height="${dimensions[id].main[1]}" fetchpriority="high"><figcaption>${t.caption}</figcaption></figure><section class="case-context"><p class="eyebrow">${c.role}</p><p>${note?.role || c.roleText}</p><ul class="tags">${p.stack.map((s) => `<li>${s}</li>`).join("")}</ul></section>${note ? `<section class="case-context"><h2>${labels.problem}</h2><p>${note.problem}</p></section>` : ""}<section class="io-grid"><div><span class="section-number" aria-hidden="true">01</span><h2>${c.input}</h2><p>${t.input}</p></div><div><span class="section-number" aria-hidden="true">02</span><h2>${c.output}</h2><p>${t.output}</p></div></section><section class="case-engineering"><div><p class="eyebrow">03 / ${c.engineering}</p><h2>${c.engineering}<span class="brand-dot">.</span></h2></div><ol>${(note?.choices || t.decisions).map((s, i) => `<li><span aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><p>${s}</p></li>`).join("")}</ol></section>${note ? `<section class="case-context"><h2>${labels.fix}</h2><p>${note.fix}</p>${external(p.evidence,c.evidence)}</section><section class="case-context"><h2>${labels.scenario}</h2><p>${note.scenario}</p>${external(p.live,labels.demo,"pill-link")}</section>` : ""}<section class="case-details"><figure class="detail-image image-shell"><img src="${root}assets/${id}-detail.webp" alt="${escape(t.detailAlt)}" width="${dimensions[id].detail[0]}" height="${dimensions[id].detail[1]}" loading="lazy"></figure><div><p class="eyebrow">04 / ${c.boundaries}</p><h2>${c.boundaries}</h2><p>${t.limit}</p>${external(p.evidence, c.evidence)}</div></section><a class="next-project" href="${pageHref(next.id, locale, true)}"><span class="eyebrow">${c.next}</span><span>${next.name}<span class="brand-dot">.</span></span></a></main>${footer}`;
  }
  return renderLotusHome(locale, header, footer);
}

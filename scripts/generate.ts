import { writeFileSync, mkdirSync } from "node:fs";
import { copy, projects, type ProjectId } from "../src/content.ts";
import { renderPage, escape } from "../src/render.ts";
import { dirname } from 'node:path';
import { aliases, creditPages, allPages } from './page-manifest.ts';
const template = (id: ProjectId | null) => `<!doctype html>
<html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f4f1e9"><meta name="description" content="${escape(id ? copy.ru.project[id].summary : copy.ru.description)}"><meta name="color-scheme" content="light dark"><meta name="referrer" content="strict-origin-when-cross-origin"><meta property="og:type" content="website"><meta property="og:title" content="${escape(id ? `${projects.find((p) => p.id === id)!.name} — Beibars Ileskhan` : copy.ru.title)}"><meta property="og:description" content="${escape(id ? copy.ru.project[id].summary : copy.ru.description)}"><meta name="twitter:card" content="summary"><link rel="icon" href="${id ? "../" : ""}favicon.svg" type="image/svg+xml"><title>${escape(id ? `${projects.find((p) => p.id === id)!.name} — Beibars Ileskhan` : copy.ru.title)}</title><link rel="stylesheet" href="${id ? "../" : ""}src/style.css"><script type="module" src="${id ? "../" : ""}src/main.ts"></script></head><body data-project="${id || ""}"><div id="app">${renderPage("ru", id)}</div><noscript><style>html{scroll-behavior:auto}.languages,.motion-toggle,.menu-toggle{display:none}.unfold{height:100svh;min-height:650px}.unfold-sticky{position:relative}.header nav{display:flex}</style></noscript></body></html>`;
mkdirSync("projects", { recursive: true });
writeFileSync("index.html", template(null));
for (const p of projects)
  writeFileSync(`projects/${p.id}.html`, template(p.id));
const staticPage = (locale: string, title: string, body: string, prefix = '', head = '') => `<!doctype html>
<html lang="${locale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#F4F1EA"><title>${title} · Beibars Ileskhan</title><link rel="icon" href="${prefix}favicon.svg"><link rel="stylesheet" href="${prefix}src/style.css">${head}</head><body class="legal-page"><header class="header"><a class="wordmark" href="${prefix}index.html?lang=${locale}">BEIBARS</a></header><main id="main" class="case-page"><section class="case-header">${body}</section></main></body></html>`;
for (const alias of aliases) {
  mkdirSync(dirname(alias.file), { recursive: true });
  const nested = alias.file.includes('/projects/');
  const prefix = nested ? '../../' : '../';
  const id = nested ? alias.file.split('/').at(-1)!.replace('.html', '') as ProjectId : null;
  const normalFile = id ? `projects/${id}.html` : 'index.html';
  const title = id ? `${projects.find(p => p.id === id)!.name} · Beibars Ileskhan` : copy[alias.locale].title;
  const translated = renderPage(alias.locale, id).replace(/(href|src)="([^"]+)"/g, (match, key, url: string) => {
    if (/^(https?:|#)/.test(url)) return match;
    const resolved = new URL(url, `https://portfolio.invalid/${normalFile}`);
    const translatedRoute = key === 'href' && (resolved.pathname === '/index.html' || resolved.pathname.startsWith('/projects/'));
    return `${key}="${prefix}${translatedRoute ? alias.locale + '/' : ''}${resolved.pathname.slice(1)}${resolved.search}${resolved.hash}"`;
  });
  writeFileSync(alias.file, `<!doctype html><html lang="${alias.locale}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title><link rel="icon" href="${prefix}favicon.svg"><link rel="stylesheet" href="${prefix}src/style.css"><script type="module" src="${prefix}src/legacy-redirect.ts"></script></head><body data-redirect="${alias.target}">${translated}<noscript><style>html{scroll-behavior:auto}.languages,.motion-toggle,.menu-toggle{display:none}.unfold{height:100svh;min-height:650px}.unfold-sticky{position:relative}.header nav{display:flex}</style></noscript></body></html>`);
}
const creditCopy = {
  ru: { title: 'Источники и материалы', intro: 'Оригинальная модель лотоса создана для этого портфолио. Изображения проектов — реальные снимки приложений. Разработка выполнена с помощью ИИ; роль и ограничения описаны в кейсах.', model: 'Редактируемая модель и методика', sources: 'Источники изображений и проверка проектов', fonts: 'Шрифты и библиотеки', back: 'К работам' },
  en: { title: 'Sources and materials', intro: 'The original lotus model was made for this portfolio. Project images are actual application captures. Development is AI-assisted; each case describes the role and limitations.', model: 'Editable model and method', sources: 'Image sources and project verification', fonts: 'Fonts and libraries', back: 'Selected work' },
  kk: { title: 'Дереккөздер мен материалдар', intro: 'Лотостың түпнұсқа моделі осы портфолио үшін жасалды. Жоба суреттері — нақты қолданбалардың скриншоттары. Әзірлеу ЖИ көмегімен орындалды; рөл мен шектеулер кейстерде сипатталған.', model: 'Өңделетін модель және әдіс', sources: 'Сурет дереккөздері және жобаларды тексеру', fonts: 'Қаріптер мен кітапханалар', back: 'Жұмыстарға' },
};
for (const { file, locale, prefix } of creditPages) {
  mkdirSync(dirname(file), { recursive: true });
  const c = creditCopy[locale];
  writeFileSync(file, staticPage(locale, c.title, `<p class="eyebrow">BEIBARS / CREDITS</p><h1>${c.title}</h1><p class="case-summary">${c.intro}</p><div class="case-actions"><a href="${prefix}index.html?lang=${locale}#work">${c.back} ↗</a></div><p><a href="https://github.com/seoshiro/seoshiro.github.io/blob/main/docs/lotus-model.md">${c.model} ↗</a></p><p><a href="https://github.com/seoshiro/seoshiro.github.io/blob/main/docs/PROVENANCE.md">${c.sources} ↗</a></p><h2>${c.fonts}</h2><p><a href="${prefix}fonts/CormorantGaramond-OFL.txt">Cormorant Garamond · SIL OFL 1.1</a></p><p><a href="${prefix}fonts/IBMPlexSans-LICENSE.txt">IBM Plex Sans · SIL OFL 1.1</a></p><p><a href="${prefix}licenses/three-MIT.txt">Three.js · MIT</a></p><nav aria-label="Language"><a href="${prefix}credits.html" lang="ru">RU</a> · <a href="${prefix}en/credits.html" lang="en">EN</a> · <a href="${prefix}kk/credits.html" lang="kk">KK</a></nav>`, prefix));
}
writeFileSync('404.html', staticPage('en', 'Page not found', '<p class="eyebrow">404</p><h1>Page not found.</h1><p><a href="https://seoshiro.github.io/">Return to the portfolio ↗</a></p>', '', '<meta name="robots" content="noindex">'));
console.log(`Generated ${allPages.length} HTML pages: home, ${projects.length} cases, locale compatibility routes, credits and 404.`);

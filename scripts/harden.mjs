import { readFile, writeFile } from "node:fs/promises";
import { allPages, aliases, contentPages, creditPages } from './page-manifest.ts';
const origin = "https://seoshiro.github.io";
const preview = process.env.PORTFOLIO_PREVIEW === '1';
const commit =
  process.env.GITHUB_SHA || process.env.PORTFOLIO_COMMIT || "local-development";
const policy =
  "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";
for (const file of allPages) {
  const alias = aliases.find(p => p.file === file);
  const canonical = alias ? new URL(alias.target, `${origin}/${file}`).href : `${origin}/${file === 'index.html' ? '' : file}`;
  let html = await readFile(`dist/${file}`, "utf8");
  // Pages serves this document at the missing URL, including nested paths.
  if (file === '404.html') html = html.replace(/(href|src)="(?!https?:|#)([^"]+)"/g, (_, key, url) => {
    const target = new URL(url, `${origin}/`);
    return `${key}="${target.pathname}${target.search}${target.hash}"`;
  });
  await writeFile(
    `dist/${file}`,
    html
      .replace(
        "<head>",
        `<head>${preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<link rel="canonical" href="${canonical}"><meta property="og:url" content="${canonical}"><meta name="portfolio-build" content="${commit}">`,
      )
      .replace(
        '<meta charset="UTF-8">',
        `<meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="${policy}">`,
      ),
  );
}
await writeFile("dist/version.json", JSON.stringify({ commit }));
await writeFile(
  "dist/robots.txt",
  preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
);
await writeFile(
  "dist/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...contentPages, ...creditPages.map(p => p.file)].map(path => `<url><loc>${origin}/${path === 'index.html' ? '' : path}</loc></url>`).join('')}</urlset>`,
);
console.log(`Production CSP applied to all ${allPages.length} static pages.`);

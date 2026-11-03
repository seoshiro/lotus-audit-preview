import { projects } from '../src/content.ts';

export const contentPages = ['index.html', ...projects.map(p => `projects/${p.id}.html`)];
export const aliases = (['en', 'kk'] as const).flatMap(locale => [
  { file: `${locale}/index.html`, target: `../index.html?lang=${locale}`, locale },
  ...projects.map(p => ({ file: `${locale}/projects/${p.id}.html`, target: `../../projects/${p.id}.html?lang=${locale}`, locale })),
]);
export const creditPages = [
  { file: 'credits.html', locale: 'ru', prefix: '' },
  { file: 'en/credits.html', locale: 'en', prefix: '../' },
  { file: 'kk/credits.html', locale: 'kk', prefix: '../' },
] as const;
export const allPages = [...contentPages, ...aliases.map(p => p.file), ...creditPages.map(p => p.file), '404.html'];

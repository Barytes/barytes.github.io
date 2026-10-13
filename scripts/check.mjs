import fs from 'node:fs';
import path from 'node:path';

const previewDrafts = process.env.PREVIEW_DRAFTS === '1';
const root = path.resolve(previewDrafts ? 'dist-drafts' : 'dist');
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const site = JSON.parse(fs.readFileSync('src/site.json', 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
let count = 0;
const failures = [];
function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const file = path.join(dir, f);
    if (fs.statSync(file).isDirectory()) {
      walk(file);
      continue;
    }
    if (!f.endsWith('.html')) continue;
    count++;
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)) {
      let target = match[1].split('?')[0];
      if (/^(https?:|mailto:|data:)/.test(target)) continue;
      if (base && !target.startsWith(base + '/')) {
        failures.push(`${file}: missing base path in ${target}`);
        continue;
      }
      if (base) target = target.slice(base.length);
      if (!fs.existsSync(path.join(root, target))) failures.push(`${file}: missing ${target}`);
    }
    if (!html.includes('<h1>') || !html.includes('<title>')) failures.push(`${file}: missing page heading/title`);

    const relative = '/' + path.relative(root, file).split(path.sep).join('/');
    const route = relative.replace(/index\.html$/, '');
    const english = route.startsWith('/en/');
    const originalRoute = english ? route.slice(3) : route;
    const canonical = `${site.url}${base}${route}`;
    if (!html.includes(`<html lang="${english ? 'en' : 'zh-CN'}"`)) failures.push(`${file}: wrong document language`);
    if (!html.includes(`<link rel="canonical" href="${canonical}">`)) failures.push(`${file}: wrong canonical URL`);
    for (const [locale, language] of [['zh', 'zh-CN'], ['en', 'en']]) {
      const counterpart = `${base}${locale === 'en' ? '/en' : ''}${originalRoute}`;
      if (!html.includes(`<link rel="alternate" hreflang="${language}" href="${site.url}${counterpart}">`)) failures.push(`${file}: missing ${language} alternate`);
      if (!html.includes(`href="${counterpart}" data-language="${locale}"`)) failures.push(`${file}: language switch loses current page`);
    }
    if (!html.includes(`src="${base}/language.js"`)) failures.push(`${file}: missing language preference script`);
    const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
    for (const match of main.matchAll(/href="(\/(?!\/)[^"#?]*)(?:[?#][^"]*)?"/g)) {
      const target = match[1].slice(base.length);
      if ((target.endsWith('/') || target.endsWith('.html')) && target.startsWith('/en/') !== english) failures.push(`${file}: content link changes language (${match[1]})`);
    }
    const inSitemap = sitemap.includes(`<loc>${canonical}</loc>`);
    const shouldIndex = originalRoute !== '/404.html' && !(previewDrafts && originalRoute.startsWith('/thoughts/'));
    if (inSitemap !== shouldIndex) failures.push(`${file}: incorrect sitemap inclusion`);
    if (previewDrafts && !html.includes('<meta name="robots" content="noindex, nofollow">')) failures.push(`${file}: draft preview must be noindex`);
  }
}
walk(root);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Checked ${count} HTML pages: local links, assets, language pairs, navigation, and sitemap resolve.`);

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { prepareArticle } from './content.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const slug = process.argv[2];
if (!slug) throw new Error('Usage: node skills/substack-sync/scripts/browser.mjs SLUG');
const articles = prepareArticle(root, slug);
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/site.json'), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const pages = new Map(articles.map(article => {
  const body = marked.parse(article.markdown).replace(/src="(\/[^"\s]+)"/g, (_, url) => `src="${new URL(url, site.url).href}"`);
  const html = `<!doctype html><html lang="${article.language}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(article.title)}</title><style>body{max-width:720px;margin:40px auto;padding:0 24px;font:18px/1.7 system-ui;background:#faf9f6;color:#252525}img{max-width:100%;height:auto}h1,h2{line-height:1.3}blockquote{border-left:3px solid #bbb;margin-left:0;padding-left:20px}code{font-size:.9em}li{margin:10px 0}aside{font:14px/1.5 system-ui;color:#666;border-bottom:1px solid #ddd;padding-bottom:16px}</style><aside>Local transfer preview. Copy only the article body into a private Substack draft.</aside><h1 id="draft-title">${escape(article.title)}</h1><p id="draft-subtitle">${escape(article.subtitle)}</p><article id="substack-body" data-source-hash="${article.source_hash}">${body}</article></html>`;
  return [`/${article.language}`, html];
}));
const server = http.createServer((request, response) => {
  const html = pages.get(new URL(request.url, 'http://localhost').pathname);
  response.writeHead(html ? 200 : 404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(html || 'Not found');
});
server.listen(0, '127.0.0.1', () => {
  const origin = `http://127.0.0.1:${server.address().port}`;
  console.log(JSON.stringify({ slug, previews: articles.map(article => ({ language: article.language,
    url: `${origin}/${article.language}`, source_hash: article.source_hash,
    tables: article.tables.length, rows: article.tables.map(table => table.rows.length), images: article.assets.length })) }, null, 2));
});
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('SIGTERM', () => server.close(() => process.exit(0)));

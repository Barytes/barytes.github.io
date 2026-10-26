import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { convertMarkdown } from '@conorbronsdon/substack-mcp/dist/utils/markdown-to-prosemirror.js';

export const sha256 = value => createHash('sha256').update(value).digest('hex');
export const textOf = node => typeof node === 'string' ? node :
  (node.text || '') + (node.content || []).map(textOf).join('');
export const imagesOf = node => [
  ...(['image', 'image2'].includes(node.type) ? [{ src: node.attrs?.src, alt: node.attrs?.alt || null }] : []),
  ...(node.content || []).flatMap(imagesOf),
];

export function normalizeContent(content) {
  const tables = [];
  const html = marked.parse(content);
  if (/<(?:iframe|video|audio|script|input|math|svg)\b/i.test(html)) {
    throw new Error('Unsupported embedded media, form or markup; adapt it explicitly before syncing.');
  }
  const service = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
  service.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: content => `~~${content}~~`,
  });
  service.addRule('tables-as-labelled-lists', {
    filter: 'table',
    replacement(_content, node) {
      const descendants = (element, names) => Array.from(element.childNodes || []).flatMap(child =>
        names.includes(child.nodeName) ? [child] : descendants(child, names));
      const rows = descendants(node, ['TR']).map(row =>
        descendants(row, ['TH', 'TD']).map(cell => service.turndown(cell.innerHTML).trim()));
      const headers = rows.shift();
      if (!headers?.length || rows.some(row => row.length !== headers.length)) {
        throw new Error('Cannot preserve an irregular table. Adapt it explicitly before syncing.');
      }
      tables.push({ headers, rows });
      return '\n\n' + rows.map(row => '- ' + row.map((cell, i) => `**${headers[i]}:** ${cell}`).join(' · ')).join('\n\n') + '\n\n';
    },
  });
  const markdown = service.turndown(html);
  // Validate structure offline with placeholder origins; uploads replace these local paths before writes.
  const conversion = convertMarkdown(markdown.replace(/\]\((\/[^)]+)\)/g, '](https://local-assets.invalid$1)'));
  if (conversion.unsupported_nodes.length) {
    throw new Error(`Unsupported content after normalization: ${JSON.stringify(conversion.unsupported_nodes)}`);
  }
  return { markdown, tables, document: conversion.document };
}

export function prepareArticle(root, slug, languages = ['zh', 'en']) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error('Invalid article slug.');
  const site = JSON.parse(fs.readFileSync(path.join(root, 'src/site.json'), 'utf8'));
  const original = matter(fs.readFileSync(path.join(root, 'content/blog', `${slug}.md`), 'utf8'));
  return languages.map(language => {
    if (!['zh', 'en'].includes(language)) throw new Error('Language must be zh or en.');
    const translationFile = path.join(root, `content/translations/${language}/blog/${slug}.md`);
    const translated = fs.existsSync(translationFile) ? matter(fs.readFileSync(translationFile, 'utf8')) : null;
    if (!translated && (original.data.lang || 'zh-CN').split('-')[0] !== language) {
      throw new Error(`Missing ${language} translation for ${slug}.`);
    }
    const prose = translated || original;
    const title = prose.data.title || original.data.title;
    const subtitle = prose.data.description || original.data.description || '';
    const normalized = normalizeContent(prose.content);
    let markdown = normalized.markdown;
    const cover = ['png', 'jpg', 'webp'].map(ext => `/blog/${slug}.${ext}`)
      .find(url => fs.existsSync(path.join(root, 'public', url)));
    if (cover) {
      const alt = language === 'zh' ? `《${title}》的封面插画` : `Cover illustration for ${title}`;
      markdown = `![${alt}](${cover})\n\n${markdown}`;
    }
    // Absolute website links remain useful from Substack; local images are uploaded later.
    markdown = markdown.replace(/\]\((\/[^)]*)\)/g, (match, url, offset) => {
      const start = markdown.lastIndexOf('[', offset);
      return markdown[start - 1] === '!' ? match : `](${new URL(url, site.url).href})`;
    });
    const assets = [...new Set([...markdown.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)].map(m => m[1]))].map(url => {
      const file = path.resolve(root, 'public', '.' + url);
      if (!file.startsWith(path.resolve(root, 'public') + path.sep)) throw new Error('Image escapes public/.');
      return { url, file: path.relative(root, file), sha256: sha256(fs.readFileSync(file)) };
    });
    const sourceHash = sha256(JSON.stringify({ title, subtitle, markdown, assets }));
    return { slug, language, title, subtitle, markdown, assets, tables: normalized.tables,
      source_hash: sourceHash, original_date: original.data.date };
  });
}

export function renderDocument(markdown) {
  const conversion = convertMarkdown(markdown);
  if (conversion.unsupported_nodes.length) throw new Error('Refusing a lossy Markdown conversion.');
  return conversion.document;
}

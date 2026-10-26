#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareArticle, renderDocument, textOf, imagesOf, sha256 } from './content.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const compact = text => text.replace(/\s+/g, '');
const walk = node => [node, ...(node.content || []).flatMap(walk)];
// MCP's converter promotes image alt text to captions; browser HTML paste keeps it as alt only.
const browserText = node => node.type === 'caption' ? '' :
  (node.text || '') + (node.content || []).map(browserText).join('');

// Stable DOM content only: image load sizes and transient editor UI are excluded.
export function browserFingerprint(snapshot) {
  return sha256(JSON.stringify({ title: snapshot.title, subtitle: snapshot.subtitle,
    text: compact(snapshot.text), headings: snapshot.headings, lists: snapshot.lists,
    links: snapshot.links, images: snapshot.images, formatting: snapshot.formatting }));
}

export function validateBrowserSnapshot(article, snapshot) {
  const document = renderDocument(article.markdown.replace(/\]\((\/[^)]+)\)/g, '](https://local-assets.invalid$1)'));
  const nodes = walk(document);
  const expectedLinks = [...new Set(nodes.flatMap(node => (node.marks || [])
    .filter(mark => mark.type === 'link').map(mark => mark.attrs.href)))].sort();
  const actualLinks = [...new Set(snapshot.links.map(link => link.href))].sort();
  const expectedImages = imagesOf(document);
  if (snapshot.title !== article.title || snapshot.subtitle !== article.subtitle ||
      compact(snapshot.text) !== compact(browserText(document))) throw new Error('Browser title, subtitle or full text differs from source.');
  if (JSON.stringify(expectedLinks) !== JSON.stringify(actualLinks)) throw new Error('Browser links differ from source.');
  if (JSON.stringify(snapshot.headings) !== JSON.stringify(nodes.filter(n => n.type === 'heading' && n.attrs.level === 2).map(textOf))) {
    throw new Error('Browser headings differ from source.');
  }
  if (snapshot.images.length !== expectedImages.length || snapshot.images.some((image, i) =>
    image.alt !== expectedImages[i].alt || !/^https:\/\/(substackcdn\.com|substack-post-media\.s3\.amazonaws\.com)\//.test(image.src) ||
    !(snapshot.image_loads[i]?.width > 0 && snapshot.image_loads[i]?.height > 0))) {
    throw new Error('Browser images are missing, unloaded, unhosted or have different alt text.');
  }
  return browserFingerprint(snapshot);
}

function main() {
  const [command, slug, evidenceFile] = process.argv.slice(2);
  if (!['check', 'record'].includes(command) || !slug || !evidenceFile) {
    throw new Error('Usage: node skills/substack-sync/scripts/browser-state.mjs check|record SLUG READBACK_JSON');
  }
  const evidence = JSON.parse(fs.readFileSync(evidenceFile, 'utf8'));
  const stateFile = path.join(root, 'substack/sync-state.json');
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  const articles = prepareArticle(root, slug);
  for (const article of articles) {
    const key = `${slug}:${article.language}`;
    const snapshot = evidence[article.language];
    const mapping = state.articles[key];
    if (!mapping) throw new Error(`Run prepare before ${command}: ${key}`);
    const editor = new URL(snapshot.editor_url);
    const draftId = Number(editor.pathname.match(/^\/publish\/post\/(\d+)$/)?.[1]);
    if (editor.origin !== state.publication_url || !draftId || (mapping.draft_id && mapping.draft_id !== draftId)) {
      throw new Error(`Draft identity mismatch: ${key}`);
    }
    if (command === 'check') {
      if (!mapping.browser_content_sha256 || mapping.browser_content_sha256 !== browserFingerprint(snapshot)) {
        throw new Error(`Draft changed outside the last browser baseline: ${key}. Reconcile before writing.`);
      }
    } else {
      const fingerprint = validateBrowserSnapshot(article, snapshot);
      if (snapshot.ui_status !== 'draft' || snapshot.reopened !== true || snapshot.saved !== true ||
          snapshot.visual_check?.mobile !== true || snapshot.visual_check?.desktop !== true ||
          snapshot.draft_audience_observed !== 'everyone' || snapshot.preview_audience !== 'free_subscriber_view') {
        throw new Error(`Reopen, Saved, Drafts list, free audience and visual checks are required: ${key}`);
      }
      Object.assign(mapping, { source_hash: article.source_hash, synced_hash: article.source_hash,
        status: 'draft', draft_id: draftId, editor_url: snapshot.editor_url, transport: 'browser',
        browser_content_sha256: fingerprint, verified_at: evidence.checked_at,
        visual_check: snapshot.visual_check, preview_audience: snapshot.preview_audience,
        draft_audience_observed: snapshot.draft_audience_observed });
    }
  }
  if (command === 'record') {
    fs.writeFileSync(stateFile + '.tmp', JSON.stringify(state, null, 2) + '\n');
    fs.renameSync(stateFile + '.tmp', stateFile);
  }
  console.log(JSON.stringify({ command, slug, languages: articles.map(a => a.language), verified: true }));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}

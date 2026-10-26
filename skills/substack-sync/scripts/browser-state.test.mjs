import test from 'node:test';
import assert from 'node:assert/strict';
import { browserFingerprint, validateBrowserSnapshot } from './browser-state.mjs';

const article = { title: 'A draft', subtitle: 'Summary',
  markdown: '![Cover alt](/blog/cover.png)\n\n## Records\n\n- **File:** MISSION.md · **Purpose:** Goals\n\n[Source](https://example.com/)' };
const snapshot = { title: 'A draft', subtitle: 'Summary',
  text: 'Records\n\nFile: MISSION.md · Purpose: Goals\n\nSource',
  headings: ['Records'], lists: [['File: MISSION.md · Purpose: Goals']],
  links: [{ text: 'Source', href: 'https://example.com/' }],
  images: [{ alt: 'Cover alt', src: 'https://substackcdn.com/image/fetch/cover.png' }],
  image_loads: [{ width: 800, height: 400 }], formatting: { blockquote: 0, strong: 2, code: 0 } };

test('browser readback accepts alt-only images and detects missing cells, links and unloaded images', () => {
  assert.equal(validateBrowserSnapshot(article, snapshot), browserFingerprint(snapshot));
  assert.throws(() => validateBrowserSnapshot(article, { ...snapshot, text: snapshot.text.replace('Goals', '') }), /full text/);
  assert.throws(() => validateBrowserSnapshot(article, { ...snapshot, links: [] }), /links/);
  assert.throws(() => validateBrowserSnapshot(article, { ...snapshot, image_loads: [{ width: 0, height: 0 }] }), /images/);
});

test('browser conflict baseline ignores image resolution and detects remote prose or link edits', () => {
  assert.equal(browserFingerprint(snapshot), browserFingerprint({ ...snapshot, image_loads: [{ width: 1200, height: 600 }] }));
  assert.notEqual(browserFingerprint(snapshot), browserFingerprint({ ...snapshot, text: snapshot.text + 'Editor change' }));
  assert.notEqual(browserFingerprint(snapshot), browserFingerprint({ ...snapshot, links: [{ text: 'Source', href: 'https://example.org/' }] }));
});

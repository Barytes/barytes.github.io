import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { prepareArticle, normalizeContent, renderDocument, imagesOf, textOf, sha256 } from './content.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));

test('the real bilingual pilot keeps every table cell and both images', () => {
  const files = ['content/blog/skill-development.md', 'content/translations/en/blog/skill-development.md'];
  const before = files.map(file => sha256(fs.readFileSync(root + file)));
  const articles = prepareArticle(root, 'skill-development');
  for (const article of articles) {
    assert.deepEqual(article.tables.map(table => table.rows.length), [3, 6]);
    assert.equal(article.assets.length, 2);
    const hosted = article.markdown.replace(/\]\((\/[^)]+)\)/g, '](https://assets.example$1)');
    const document = renderDocument(hosted);
    const text = textOf(document);
    for (const table of article.tables) {
      for (const cell of [...table.headers, ...table.rows.flat()]) {
        const plain = textOf(renderDocument(cell));
        assert.ok(text.includes(plain), `Missing table cell: ${plain}`);
      }
    }
    assert.equal(imagesOf(document).length, 2);
    assert.ok(imagesOf(document).every(image => image.alt));
    assert.ok(!article.markdown.startsWith('---'), 'front matter is excluded');
  }
  assert.deepEqual(files.map(file => sha256(fs.readFileSync(root + file))), before, 'originals stay byte-for-byte unchanged');
});

test('raw HTML is normalized into actual paragraphs, links and images', () => {
  const { markdown, document } = normalizeContent('<h2>标题</h2><p>完整正文 <strong>必须保留</strong> <a href="https://example.com/source">引用</a></p><figure><img src="/blog/picture.png" alt="图的描述"></figure>');
  assert.match(textOf(document), /完整正文 必须保留 引用/);
  assert.equal(imagesOf(document).length, 1);
  assert.match(marked.parse(markdown), /href="https:\/\/example.com\/source"/);
});

test('an unsupported structure fails instead of being silently omitted', () => {
  assert.throws(() => normalizeContent('<iframe src="https://example.com/important-video"></iframe>'), /Unsupported embedded/);
});

test('strikethrough retains its meaning through the HTML normalization', () => {
  const { document } = normalizeContent('~~This is a retracted claim~~');
  assert.match(JSON.stringify(document), /strikethrough/);
});

test('all seven current blogs can be prepared as complete bilingual pairs', () => {
  for (const file of fs.readdirSync(root + 'content/blog').filter(file => file.endsWith('.md'))) {
    const articles = prepareArticle(root, file.slice(0, -3));
    assert.equal(articles.length, 2);
    assert.ok(articles.every(article => article.markdown.length > 500 && article.title));
  }
});

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked, Marked } from 'marked';
import { createHash } from 'node:crypto';

const site = JSON.parse(fs.readFileSync('src/site.json', 'utf8'));
const locales = JSON.parse(fs.readFileSync('src/locales.json', 'utf8'));
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const url = p => `${base}${p}`;
const localeRoute = (route, locale) => locale === 'en' ? `/en${route}` : route;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = type => fs.readdirSync(`content/${type}`).filter(f => f.endsWith('.md')).map(f => {
  const { data, content } = matter(fs.readFileSync(`content/${type}/${f}`, 'utf8'));
  return { ...data, content, slug: f.replace(/\.md$/, ''), type };
});
const sourcePapers = read('publications').sort((a, b) => a.order - b.order);
const previewDrafts = process.env.PREVIEW_DRAFTS === '1';
const output = previewDrafts ? 'dist-drafts' : 'dist';
const sourcePosts = read('blog').filter(p => {
  const status = p.status ?? 'published';
  if (!['draft', 'published'].includes(status)) throw new Error(`Blog ${p.slug}: status must be draft or published`);
  return status === 'published' || previewDrafts;
}).sort((a, b) => new Date(b.date) - new Date(a.date));
const draftPostRoutes = new Set(sourcePosts.filter(p => p.status === 'draft').map(p => `/blog/${p.slug}/`));
const segments = content => content.trim().split(/^\s*<!-- more -->\s*$/m).map(p => p.trim());
const sourceThreads = read('thoughts').filter(t => {
  if (!['draft', 'published'].includes(t.status)) throw new Error(`Thread ${t.slug}: status must be draft or published`);
  return t.status === 'published' || previewDrafts;
}).map(t => {
  if (typeof t.date !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/.test(t.date) || !Number.isFinite(Date.parse(t.date))) {
    throw new Error(`Thread ${t.slug}: date must be a quoted ISO timestamp with timezone`);
  }
  if (segments(t.content).some(p => !p)) throw new Error(`Thread ${t.slug}: each segment needs content`);
  return t;
}).sort((a, b) => Date.parse(b.date) - Date.parse(a.date) || a.slug.localeCompare(b.slug));

// Originals own dates, publication state, URLs and citation metadata. A language
// counterpart translates prose; official paper titles stay in English.
function translate(entry, locale) {
  const file = `content/translations/${locale}/${entry.type}/${entry.slug}.md`;
  let translated = entry;
  if (fs.existsSync(file)) {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const fields = entry.type === 'publications' ? ['description'] : ['title', 'description'];
    const unexpected = Object.keys(data).filter(key => !fields.includes(key));
    if (unexpected.length) throw new Error(`${file}: shared metadata belongs in the original (${unexpected.join(', ')})`);
    for (const field of fields) {
      if (entry[field] && (typeof data[field] !== 'string' || !data[field].trim())) throw new Error(`${file}: translated ${field} is required`);
    }
    if (!content.trim()) throw new Error(`${file}: translated body is required`);
    translated = { ...entry, ...data, content };
  } else {
    const originalLanguage = entry.lang || (entry.type === 'publications' ? 'en' : 'zh-CN');
    if (originalLanguage.split('-')[0] !== locale) throw new Error(`Missing translation: ${file}`);
  }
  if (entry.type === 'thoughts') {
    const parts = segments(translated.content);
    if (parts.some(p => !p) || parts.length !== segments(entry.content).length) throw new Error(`${file}: preserve the original thread segments`);
    translated = { ...translated, parts };
  }
  return { ...translated, lang: locales[locale].htmlLang };
}
const threadPageSize = 20;
const threadPageCount = Math.max(1, Math.ceil(sourceThreads.length / threadPageSize));
const threadRoute = page => page === 1 ? '/thoughts/' : `/thoughts/page/${page}/`;
const categories = [...new Set(sourcePosts.map(p => p.category))];
const pageRoutes = new Set([
  '/', '/blog/', '/publications/', '/404.html',
  ...categories.map(key => `/blog/category/${key}/`),
  ...Array.from({ length: threadPageCount }, (_, i) => threadRoute(i + 1)),
  ...[...sourcePosts, ...sourcePapers].map(p => `/${p.type}/${p.slug}/`),
]);
function internalHref(href, locale) {
  const [route] = href.split(/[?#]/);
  return url(pageRoutes.has(route) ? `${localeRoute(route, locale)}${href.slice(route.length)}` : href);
}
const markdown = (content, locale, parser = marked) => parser.parse(content)
  .replace(/href="(\/(?!\/)[^"]*)"/g, (_, href) => `href="${internalHref(href, locale)}"`)
  .replace(/src="\/(?!\/)/g, `src="${base}/`);
function attachmentUrl(value, field) {
  if (typeof value !== 'string' || !value.trim() || /[\s\\]/.test(value)) throw new Error(`link-card: ${field} must be an HTTP(S) URL or a /path`);
  const internal = value.startsWith('/') && !value.startsWith('//');
  const parsed = new URL(value, internal ? site.url : undefined);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error(`link-card: ${field} must use HTTP(S)`);
  return internal ? value : parsed.href;
}
const thoughtMarkdown = new Marked();
thoughtMarkdown.use({ renderer: {
  code({ lang, text }) {
    if (lang !== 'link-card') return false;
    const { data } = matter(`---\n${text}\n---`);
    const href = attachmentUrl(data.url, 'url');
    if (typeof data.title !== 'string' || !data.title.trim()) throw new Error('link-card: title is required');
    for (const field of ['description', 'image']) {
      if (data[field] !== undefined && typeof data[field] !== 'string') throw new Error(`link-card: ${field} must be text`);
    }
    const image = data.image ? attachmentUrl(data.image, 'image') : '';
    const host = new URL(href, site.url).hostname;
    return `<a class="thought-link-card${image ? ' has-image' : ''}" href="${esc(href)}">${image ? `<img class="thought-link-image" src="${esc(image)}" alt="" loading="lazy" decoding="async">` : ''}<span class="thought-link-copy"><span class="thought-link-title">${esc(data.title)}</span>${data.description ? `<span class="thought-link-description">${esc(data.description)}</span>` : ''}<span class="thought-link-source">${esc(host)} <span aria-hidden="true">↗</span></span></span></a>\n`;
  }
} });
const arrow = '<span aria-hidden="true">↗</span>';
const coverOf = slug => {
  const cover = ['.png', '.jpg', '.jpeg', '.webp'].map(ext => `/blog/${slug}${ext}`).find(p => fs.existsSync(`public${p}`));
  return cover ? `${cover}?v=${createHash('sha256').update(fs.readFileSync(`public${cover}`)).digest('hex').slice(0, 12)}` : '';
};
const threadDate = d => new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(new Date(d)).split('/').reverse().join('.');
const paths = [];
function write(route, html, locale) {
  const localized = localeRoute(route, locale);
  const target = localized.endsWith('.html') ? `${output}${localized}` : `${output}${localized}index.html`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
  paths.push({ route, locale });
}
// Validate both editions before replacing the last successful build.
const editions = Object.keys(locales).map(locale => ({
  locale,
  posts: sourcePosts.map(p => translate(p, locale)),
  papers: sourcePapers.map(p => translate(p, locale)),
  threads: sourceThreads.map(t => translate(t, locale)),
}));
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output);
fs.cpSync('public', output, { recursive: true });
for (const file of ['style.css', 'language.js']) fs.copyFileSync(`src/${file}`, `${output}/${file}`);

for (const { locale, posts, papers, threads } of editions) {
  const t = locales[locale];
  const name = locale === 'zh' ? site.chineseName : site.name;
  const pageUrl = route => url(localeRoute(route, locale));
  const link = (route, text, cl = 'text-link') => `<a class="${cl}" href="${pageUrl(route)}">${text}</a>`;
  const date = d => new Date(d).toLocaleDateString(t.dateLocale, { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const status = p => esc(t.statuses[p.status] || p.status);
  function layout(title, section, body, route = '/', description = site.description[locale], image = '') {
    const canonical = `${site.url}${pageUrl(route)}`;
    const alternates = Object.entries(locales).map(([key, value]) => `<link rel="alternate" hreflang="${value.htmlLang}" href="${site.url}${url(localeRoute(route, key))}">`).join('');
    const switcher = `<div class="language-switch" role="group" aria-label="${t.language}">${[['zh', '中文'], ['en', 'EN']].map(([key, label]) => `<a href="${url(localeRoute(route, key))}" data-language="${key}" lang="${locales[key].htmlLang}" hreflang="${locales[key].htmlLang}" aria-label="${key === 'zh' ? '切换到中文' : 'Switch to English'}"${key === locale ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</div>`;
    const navigation = [['/', 'about'], ['/blog/', 'blog'], ['/thoughts/', 'thoughts'], ['/publications/', 'publications']].map(([p, key]) => `<a href="${pageUrl(p)}"${section === key ? ' aria-current="page"' : ''}>${t[key]}</a>`).join('');
    return `<!doctype html><html lang="${t.htmlLang}" data-locale="${locale}" data-base="${esc(base)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}">${previewDrafts ? '<meta name="robots" content="noindex, nofollow">' : ''}<meta name="theme-color" content="#f7f5ef"><title>${esc(title)}${title === name ? '' : ` — ${name}`}</title><link rel="canonical" href="${canonical}">${alternates}<link rel="alternate" hreflang="x-default" href="${site.url}${url(route)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${section === 'blog' && route.startsWith('/blog/') && !route.includes('/category/') && route !== '/blog/' ? 'article' : 'website'}"><meta property="og:url" content="${canonical}"><meta property="og:locale" content="${locale === 'zh' ? 'zh_CN' : 'en_US'}">${image ? `<meta property="og:image" content="${esc(site.url)}${url(image)}">` : ''}<link rel="icon" href="data:,"><link rel="stylesheet" href="${url('/style.css')}"><script src="${url('/language.js')}"></script></head><body><a class="skip" href="#main">${t.skip}</a><header class="header"><a class="wordmark" href="${pageUrl('/')}">${name}</a><nav aria-label="${t.navigation}">${navigation}</nav><div class="header-actions">${switcher}<a class="header-contact" href="mailto:${site.email}">${t.contact} ${arrow}</a></div></header><main id="main">${body}</main><footer><div class="footer-top"><a class="wordmark" href="${pageUrl('/')}">${name}</a><div><a href="mailto:${site.email}">${t.email} ${arrow}</a><a href="${site.github}">GitHub ${arrow}</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${name}</span><a href="#main">${t.top}</a></div></footer></body></html>`;
  }
  function paperRow(p, i) {
    return `<a class="paper-row" href="${pageUrl(`/publications/${p.slug}/`)}"><span class="row-number">${String(i + 1).padStart(2, '0')}</span><div><div class="meta">${esc(p.venue)} · ${p.year}<span class="status ${p.status === 'Under review' ? 'muted' : ''}">${status(p)}</span></div><h3>${esc(p.title)}</h3></div><span class="row-arrow" aria-hidden="true">↗</span></a>`;
  }
  function postCard(p, i) {
    const cover = coverOf(p.slug);
    const art = cover
      ? `<div class="post-art"><img src="${url(cover)}" alt=""><span class="art-arrow">↗</span></div>`
      : `<div class="post-art art-${i % 2}" aria-hidden="true">${i % 2 ? '<div class="orbit one"></div><div class="orbit two"></div><div class="orbit three"></div><span class="orbit-center"></span>' : '<div class="balance"><i></i><i></i><i></i><i></i><i></i></div>'}<span class="art-arrow">↗</span></div>`;
    return `<a class="post-card" href="${pageUrl(`/blog/${p.slug}/`)}">${art}<div class="meta">${esc(t.categories[p.category])} <span>· ${p.sample ? t.sample : date(p.date)}</span>${p.status === 'draft' ? `<span class="thread-draft">${t.draft}</span>` : ''}</div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><span class="read-link">${t.readNote} ${arrow}</span></a>`;
  }
  function blogPage(active = '') {
    const entries = active ? posts.filter(p => p.category === active) : posts;
    const route = active ? `/blog/category/${active}/` : '/blog/';
    const label = active ? t.categories[active] : '';
    const filters = ['', ...categories].map(key => {
      const count = key ? posts.filter(p => p.category === key).length : posts.length;
      if (key && !t.categories[key]) throw new Error(`Missing ${locale} category label: ${key}`);
      return `<a class="category-link" href="${pageUrl(key ? `/blog/category/${key}/` : '/blog/')}"${key === active ? ' aria-current="page"' : ''}>${esc(key ? t.categories[key] : t.all)}<span>${count}</span></a>`;
    }).join('');
    write(route, layout(label ? `${label} — ${t.blog}` : t.blog, 'blog', `<section class="page-heading"><h1>${t.blog}</h1></section><section class="listing"><nav class="category-nav" aria-label="${t.categoriesLabel}">${filters}</nav><div class="post-grid">${entries.map(postCard).join('')}</div></section>`, route), locale);
  }
  blogPage();
  for (const key of categories) blogPage(key);
  function threadRow(thread) {
    const parts = thread.parts.map((part, index) => {
      try { return `<li class="thread-part"><div class="prose thread-prose">${markdown(part, locale, thoughtMarkdown)}</div></li>`; }
      catch (error) { throw new Error(`Thread ${thread.slug}, segment ${index + 1}: ${error.message}`); }
    }).join('');
    return `<article class="thread" lang="${t.htmlLang}" aria-label="${esc(thread.title || `${t.thread} · ${threadDate(thread.date)}`)}"><header class="thread-meta"><time datetime="${esc(thread.date)}">${threadDate(thread.date)}</time>${thread.status === 'draft' ? `<span class="thread-draft">${t.draft}</span>` : ''}</header><div class="thread-content">${thread.title ? `<h2 class="thread-title">${esc(thread.title)}</h2>` : ''}<ol class="thread-parts ${thread.parts.length > 1 ? 'thread-connected' : 'thread-single'}" aria-label="${t.segments}">${parts}</ol></div></article>`;
  }
  for (let page = 1; page <= threadPageCount; page++) {
    const entries = threads.slice((page - 1) * threadPageSize, page * threadPageSize);
    const pagination = threadPageCount > 1 ? `<nav class="thread-pagination" aria-label="${t.pagination}"><span>${page > 1 ? link(threadRoute(page - 1), t.newer) : ''}</span><span class="thread-page-count">${page} / ${threadPageCount}</span><span>${page < threadPageCount ? link(threadRoute(page + 1), t.older) : ''}</span></nav>` : '';
    write(threadRoute(page), layout(page === 1 ? t.thoughts : `${t.thoughts} — ${page}`, 'thoughts', `<section class="page-heading"><h1>${t.thoughts}</h1></section><section class="thread-list" aria-label="${t.thoughts}">${entries.length ? entries.map(threadRow).join('') : `<p class="thread-empty">${t.empty}</p>`}${pagination}</section>`, threadRoute(page), t.thoughtDescription), locale);
  }
  write('/publications/', layout(t.publications, 'publications', `<section class="page-heading"><h1>${t.publications}</h1></section><section class="listing">${papers.map(paperRow).join('')}</section>`, '/publications/'), locale);
  for (const p of [...posts, ...papers]) {
    const paper = p.type === 'publications';
    const route = `/${p.type}/${p.slug}/`;
    const related = (paper ? papers : posts).filter(x => x.slug !== p.slug);
    const cover = paper ? '' : coverOf(p.slug);
    const coverHtml = cover ? `<figure class="article-cover"><img src="${url(cover)}" alt="${esc(p.title)}"></figure>` : '';
    const minutes = Math.max(1, Math.ceil((p.content.replace(/<[^>]*>/g, '').match(/[\u4e00-\u9fff]|[a-zA-Z]+/g) || []).length / 300));
    const metadata = paper
      ? `<p class="authors">${esc(p.authors)}</p><div class="publication-meta"><span>${esc(p.venue)}</span><span class="status ${p.status === 'Under review' ? 'muted' : ''}">${status(p)}</span></div><div class="paper-actions"><a class="button" href="${url(p.pdf)}" target="_blank" rel="noopener">${t.readPaper} ${arrow}</a>${p.doi ? `<a class="text-link" href="${esc(p.doi)}">${t.publishedVersion} ${arrow}</a>` : ''}</div>`
      : `<p class="article-meta">${date(p.date)} · ${minutes} ${t.minutes}${p.status === 'draft' ? ` · <span class="thread-draft">${t.draft}</span>` : ''}</p>`;
    write(route, layout(p.title, paper ? 'publications' : 'blog', `<article class="article"><a class="back-link" href="${pageUrl(`/${p.type}/`)}">${paper ? t.allPapers : t.allNotes}</a><header class="article-header"><h1>${esc(p.title)}</h1>${metadata}</header>${coverHtml}<div class="prose">${markdown(p.content, locale)}</div><div class="article-end"><span>${t.continue}</span>${related.slice(0, 1).map(r => link(`/${r.type}/${r.slug}/`, `${esc(r.title)} ${arrow}`)).join('')}</div></article>`, route, p.description, cover), locale);
  }
  const indexHero = `<section class="index-hero"><div><h1>${name}</h1><dl class="contact-details"><div><dt>${t.email}:</dt><dd><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd></div><div><dt>GitHub:</dt><dd><a href="${esc(site.github)}">${esc(site.github.replace(/^https?:\/\//, ''))}</a></dd></div><div><dt>Substack:</dt><dd><a href="https://barytes.substack.com">barytes.substack.com</a></dd></div></dl></div><div class="index-description"><p>${esc(site.intro[locale])} ${esc(site.current[locale])}</p></div></section>`;
  const research = `<section class="section home-research"><div class="section-heading"><h2>${t.research}</h2>${link('/publications/', t.viewAll)}</div>${papers.map(paperRow).join('')}</section>`;
  const writing = `<section class="section"><div class="section-heading"><h2>${t.writing}</h2>${link('/blog/', t.allArticles)}</div><div class="post-grid">${posts.slice(0, 2).map(postCard).join('')}</div></section>`;
  const education = `<section class="education-section"><h2>${t.education}</h2><div><div class="education-row"><span>2023 — 2026</span><h3>${t.masters}</h3><p>${t.university} · ${t.supervisor}</p></div><div class="education-row"><span>2018 — 2022</span><h3>${t.bachelors}</h3><p>${t.university}</p></div></div></section>`;
  write('/', layout(name, 'about', indexHero + research + writing + education), locale);
  write('/404.html', layout(t.notFound, '', `<section class="page-heading not-found"><h1>${t.lost}</h1>${link('/', t.home, 'button')}</section>`, '/404.html'), locale);
}
fs.writeFileSync(`${output}/.nojekyll`, '');
fs.writeFileSync(`${output}/robots.txt`, previewDrafts ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${site.url}${base}/sitemap.xml\n`);
const sitemapEntries = paths.filter(({ route }) => route !== '/404.html' && !draftPostRoutes.has(route) && !(previewDrafts && route.startsWith('/thoughts/'))).map(({ route, locale }) => `<url><loc>${site.url}${url(localeRoute(route, locale))}</loc>${Object.entries(locales).map(([key, value]) => `<xhtml:link rel="alternate" hreflang="${value.htmlLang}" href="${site.url}${url(localeRoute(route, key))}"/>`).join('')}</url>`).join('');
fs.writeFileSync(`${output}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${sitemapEntries}</urlset>`);
console.log(`Built ${paths.length} pages in Chinese and English → ${output}/ (base: ${base || '/'})`);

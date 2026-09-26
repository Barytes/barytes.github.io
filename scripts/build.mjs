import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
const site = JSON.parse(fs.readFileSync('src/site.json', 'utf8'));
const base = (process.env.BASE_PATH || '').replace(/\/$/, '');
const url = p => `${base}${p}`;
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const read = type => fs.readdirSync(`content/${type}`).filter(f => f.endsWith('.md')).map(f => {
 const {data, content} = matter(fs.readFileSync(`content/${type}/${f}`, 'utf8'));
 return {...data, content, slug:f.replace(/\.md$/, ''), type};
});
const posts = read('blog').sort((a,b) => new Date(b.date)-new Date(a.date));
const papers = read('publications').sort((a,b) => a.order-b.order);
const date = d => new Date(d).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric', timeZone:'UTC'});
const arrow = '<span aria-hidden="true">↗</span>';
const link = (p,t,cl='text-link') => `<a class="${cl}" href="${url(p)}">${t}</a>`;
function layout(title, section, body, route='/', description=site.description, lang='en') {
 return `<!doctype html><html lang="${esc(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f7f5ef"><title>${esc(title)}${title===site.name?'':` — ${site.name}`}</title><link rel="canonical" href="${site.url}${url(route)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="${route.includes('/blog/')&&route!='/blog/'&&!route.includes('/category/')?'article':'website'}"><meta property="og:url" content="${site.url}${url(route)}"><link rel="icon" href="data:,"><link rel="stylesheet" href="${url('/style.css')}"></head><body><a class="skip" href="#main">Skip to content</a><header class="header"><a class="wordmark" href="${url('/')}">${site.name}</a><nav aria-label="Main navigation">${[['/','About'],['/blog/','Blog'],['/publications/','Publications']].map(([p,t])=>`<a href="${url(p)}" ${section===t?'aria-current="page"':''}>${t}</a>`).join('')}</nav><a class="header-contact" href="mailto:${site.email}">Get in touch ${arrow}</a></header><main id="main">${body}</main><footer><div class="footer-top"><a class="wordmark" href="${url('/')}">${site.name}<span class="chinese">${site.chineseName}</span></a><div><a href="mailto:${site.email}">Email ${arrow}</a><a href="${site.github}">GitHub ${arrow}</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ${site.name}</span><a href="#main">Back to top ↑</a></div></footer></body></html>`;
}
function paperRow(p,i) { return `<a class="paper-row" href="${url(`/publications/${p.slug}/`)}"><span class="row-number">${String(i+1).padStart(2,'0')}</span><div><div class="meta">${esc(p.venue)} · ${p.year}<span class="status ${p.status==='Under review'?'muted':''}">${esc(p.status)}</span></div><h3>${esc(p.title)}</h3></div><span class="row-arrow" aria-hidden="true">↗</span></a>`; }
function postCard(p,i) {return `<a class="post-card" href="${url(`/blog/${p.slug}/`)}"><div class="post-art art-${i%2}" aria-hidden="true">${i%2?'<div class="orbit one"></div><div class="orbit two"></div><div class="orbit three"></div><span class="orbit-center"></span>':'<div class="balance"><i></i><i></i><i></i><i></i><i></i></div>'}<span class="art-arrow">↗</span></div><div class="meta">${esc(p.tag)} <span>· ${p.sample?'示例草稿':date(p.date)}</span></div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p><span class="read-link">Read the note <span aria-hidden="true">↗</span></span></a>`;}
const paths=[];
function write(route, html){const target = route.endsWith('.html')?`dist${route}`:`dist${route}index.html`;fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html);paths.push(route);}
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist');fs.cpSync('public','dist',{recursive:true});fs.copyFileSync('src/style.css','dist/style.css');
const backgroundSection = `<section class="education-section"><div><h2>Education</h2></div><div><div class="education-row"><span>2023 — 2026</span><h3>M.Eng. in Software Engineering</h3><p>Sun Yat-sen University · Supervisor: Prof. Guocheng Liao</p></div><div class="education-row"><span>2018 — 2022</span><h3>B.Eng. in Software Engineering</h3><p>Sun Yat-sen University</p></div></div></section>
`;
const categories = [...new Map(posts.map(p => [p.category, p.tag])).entries()];
function blogPage(active = '') {
 const entries = active ? posts.filter(p => p.category === active) : posts;
 const route = active ? `/blog/category/${active}/` : '/blog/';
 const label = categories.find(([key]) => key === active)?.[1];
 const filters = [['', '全部'], ...categories].map(([key, name]) => {
  const count = key ? posts.filter(p => p.category === key).length : posts.length;
  return `<a class="category-link" href="${url(key ? `/blog/category/${key}/` : '/blog/')}" ${key === active ? 'aria-current="page"' : ''}>${esc(name)}<span>${count}</span></a>`;
 }).join('');
 write(route, layout(label ? `${label} — Blog` : 'Blog', 'Blog', `<section class="page-heading"><h1>Blog</h1></section><section class="listing"><nav class="category-nav" aria-label="博客分类">${filters}</nav><div class="post-grid">${entries.map(postCard).join('')}</div></section>`, route));
}
blogPage();
for (const [key] of categories) blogPage(key);
write('/publications/',layout('Publications','Publications',`<section class="page-heading"><h1>Publications</h1></section><section class="listing">${papers.map(paperRow).join('')}</section>`,'/publications/'));
for(const p of [...posts,...papers]){
 const paper = p.type==='publications';
 const route=`/${p.type}/${p.slug}/`;
 const body=marked.parse(p.content).replace(/href="\/(?!\/)/g,`href="${base}/`).replace(/src="\/(?!\/)/g,`src="${base}/`);
 const related=paper?papers.filter(x=>x.slug!==p.slug):posts.filter(x=>x.slug!==p.slug);
 write(route, layout(p.title,paper?'Publications':'Blog',`<article class="article"><a class="back-link" href="${url(`/${p.type}/`)}">← All ${paper?'publications':'notes'}</a><header class="article-header"><h1>${esc(p.title)}</h1>${paper?`<p class="authors">${esc(p.authors)}</p><div class="publication-meta"><span>${esc(p.venue)}</span><span class="status">${esc(p.status)}</span></div><div class="paper-actions"><a class="button" href="${url(p.pdf)}" target="_blank" rel="noopener">Read paper (PDF) ${arrow}</a>${p.doi?`<a class="text-link" href="${esc(p.doi)}">Published version ${arrow}</a>`:''}</div>`:`<p class="article-meta">${date(p.date)} · ${Math.max(1,Math.ceil((p.content.replace(/<[^>]*>/g,'').match(/[\u4e00-\u9fff]|[a-zA-Z]+/g)||[]).length/300))} min read</p>`}</header><div class="prose">${body}</div><div class="article-end"><span>Continue exploring</span>${related.slice(0,1).map(r=>link(`/${r.type}/${r.slug}/`,`${esc(r.title)} ${arrow}`)).join('')}</div></article>`,route,p.description,p.lang||'en'));
}

const indexHero = `<section class="index-hero"><div><h1>Beiyan Liu <span>刘倍延</span></h1><dl class="contact-details"><div><dt>Email:</dt><dd><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd></div><div><dt>GitHub:</dt><dd><a href="${esc(site.github)}">${esc(site.github.replace(/^https?:\/\//,''))}</a></dd></div><div><dt>Substack:</dt><dd><a href="https://barytes.substack.com">barytes.substack.com</a></dd></div></dl></div><div class="index-description"><p>${esc(site.intro)} ${esc(site.current)}</p></div></section>`;
const researchSection = `<section class="section home-research"><div class="section-heading"><div><h2>Publications & manuscripts</h2></div>${link('/publications/','View all ↗')}</div>${papers.map(paperRow).join('')}</section>`;
const writingSection = `<section class="section"><div class="section-heading"><h2>Recent writing</h2>${link('/blog/','All articles ↗')}</div><div class="post-grid">${posts.slice(0,2).map(postCard).join('')}</div></section>`;
write('/',layout(site.name,'About',indexHero+researchSection+writingSection+backgroundSection));

write('/404.html',layout('Page not found','',`<section class="page-heading not-found"><h1>This page wandered off.</h1>${link('/','Back to home ↗','button')}</section>`,'/404.html'));
fs.writeFileSync('dist/.nojekyll','');
fs.writeFileSync('dist/robots.txt',`User-agent: *\nAllow: /\nSitemap: ${site.url}${base}/sitemap.xml\n`);
fs.writeFileSync('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.filter(p=>p!='/404.html').map(p=>`<url><loc>${site.url}${url(p)}</loc></url>`).join('')}</urlset>`);
console.log(`Built ${paths.length} pages → dist/ (base: ${base || '/'})`);

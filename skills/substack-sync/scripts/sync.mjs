#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { prepareArticle, renderDocument, imagesOf, sha256, textOf } from './content.mjs';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const PRIVATE = path.join(ROOT, '.substack');
const STATE_FILE = path.join(ROOT, 'substack/sync-state.json');
const SERVER = fileURLToPath(new URL('../node_modules/@conorbronsdon/substack-mcp/dist/index.js', import.meta.url));
const ALLOWED = new Set(['get_publication', 'get_sections', 'list_drafts', 'get_draft', 'export_draft',
  'preflight_draft', 'create_draft', 'plan_draft_update', 'update_draft', 'upload_image']);
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'substack/config.json'), 'utf8'));
const readState = () => JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
function saveState(state) {
  const temp = STATE_FILE + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(state, null, 2) + '\n');
  fs.renameSync(temp, STATE_FILE);
}
function writePrivate(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
}
function loadEnvironment() {
  const env = Object.fromEntries(Object.entries(process.env).filter(([, value]) => typeof value === 'string'));
  env.SUBSTACK_MCP_HOME ||= path.join(PRIVATE, 'auth');
  env.SUBSTACK_REQUEST_TIMEOUT_MS ||= '15000';
  const credentialFile = path.join(PRIVATE, 'credentials.json');
  if (fs.existsSync(credentialFile) && !env.SUBSTACK_SESSION_TOKEN) {
    const credentials = JSON.parse(fs.readFileSync(credentialFile, 'utf8'));
    if (credentials.session_token) {
      env.SUBSTACK_PUBLICATION_URL = credentials.publication_url;
      env.SUBSTACK_SESSION_TOKEN = credentials.session_token;
      env.SUBSTACK_USER_ID = String(credentials.user_id);
    }
  }
  if (env.SUBSTACK_SESSION_TOKEN && env.SUBSTACK_PUBLICATION_URL !== config.publication_url) {
    throw new Error('Credential publication differs from substack/config.json. No remote call made.');
  }
  return env;
}
async function withMcp(action) {
  const env = loadEnvironment();
  if (!env.SUBSTACK_SESSION_TOKEN && !env.SUBSTACK_PROFILES &&
      !fs.existsSync(path.join(env.SUBSTACK_MCP_HOME, 'session.json')) && env.SUBSTACK_CREDENTIAL_STORE !== 'keychain') {
    throw new Error('MCP_AUTH_REQUIRED: configure Substack credentials in this environment; see skills/substack-sync/references/setup.md. An in-app browser login does not authenticate this MCP process.');
  }
  const transport = new StdioClientTransport({ command: process.execPath, args: [SERVER],
    cwd: ROOT, env, stderr: 'pipe' });
  const client = new Client({ name: 'barytes-substack-draft-sync', version: '1.0.0' });
  // The upstream may log authentication failures; never forward arbitrary server logs.
  transport.stderr?.on('data', () => {});
  try {
    await client.connect(transport);
    const call = async (name, args = {}) => {
      if (!ALLOWED.has(name)) throw new Error(`Tool is outside the draft-only allowlist: ${name}`);
      const result = await client.callTool({ name, arguments: args }, undefined, { timeout: 60000 });
      const text = result.content?.filter(item => item.type === 'text').map(item => item.text).join('\n');
      if (result.isError) throw new Error(`${name}: ${text}`);
      return result.structuredContent || JSON.parse(text);
    };
    return await action(call, client);
  } finally { await client.close(); }
}
function prepare(slug) {
  const articles = prepareArticle(ROOT, slug, config.languages);
  const state = readState();
  for (const article of articles) {
    const dir = path.join(PRIVATE, 'prepared', slug);
    writePrivate(path.join(dir, `${article.language}.md`), article.markdown + '\n');
    writePrivate(path.join(dir, `${article.language}.json`), article);
    const key = `${slug}:${article.language}`;
    const mapping = state.articles[key] ||= { slug, language: article.language, status: 'pending' };
    mapping.source_hash = article.source_hash;
    if (mapping.synced_hash !== article.source_hash && mapping.status !== 'create_pending') mapping.status = 'pending';
  }
  saveState(state);
  return articles;
}
function summarize(article) {
  return { slug: article.slug, language: article.language, title: article.title,
    tables_converted: article.tables.length, table_rows: article.tables.map(table => table.rows.length),
    local_images: article.assets.length, source_hash: article.source_hash };
}
function hostedMarkdown(article, state) {
  let markdown = article.markdown;
  for (const asset of article.assets) {
    const hosted = state.assets[asset.sha256]?.url;
    if (!hosted) throw new Error(`Image has not been uploaded: ${asset.file}`);
    markdown = markdown.replaceAll(`](${asset.url})`, `](${hosted})`);
  }
  return markdown;
}
async function verify(call, article, state) {
  const key = `${article.slug}:${article.language}`;
  const mapping = state.articles[key];
  const exported = await call('export_draft', { draft_id: mapping.draft_id });
  if (exported.publication_url !== config.publication_url || exported.is_published !== false) {
    throw new Error(`Draft publication/state cannot be verified for ${key}.`);
  }
  const expected = renderDocument(hostedMarkdown(article, state));
  const observed = JSON.parse(exported.source_prosemirror || 'null');
  if (!observed || exported.title !== article.title || exported.subtitle !== article.subtitle ||
      textOf(observed) !== textOf(expected) || JSON.stringify(imagesOf(observed)) !== JSON.stringify(imagesOf(expected))) {
    throw new Error(`Remote title, subtitle, text or images differ for ${key}. Inspect the existing draft; no automatic retry.`);
  }
  if (exported.unsupported_nodes.length || !exported.preflight.checks_passed) {
    throw new Error(`Remote draft preflight/conversion failed for ${key}.`);
  }
  const evidence = { ...summarize(article), draft_id: mapping.draft_id, editor_url: exported.editor_url,
    checked_at: new Date().toISOString(), is_published: false, remote_text_matches: true,
    remote_images: imagesOf(observed), remote_source_sha256: exported.source_sha256,
    preflight: exported.preflight, visual_check: 'pending' };
  writePrivate(path.join(PRIVATE, 'evidence', `${article.slug}-${article.language}.json`), evidence);
  mapping.synced_hash = article.source_hash;
  mapping.remote_source_sha256 = exported.source_sha256;
  mapping.status = 'draft';
  mapping.editor_url = exported.editor_url;
  mapping.verified_at = evidence.checked_at;
  saveState(state);
  return evidence;
}
async function sync(call, articles, verifyOnly) {
  const publication = await call('get_publication');
  if (publication.publication_url !== config.publication_url) throw new Error('Wrong publication.');
  const state = readState();
  if (state.publication_url !== config.publication_url) throw new Error('Sync state belongs to a different publication.');
  const drafts = [];
  for (let offset = 0; ; offset += 50) {
    const page = await call('list_drafts', { offset, limit: 50 });
    drafts.push(...page);
    if (page.length < 50) break;
  }
  const results = [];
  for (const article of articles) {
    const key = `${article.slug}:${article.language}`;
    let mapping = state.articles[key];
    if (mapping?.transport === 'browser') {
      throw new Error(`Draft ${mapping.draft_id} uses a browser verification baseline. Continue with references/browser.md; establish an MCP export/image baseline before changing transport.`);
    }
    if (verifyOnly) {
      if (!mapping?.draft_id) throw new Error(`No mapped draft for ${key}.`);
      results.push(await verify(call, article, state));
      continue;
    }
    if (!mapping?.draft_id) {
      const existing = drafts.filter(draft => draft.title === article.title);
      if (existing.length) {
        if (mapping?.status !== 'create_pending' || existing.length !== 1) {
          throw new Error(`An unmapped draft already has this title: ${article.title}. Associate it before creating anything.`);
        }
        mapping.draft_id = existing[0].id;
        saveState(state);
        results.push(await verify(call, article, state));
        continue;
      }
    } else {
      const existing = await call('export_draft', { draft_id: mapping.draft_id });
      if (existing.is_published !== false) throw new Error(`Mapped post ${mapping.draft_id} is no longer an editable draft.`);
      if (mapping.remote_source_sha256 && existing.source_sha256 !== mapping.remote_source_sha256) {
        throw new Error(`Draft ${mapping.draft_id} changed outside the repository. Resolve the difference before syncing.`);
      }
      if (mapping.synced_hash === article.source_hash) {
        results.push(await verify(call, article, state));
        continue;
      }
    }
    for (const asset of article.assets) {
      if (!state.assets[asset.sha256]) {
        const uploaded = await call('upload_image', { image_path: path.join(ROOT, asset.file) });
        state.assets[asset.sha256] = { url: uploaded.image_url, file: asset.file };
        saveState(state);
      }
    }
    const payload = { title: article.title, subtitle: article.subtitle,
      body: hostedMarkdown(article, state), audience: 'everyone', allow_unsupported: false };
    if (!mapping?.draft_id) {
      mapping = state.articles[key] = { slug: article.slug, language: article.language,
        source_hash: article.source_hash, status: 'create_pending' };
      saveState(state);
      const created = await call('create_draft', payload);
      mapping.draft_id = created.id;
      saveState(state); // Keep the ID even if readback fails.
    } else {
      const changes = { draft_id: mapping.draft_id, ...payload };
      const plan = await call('plan_draft_update', changes);
      if (plan.unsupported_nodes.length) throw new Error('Update would lose unsupported content.');
      const applied = await call('update_draft', { ...changes, receipt: plan.receipt });
      if (applied.status !== 'verified') throw new Error(`Draft update was ${applied.status}; inspect it before retrying.`);
    }
    results.push(await verify(call, article, state));
  }
  return results;
}

async function main() {
  const [command, slug, ...flags] = process.argv.slice(2);
  if (command === 'prepare' && slug && !flags.length) return prepare(slug).map(summarize);
  if (command === 'doctor' && !slug) return withMcp(async (call, client) => ({
    publication: await call('get_publication'), sections: await call('get_sections'),
    draft_tools: (await client.listTools()).tools.map(tool => tool.name).filter(name => ALLOWED.has(name)),
  }));
  if (['sync', 'verify'].includes(command) && slug &&
      (command === 'verify' ? !flags.length : flags.length === 1 && flags[0] === '--write-drafts')) {
    const articles = prepare(slug);
    return withMcp(call => sync(call, articles, command === 'verify'));
  }
  throw new Error('Usage: node skills/substack-sync/scripts/sync.mjs prepare|verify SLUG; sync SLUG --write-drafts; doctor. Publishing is not implemented.');
}
main().then(result => console.log(JSON.stringify(result, null, 2))).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

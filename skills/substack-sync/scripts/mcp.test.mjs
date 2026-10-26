import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('the installed MCP handshakes and rejects a lossy table before a write', async () => {
  const server = fileURLToPath(new URL('../node_modules/@conorbronsdon/substack-mcp/dist/index.js', import.meta.url));
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('SUBSTACK_')));
  // Deliberately non-routable test publication; never load or send real credentials.
  Object.assign(env, { SUBSTACK_PUBLICATION_URL: 'https://example.invalid',
    SUBSTACK_SESSION_TOKEN: 'offline-mcp-contract-fixture', SUBSTACK_USER_ID: '1',
    SUBSTACK_REQUEST_TIMEOUT_MS: '1000' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [server], env, stderr: 'pipe' });
  const client = new Client({ name: 'substack-sync-contract-check', version: '1.0.0' });
  transport.stderr?.on('data', () => {});
  try {
    await client.connect(transport);
    const names = (await client.listTools()).tools.map(tool => tool.name);
    for (const name of ['create_draft', 'export_draft', 'plan_draft_update', 'update_draft', 'upload_image']) {
      assert.ok(names.includes(name), `Missing required MCP tool ${name}`);
    }
    assert.ok(!names.some(name => /publish.*draft|schedule.*draft/.test(name)));
    const result = await client.callTool({ name: 'create_draft', arguments: {
      title: 'Offline conversion check', body: '| A | B |\n| --- | --- |\n| one | two |', allow_unsupported: false,
    } });
    assert.equal(result.isError, true);
    const response = JSON.parse(result.content.find(item => item.type === 'text').text);
    assert.equal(response.code, 'unsupported_markdown');
    assert.ok(response.unsupported_nodes.some(node => node.type === 'table'));
  } finally { await client.close(); }
});

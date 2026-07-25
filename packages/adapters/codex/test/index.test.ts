import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const STORE_DIR = '.contrail';
const STORE_FILE = 'claims.jsonl';

async function importAdapter(testDir: string) {
  // We dynamically test by writing claims.jsonl directly and reading through adapter
  const { CodexAdapter } = await import('../src/adapter.js');
  return new CodexAdapter(testDir);
}

describe('CodexAdapter', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'contrail-codex-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('readAll returns empty array on fresh store', async () => {
    const adapter = await importAdapter(testDir);
    expect(adapter.readAll()).toEqual([]);
  });

  it('toPromptString returns readable context from seed claims', async () => {
    const storeDir = join(testDir, STORE_DIR);
    mkdirSync(storeDir, { recursive: true });
    writeFileSync(join(storeDir, STORE_FILE), [
      JSON.stringify({ schema_version: '0.1.0', id: 'id1', subject: 'self', predicate: 'preference.editor', value: 'vscode', confidence: 0.9, value_type: 'string', valid_from: '2026-01-01T00:00:00Z', valid_until: null, supersedes: null, source: { tool: 'test', session_id: null, kind: 'explicit-statement' }, visibility: 'private', signature: null }),
      JSON.stringify({ schema_version: '0.1.0', id: 'id2', subject: 'self', predicate: 'constraint.language', value: 'TypeScript', confidence: 1.0, value_type: 'string', valid_from: '2026-01-01T00:00:00Z', valid_until: null, supersedes: null, source: { tool: 'test', session_id: null, kind: 'explicit-statement' }, visibility: 'private', signature: null }),
    ].join('\n') + '\n', 'utf-8');

    const adapter = new (await import('../src/adapter.js')).CodexAdapter(testDir);
    const prompt = adapter.toPromptString();
    expect(prompt).toContain('preference.editor');
    expect(prompt).toContain('vscode');
    expect(prompt).toContain('constraint.language');
    expect(prompt).toContain('TypeScript');
    expect(prompt).toContain('Project Memory');
  });

  it('toPromptString returns empty message when no claims', async () => {
    const adapter = await importAdapter(testDir);
    const prompt = adapter.toPromptString();
    expect(prompt).toContain('No project memory');
  });
});
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const STORE_DIR = '.contrail';
const STORE_FILE = 'claims.jsonl';

const seedClaim = (overrides: Record<string, unknown> = {}) => ({
  schema_version: '0.1.0' as const,
  id: 'id1',
  subject: 'self',
  predicate: 'preference.editor',
  value: 'vscode',
  confidence: 0.9,
  value_type: 'string',
  valid_from: '2026-01-01T00:00:00Z',
  valid_until: null,
  supersedes: null,
  source: { tool: 'test', session_id: null, kind: 'explicit-statement' as const },
  visibility: 'private' as const,
  signature: null,
  ...overrides,
});

async function importAdapter(testDir: string) {
  const { OpenAIAdapter } = await import('../src/adapter.js');
  return new OpenAIAdapter(testDir);
}

describe('OpenAIAdapter', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'contrail-openai-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('readAll returns empty array on fresh store', async () => {
    const adapter = await importAdapter(testDir);
    expect(adapter.readAll()).toEqual([]);
  });

  it('recall returns null for unknown subject/predicate', async () => {
    const adapter = await importAdapter(testDir);
    const result = adapter.recall('unknown', 'nonexistent');
    expect(result).toBeNull();
  });

  it('toInstructionBlock formats current beliefs from seed claims', async () => {
    const storeDir = join(testDir, STORE_DIR);
    mkdirSync(storeDir, { recursive: true });
    writeFileSync(join(storeDir, STORE_FILE), [
      JSON.stringify(seedClaim({ id: 'id1', predicate: 'preference.editor', value: 'vscode', confidence: 0.9 })),
      JSON.stringify(seedClaim({ id: 'id2', predicate: 'constraint.language', value: 'TypeScript', confidence: 1.0 })),
    ].join('\n') + '\n', 'utf-8');

    const adapter = new (await import('../src/adapter.js')).OpenAIAdapter(testDir);
    const block = adapter.toInstructionBlock();
    expect(block).toContain('Project Knowledge');
    expect(block).toContain('preference.editor');
    expect(block).toContain('vscode');
    expect(block).toContain('constraint.language');
    expect(block).toContain('TypeScript');
    expect(block).toContain('confidence: 0.90');
    expect(block).toContain('confidence: 1.00');
  });

  it('toInstructionString returns compact format', async () => {
    const storeDir = join(testDir, STORE_DIR);
    mkdirSync(storeDir, { recursive: true });
    writeFileSync(join(storeDir, STORE_FILE), [
      JSON.stringify(seedClaim({ id: 'id1', predicate: 'preference.editor', value: 'vscode' })),
      JSON.stringify(seedClaim({ id: 'id2', predicate: 'constraint.language', value: 'TypeScript' })),
    ].join('\n') + '\n', 'utf-8');

    const adapter = new (await import('../src/adapter.js')).OpenAIAdapter(testDir);
    const str = adapter.toInstructionString();
    expect(str).toContain('preference.editor:');
    expect(str).toContain('"vscode"');
    expect(str).toContain('constraint.language:');
    expect(str).toContain('"TypeScript"');
  });
});
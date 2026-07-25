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
  const { OpenCodeAdapter } = await import('../src/adapter.js');
  return new OpenCodeAdapter(testDir);
}

describe('OpenCodeAdapter', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'contrail-opencode-'));
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('readAll returns empty array on fresh store', async () => {
    const adapter = await importAdapter(testDir);
    expect(adapter.readAll()).toEqual([]);
  });

  it('listPredicates returns current beliefs from seed claims', async () => {
    const storeDir = join(testDir, STORE_DIR);
    mkdirSync(storeDir, { recursive: true });
    writeFileSync(join(storeDir, STORE_FILE), [
      JSON.stringify(seedClaim({ id: 'id1', subject: 'self', predicate: 'preference.editor', value: 'vscode', confidence: 0.9 })),
      JSON.stringify(seedClaim({ id: 'id2', subject: 'self', predicate: 'constraint.language', value: 'TypeScript', confidence: 1.0 })),
    ].join('\n') + '\n', 'utf-8');

    const adapter = new (await import('../src/adapter.js')).OpenCodeAdapter(testDir);
    const predicates = adapter.listPredicates();

    expect(predicates).toHaveLength(2);
    expect(predicates).toEqual(
      expect.arrayContaining([
        { subject: 'self', predicate: 'preference.editor', currentValue: 'vscode', confidence: 0.9 },
        { subject: 'self', predicate: 'constraint.language', currentValue: 'TypeScript', confidence: 1.0 },
      ])
    );
  });

  it('toMarkdownTable returns formatted table', async () => {
    const storeDir = join(testDir, STORE_DIR);
    mkdirSync(storeDir, { recursive: true });
    writeFileSync(join(storeDir, STORE_FILE), [
      JSON.stringify(seedClaim({ id: 'id1', subject: 'self', predicate: 'preference.editor', value: 'vscode', confidence: 0.9 })),
    ].join('\n') + '\n', 'utf-8');

    const adapter = new (await import('../src/adapter.js')).OpenCodeAdapter(testDir);
    const table = adapter.toMarkdownTable();

    expect(table).toContain('Project Memory');
    expect(table).toContain('| Subject | Predicate | Current Value | Confidence |');
    expect(table).toContain('| --- | --- | --- | --- |');
    expect(table).toContain('self');
    expect(table).toContain('preference.editor');
    expect(table).toContain('vscode');
    expect(table).toContain('0.9');
  });
});
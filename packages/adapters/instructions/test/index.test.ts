import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function makeClaim(id: string, subject: string, predicate: string, value: string, confidence = 0.9) {
  return {
    schema_version: '0.1.0', id, subject, predicate, value,
    value_type: 'string', confidence,
    valid_from: '2026-01-01T00:00:00Z', valid_until: null, supersedes: null,
    source: { tool: 'test', session_id: null, kind: 'explicit-statement' as const },
    visibility: 'private', signature: null,
  };
}

describe('InstructionGenerator', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = mkdtempSync(join(tmpdir(), 'contrail-inst-'));
    const storeDir = join(testDir, '.contrail');
    mkdirSync(storeDir, { recursive: true });
    const claims = [
      makeClaim('id1', 'self', 'preference.editor', 'vscode'),
      makeClaim('id2', 'self', 'constraint.language', 'TypeScript', 1.0),
    ];
    writeFileSync(join(storeDir, 'claims.jsonl'), claims.map(c => JSON.stringify(c)).join('\n') + '\n', 'utf-8');
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it('generates CLAUDE.md for claude-code target', async () => {
    const { InstructionGenerator } = await import('../src/generator.js');
    const gen = new InstructionGenerator(testDir);
    const output = gen.generate('claude-code');
    expect(output).toContain('# Project Context');
    expect(output).toContain('preference.editor');
    expect(output).toContain('vscode');
    expect(output).toContain('constraint.language');
    expect(output).toContain('TypeScript');
    expect(output).toContain('This file is managed by Contrail');
  });

  it('generates AGENTS.md for codex target', async () => {
    const { InstructionGenerator } = await import('../src/generator.js');
    const gen = new InstructionGenerator(testDir);
    const output = gen.generate('codex');
    expect(output).toContain('# Agent Context');
    expect(output).toContain('preference.editor');
    expect(output).toContain('Managed by Contrail');
  });

  it('generates generic markdown', async () => {
    const { InstructionGenerator } = await import('../src/generator.js');
    const gen = new InstructionGenerator(testDir);
    const output = gen.generate('generic-markdown');
    expect(output).toContain('Project Memory');
    expect(output).toContain('preference.editor');
  });

  it('writes file to disk for claude-code', async () => {
    const { InstructionGenerator } = await import('../src/generator.js');
    const gen = new InstructionGenerator(testDir);
    const path = gen.generateToFile('claude-code', { outputPath: join(testDir, 'CLAUDE.md') });
    const content = readFileSync(path, 'utf-8');
    expect(content).toContain('# Project Context');
    expect(content).toContain('vscode');
  });

  it('write file for codex target', async () => {
    const { InstructionGenerator } = await import('../src/generator.js');
    const gen = new InstructionGenerator(testDir);
    const path = gen.generateToFile('codex', { outputPath: join(testDir, 'AGENTS.md') });
    const content = readFileSync(path, 'utf-8');
    expect(content).toContain('# Agent Context');
  });

  it('handles empty store gracefully', async () => {
    const emptyDir = mkdtempSync(join(tmpdir(), 'contrail-inst-empty-'));
    const { InstructionGenerator } = await import('../src/generator.js');
    const gen = new InstructionGenerator(emptyDir);
    const output = gen.generate('claude-code');
    expect(output).toContain('No stored instructions');
    rmSync(emptyDir, { recursive: true, force: true });
  });

  it('deduplicates claims with same subject/predicate', async () => {
    const { InstructionGenerator } = await import('../src/generator.js');
    // Read existing store, add a duplicate predicate
    const storePath = join(testDir, '.contrail', 'claims.jsonl');
    const existing = readFileSync(storePath, 'utf-8');
    const extra = JSON.stringify(makeClaim('id3', 'self', 'preference.editor', 'neovim'));
    writeFileSync(storePath, existing.trim() + '\n' + extra + '\n', 'utf-8');
    const gen = new InstructionGenerator(testDir);
    const lines = gen.formatClaims(gen.readAll());
    expect(lines.filter((l: string) => l.includes('preference.editor')).length).toBe(1);
  });
});
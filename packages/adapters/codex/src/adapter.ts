import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Claim } from '@contrail-spec/core';

const STORE_DIR = '.contrail';
const STORE_FILE = 'claims.jsonl';

export class CodexAdapter {
  private storePath: string;

  constructor(cwd: string) {
    const dir = resolve(cwd, STORE_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.storePath = resolve(dir, STORE_FILE);
    if (!existsSync(this.storePath)) writeFileSync(this.storePath, '', 'utf-8');
  }

  readAll(): Claim[] {
    const content = readFileSync(this.storePath, 'utf-8');
    if (!content.trim()) return [];
    return content.trim().split('\n').map(l => JSON.parse(l));
  }

  /** Returns all claims as a single prompt string for Codex CLI context injection */
  toPromptString(): string {
    const claims = this.readAll();
    if (claims.length === 0) return 'No project memory stored. Use contrail add to record instructions.';
    const lines = claims.map((c, i) =>
      `[${i + 1}] ${c.subject}/${c.predicate} = ${JSON.stringify(c.value)} (conf: ${c.confidence}, source: ${c.source?.tool ?? '?'})`
    );
    return `## Project Memory (Contrail)\n\n${lines.join('\n')}`;
  }
}
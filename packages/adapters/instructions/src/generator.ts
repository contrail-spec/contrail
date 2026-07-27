import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Claim } from '@contrail-spec/core';
import { CLAUDE_MD_TEMPLATE, AGENTS_MD_TEMPLATE, GENERIC_MD_TEMPLATE, type Formatter } from './templates.js';

export type InstructionTarget = 'claude-code' | 'codex' | 'generic-markdown';

export interface GenerateOptions {
  storePath?: string;
  outputPath?: string;
}

const TARGET_FILE: Record<InstructionTarget, string> = {
  'claude-code': 'CLAUDE.md',
  'codex': 'AGENTS.md',
  'generic-markdown': 'generic-instructions.md',
};

const TARGET_TEMPLATE: Record<InstructionTarget, Formatter> = {
  'claude-code': CLAUDE_MD_TEMPLATE,
  'codex': AGENTS_MD_TEMPLATE,
  'generic-markdown': GENERIC_MD_TEMPLATE,
};

function formatClaimLine(claim: Claim): string {
  const source = claim.source ? ` (source: ${claim.source.tool}, ${claim.source.kind})` : '';
  return `- \`${claim.subject}/${claim.predicate}\` = ${JSON.stringify(claim.value)} (confidence: ${claim.confidence.toFixed(2)})${source}`;
}

export class InstructionGenerator {
  private storePath: string;

  constructor(cwd: string) {
    const dir = resolve(cwd, '.contrail');
    this.storePath = resolve(dir, 'claims.jsonl');
  }

  readAll(): Claim[] {
    if (!existsSync(this.storePath)) return [];
    const content = readFileSync(this.storePath, 'utf-8');
    if (!content.trim()) return [];
    return content.trim().split('\n').map(l => JSON.parse(l));
  }

  /** Formats claims as a flat list of strings, one per unique (subject, predicate). */
  formatClaims(claims: Claim[]): string[] {
    const seen = new Set<string>();
    const lines: string[] = [];
    for (const c of claims) {
      const key = `${c.subject}|${c.predicate}`;
      if (!seen.has(key)) {
        seen.add(key);
        lines.push(formatClaimLine(c));
      }
    }
    return lines;
  }

  /**
   * Generates an instruction file for the given target tool.
   * Returns the full generated content (does not write to disk by default).
   */
  generate(target: InstructionTarget, _options?: GenerateOptions): string {
    const claims = this.readAll();
    const lines = this.formatClaims(claims);
    const template = TARGET_TEMPLATE[target];
    return template(lines);
  }

  /**
   * Generates and writes the instruction file to disk.
   * Default path for claude-code is ./CLAUDE.md, for codex is ./AGENTS.md.
   * Returns the output path.
   */
  generateToFile(target: InstructionTarget, options?: GenerateOptions): string {
    const content = this.generate(target, options);
    const outputPath = options?.outputPath ?? resolve(process.cwd(), TARGET_FILE[target]);
    const dir = resolve(outputPath, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(outputPath, content, 'utf-8');
    return outputPath;
  }
}
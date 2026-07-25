import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Claim } from '@contrail-spec/core';
import { resolveCurrentBelief } from '@contrail-spec/core';

const STORE_DIR = '.contrail';
const STORE_FILE = 'claims.jsonl';

export class OpenCodeAdapter {
  private storePath: string;
  private cwd: string;

  constructor(cwd: string) {
    const dir = resolve(cwd, STORE_DIR);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    this.storePath = resolve(dir, STORE_FILE);
    if (!existsSync(this.storePath)) writeFileSync(this.storePath, '', 'utf-8');
    this.cwd = cwd;
  }

  readAll(): Claim[] {
    const content = readFileSync(this.storePath, 'utf-8');
    if (!content.trim()) return [];
    return content.trim().split('\n').map(l => JSON.parse(l));
  }

  /**
   * Lists all unique subject/predicate pairs with their current resolved value and confidence.
   * For each pair, resolveCurrentBelief returns the head of the trajectory.
   */
  listPredicates(): { subject: string; predicate: string; currentValue: unknown; confidence: number }[] {
    const claims = this.readAll();
    if (claims.length === 0) return [];

    // Group by subject|predicate
    const groups = new Map<string, Claim[]>();
    for (const claim of claims) {
      const key = `${claim.subject}|${claim.predicate}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(claim);
    }

    const results: { subject: string; predicate: string; currentValue: unknown; confidence: number }[] = [];
    Array.from(groups.entries()).forEach(([key, groupClaims]) => {
      const parts = key.split('|');
      const subject = parts[0]!;
      const predicate = parts[1]!;
      const belief = resolveCurrentBelief(groupClaims, subject, predicate);
      if (belief) {
        results.push({
          subject,
          predicate,
          currentValue: belief.current.value,
          confidence: belief.current.confidence,
        });
      }
    });

    return results;
  }

  /**
   * Formats all predicates as a markdown table with columns:
   * Subject | Predicate | Current Value | Confidence
   */
  toMarkdownTable(): string {
    const predicates = this.listPredicates();
    if (predicates.length === 0) return 'No project memory stored.';

    const rows: string[] = [
      '| Subject | Predicate | Current Value | Confidence |',
      '| --- | --- | --- | --- |',
    ];

    for (const p of predicates) {
      const valueStr = typeof p.currentValue === 'string' ? p.currentValue : JSON.stringify(p.currentValue);
      rows.push(`| ${p.subject} | ${p.predicate} | ${valueStr} | ${p.confidence} |`);
    }

    return `## Project Memory\n\n${rows.join('\n')}`;
  }
}
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import type { Claim, BeliefResolution } from '@contrail-spec/core';
import { resolveCurrentBelief } from '@contrail-spec/core';

const STORE_DIR = '.contrail';
const STORE_FILE = 'claims.jsonl';

export class HermesAdapter {
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
   * Resolve the current belief for a given subject and predicate.
   * Returns the BeliefResolution if found, or null if no claim exists.
   */
  recall(subject: string, predicate: string): BeliefResolution | null {
    const claims = this.readAll();
    return resolveCurrentBelief(claims, subject, predicate);
  }

  /**
   * Formats all current beliefs as a markdown instruction block.
   * For each unique subject/predicate pair, it includes the current value and confidence.
   */
  toInstructionBlock(): string {
    const claims = this.readAll();
    if (claims.length === 0) return 'No project memory stored. Use `contrail add` to record project knowledge.';

    // Group claims by subject|predicate and find the head of each trajectory
    const groups = new Map<string, Claim[]>();
    for (const claim of claims) {
      const key = `${claim.subject}|${claim.predicate}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(claim);
    }

    const blocks: string[] = [];
    Array.from(groups.entries()).forEach(([key, groupClaims]) => {
      const parts = key.split('|');
      const subject = parts[0]!;
      const predicate = parts[1]!;
      const belief = resolveCurrentBelief(groupClaims, subject, predicate);
      if (!belief) return;

      const c = belief.current;
      const valueStr = typeof c.value === 'string' ? c.value : JSON.stringify(c.value);
      blocks.push(`- **${c.subject}/${c.predicate}**: ${valueStr} (confidence: ${c.confidence})`);
    });

    if (blocks.length === 0) return 'No project memory stored. Use `contrail add` to record project knowledge.';

    return `## Project Knowledge\n\n${blocks.join('\n')}`;
  }
}
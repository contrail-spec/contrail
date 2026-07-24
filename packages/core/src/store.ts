import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { lockSync } from 'proper-lockfile';
import type { Claim } from './types.js';

const STORE_DIR = '.contrail';
const STORE_FILE = 'claims.jsonl';
const LOCK_FILE = 'claims.jsonl.lock';

/**
 * Store interface for reading and writing claims to a JSONL file.
 *
 * Implementations exist in two flavours:
 *   - `createStore` (sync) — used by the CLI where blocking is acceptable
 *   - `createAsyncStore` (async) — used by the MCP server where the event
 *     loop must not be blocked during long-lived connections
 *
 * Both share the same on-disk layout and locking strategy, so they can
 * coexist safely on the same `.contrail/claims.jsonl` file.
 */
export interface Store {
  init(): void;
  readAll(): Claim[];
  append(claim: Claim): void;
}

/**
 * Creates a synchronous Store rooted at `cwd/.contrail/claims.jsonl`.
 *
 * Uses sync file locking — appropriate for short-lived CLI invocations
 * where the process exits after a single operation.
 */
export function createStore(cwd: string): Store {
  const storePath = resolveStorePath(cwd);
  const lockPath = resolveLockPath(cwd);

  return {
    init() {
      if (!existsSync(storePath)) {
        writeFileSync(storePath, '', 'utf-8');
      }
    },

    readAll() {
      if (!existsSync(storePath)) return [];
      const content = readFileSync(storePath, 'utf-8');
      if (!content.trim()) return [];
      return content.trim().split('\n').map(line => JSON.parse(line));
    },

    append(claim: Claim) {
      const line = JSON.stringify(claim);
      ensureLockFile(lockPath);
      const release = lockSync(lockPath);
      try {
        appendFileSync(storePath, line + '\n', 'utf-8');
      } finally {
        release();
      }
    }
  };
}

function resolveStorePath(cwd: string): string {
  const dir = resolve(cwd, STORE_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return resolve(dir, STORE_FILE);
}

function resolveLockPath(cwd: string): string {
  const dir = resolve(cwd, STORE_DIR);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return resolve(dir, LOCK_FILE);
}

function ensureLockFile(lockPath: string): void {
  const lockDir = resolve(lockPath, '..');
  if (!existsSync(lockDir)) {
    mkdirSync(lockDir, { recursive: true });
  }
  if (!existsSync(lockPath)) {
    writeFileSync(lockPath, '', 'utf-8');
  }
}

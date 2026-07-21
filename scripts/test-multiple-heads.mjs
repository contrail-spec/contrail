import { execFileSync } from 'child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const cliPath = join(repoRoot, 'packages', 'cli', 'dist', 'cli.js');

const testDir = mkdtempSync(join(tmpdir(), 'contrail-mh-test-'));
const storeDir = join(testDir, '.contrail');
mkdirSync(storeDir, { recursive: true });

const claims = [
  { schema_version: '0.1.0', id: 'ID001', subject: 'self', predicate: 'preference.editor', value: 'vscode', value_type: 'string', confidence: 0.9, valid_from: '2026-01-01T00:00:00Z', valid_until: null, supersedes: null, source: { tool: 'claude-code', session_id: null, kind: 'explicit-statement' }, visibility: 'private', signature: null },
  { schema_version: '0.1.0', id: 'ID002', subject: 'self', predicate: 'preference.editor', value: 'neovim', value_type: 'string', confidence: 0.95, valid_from: '2026-06-01T00:00:00Z', valid_until: null, supersedes: 'ID001', source: { tool: 'claude-code', session_id: null, kind: 'corrected' }, visibility: 'private', signature: null },
  { schema_version: '0.1.0', id: 'ID003', subject: 'self', predicate: 'preference.editor', value: 'vim', value_type: 'string', confidence: 0.85, valid_from: '2026-07-01T00:00:00Z', valid_until: null, supersedes: 'ID001', source: { tool: 'cursor', session_id: null, kind: 'corrected' }, visibility: 'private', signature: null }
];

writeFileSync(join(storeDir, 'claims.jsonl'), claims.map(c => JSON.stringify(c)).join('\n') + '\n');

console.log('Testing MULTIPLE_HEADS CLI handling...\n');

try {
  const output = execFileSync(process.execPath, [cliPath, 'log', 'preference.editor'], { cwd: testDir, encoding: 'utf8' });
  console.log('STDOUT:', output);
  // Should not reach here - CLI should exit non-zero
  console.log('✗ FAIL: CLI should have exited with error code.');
  process.exitCode = 1;
} catch (e) {
  const stderr = e.stderr ?? '';
  if (stderr.includes('Conflicting claims')) {
    console.log('CLI output (stderr):');
    console.log(stderr);
    console.log('\n✓ PASS: CLI exits non-zero with clear error about conflicting heads.');
  } else {
    console.log('STDERR:', stderr);
    console.log('✗ FAIL: No helpful error message in stderr.');
    process.exitCode = 1;
  }
}

rmSync(testDir, { recursive: true, force: true });

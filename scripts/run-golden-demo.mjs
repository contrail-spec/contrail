import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDirectory = join(repositoryRoot, 'examples', 'testing-policy-evolution');
const expectedOutput = readFileSync(join(fixtureDirectory, 'expected-cli-output.txt'), 'utf8');
const demoDirectory = mkdtempSync(join(tmpdir(), 'contrail-golden-demo-'));

try {
  cpSync(join(fixtureDirectory, 'seed.jsonl'), join(demoDirectory, '.contrail', 'claims.jsonl'), {
    recursive: false,
    force: true,
    errorOnExist: false
  });

  const actualOutput = execFileSync(
    process.execPath,
    [
      join(repositoryRoot, 'packages', 'cli', 'dist', 'cli.js'),
      'log',
      'project.testing.framework',
      '--subject',
      'repository'
    ],
    { cwd: demoDirectory, encoding: 'utf8' }
  );

  if (actualOutput !== expectedOutput) {
    console.error('Golden demo output drifted from examples/testing-policy-evolution/expected-cli-output.txt.');
    process.exitCode = 1;
  } else {
    console.log('WITHOUT CONTRAIL');
    console.log('  A stale memory says: "Use Node\'s built-in test runner."');
    console.log('  It cannot prove that a later project decision replaced it.');
    console.log('\nWITH CONTRAIL');
    process.stdout.write(actualOutput);
  }
} finally {
  rmSync(demoDirectory, { recursive: true, force: true });
}

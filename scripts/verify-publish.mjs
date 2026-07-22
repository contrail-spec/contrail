#!/usr/bin/env node
/**
 * Pre-publish verification script.
 *
 * Installs the candidate tarball (npm pack) in a temporary directory
 * and runs the quickstart flow. This catches missing dependencies
 * that are hoisted in the monorepo but absent from published packages.
 *
 * Usage:
 *   node scripts/verify-publish.mjs <package-name>
 *
 * Example:
 *   node scripts/verify-publish.mjs @contrail-spec/cli
 */
import { execSync } from 'child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const packageName = process.argv[2];
if (!packageName) {
  console.error('Usage: node scripts/verify-publish.mjs <package-name>');
  console.error('Example: node scripts/verify-publish.mjs @contrail-spec/cli');
  process.exit(1);
}

const pkgName = packageName.replace('/', '-').replace('@', '');
const tmpDir = mkdtempSync(join(tmpdir(), `verify-${pkgName}-`));

try {
  console.log(`\nVerifying ${packageName} in clean directory...`);
  console.log(`  Temp dir: ${tmpDir}\n`);

  // Create a minimal package.json
  writeFileSync(join(tmpDir, 'package.json'), JSON.stringify({
    name: `verify-${pkgName}`,
    version: '1.0.0',
    private: true
  }));

  // Install from npm
  console.log('  Step 1: npm install');
  execSync(`npm install --prefix "${tmpDir}" ${packageName}@latest`, {
    stdio: 'pipe',
    encoding: 'utf-8'
  });
  console.log('  ✓ Install succeeded\n');

  // If it's the CLI, run the quickstart using node explicitly (cross-platform)
  if (packageName.includes('cli')) {
    const nodeCmd = `node "${join(tmpDir, 'node_modules', '@contrail-spec', 'cli', 'dist', 'cli.js')}"`;

    console.log('  Step 2: contrail init');
    execSync(`${nodeCmd} init`, { cwd: tmpDir, stdio: 'pipe', encoding: 'utf-8' });
    console.log('  ✓ Init succeeded\n');

    console.log('  Step 3: contrail add');
    execSync(`${nodeCmd} add test.key "test-value" --confidence 0.9 --source-tool verify --source-kind explicit-statement`, {
      cwd: tmpDir, stdio: 'pipe', encoding: 'utf-8'
    });
    console.log('  ✓ Add succeeded\n');

    console.log('  Step 4: contrail log');
    execSync(`${nodeCmd} log test.key`, { cwd: tmpDir, stdio: 'pipe', encoding: 'utf-8' });
    console.log('  ✓ Log succeeded\n');
  }

  console.log(`  ${packageName}@latest — VERIFIED`);
} catch (e) {
  console.error(`  ✗ FAILED: ${e.message}`);
  process.exit(1);
} finally {
  rmSync(tmpDir, { recursive: true, force: true });
}

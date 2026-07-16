#!/usr/bin/env node
/**
 * Validates all spec example fixtures against the claim schema.
 * Exits non-zero if any valid fixture fails or any invalid fixture passes.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const SCHEMA_PATH = path.join(__dirname, '..', 'spec', 'schema', 'v0.1', 'claim.schema.json');
const VALID_DIR = path.join(__dirname, '..', 'spec', 'schema', 'v0.1', 'examples', 'valid');
const INVALID_DIR = path.join(__dirname, '..', 'spec', 'schema', 'v0.1', 'examples', 'invalid');

function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const ajv = new Ajv({ strict: true, allErrors: true, verbose: true, formats: { 'date-time': true } });
  ajv.addFormat('date-time', {
    validate: (str) => {
      if (typeof str !== 'string') return false;
      const date = new Date(str);
      return !isNaN(date.getTime()) && str.endsWith('Z') && str.includes('T');
    }
  });
  const validate = ajv.compile(schema);

  let passed = 0;
  let failed = 0;

  // Validate valid fixtures (must pass)
  const validFiles = fs.readdirSync(VALID_DIR).filter(f => f.endsWith('.json'));
  console.log(`\nValidating ${validFiles.length} valid fixtures...`);

  for (const file of validFiles) {
    const filePath = path.join(VALID_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(data);

    if (valid) {
      console.log(`  ✓ ${file}`);
      passed++;
    } else {
      console.error(`  ✗ ${file} — expected valid, got errors:`);
      console.error(JSON.stringify(validate.errors, null, 2));
      failed++;
    }
  }

  // Validate invalid fixtures (must fail)
  const invalidFiles = fs.readdirSync(INVALID_DIR).filter(f => f.endsWith('.json'));
  console.log(`\nValidating ${invalidFiles.length} invalid fixtures...`);

  for (const file of invalidFiles) {
    const filePath = path.join(INVALID_DIR, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(data);

    if (!valid) {
      console.log(`  ✓ ${file} (correctly rejected)`);
      passed++;
    } else {
      console.error(`  ✗ ${file} — expected invalid, but passed validation`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
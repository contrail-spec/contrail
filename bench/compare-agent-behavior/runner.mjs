import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Confidence-only lookup:
 * Flat memory without supersession awareness.
 * Picks the claim with the highest confidence for a given (subject, predicate).
 * This is the best possible flat strategy and still fails when
 * a stale instruction has higher confidence than the correction.
 */
function flatMemoryLookup(claims, subject, predicate) {
  const matching = claims.filter(c => c.subject === subject && c.predicate === predicate);
  if (matching.length === 0) return null;

  // Pick the claim with the highest confidence (no temporal awareness)
  matching.sort((a, b) => b.confidence - a.confidence);
  return matching[0];
}

/**
 * Contrail agent simulation:
 * Uses the temporal supersession chain to find the current instruction.
 */
function temporalLookup(claims, subject, predicate) {
  const filtered = claims.filter(c => c.subject === subject && c.predicate === predicate);
  if (filtered.length === 0) return null;

  const supersededIds = new Set(
    filtered.map(c => c.supersedes).filter(id => id !== null)
  );
  const heads = filtered.filter(c => !supersededIds.has(c.id));

  if (heads.length === 0) return null;
  if (heads.length > 1) return null;

  const chain = [];
  const visited = new Set();
  let current = heads[0];

  while (current) {
    if (visited.has(current.id)) return null;
    visited.add(current.id);
    chain.push(current);
    if (!current.supersedes) break;
    current = filtered.find(c => c.id === current.supersedes);
    if (!current) return null;
  }

  return {
    current: chain[0],
    previous: chain[1] ?? null,
    chain
  };
}

function evaluateScenario(scenario) {
  const results = [];

  for (const query of scenario.queries) {
    const flatResult = flatMemoryLookup(scenario.claims, query.subject, query.predicate);
    const temporalResult = temporalLookup(scenario.claims, query.subject, query.predicate);

    const flatValue = flatResult ? flatResult.value : null;
    const temporalValue = temporalResult ? temporalResult.current.value : null;

    const flatCorrect = flatValue === query.expected_value;
    const temporalCorrect = temporalValue === query.expected_value;

    const flatHasProvenance = false; // flat memory never has provenance
    const temporalHasProvenance = temporalResult !== null
      && temporalResult.previous !== null
      && temporalResult.chain.length === query.expected_chain_length;

    const temporalExplanation = temporalHasProvenance
      ? `This claim supersedes ${temporalResult.previous.id}, so it is the current instruction.`
      : null;

    results.push({
      subject: query.subject,
      predicate: query.predicate,
      standard: {
        value: flatValue,
        correct: flatCorrect,
        provenance: false
      },
      contrail: {
        value: temporalValue,
        correct: temporalCorrect,
        provenance: temporalHasProvenance,
        chainLength: temporalResult ? temporalResult.chain.length : 0,
        previousValue: temporalResult ? temporalResult.previous?.value ?? null : null,
        explanation: temporalExplanation
      },
      expected_value: query.expected_value,
      expected_chain_length: query.expected_chain_length
    });
  }

  return results;
}

function loadScenarios(scenariosDir) {
  const files = readdirSync(scenariosDir)
    .filter(f => f.endsWith('.json'))
    .sort();

  return files.map(file => {
    const path = join(scenariosDir, file);
    const content = JSON.parse(readFileSync(path, 'utf-8'));
    return { ...content, file };
  });
}

function runBenchmark(scenariosDir) {
  const scenarios = loadScenarios(scenariosDir);
  let totalQueries = 0;
  let standardPassed = 0;
  let contrailPassed = 0;

  const scenarioResults = [];

  for (const scenario of scenarios) {
    const results = evaluateScenario(scenario);

    const stdPass = results.filter(r => r.standard.correct).length;
    const ctlPass = results.filter(r => r.contrail.correct).length;

    totalQueries += results.length;
    standardPassed += stdPass;
    contrailPassed += ctlPass;

    scenarioResults.push({
      name: scenario.name,
      description: scenario.description,
      queries: results,
      standardScore: `${stdPass}/${results.length}`,
      contrailScore: `${ctlPass}/${results.length}`,
      note: scenario.queries[0]?.explanation ?? ''
    });
  }

  return {
    scenarios: scenarioResults,
    totalQueries,
    standardPassed,
    contrailPassed,
    standardScore: `${standardPassed}/${totalQueries}`,
    contrailScore: `${contrailPassed}/${totalQueries}`,
    standardPct: Math.round((standardPassed / totalQueries) * 100),
    contrailPct: Math.round((contrailPassed / totalQueries) * 100)
  };
}

export { runBenchmark, flatMemoryLookup, temporalLookup, evaluateScenario, loadScenarios };

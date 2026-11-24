#!/usr/bin/env node
/**
 * run-evals.js — runner for skill eval suites (evals/*.cases.jsonl).
 *
 * Usage:
 *   node scripts/run-evals.js list <suite>                 List cases in a suite
 *   node scripts/run-evals.js plan <suite> <mode>          Emit prompts for a run (mode: baseline|candidate)
 *   node scripts/run-evals.js record <suite> <mode> <runId> <responses.json>
 *   node scripts/run-evals.js score <suite> <runId>        Print the blind-scoring worksheet (A/B labels)
 *
 * Suites live in evals/<name>.cases.jsonl. Run records go to evals/runs/<suite>/<runId>.json.
 *
 * The runner never calls a model itself: prompts are emitted for the operator
 * (or an orchestrating agent) to send, responses are pasted back as JSON, and
 * scoring is done blind — the worksheet labels runs A/B without revealing
 * which mode each is.
 */
const fs = require('fs');
const path = require('path');

const EVALS_DIR = path.join(__dirname, '..', 'evals');
const RUNS_DIR = path.join(EVALS_DIR, 'runs');

function loadSuite(suite) {
  const file = path.join(EVALS_DIR, `${suite}.cases.jsonl`);
  if (!fs.existsSync(file)) {
    console.error(`Suite not found: ${file}`);
    console.error(
      `Available: ${
        fs
          .readdirSync(EVALS_DIR)
          .filter((f) => f.endsWith('.cases.jsonl'))
          .join(', ') || '(none)'
      }`,
    );
    process.exit(1);
  }
  return fs
    .readFileSync(file, 'utf8')
    .trim()
    .split('\n')
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch (e) {
        console.error(`Invalid JSON on line ${i + 1}: ${e.message}`);
        process.exit(1);
      }
    });
}

function trialsFor(c, mode) {
  const base = c.risk === 'high' ? 5 : 3;
  return mode === 'smoke' ? 1 : base;
}

const [, , cmd, suite, ...rest] = process.argv;

if (cmd === 'list') {
  const cases = loadSuite(suite);
  for (const c of cases) {
    console.log(`${c.id}  [${c.category}] risk=${c.risk} asset=${c.asset} expect_active=${c.expect_active || '-'}`);
  }
  console.log(`\n${cases.length} cases.`);
} else if (cmd === 'plan') {
  const mode = rest[0] || 'candidate';
  if (!['baseline', 'candidate', 'smoke'].includes(mode)) {
    console.error('mode must be baseline|candidate|smoke');
    process.exit(1);
  }
  const cases = loadSuite(suite);
  const plan = cases.map((c) => ({
    id: c.id,
    category: c.category,
    trials: trialsFor(c, mode),
    prompt: c.prompt,
    turns: c.turns || [],
    criteria: c.criteria,
    must_not: c.must_not || [],
  }));
  console.log(JSON.stringify({ suite, mode, trials_default: mode, cases: plan }, null, 2));
} else if (cmd === 'record') {
  const mode = rest[0];
  const runId = rest[1];
  const responsesFile = rest[2];
  if (!mode || !runId || !responsesFile) {
    console.error('usage: record <suite> <baseline|candidate> <runId> <responses.json>');
    process.exit(1);
  }
  const responses = JSON.parse(fs.readFileSync(responsesFile, 'utf8'));
  const cases = loadSuite(suite);
  const missing = cases.filter((c) => !responses[c.id]);
  if (missing.length) {
    console.error(`Missing responses for: ${missing.map((c) => c.id).join(', ')}`);
    process.exit(1);
  }
  const dir = path.join(RUNS_DIR, suite);
  fs.mkdirSync(dir, { recursive: true });
  const record = {
    suite,
    mode,
    runId,
    model: process.env.EVAL_MODEL || 'unspecified',
    recorded_at: new Date().toISOString(),
    responses,
  };
  const out = path.join(dir, `${runId}.json`);
  fs.writeFileSync(out, JSON.stringify(record, null, 2));
  console.log(`Recorded ${Object.keys(responses).length} case responses → ${out}`);
} else if (cmd === 'score') {
  const runId = rest[0];
  const dir = path.join(RUNS_DIR, suite);
  const runs = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  if (runs.length < 2) {
    console.error('Need at least 2 recorded runs (baseline + candidate) to score blind.');
    process.exit(1);
  }
  // Blind labels: shuffle A/B assignment deterministically per runId hash so re-runs are stable
  const label = (f) => (Buffer.from(f).reduce((a, b) => a + b, 0) % 2 === 0 ? 'A' : 'B');
  const cases = loadSuite(suite);
  console.log(`Blind scoring worksheet for suite '${suite}' (run ${runId || 'all'})\n`);
  console.log('Labels (do NOT map these back to modes while scoring):');
  for (const f of runs) console.log(`  ${label(f)} = ${f}`);
  console.log('\nPer case, score each trial 0/1 against criteria; a case fails if any must_not fires.\n');
  for (const c of cases) {
    console.log(`\n## ${c.id} [${c.category}] risk=${c.risk}`);
    console.log(`Prompt: ${c.prompt}`);
    c.criteria.forEach((cr, i) => console.log(`  [ ] criterion ${i + 1}: ${cr}`));
    (c.must_not || []).forEach((m) => console.log(`  [ ] MUST_NOT (blocking): ${m}`));
  }
} else {
  console.log('usage: run-evals.js <list|plan|record|score> <suite> [args]');
  process.exit(1);
}

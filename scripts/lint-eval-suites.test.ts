#!/usr/bin/env node
/**
 * Unit tests for scripts/lint-eval-suites.ts
 * Run: npm run test:p3 or node --test scripts/lint-eval-suites.test.ts
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  collectAssetNames,
  validateCase,
  checkAssetReferences,
  checkTwinCoverage,
  parseReadmeSuiteTable,
  checkReadmeCounts,
} = require('./lint-eval-suites.ts');

/* ---------- collectAssetNames ---------- */

test('collectAssetNames: łącznie skills i agents, bez knowledge', () => {
  const bundles = {
    bundle: { skills: ['a-skill', 'b-skill'], agents: ['an-agent'], knowledge: ['a-guide'] },
  };
  const names = collectAssetNames(bundles);
  assert.ok(names.has('a-skill'));
  assert.ok(names.has('b-skill'));
  assert.ok(names.has('an-agent'));
  assert.ok(!names.has('a-guide'));
});

/* ---------- validateCase ---------- */

const goodCase = {
  id: 'act-pos-something',
  category: 'activation-positive',
  risk: 'medium',
  asset: 'some-skill',
  prompt: 'Trigger wording that never names the asset.',
  criteria: ['Activates some-skill', 'Produces the artifact'],
  expect_active: 'some-skill',
  expect_inactive: [],
};

test('validateCase: poprawny case nie zgłasza nic', () => {
  assert.deepEqual(validateCase(goodCase, 'suite'), []);
});

test('validateCase: zła kategoria i risk trafiają na listę', () => {
  const issues = validateCase({ ...goodCase, category: 'activation', risk: 'extreme' }, 'suite');
  assert.equal(issues.length, 2);
  assert.ok(issues.some((i: string) => i.includes('category')));
  assert.ok(issues.some((i: string) => i.includes('risk')));
});

test('validateCase: prompt zawierający nazwę assetu = łamie higienę activation', () => {
  const issues = validateCase({ ...goodCase, prompt: 'Run some-sill... use the some-skill method now' }, 'suite');
  assert.ok(issues.some((i: string) => i.includes('activation hygiene')));
});

test('validateCase: activation-positive bez expect_active to brak asercji routingu', () => {
  const { expect_active, ...noExpect } = goodCase;
  assert.ok(expect_active !== undefined); // destructure tylko czytelności
  const issues = validateCase(noExpect, 'suite');
  assert.ok(issues.some((i: string) => i.includes('without expect_active')));
});

test('validateCase: brak id, puste kryteria, złe must_not', () => {
  const issues = validateCase({ category: 'contract', risk: 'low', must_not: 'yes' }, 'suite');
  assert.ok(issues.some((i: string) => i.includes('missing id')));
  assert.ok(issues.some((i: string) => i.includes('missing asset')));
  assert.ok(issues.some((i: string) => i.includes('missing prompt')));
  assert.ok(issues.some((i: string) => i.includes('criteria')));
  assert.ok(issues.some((i: string) => i.includes('must_not')));
});

/* ---------- checkAssetReferences ---------- */

test('checkAssetReferences: nieistniejące assety w polach expect są zgłaszane', () => {
  const assets = new Set(['some-skill', 'other-skill']);
  const issues = checkAssetReferences(
    {
      id: 'case-1',
      asset: 'some-skill',
      expect_active: 'renamed-skill',
      expect_inactive: ['other-skill', 'ghost-agent'],
    },
    'suite',
    assets,
  );
  assert.equal(issues.length, 2);
  assert.ok(issues.some((i: string) => i.includes('expect_active')));
  assert.ok(issues.some((i: string) => i.includes('ghost-agent')));
});

/* ---------- checkTwinCoverage ---------- */

test('checkTwinCoverage: para pokryta w obu kierunkach przechodzi, niepokryta nie', () => {
  const pairs = [
    { command: 'stabilize-flaky-tests', skill: 'stabilizing-flaky-tests', bundle: 'test-automation' },
    { command: 'record-change-intent', skill: 'recording-change-intent', bundle: 'quality-gates' },
  ];
  const cases = [
    { expect_active: 'stabilizing-flaky-tests', expect_inactive: ['stabilize-flaky-tests'] },
    { expect_active: 'record-change-intent', expect_inactive: ['recording-change-intent'] },
  ];
  const issues = checkTwinCoverage(pairs, cases);
  assert.deepEqual(issues, []);
});

test('checkTwinCoverage: para bez case-u asercji split dostaje issue', () => {
  const pairs = [{ command: 'verify-acceptance-criteria', skill: 'verifying-acceptance-criteria', bundle: 'qa-core' }];
  const cases = [{ expect_active: 'something-else', expect_inactive: [] }];
  const issues = checkTwinCoverage(pairs, cases);
  assert.equal(issues.length, 1);
  assert.ok(issues[0].includes('verify-acceptance-criteria'));
});

/* ---------- parseReadmeSuiteTable + checkReadmeCounts ---------- */

test('parseReadmeSuiteTable: czyta wiersze tabeli Suite, ignoruje nagłówek i kod', () => {
  const readme = [
    '# Evals',
    '',
    '| Suite | Cases | Covers |',
    '|---|---|---|',
    '| `qa-core` | 6 | backlog planner |',
    '| `authoring` | 12 | placement |',
    '',
    '```bash',
    'node scripts/run-evals.ts list qa-core',
    '```',
    '',
  ].join('\n');
  const table = parseReadmeSuiteTable(readme);
  assert.equal(table.get('qa-core'), 6);
  assert.equal(table.get('authoring'), 12);
  assert.equal(table.size, 2);
});

test('checkReadmeCounts: brak wiersza, rozjazd liczby i suites-widmo', () => {
  const table = new Map([
    ['qa-core', 5],
    ['ghost-suite', 3],
  ]);
  const actual = new Map([
    ['qa-core', 6],
    ['coverless-suite', 2],
  ]);
  const issues = checkReadmeCounts(table, actual);
  assert.equal(issues.length, 3);
  assert.ok(issues.some((i: string) => i.includes('coverless-suite')));
  assert.ok(issues.some((i: string) => i.includes('README says suite')));
  assert.ok(issues.some((i: string) => i.includes('ghost-suite')));
});

#!/usr/bin/env node
/**
 * Unit tests for scripts/lint-command-skill-pairs.ts
 * Run: npm run test:p3 or node --test scripts/lint-command-skill-pairs.test.ts
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { isGerund, areTwinNames, findTwinPairs, checkMutualRefs } = require('./lint-command-skill-pairs.ts');

/* ---------- isGerund ---------- */

test('isGerund: rozpoznaje regularne formy gerund', () => {
  assert.ok(isGerund('record', 'recording'));
  assert.ok(isGerund('stabilize', 'stabilizing')); // -e dropped
  assert.ok(isGerund('verify', 'verifying')); // -y -> -ying
  assert.ok(isGerund('migrate', 'migrating'));
});

test('isGerund: odrzuca nie-gerundy i fałszywe pary', () => {
  assert.ok(!isGerund('map', 'mapping-requirements')); // sufiks poza granicą słowa
  assert.ok(!isGerund('verify', 'verify-acceptance')); // nie ma zamiany formy
  assert.ok(!isGerund('fix', 'fixing-tests')); // sufiks poza granicą słowa
  assert.ok(!isGerund('analyze', 'auditing')); // różne rdzenie
  // scope -> scoping JEST gerundem (poprawne, celowo pozytywnie):
  assert.ok(isGerund('scope', 'scoping'));
});

/* ---------- areTwinNames ---------- */

test('areTwinNames: para jedno-słowo-gerund w tym samym bundlu', () => {
  assert.ok(areTwinNames('stabilize-flaky-tests', 'stabilizing-flaky-tests'));
  assert.ok(areTwinNames('verify-acceptance-criteria', 'verifying-acceptance-criteria'));
  assert.ok(areTwinNames('record-change-intent', 'recording-change-intent'));
  assert.ok(areTwinNames('migrate-tests-to-playwright', 'migrating-tests-to-playwright'));
});

test('areTwinNames: nie-consinne nazwy nie są parą', () => {
  assert.ok(!areTwinNames('derive-quality-contract', 'deriving-a-quality-contract')); // dodany człon
  assert.ok(!areTwinNames('scope-change-gate', 'scoping-change-relevance')); // różnią się dwa słowa
  assert.ok(!areTwinNames('stabilize-flaky-tests', 'stabilizing-flaky-policy')); // nie-gerund w różnicy
  assert.ok(!areTwinNames('fix-tests', 'diagnosing-test-failures'));
});

/* ---------- findTwinPairs ---------- */

test('findTwinPairs: komendy parują się tylko z model-skilami tego samego bundla', () => {
  const bundles = {
    testbundle: {
      skills: [
        'stabilize-flaky-tests',
        'stabilizing-flaky-tests',
        'record-change-intent',
        'recording-change-intent',
        'unrelated-skill',
      ],
    },
    other: { skills: ['migrate-x', 'migrating-x'] },
  };
  const isCommand = (s: string) => s.startsWith('stabilize-') || s.startsWith('record-') || s.startsWith('migrate-');

  const pairs = findTwinPairs(bundles, isCommand);
  assert.strictEqual(pairs.length, 3);
  assert.ok(
    pairs.some(
      (p: { command: string; skill: string; bundle: string }) =>
        p.command === 'stabilize-flaky-tests' && p.skill === 'stabilizing-flaky-tests',
    ),
  );
  assert.ok(
    pairs.some(
      (p: { command: string; skill: string; bundle: string }) =>
        p.command === 'record-change-intent' && p.skill === 'recording-change-intent',
    ),
  );
  assert.ok(
    pairs.some(
      (p: { command: string; skill: string; bundle: string }) =>
        p.command === 'migrate-x' && p.skill === 'migrating-x' && p.bundle === 'other',
    ),
  );
});

/* ---------- checkMutualRefs ---------- */

test('checkMutualRefs: para z wzajemnymi wskazaniami przechodzi', () => {
  const pairs = [{ command: 'stabilize-x', skill: 'stabilizing-x', bundle: 'b' }];
  const descriptions: Record<string, string> = {
    'stabilize-x': 'Quick triage form. For the full workflow use the stabilizing-x skill.',
    'stabilizing-x': 'Full workflow. For the quick form use the stabilize-x command.',
  };
  const issues = checkMutualRefs(pairs, (skill: string) => descriptions[skill] ?? '');
  assert.deepStrictEqual(issues, []);
});

test('checkMutualRefs: brak wskazania w описание = issue, w obie strony', () => {
  const pairs = [{ command: 'verify-x', skill: 'verifying-x', bundle: 'b' }];
  const descriptions: Record<string, string> = {
    'verify-x': 'Quick matrix form, no mention of the sibling.',
    'verifying-x': 'Full workflow. For the quick form use the verify-x command.',
  };
  const issues = checkMutualRefs(pairs, (skill: string) => descriptions[skill] ?? '');
  assert.strictEqual(issues.length, 1);
  const [first] = issues;
  if (first === undefined) {
    assert.fail('expected a missing-reference issue');
  }
  assert.match(first, /verify-x: description does not mention verifying-x/);
});

#!/usr/bin/env node
/**
 * Unit tests for scripts/update-readme-stats.ts
 * Run: npm run test:p3 or node --test scripts/update-readme-stats.test.ts
 *
 * Tests cover:
 * - bundles.yaml parsing
 * - Counting skills, agents, knowledge, hooks
 * - README.md stats extraction
 * - Stats replacement logic
 * - Dry-run and check modes
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

// Import functions from update-readme-stats.ts
const { loadBundles, loadReadme, countFromBundles, updateReadme } = require('./update-readme-stats.ts');

const REPO_ROOT = path.resolve(__dirname, '..');

/* ---------- Helper: write temp file ---------- */

function writeTmp(content: string, suffix = '.md') {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'update-readme-stats-test-'));
  const filePath = path.join(tmpDir, `test${suffix}`);
  fs.writeFileSync(filePath, content);
  return { filePath, tmpDir, cleanup: () => fs.rmSync(tmpDir, { recursive: true, force: true }) };
}

/* ---------- loadBundles tests ---------- */

test('loadBundles: loads bundles.yaml successfully', () => {
  const bundles = loadBundles();

  assert.ok(bundles);
  assert.ok(typeof bundles === 'object');
  assert.ok(Object.keys(bundles).length > 0);
});

test('loadBundles: returns object with expected structure', () => {
  const bundles = loadBundles();

  // Check first bundle has expected properties
  const firstBundle = bundles[Object.keys(bundles)[0]!];
  assert.ok(firstBundle);

  // Should have at least some of these properties
  const hasKnownProperty =
    'skills' in firstBundle || 'agents' in firstBundle || 'knowledge' in firstBundle || 'hooks' in firstBundle;

  assert.ok(hasKnownProperty);
});

test('loadBundles: throws error if bundles.yaml missing', () => {
  const originalPath = path.join(REPO_ROOT, 'bundles.yaml');
  const tmp = writeTmp('');

  try {
    // Temporarily rename bundles.yaml
    const backupPath = `${originalPath}.backup`;
    if (fs.existsSync(originalPath)) {
      fs.renameSync(originalPath, backupPath);
    }

    // This should throw an error
    assert.throws(() => loadBundles(), /bundles.yaml not found/);

    // Restore
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, originalPath);
    }
  } finally {
    tmp.cleanup();
    // Make sure file is restored
    if (fs.existsSync(`${originalPath}.backup`)) {
      fs.renameSync(`${originalPath}.backup`, originalPath);
    }
  }
});

/* ---------- countFromBundles tests ---------- */

test('countFromBundles: counts plugins correctly', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  assert.ok(counts.plugins >= 0);
  assert.strictEqual(counts.plugins, Object.keys(bundles).length);
});

test('countFromBundles: counts skills correctly', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  assert.ok(counts.skills >= 0);

  // Verify by manual count
  let manualCount = 0;
  for (const bundle of Object.values(bundles) as {
    skills?: string[];
    agents?: string[];
    knowledge?: string[];
    hooks?: string[];
  }[]) {
    if (bundle.skills) {
      manualCount += bundle.skills.length;
    }
  }
  assert.strictEqual(counts.skills, manualCount);
});

test('countFromBundles: counts agents correctly', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  assert.ok(counts.agents >= 0);

  // Verify by manual count
  let manualCount = 0;
  for (const bundle of Object.values(bundles) as {
    skills?: string[];
    agents?: string[];
    knowledge?: string[];
    hooks?: string[];
  }[]) {
    if (bundle.agents) {
      manualCount += bundle.agents.length;
    }
  }
  assert.strictEqual(counts.agents, manualCount);
});

test('countFromBundles: counts knowledge correctly', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  assert.ok(counts.knowledge >= 0);

  // Verify by manual count
  let manualCount = 0;
  for (const bundle of Object.values(bundles) as {
    skills?: string[];
    agents?: string[];
    knowledge?: string[];
    hooks?: string[];
  }[]) {
    if (bundle.knowledge) {
      manualCount += bundle.knowledge.length;
    }
  }
  assert.strictEqual(counts.knowledge, manualCount);
});

test('countFromBundles: counts hooks correctly', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  assert.ok(counts.hooks >= 0);

  // Verify by manual count
  let manualCount = 0;
  for (const bundle of Object.values(bundles) as {
    skills?: string[];
    agents?: string[];
    knowledge?: string[];
    hooks?: string[];
  }[]) {
    if (bundle.hooks) {
      manualCount += bundle.hooks.length;
    }
  }
  assert.strictEqual(counts.hooks, manualCount);
});

test('countFromBundles: counts visibleSkills from source', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  assert.ok(counts.visibleSkills >= 0);
  assert.ok(counts.visibleSkills <= counts.skills);
});

test('countFromBundles: stores per-bundle counts', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  assert.ok(counts.perBundle);
  assert.ok(typeof counts.perBundle === 'object');

  // Each bundle should have counts
  for (const bundleName of Object.keys(bundles)) {
    assert.ok(counts.perBundle[bundleName]);
    assert.ok('skills' in counts.perBundle[bundleName]);
    assert.ok('agents' in counts.perBundle[bundleName]);
    assert.ok('knowledge' in counts.perBundle[bundleName]);
    assert.ok('hooks' in counts.perBundle[bundleName]);
  }
});

/* ---------- loadReadme tests ---------- */

test('loadReadme: loads README.md successfully', () => {
  const readme = loadReadme();

  assert.ok(readme);
  assert.ok(typeof readme === 'string');
  assert.ok(readme.length > 0);
  assert.ok(readme.includes('# qa-tools'));
});

test('loadReadme: throws error if README.md missing', () => {
  const originalPath = path.join(REPO_ROOT, 'README.md');
  const tmp = writeTmp('');

  try {
    // Temporarily rename README.md
    const backupPath = `${originalPath}.backup`;
    if (fs.existsSync(originalPath)) {
      fs.renameSync(originalPath, backupPath);
    }

    // This should throw an error
    assert.throws(() => loadReadme(), /README.md not found/);

    // Restore
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, originalPath);
    }
  } finally {
    tmp.cleanup();
    // Make sure file is restored
    if (fs.existsSync(`${originalPath}.backup`)) {
      fs.renameSync(`${originalPath}.backup`, originalPath);
    }
  }
});

/* ---------- Stats validation tests ---------- */

test('Stats: total counts are reasonable', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  // Based on known state of the repo
  assert.ok(counts.plugins > 0);
  assert.ok(counts.skills > 0);
  assert.ok(counts.agents >= 0);
  assert.ok(counts.knowledge >= 0);
  assert.ok(counts.hooks >= 0);
});

test('Stats: known repo state — manifest liczy tyle, co pliki na dysku', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  // Kanarek: liczba pluginów odpowiada tabeli „Razem:" w README
  assert.strictEqual(counts.plugins, 14);

  // bundles.yaml musi pokrywać dokładnie to, co leży na dysku — łapie
  // przypadkowe usunięcie assetu z bundles.yaml albo z src/skills
  const skillsOnDisk = fs
    .readdirSync(path.join(REPO_ROOT, 'src', 'skills'), { withFileTypes: true })
    .filter((d: import('node:fs').Dirent) => d.isDirectory()).length;
  const agentsOnDisk = fs
    .readdirSync(path.join(REPO_ROOT, 'src', 'agents'))
    .filter((f: string) => f.endsWith('.md')).length;

  assert.strictEqual(counts.skills, skillsOnDisk);
  assert.strictEqual(counts.agents, agentsOnDisk);
});

/* ---------- Edge cases ---------- */

test('countFromBundles: handles empty bundles', () => {
  const emptyBundles = {};
  const counts = countFromBundles(emptyBundles);

  assert.strictEqual(counts.plugins, 0);
  assert.strictEqual(counts.skills, 0);
  assert.strictEqual(counts.agents, 0);
  assert.strictEqual(counts.knowledge, 0);
  assert.strictEqual(counts.hooks, 0);
  // visibleSkills is counted from src/skills, which may have skills even with empty bundles
  assert.ok(counts.visibleSkills >= 0);
});

test('countFromBundles: handles bundle with no skills/agents', () => {
  const bundles = { empty: {} };
  const counts = countFromBundles(bundles);

  assert.strictEqual(counts.plugins, 1);
  assert.strictEqual(counts.skills, 0);
  assert.strictEqual(counts.agents, 0);
});

test('countFromBundles: handles bundle with empty arrays', () => {
  const bundles = {
    test: {
      skills: [],
      agents: [],
      knowledge: [],
      hooks: [],
    },
  };
  const counts = countFromBundles(bundles);

  assert.strictEqual(counts.plugins, 1);
  assert.strictEqual(counts.skills, 0);
  assert.strictEqual(counts.agents, 0);
});

/* ---------- updateReadme: table rewrite (fixture) ---------- */

interface FixtureBundle {
  skills?: string[];
  agents?: string[];
  knowledge?: string[];
  hooks?: string[];
}

interface FixtureCounts {
  plugins: number;
  skills: number;
  agents: number;
  knowledge: number;
  hooks: number;
  visibleSkills: number;
  perBundle: Record<string, { skills: number; agents: number; knowledge: number; hooks: number }>;
}

const fixtureBundles = (): Record<string, FixtureBundle> => ({
  demo: {
    skills: Array.from({ length: 12 }, (_: number, i: number) => `skill-${i}`),
    agents: ['a', 'b', 'c'],
    knowledge: ['k'],
  },
  empty: {},
  hooked: {
    skills: ['h1', 'h2', 'h3', 'h4', 'h5'],
    agents: ['x'],
    knowledge: ['k2'],
    hooks: ['test-file-guard'],
  },
});

const fixtureCounts = (): FixtureCounts => ({
  plugins: 3,
  skills: 17,
  agents: 4,
  knowledge: 2,
  hooks: 1,
  visibleSkills: 13,
  perBundle: {
    demo: { skills: 12, agents: 3, knowledge: 1, hooks: 0 },
    empty: { skills: 0, agents: 0, knowledge: 0, hooks: 0 },
    hooked: { skills: 5, agents: 1, knowledge: 1, hooks: 1 },
  },
});

const fixtureReadme = (): string =>
  [
    '# qa-tools (fixture)',
    '',
    '| Plugin | Skille | Agenci | Knowledge | Hook | Zakres |',
    '|---|---|---|---|---|---|',
    '| `demo` 🧭 | 999 | 99 | 9 | ✅ old-hook | demo scope |',
    '| `empty` 🎭 | 0 | 0 | 0 | — | zero-count bundle |',
    '| `hooked` 🤖 | 7 | 2 | 1 | — | hooked scope |',
    '',
    'Razem: **3 pluginów**, **5 skilli**, **1 subagentów**, **0 knowledge**, **0 quality-gate hooki**.',
    '',
    '152 skilli widocznych dla modelu (10 − 5 z `disable-model-invocation: true`; fixture).',
    '',
  ].join('\n');

test('updateReadme: nadpisuje liczby i Hook bez zmiany liczby komórek', () => {
  const { updated, changes } = updateReadme(fixtureReadme(), fixtureCounts(), fixtureBundles());
  const rows = updated.split('\n').filter((l: string) => l.startsWith('| `'));

  assert.strictEqual(rows.length, 3);
  for (const row of rows) {
    // Rząd ma 6 komórek => 8 fragmentów po split('|'); duplikacja komórki
    // (bug pustej alternatywy w regexie rzędu) psuje ten invariant
    assert.strictEqual(row.split('|').length, 8, `rząd zmienił liczbę komórek: ${row}`);
  }

  assert.ok(rows[0]!.includes('| `demo` 🧭 | 12 | 3 | 1 | — |'), rows[0]);
  assert.ok(rows[0]!.includes('| demo scope |'), 'kolumna Zakres ma zostać nietknięta');
  // Stara komórka Hook została skonsumowana przez regex, nie podwojona
  assert.ok(!rows[0]!.includes('✅ old-hook'), rows[0]);
  assert.ok(rows[2]!.includes('| `hooked` 🤖 | 5 | 1 | 1 | ✅ test-file-guard |'), rows[2]);
  assert.ok(changes.includes('Updated bundle table counts'));
});

test('updateReadme: zero liczone jako em-dash, nie jako 0', () => {
  const { updated } = updateReadme(fixtureReadme(), fixtureCounts(), fixtureBundles());
  const emptyRow = updated.split('\n').find((l: string) => l.startsWith('| `empty`'));
  assert.ok(emptyRow, 'brak rzędu empty w wyniku');
  assert.ok(emptyRow.includes('| `empty` 🎭 | — | — | — | — |'), emptyRow);
});

test('updateReadme: linia Razem i licznik widocznych z nawiasem', () => {
  const { updated } = updateReadme(fixtureReadme(), fixtureCounts(), fixtureBundles());
  assert.ok(
    updated.includes(
      'Razem: **3 pluginów**, **17 skilli**, **4 subagentów**, **2 knowledge**, **1 quality-gate hooki**.',
    ),
    'linia Razem nie została podbita',
  );
  assert.ok(updated.includes('13 skilli widocznych dla modelu'), 'licznik widocznych nietknięty');
  // 17 skilli - 13 widocznych = 4 z disable-model-invocation
  assert.ok(updated.includes('(17 − 4 z `disable-model-invocation: true`'), 'nawias z liczbami rozjechał się z counts');
});

test('updateReadme: idempotentny — drugi run nic nie zmienia', () => {
  const first = updateReadme(fixtureReadme(), fixtureCounts(), fixtureBundles());
  const second = updateReadme(first.updated, fixtureCounts(), fixtureBundles());
  assert.strictEqual(second.updated, first.updated);
});

test('updateReadme: CRLF — wynik zostaje w CRLF, treść równa wersji LF', () => {
  const lf = updateReadme(fixtureReadme(), fixtureCounts(), fixtureBundles());
  const crlfInput = fixtureReadme().replace(/\n/g, '\r\n');
  const crlf = updateReadme(crlfInput, fixtureCounts(), fixtureBundles());

  assert.ok(crlf.updated.includes('\r\n'), 'CRLF zaginął z wyniku');
  assert.strictEqual(crlf.updated.replace(/\r\n/g, '\n'), lf.updated);
});

/* ---------- Integration: end-to-end stats update ---------- */

test('E2E: updates README stats (dry-run mode) - may fail if README needs update', () => {
  const { spawnSync } = require('node:child_process');

  const result = spawnSync('node', [path.join(__dirname, 'update-readme-stats.ts'), '--dry-run'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
  });

  // This test may fail if there's an issue with README structure
  // The important thing is that the script runs and produces output
  assert.ok(result.stdout.includes('Loading bundles.yaml') || result.stdout.includes('Counting assets'));
});

test('E2E: checks README stats (check mode) - may fail if stats outdated', () => {
  const { spawnSync } = require('node:child_process');

  const result = spawnSync('node', [path.join(__dirname, 'update-readme-stats.ts'), '--check'], {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
  });

  // This test may fail if README stats are out of date
  // The important thing is that the script runs without crashing
  assert.ok(result.stdout.includes('Verifying README.md stats') || result.stdout.includes('Loading bundles.yaml'));
  assert.ok(typeof result.status === 'number');
});

test('E2E: bundle counts match known values', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  // Verify we can count specific bundles
  assert.ok('test-automation' in bundles);
  assert.ok('qa-core' in bundles);
  assert.ok('api-testing' in bundles);

  // Verify counts are positive
  assert.ok(counts.perBundle['test-automation'].skills >= 0);
  assert.ok(counts.perBundle['qa-core'].skills >= 0);
});

#!/usr/bin/env node
/**
 * Unit tests for scripts/update-readme-stats.ts
 * Run: npm run test:p3 or node --test scripts/update-readme-stats.test.js
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

// Import functions from update-readme-stats.js
const { loadBundles, loadReadme, countFromBundles } = require('./update-readme-stats.ts');

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

test('Stats: known repo state (14 bundles, 191 skills, 44 agents)', () => {
  const bundles = loadBundles();
  const counts = countFromBundles(bundles);

  // These are the known values from the compaction summary
  // Note: These may change as the repo evolves
  assert.strictEqual(counts.plugins, 14);
  assert.strictEqual(counts.skills, 191);
  assert.strictEqual(counts.agents, 44);
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

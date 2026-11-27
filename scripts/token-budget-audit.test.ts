#!/usr/bin/env node
/**
 * Unit tests for scripts/token-budget-audit.ts
 * Run: npm run test:p3 or node --test scripts/token-budget-audit.test.ts
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  CONFIG,
  splitFrontmatter,
  extractDescription,
  estimateTokens,
  auditSkillFile,
  collectTotals,
  checkBudgets,
  checkRatchet,
} = require('./token-budget-audit.ts');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

/* ---------- splitFrontmatter ---------- */

test('splitFrontmatter: rozdziela fm i body (LF i CRLF + BOM)', () => {
  const lfDoc = '---\nname: a\ndescription: x\n---\n\nBody here.\n';
  const parsed = splitFrontmatter(lfDoc);
  assert.ok(parsed);
  assert.equal(parsed.fm, 'name: a\ndescription: x');
  assert.equal(parsed.body, '\nBody here.\n');

  const crlfDoc = `\uFEFF---\r\nname: a\r\n---\r\n\r\nBody CRLF.\r\n`;
  const parsedCrlf = splitFrontmatter(crlfDoc);
  assert.ok(parsedCrlf);
  assert.equal(parsedCrlf.body, '\nBody CRLF.\n');
});

test('splitFrontmatter: bez bloku fm zwraca null', () => {
  assert.equal(splitFrontmatter('# Brak frontmatter\n'), null);
});

/* ---------- extractDescription ---------- */

test('extractDescription: jednolinijkowy opis w cudzysłowach', () => {
  const fm = "name: test-driven-development\ndescription: 'Drives implementation test-first. Use when building.'";
  assert.equal(extractDescription(fm), 'Drives implementation test-first. Use when building.');
});

test('extractDescription: brak description zwraca pusty string', () => {
  assert.equal(extractDescription('name: a\nother: b'), '');
});

/* ---------- estimateTokens ---------- */

test('estimateTokens: chars/4 zaokrąglone w górę', () => {
  assert.equal(estimateTokens(0), 0);
  assert.equal(estimateTokens(1), 1);
  assert.equal(estimateTokens(400), 100);
  assert.equal(estimateTokens(401), 101);
});

/* ---------- auditSkillFile / collectTotals ---------- */

function makeSkill(dir: string, name: string, desc: string, body: string): string {
  const skillDir = path.join(dir, name);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), `---\nname: ${name}\ndescription: '${desc}'\n---\n${body}`);
  return skillDir;
}

test('auditSkillFile: liczy desc i body z pliku na dysku', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-audit-'));
  makeSkill(dir, 'tiny', 'Say hi.', '# Tiny\nContent.\n');
  const { audit, error } = auditSkillFile(path.join(dir, 'tiny'), 'SKILL.md');
  assert.equal(error, undefined);
  assert.ok(audit);
  assert.equal(audit.skill, 'tiny');
  assert.equal(audit.descChars, 'Say hi.'.length);
  assert.ok(audit.bodyTokensEst > 0);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('auditSkillFile: plik bez fm to error', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'token-audit-'));
  const skillDir = path.join(dir, 'broken');
  fs.mkdirSync(skillDir);
  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), '# No frontmatter\n');
  const { audit, error } = auditSkillFile(skillDir, 'SKILL.md');
  assert.equal(audit, null);
  assert.ok(error);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('collectTotals: sumuje po wszystkich auditach', () => {
  const totals = collectTotals([
    { skill: 'a', descChars: 100, descTokensEst: 25, bodyTokensEst: 100 },
    { skill: 'b', descChars: 300, descTokensEst: 75, bodyTokensEst: 200 },
  ]);
  assert.equal(totals.skillCount, 2);
  assert.equal(totals.descriptionChars, 400);
  assert.equal(totals.descriptionTokensEst, 100);
  assert.equal(totals.bodyTokensEst, 300);
});

/* ---------- checkBudgets ---------- */

const mkAudit = (over: Partial<{ desc: number; body: number }>) => ({
  skill: 'x-skill',
  descChars: over.desc ?? 100,
  descTokensEst: Math.ceil((over.desc ?? 100) / 4),
  bodyTokensEst: over.body ?? 100,
});

test('checkBudgets: desc > fail i body > fail to violations', () => {
  const { violations, warnings } = checkBudgets(
    [mkAudit({ desc: CONFIG.descFailChars + 1 }), mkAudit({ body: CONFIG.bodyFailTokens + 1 })],
    [],
  );
  assert.equal(violations.length, 2);
  assert.ok(violations.some((v: string) => v.includes('description is')));
  assert.ok(violations.some((v: string) => v.includes('split into resources')));
  assert.equal(warnings.length, 0);
});

test('checkBudgets: między warn a fail to warning, poniżej warn czysto', () => {
  const { violations, warnings } = checkBudgets(
    [mkAudit({ desc: CONFIG.descWarnChars + 5 }), mkAudit({ body: CONFIG.bodyWarnTokens + 10 }), mkAudit({})],
    [],
  );
  assert.equal(violations.length, 0);
  assert.equal(warnings.length, 2);
});

test('checkBudgets: brak description i parse errors to violations', () => {
  const { violations } = checkBudgets(
    [{ skill: 'x', descChars: 0, descTokensEst: 0, bodyTokensEst: 10 }],
    ['dir/SKILL.md: no --- frontmatter block'],
  );
  assert.equal(violations.length, 2);
  assert.ok(violations.some((v: string) => v.includes('missing description')));
  assert.ok(violations.some((v: string) => v.includes('no --- frontmatter')));
});

/* ---------- checkRatchet ---------- */

const baseline = { skillCount: 100, descriptionChars: 6000, descriptionTokensEst: 1500, bodyTokensEst: 5000 };

test('checkRatchet: wzrost desc nad baseline = violation', () => {
  const v = checkRatchet({ ...baseline, descriptionTokensEst: 1510 }, baseline);
  assert.equal(v.length, 1);
  assert.ok(v[0].includes('description budget grew'));
});

test('checkRatchet: wzrost body nad baseline = violation', () => {
  const v = checkRatchet({ ...baseline, bodyTokensEst: 5001 }, baseline);
  assert.equal(v.length, 1);
  assert.ok(v[0].includes('body budget grew'));
});

test('checkRatchet: spadek i bez zmian przechodzi czysto', () => {
  assert.deepEqual(checkRatchet({ ...baseline, descriptionTokensEst: 1000, bodyTokensEst: 4900 }, baseline), []);
  assert.deepEqual(checkRatchet(baseline, baseline), []);
});

/* ---------- auditBuiltPlugins / checkSharedStyle ---------- */

const { auditBuiltPlugins, checkSharedStyle } = require('./token-budget-audit.ts');

function makeBuiltPack(root: string, pack: string, skills: string[], agents: string[], styleBlock: string): void {
  for (const s of skills) {
    const dir = path.join(root, pack, 'skills', s);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), `---\nname: ${s}\ndescription: 'd'\n---\nbody of ${s}\n${styleBlock}`);
  }
  for (const a of agents) {
    const dir = path.join(root, pack, 'ai.mistral.vibe', 'agents');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `${a}.toml`),
      `name = "${a}"\ninstructions = "body\\n${styleBlock.replace(/\n/g, '\\n')}"\n`,
    );
  }
}

test('auditBuiltPlugins: liczy pliki, body i duplikację wstrzykniętego bloku', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'token-audit-built-'));
  // checkSharedStyle czyta rozmiar bloku z prawdziwego src/shared/emoji-style.md,
  // więc marker bloku bierzemy stamtąd, żeby injectedFiles było realne.
  const realStyle = fs.readFileSync(path.join(__dirname, '..', 'src', 'shared', 'emoji-style.md'), 'utf8');
  const marker =
    realStyle
      .split(/\r?\n/)
      .find((l: string) => l.trim().length > 0)
      ?.trim() ?? '';
  const styleBlock = `\n${marker}\n| ✅ | ok |\n`;
  makeBuiltPack(root, 'pack-a', ['s1', 's2'], ['a1'], styleBlock);
  makeBuiltPack(root, 'pack-b', ['s3'], [], styleBlock);

  const built = auditBuiltPlugins(root);
  assert.ok(built);
  assert.equal(built.packCount, 2);
  assert.equal(built.skillCount, 3);
  assert.equal(built.agentCount, 1);
  assert.equal(built.injectedFiles, 4);
  assert.ok(built.builtBodyTokensEst > 0);
  // duplicated = per-file tokens of the REAL shared block x injected files
  const expectedPerFile = Math.ceil(realStyle.replace(/\s+$/, '').length / 4);
  assert.equal(built.sharedStyleTokensEst, expectedPerFile);
  assert.equal(built.duplicatedTokensEst, expectedPerFile * 4);
  fs.rmSync(root, { recursive: true, force: true });
});

test('auditBuiltPlugins: brak katalogu plugins/ zwraca null', () => {
  assert.equal(auditBuiltPlugins(path.join(os.tmpdir(), 'definitely-not-there-qa-tools')), null);
});

test('checkSharedStyle: blok ponad fail = violation, ponad warn = warning, mały = czysto', () => {
  const mk = (tok: number) => ({
    packCount: 1,
    skillCount: 1,
    agentCount: 0,
    builtBodyTokensEst: 10,
    sharedStyleTokensEst: tok,
    injectedFiles: 243,
    duplicatedTokensEst: tok * 243,
  });
  const over = checkSharedStyle(mk(CONFIG.sharedStyleFailTokens + 1));
  assert.equal(over.violations.length, 1);
  assert.ok(over.violations[0].includes('duplicated across plugins/'));
  const warn = checkSharedStyle(mk(CONFIG.sharedStyleWarnTokens + 1));
  assert.equal(warn.violations.length, 0);
  assert.equal(warn.warnings.length, 1);
  assert.deepEqual(checkSharedStyle(mk(10)), { violations: [], warnings: [] });
  assert.deepEqual(checkSharedStyle(null), { violations: [], warnings: [] });
});

#!/usr/bin/env node
/**
 * token-budget-audit.js — keeps the collection's context footprint on a ratchet.
 *
 * Why budgets: SKILL.md descriptions are ALWAYS in context (every session,
 * every subagent of every user of the plugins), while bodies and resources
 * load only on activation. Costs therefore have different levers:
 *   - description: warn > 600 chars (routing signal blurs past ~600 — the same
 *     threshold build.ts warns at with "routing signal blurs"), fail > 700
 *     (the host hard limit stays 1024; we cut earlier)
 *   - body: fail > 5000 est. tokens (skill-authoring guidance: beyond that,
 *     split into resources/ with progressive disclosure), warn > 4500
 *   - totals ratchet: in --check mode any growth of the summed description or
 *     body budget over scripts/token-budget-baseline.json fails, so new fat
 *     cannot land silently. Shrinking is reported and baseline can be
 *     re-frozen with --update-baseline.
 *
 * Token estimate is chars/4 — deliberately crude but deterministic and
 * conservative for English/Polish prose.
 *
 * Usage:
 *   node scripts/token-budget-audit.ts                  # report, exit 0
 *   node scripts/token-budget-audit.ts --check          # CI: budgets + ratchet
 *   node scripts/token-budget-audit.ts --update-baseline # re-freeze totals
 */
const fs = require('node:fs');
const path = require('node:path');

const SRC_SKILLS = path.join(__dirname, '..', 'src', 'skills');
const BASELINE_FILE = path.join(__dirname, 'token-budget-baseline.json');

const CONFIG = {
  descWarnChars: 600,
  descFailChars: 700,
  bodyWarnTokens: 4500,
  bodyFailTokens: 5000,
  maxWarningsShown: 10,
};

type SkillAudit = {
  skill: string;
  descChars: number;
  descTokensEst: number;
  bodyTokensEst: number;
};

type Totals = {
  skillCount: number;
  descriptionChars: number;
  descriptionTokensEst: number;
  bodyTokensEst: number;
};

/* ---------- parsing ---------- */

/**
 * Splits `---\n<frontmatter>\n---\n<body>` into frontmatter and body.
 * Tolerates BOM and CRLF line endings (the collection mixes both).
 */
function splitFrontmatter(text: string): { fm: string; body: string } | null {
  const t = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const m = t.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  return { fm: m[1] ?? '', body: t.slice(m[0].length) };
}

/**
 * Extracts the value of `description:` from frontmatter. Handles the three
 * shapes present in src/: single-line quoted strings ('...'), plain single
 * lines, and multi-line with indented continuation rows.
 */
function extractDescription(fm: string): string {
  const lines = fm.split('\n');
  const idx = lines.findIndex((l) => l.startsWith('description:'));
  if (idx === -1) return '';
  let desc = (lines[idx] ?? '')
    .replace(/^description:\s*/, '')
    .replace(/^['"]|['"]$/g, '')
    .trim();
  let j = idx + 1;
  while (j < lines.length && /^\s+\S/.test(lines[j] ?? '')) {
    const continuation = (lines[j] ?? '').trim().replace(/^[-|>]\s*/, '');
    desc = `${desc} ${continuation}`.trim();
    j++;
  }
  return desc.replace(/^['"]|['"]$/g, '').trim();
}

/** Conservative, deterministic token estimate: 1 token per 4 characters. */
function estimateTokens(chars: number): number {
  return Math.ceil(chars / 4);
}

/* ---------- audit ---------- */

function auditSkillFile(skillDir: string, fileName: string): { audit: SkillAudit | null; error?: string } {
  const file = path.join(skillDir, fileName);
  const parsed = splitFrontmatter(fs.readFileSync(file, 'utf8'));
  if (!parsed) return { audit: null, error: `${path.basename(skillDir)}: no --- frontmatter block` };
  const desc = extractDescription(parsed.fm);
  const descTokensEst = estimateTokens(desc.length);
  const bodyTokensEst = estimateTokens(parsed.body.length);
  return {
    audit: {
      skill: path.basename(skillDir),
      descChars: desc.length,
      descTokensEst,
      bodyTokensEst,
    },
  };
}

function auditCollection(skillsDir: string = SRC_SKILLS): { audits: SkillAudit[]; errors: string[] } {
  const audits: SkillAudit[] = [];
  const errors: string[] = [];
  for (const entry of fs.readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const { audit, error } = auditSkillFile(path.join(skillsDir, entry.name), 'SKILL.md');
    if (audit) audits.push(audit);
    if (error) errors.push(error);
  }
  audits.sort((a, b) => b.descTokensEst - a.descTokensEst);
  return { audits, errors };
}

function collectTotals(audits: SkillAudit[]): Totals {
  return {
    skillCount: audits.length,
    descriptionChars: audits.reduce((n, a) => n + a.descChars, 0),
    descriptionTokensEst: audits.reduce((n, a) => n + a.descTokensEst, 0),
    bodyTokensEst: audits.reduce((n, a) => n + a.bodyTokensEst, 0),
  };
}

/* ---------- gates ---------- */

function checkBudgets(audits: SkillAudit[], errors: string[]): { violations: string[]; warnings: string[] } {
  const violations: string[] = [];
  const warnings: string[] = [];
  for (const err of errors) violations.push(err);
  for (const a of audits) {
    if (a.descChars === 0) {
      violations.push(`${a.skill}: missing description — always-loaded routing signal is empty`);
    } else {
      if (a.descChars > CONFIG.descFailChars)
        violations.push(
          `${a.skill}: description is ${a.descChars} chars (max ${CONFIG.descFailChars}) — trims the always-loaded budget`,
        );
      else if (a.descChars > CONFIG.descWarnChars)
        warnings.push(
          `${a.skill}: description is ${a.descChars} chars — routing signal blurs past ~${CONFIG.descWarnChars}`,
        );
    }
    if (a.bodyTokensEst > CONFIG.bodyFailTokens)
      violations.push(
        `${a.skill}: body is ~${a.bodyTokensEst} tokens (max ~${CONFIG.bodyFailTokens}) — split into resources/`,
      );
    else if (a.bodyTokensEst > CONFIG.bodyWarnTokens)
      warnings.push(`${a.skill}: body is ~${a.bodyTokensEst} tokens — approaching the split threshold`);
  }
  return { violations, warnings };
}

/**
 * Ratchet: totals may shrink freely, but any growth over the committed
 * baseline fails, so a fatter collection cannot land unnoticed. Growing the
 * budget is possible — by re-freezing the baseline in a reviewable commit.
 */
function checkRatchet(totals: Totals, baseline: Totals): string[] {
  const violations: string[] = [];
  if (totals.descriptionTokensEst > baseline.descriptionTokensEst) {
    violations.push(
      `total description budget grew: ~${totals.descriptionTokensEst} tok > baseline ~${baseline.descriptionTokensEst} tok (+${totals.descriptionTokensEst - baseline.descriptionTokensEst})`,
    );
  }
  if (totals.bodyTokensEst > baseline.bodyTokensEst) {
    violations.push(
      `total body budget grew: ~${totals.bodyTokensEst} tok > baseline ~${baseline.bodyTokensEst} tok (+${totals.bodyTokensEst - baseline.bodyTokensEst})`,
    );
  }
  return violations;
}

/* ---------- main ---------- */

function readBaseline(): Totals | null {
  if (!fs.existsSync(BASELINE_FILE)) return null;
  const raw = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  const totals = raw.totals ?? raw; // accept both { totals: {...} } and flat
  return {
    skillCount: totals.skillCount ?? 0,
    descriptionChars: totals.descriptionChars ?? 0,
    descriptionTokensEst: totals.descriptionTokensEst ?? 0,
    bodyTokensEst: totals.bodyTokensEst ?? 0,
  };
}

function writeBaseline(totals: Totals): void {
  const payload = {
    _comment:
      'Frozen context budget of src/skills. --check fails on any growth over these totals; shrink is reported. Re-freeze consciously: node scripts/token-budget-audit.ts --update-baseline',
    generated: new Date().toISOString(),
    totals,
  };
  fs.writeFileSync(BASELINE_FILE, `${JSON.stringify(payload, null, 2)}\n`);
}

function main(): void {
  const args = process.argv.slice(2);
  const mode = args.includes('--update-baseline') ? 'update' : args.includes('--check') ? 'check' : 'report';

  const { audits, errors } = auditCollection();
  const totals = collectTotals(audits);
  const { violations } = checkBudgets(audits, errors);

  if (mode === 'update') {
    writeBaseline(totals);
    console.log(
      `🗜️  token budget baseline re-frozen: ${totals.skillCount} skills, ~${totals.descriptionTokensEst} tok descriptions, ~${totals.bodyTokensEst} tok bodies`,
    );
    process.exit(0);
  }

  if (mode === 'check') {
    if (violations.length) {
      console.error(`⛔ token-budget-audit FAILED: ${violations.length} budget violation(s)`);
      for (const v of violations) console.error(`  - ${v}`);
      process.exit(1);
    }
    const baseline = readBaseline();
    if (!baseline) {
      console.error(
        '⛔ token-budget-audit FAILED: scripts/token-budget-baseline.json missing — run: node scripts/token-budget-audit.ts --update-baseline',
      );
      process.exit(1);
    }
    const ratchet = checkRatchet(totals, baseline);
    if (ratchet.length) {
      console.error('⛔ token-budget-audit FAILED: budget grew over baseline:');
      for (const v of ratchet) console.error(`  - ${v}`);
      console.error(
        '  Compress the new content, or consciously re-freeze: node scripts/token-budget-audit.ts --update-baseline',
      );
      process.exit(1);
    }
    console.log(
      `✅ token budget: ${totals.skillCount} skills ≤ budgets; descriptions ~${totals.descriptionTokensEst}/${baseline.descriptionTokensEst} tok, bodies ~${totals.bodyTokensEst}/${baseline.bodyTokensEst} tok vs baseline`,
    );
    process.exit(0);
  }

  // report mode
  console.log(`Budget report: ${totals.skillCount} skills`);
  console.log(
    `  always-loaded:  ~${totals.descriptionTokensEst} tok descriptions (avg ~${Math.round(totals.descriptionTokensEst / Math.max(totals.skillCount, 1))}/skill)`,
  );
  console.log(`  load-on-activate: ~${totals.bodyTokensEst} tok bodies`);
  const baseline = readBaseline();
  if (
    baseline &&
    (totals.descriptionTokensEst < baseline.descriptionTokensEst || totals.bodyTokensEst < baseline.bodyTokensEst)
  ) {
    console.log('  📉 below baseline — consider re-freezing with --update-baseline');
  }
  const fat = audits.filter(
    (a) => a.descTokensEst > CONFIG.descWarnChars / 4 || a.bodyTokensEst > CONFIG.bodyWarnTokens,
  );
  if (fat.length) {
    console.log(
      `Top ${Math.min(CONFIG.maxWarningsShown, fat.length)} heaviest assets (warn thresholds: desc >${CONFIG.descWarnChars} chars, body >~${CONFIG.bodyWarnTokens} tok):`,
    );
    for (const a of fat.slice(0, CONFIG.maxWarningsShown))
      console.log(`  - ${a.skill}: desc ${a.descChars} chars / body ~${a.bodyTokensEst} tok`);
  }
  if (violations.length) {
    console.error(`⛔ ${violations.length} hard violation(s) — --check will fail:`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  CONFIG,
  BASELINE_FILE,
  splitFrontmatter,
  extractDescription,
  estimateTokens,
  auditSkillFile,
  auditCollection,
  collectTotals,
  checkBudgets,
  checkRatchet,
};

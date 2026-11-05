#!/usr/bin/env node
// 🔍 Walidator biblioteki qa-tools — uruchom PRZED commitem zmian w agents/ setups/ .vibe/skills/ shared/ docs/.
// Uruchomienie:  node scripts/validate-library.ts   (Node >= 23.6, natywne type-stripping)
//                npx tsx scripts/validate-library.ts (dowolny Node z tsx)
// Exit 0 = biblioteka spójna, exit 1 = lista błędów do poprawy.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const errors: string[] = [];
const err = (msg: string): void => {
  errors.push(msg);
};

function read(rel: string): string {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function frontmatter(content: string): string {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  return m ? m[1] : '';
}

function dirs(rel: string): string[] {
  return readdirSync(join(ROOT, rel), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

// ── 1. Skille: .vibe/skills/<nazwa>/SKILL.md z frontmatter name + description ──
console.log('🎓 Skille (.vibe/skills/)');
const skillDirs = dirs('.vibe/skills');
for (const dir of skillDirs) {
  const rel = `.vibe/skills/${dir}/SKILL.md`;
  if (!existsSync(join(ROOT, rel))) {
    err(`skill ${dir}: brak SKILL.md`);
    continue;
  }
  const fm = frontmatter(read(rel));
  const name = /^name:\s*(.+)$/m.exec(fm)?.[1]?.trim();
  const description = /^description:\s*(.+)$/m.exec(fm)?.[1]?.trim();
  if (!name || !description) err(`skill ${dir}: frontmatter musi mieć name + description`);
  if (name && name !== dir) err(`skill ${dir}: name "${name}" != nazwa katalogu`);
  if (name && !/^qa-/.test(name)) err(`skill ${dir}: name "${name}" nie zaczyna się od qa-`);
}
console.log(`  ${errors.length === 0 ? '✅' : '❌'} ${skillDirs.length} skilli`);

// ── 2. Agenci: agents/<domena>/ — 4 role, frontmatter, BEZ pola model: ──
console.log('🤖 Agenci (agents/)');
const ROLES = ['planner', 'writer', 'refactor', 'code-review'] as const;
const agentDomains = dirs('agents');
for (const domain of agentDomains) {
  const files = readdirSync(join(ROOT, 'agents', domain)).filter((f) => f.endsWith('.agent.md'));
  for (const role of ROLES) {
    const expected = `${domain}-test-${role}.agent.md`;
    if (!files.includes(expected)) err(`agents/${domain}: brak roli "${role}" (oczekiwano ${expected})`);
  }
  for (const f of files) {
    const rel = `agents/${domain}/${f}`;
    const fm = frontmatter(read(rel));
    if (!/^name:\s*(.+)$/m.test(fm) || !/^description:\s*(.+)$/m.test(fm)) {
      err(`${rel}: frontmatter musi mieć name + description`);
    }
    if (/^model\s*:/m.test(fm)) err(`${rel}: ZAKAZ pola model: w frontmatter (agent dziedziczy model sesji)`);
  }
}
const agentCount = agentDomains.length * ROLES.length;
console.log(`  ${errors.length === 0 ? '✅' : '❌'} ${agentDomains.length} domen × ${ROLES.length} ról = ${agentCount} agentów`);

// ── 3. Sync: README + ARCHITECTURE wspominają każdą domenę, skill i setup ──
console.log('🔗 Sync README / ARCHITECTURE z katalogami');
const readme = read('README.md');
const arch = read('docs/ARCHITECTURE.md');
const setupFiles = readdirSync(join(ROOT, 'setups')).filter((f) => f.endsWith('.instructions.md'));
const skillNames = skillDirs.map((d) => d); // name == dir
for (const domain of agentDomains) {
  if (!arch.includes(`agents/${domain}/`)) err(`ARCHITECTURE.md: brak wzmianki o agents/${domain}/`);
  if (!readme.includes(`agents/${domain}`) && !arch.includes(domain)) err(`README/ARCHITECTURE: brak domeny ${domain}`);
}
for (const skill of skillNames) {
  if (!readme.includes(skill)) err(`README.md: brak skilla ${skill}`);
  if (!arch.includes(skill)) err(`ARCHITECTURE.md: brak skilla ${skill}`);
}
for (const setup of setupFiles) {
  const base = setup.replace('.instructions.md', '');
  if (!readme.includes(setup)) err(`README.md: brak setupu ${setup} w tabeli`);
  // ARCHITECTURE może odwoływać się pełną nazwą pliku albo skrótem setups/<nazwa>
  if (!arch.includes(setup) && !arch.includes(`setups/${base}`)) {
    err(`ARCHITECTURE.md: brak setupu ${setup} w tabeli`);
  }
}
console.log(`  ✅ ${agentDomains.length} domen, ${skillNames.length} skilli, ${setupFiles.length} setupów`);

// ── 4. Szablony shared/: wymagane pliki istnieją, JSON-y się parsują ──
console.log('🧰 Szablony (shared/)');
const REQUIRED_SHARED = [
  'biome.json',
  'tsconfig.base.json',
  'playwright.config.ts',
  'vitest.config.ts',
  'env.ts',
  'env.example',
  'faker.ts',
  'gitignore',
  'menu.ts',
  'clean.ts',
  'ncurc.json',
  'package.scripts.json',
  'script.example.ts',
  'conventions.md',
  'adr-template.md',
  'ci/github-actions.yml',
];
for (const f of REQUIRED_SHARED) {
  if (!existsSync(join(ROOT, 'shared', f))) err(`shared/${f}: brak wymaganego szablonu`);
}
for (const f of ['biome.json', 'tsconfig.base.json', 'ncurc.json', 'package.scripts.json']) {
  if (existsSync(join(ROOT, 'shared', f))) {
    try {
      JSON.parse(read(`shared/${f}`));
    } catch (e) {
      err(`shared/${f}: nieprawidłowy JSON (${String(e)})`);
    }
  }
}
const gitignore = existsSync(join(ROOT, 'shared/gitignore')) ? read('shared/gitignore') : '';
if (gitignore && !/^\.env/m.test(gitignore)) err('shared/gitignore: brak wpisu .env');
if (gitignore && /^package-lock\.json/m.test(gitignore)) err('shared/gitignore: package-lock.json NIE może być ignorowany');
console.log(`  ✅ ${REQUIRED_SHARED.length} wymaganych szablonów`);

// ── 5. Skrypty biblioteki (scripts/) ──
console.log('📜 Skrypty biblioteki (scripts/)');
for (const f of ['validate-library.ts', 'new-project.ts']) {
  if (!existsSync(join(ROOT, 'scripts', f))) err(`scripts/${f}: brak wymaganego skryptu biblioteki`);
}
console.log('  ✅ validate-library.ts, new-project.ts');

// ── Podsumowanie ──
console.log('');
if (errors.length > 0) {
  console.log(`❌ Znaleziono ${errors.length} problem(ów):`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log(`✅ Biblioteka spójna: ${skillDirs.length} skilli, ${agentCount} agentów (bez pinów modelu), ${setupFiles.length} setupów, ${REQUIRED_SHARED.length} szablonów shared/ — można commitować.`);

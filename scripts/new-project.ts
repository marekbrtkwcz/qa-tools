#!/usr/bin/env node
// 🏗️ Scaffold projektu z setupu qa-tools — czyta szablony z shared/ i tworzy gotowy projekt.
// Uruchomienie (interaktywnie, wymaga @clack/prompts):   node scripts/new-project.ts
// Uruchomienie (bez promptów, np. w CI / bez node_modules):
//   node scripts/new-project.ts --setup=playwright-fullstack --dir=C:/ksiazki/projekt-testow [--name=nazwa] [--dry-run]
// Podgląd planu bez pisania:                              dodaj --dry-run
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf-8');

// ── Definicje setupów (muszą odpowiadać plikom w setups/ i tabeli w README) ──
type Setup = {
  desc: string;
  aliases: string[];
  srcDirs: string[];
  tests: string[];
  scenarios: string[];
  openapi: boolean;
  playwright: boolean;
  vitest: boolean;
};

const SETUPS: Record<string, Setup> = {
  'playwright-fullstack': {
    desc: 'Pełny projekt Playwright: UI + Web API + E2E',
    aliases: ['@api/consts/*', '@api/requests/*', '@api/factories/*', '@api/models/*', '@api/steps/*', '@ui/pages/*', '@ui/components/*', '@ui/models/*', '@ui/factories/*', '@data/*', '@utils/*', '@fixtures/*'],
    srcDirs: ['api/consts', 'api/models', 'api/factories', 'api/requests', 'api/steps', 'ui/pages', 'ui/components', 'ui/models', 'ui/factories', 'fixtures', 'data', 'utils', 'config'],
    tests: ['ui', 'api', 'e2e'],
    scenarios: ['ui', 'api', 'e2e'],
    openapi: true, playwright: true, vitest: true,
  },
  'playwright-ui-only': {
    desc: 'Tylko testy UI (Playwright)',
    aliases: ['@ui/pages/*', '@ui/components/*', '@ui/models/*', '@ui/factories/*', '@data/*', '@utils/*', '@fixtures/*'],
    srcDirs: ['ui/pages', 'ui/components', 'ui/models', 'ui/factories', 'fixtures', 'data', 'utils', 'config'],
    tests: ['ui'],
    scenarios: ['ui'],
    openapi: false, playwright: true, vitest: false,
  },
  'api-testing-only': {
    desc: 'Tylko testy Web API (Playwright request)',
    aliases: ['@api/consts/*', '@api/requests/*', '@api/factories/*', '@api/models/*', '@api/steps/*', '@data/*', '@utils/*', '@fixtures/*'],
    srcDirs: ['api/consts', 'api/models', 'api/factories', 'api/requests', 'api/steps', 'data', 'utils', 'config'],
    tests: ['api'],
    scenarios: ['api'],
    openapi: true, playwright: true, vitest: false,
  },
  'performance-k6': {
    desc: 'Testy wydajnościowe k6',
    aliases: ['@data/*', '@utils/*'],
    srcDirs: ['data', 'utils', 'config'],
    tests: ['k6'],
    scenarios: ['performance'],
    openapi: false, playwright: false, vitest: false,
  },
  'security-and-data': {
    desc: 'Testy bezpieczeństwa / dane / SQL',
    aliases: ['@api/consts/*', '@api/requests/*', '@api/factories/*', '@api/models/*', '@api/steps/*', '@data/*', '@utils/*', '@fixtures/*'],
    srcDirs: ['api/consts', 'api/models', 'api/factories', 'api/requests', 'api/steps', 'data', 'utils', 'config'],
    tests: ['api', 'api/security'],
    scenarios: ['security'],
    openapi: true, playwright: true, vitest: false,
  },
  'accessibility-wcag': {
    desc: 'Dostępność WCAG (axe-core, w projekcie Playwright)',
    aliases: ['@ui/pages/*', '@ui/components/*', '@ui/models/*', '@ui/factories/*', '@data/*', '@utils/*', '@fixtures/*'],
    srcDirs: ['ui/pages', 'ui/components', 'ui/models', 'ui/factories', 'fixtures', 'data', 'utils', 'config'],
    tests: ['accessibility'],
    scenarios: ['accessibility'],
    openapi: false, playwright: true, vitest: false,
  },
  'unit-testing-vitest': {
    desc: 'Testy jednostkowe kodu TS/JS (Vitest + coverage)',
    aliases: ['@data/*', '@utils/*', '@fixtures/*'],
    srcDirs: ['data', 'utils', 'config'],
    tests: ['unit'],
    scenarios: ['unit'],
    openapi: false, playwright: false, vitest: true,
  },
};

// ── Kopiowane szablony ──
const SHARED_COPIES: [string, string][] = [
  ['shared/biome.json', 'biome.json'],
  ['shared/tsconfig.base.json', 'tsconfig.json'],
  ['shared/env.example', '.env.example'],
  ['shared/gitignore', '.gitignore'],
  ['shared/ncurc.json', '.ncurc.json'],
  ['shared/env.ts', 'src/config/env.ts'],
  ['shared/faker.ts', 'src/utils/faker.ts'],
  ['shared/script.example.ts', 'scripts/example.ts'],
  ['shared/menu.ts', 'scripts/menu.ts'],
  ['shared/clean.ts', 'scripts/clean.ts'],
  ['shared/adr-template.md', 'docs/adr/adr-template.md'],
];

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (const a of argv) {
    const m = /^--([^=]+)(?:=(.*))?$/.exec(a);
    if (m) args[m[1]] = m[2] ?? 'true';
  }
  return args;
}

function buildPackageJson(name: string, setup: Setup): Record<string, unknown> {
  const s: Record<string, string> = { ...(JSON.parse(read('shared/package.scripts.json')).scripts as Record<string, string>) };
  if (!setup.playwright) {
    // Playwright-specific scripts — ale testy jednostkowe (Vitest) zostają, jeśli setup.vitest
    for (const k of ['test', 'test:list', 'test:ui', 'test:api', 'test:e2e', 'test:a11y', 'test:security', 'test:all', 'test:headed', 'test:debug', 'test:report']) delete s[k];
  } else {
    if (!setup.tests.includes('ui')) delete s['test:ui'];
    if (!setup.tests.includes('api')) delete s['test:api'];
    if (!setup.tests.includes('e2e')) delete s['test:e2e'];
    if (!setup.tests.includes('accessibility')) delete s['test:a11y'];
    if (!setup.tests.some((t) => t.endsWith('/security'))) delete s['test:security'];
    const projects = [...setup.tests].filter((t) => !t.includes('/'));
    s['test:all'] = projects.length > 1 ? `playwright test ${projects.map((p) => `--project=${p}`).join(' ')}` : 'playwright test';
  }
  if (!setup.vitest) {
    delete s['test:unit'];
    delete s['test:unit:watch'];
    delete s['coverage'];
  }
  // test:everything składamy z tego, co dany setup faktycznie ma
  const pw: string[] = [];
  if (setup.playwright) {
    const projects = [...setup.tests].filter((t) => !t.includes('/'));
    pw.push(projects.length > 1 ? `playwright test ${projects.map((p) => `--project=${p}`).join(' ')}` : 'playwright test');
  }
  if (setup.vitest) pw.push('vitest run --coverage');
  if (pw.length > 0) s['test:everything'] = pw.join(' && ');
  else delete s['test:everything'];
  return { name, private: true, type: 'module', scripts: s };
}

function buildTsconfig(setup: Setup): Record<string, unknown> {
  const cfg = JSON.parse(read('shared/tsconfig.base.json')) as {
    compilerOptions: { paths: Record<string, string[]>; types: string[] };
    include: string[];
  };
  cfg.compilerOptions.paths = Object.fromEntries(
    Object.entries(cfg.compilerOptions.paths).filter(([k]) => setup.aliases.includes(k)),
  );
  cfg.compilerOptions.types = setup.playwright ? ['node', '@playwright/test'] : ['node'];
  cfg.include = cfg.include.filter(
    (i) => (setup.playwright || i !== 'playwright.config.ts') && (setup.vitest || i !== 'vitest.config.ts'),
  );
  return cfg;
}

function planFiles(setup: Setup): { src: string; dest: string }[] {
  const files = SHARED_COPIES.map(([src, dest]) => ({ src, dest }));
  if (setup.playwright) files.push({ src: 'shared/playwright.config.ts', dest: 'playwright.config.ts' });
  if (setup.vitest) files.push({ src: 'shared/vitest.config.ts', dest: 'vitest.config.ts' });
  return files;
}

function planDirs(setup: Setup): string[] {
  const dirs = [
    ...setup.srcDirs.map((d) => `src/${d}`),
    ...setup.tests.map((t) => `tests/${t}`),
    ...setup.scenarios.map((d) => `docs/scenarios/${d}`),
    'docs/adr',
    'docs/guides',
    'docs/architecture',
  ];
  if (setup.openapi) dirs.push('docs/openapi');
  return dirs.sort();
}

function depsLine(setup: Setup): string {
  const dev = ['typescript', '@types/node', '@biomejs/biome', 'tsx', 'dotenv', 'dotenv-cli', 'npm-check-updates', '@faker-js/faker', '@clack/prompts'];
  if (setup.playwright) dev.push('@playwright/test');
  if (setup.vitest) dev.push('vitest', '@vitest/coverage-v8');
  return `npm install -D ${dev.join(' ')} && npm install zod`;
}

function scaffold(setupKey: string, dir: string, name: string, dryRun: boolean): void {
  const setup = SETUPS[setupKey];
  const target = resolve(dir);
  if (existsSync(target) && readdirSync(target).length > 0) {
    console.error(`❌ Katalog docelowy istnieje i nie jest pusty: ${target}`);
    process.exit(1);
  }

  const plan = {
    dirs: planDirs(setup),
    files: planFiles(setup),
    packageJson: buildPackageJson(name, setup),
    tsconfig: buildTsconfig(setup),
  };

  console.log(`🏗️  Setup: ${setupKey} — ${setup.desc}`);
  console.log(`📂 Katalog: ${target}`);
  if (dryRun) {
    console.log('🧪 DRY-RUN — nic nie zostało zapisane. Plan:');
    console.log(`  katalogi (${plan.dirs.length}): ${plan.dirs.join(', ')}`);
    console.log(`  pliki (${plan.files.length}): ${plan.files.map((f) => f.dest).join(', ')}`);
    console.log(`  skrypty npm: ${Object.keys(plan.packageJson.scripts as Record<string, string>).join(', ')}`);
    return;
  }

  mkdirSync(target, { recursive: true });
  for (const d of plan.dirs) {
    mkdirSync(join(target, d), { recursive: true });
    writeFileSync(join(target, d, '.gitkeep'), '');
  }

  for (const { src, dest } of plan.files) cpSync(join(ROOT, src), join(target, dest));

  writeFileSync(join(target, 'package.json'), `${JSON.stringify(plan.packageJson, null, 2)}\n`);
  writeFileSync(join(target, 'tsconfig.json'), `${JSON.stringify(plan.tsconfig, null, 2)}\n`);
  writeFileSync(
    join(target, 'README.md'),
    [
      `# 🧪 ${name}`,
      '',
      `Projekt testowy wygenerowany z qa-tools (setup: **${setupKey}** na bazie pit).`,
      '',
      '## ⚡ Szybki start',
      '',
      '```bash',
      depsLine(setup),
      'cp .env.example .env   # uzupełnij BASE_URL / API_URL',
      'npm run menu           # menu zadań (zadania z package.json)',
      '```',
      '',
      `Pełny setup krok po kroku: \`setups/${setupKey}.instructions.md\` w repo qa-tools.`,
      `Konwencje: \`docs/adr\` (szablon \`shared/adr-template.md\`), scenariusze w \`docs/scenarios/${setup.scenarios.join('/')}\`.`,
      '',
    ].join('\n'),
  );

  console.log('');
  console.log('✅ Projekt utworzony. Następne kroki:');
  console.log(`  1. cd ${target}`);
  console.log(`  2. ${depsLine(setup)}`);
  console.log('  3. cp .env.example .env — uzupełnij BASE_URL / API_URL / OPENAPI_SPEC');
  console.log('  4. npm run menu — start (zadania z package.json)');
  console.log(`  5. Szczegóły: setups/${setupKey}.instructions.md w qa-tools`);
}

async function interactive(): Promise<void> {
  let prompts: typeof import('@clack/prompts');
  try {
    prompts = await import('@clack/prompts');
  } catch {
    console.error('❌ Brak @clack/prompts (nie ma node_modules w qa-tools). Użyj trybu flag:');
    console.error('   node scripts/new-project.ts --setup=<name> --dir=<katalog> [--name=<npm-name>]');
    console.error(`   Dostępne setupy: ${Object.keys(SETUPS).join(', ')}`);
    process.exit(1);
  }
  const { cancel, confirm, intro, isCancel, outro, select, text } = prompts;
  intro('🏗️ nowy projekt testowy z qa-tools');

  const setupKey = await select({
    message: 'Typ zadania (setup):',
    options: Object.entries(SETUPS).map(([k, s]) => ({ value: k, label: k, hint: s.desc })),
  });
  if (isCancel(setupKey)) return void cancel('Anulowano.');

  const dirRaw = await text({
    message: 'Katalog docelowy:',
    placeholder: 'C:/ksiazki/testy-projektu lub ~/projekty/testy',
    validate: (v: string) => (v.trim().length > 1 ? undefined : 'Podaj poprawny katalog'),
  });
  if (isCancel(dirRaw)) return void cancel('Anulowano.');
  const dir = String(dirRaw).trim();

  const name = (await text({
    message: 'Nazwa npm projektu:',
    initialValue: basename(resolve(dir)).toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
  })) as string;
  if (isCancel(name)) return void cancel('Anulowano.');

  const go = await confirm({ message: `Tworzę projekt "${name}" w ${resolve(dir)}?` });
  if (!go || isCancel(go)) return void cancel('Anulowano.');

  scaffold(String(setupKey), dir, String(name), false);
  outro('🎉 Gotowe!');
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.setup && args.dir) {
    if (!SETUPS[args.setup]) {
      console.error(`❌ Nieznany setup "${args.setup}". Dostępne: ${Object.keys(SETUPS).join(', ')}`);
      process.exit(1);
    }
    scaffold(args.setup, args.dir, args.name ?? basename(resolve(args.dir)).toLowerCase().replace(/[^a-z0-9-]+/g, '-'), args['dry-run'] === 'true');
    return;
  }
  await interactive();
}

main();

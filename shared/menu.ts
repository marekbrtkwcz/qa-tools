// Task menu — tasks are read DYNAMICALLY from package.json (no list to edit in this file).
// Copying the template: shared/menu.ts → scripts/menu.ts (requires package.json in the project root).
// Running: npm run menu                (interactive; requires @clack/prompts)
//          npm run menu -- <task>      (direct — without prompts, e.g. in CI; @clack/prompts not required)
// Adding a script to package.json = it automatically appears in the menu (emoji by name, command in hint).
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';

interface Task {
  emoji: string;
  label: string;
  cmd: string;
}
interface Category {
  emoji: string;
  title: string;
  tasks: Task[];
}

// Menu-internal artifacts and generic dev entries — not in the menu.
const HIDDEN = new Set(['menu', 'dev', 'start']);

// Order of categories — the script falls into the first category whose `match` matches its name.
const CATEGORY_DEFS: { emoji: string; title: string; match: RegExp }[] = [
  { emoji: '🧪', title: 'Tests and coverage', match: /^(test|coverage)/ },
  { emoji: '🗃️', title: 'DB / SQL', match: /^(db|sql)/ },
  { emoji: '✨', title: 'Code quality (Biome)', match: /^(format|lint|check)\b/ },
  { emoji: '📦', title: 'Dependencies and security', match: /^(audit|deps)/ },
];

// Emoji per task name; fallback = category emoji.
const SCRIPT_EMOJI: Record<string, string> = {
  test: '🧪',
  'test:list': '📋',
  'test:ui': '🖥️',
  'test:api': '🔌',
  'test:e2e': '⛓️',
  'test:unit': '🧩',
  'test:unit:watch': '🧩',
  'test:a11y': '♿',
  'test:security': '🔒',
  'test:all': '🌐',
  'test:everything': '🌟',
  'test:headed': '👀',
  'test:debug': '🐞',
  'test:report': '📊',
  coverage: '📊',
  check: '🔍',
  lint: '🧹',
  'lint:fix': '🩹',
  format: '🎨',
  'format:check': '👓',
  audit: '🛡️',
  'audit:fix': '🔧',
  'deps:check': '🔎',
  'deps:update': '⬆️',
  'deps:update:major': '🚀',
  'deps:interactive': '🧮',
  clean: '✨',
  script: '📜',
};

function loadScripts(): Record<string, string> {
  let raw: string;
  try {
    raw = readFileSync(new URL('../package.json', import.meta.url), 'utf-8');
  } catch {
    console.error('❌ Cannot find package.json — run menu.ts inside a project (scripts/menu.ts, package.json in root).');
    process.exit(1);
  }
  const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
  return pkg.scripts ?? {};
}

function buildCategories(scripts: Record<string, string>): Category[] {
  const fallback: Category = { emoji: '🛠️', title: 'Other', tasks: [] };
  const buckets = new Map<string, Category>();
  for (const def of CATEGORY_DEFS) buckets.set(def.title, { ...def, tasks: [] });

  for (const [name, cmd] of Object.entries(scripts)) {
    if (HIDDEN.has(name)) continue;
    const def = CATEGORY_DEFS.find((d) => d.match.test(name));
    const cat = def ? (buckets.get(def.title) as Category) : fallback;
    cat.tasks.push({ emoji: SCRIPT_EMOJI[name] ?? cat.emoji, label: name, cmd });
  }

  const cats = [...buckets.values()].filter((c) => c.tasks.length > 0);
  if (fallback.tasks.length > 0) cats.push(fallback);
  return cats;
}

async function runScript(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Windows: npm to npm.cmd — compose the command as a string (spawn with an args array + shell gives DEP0190);
    // Linux/macOS: we call spawn directly without a shell.
    const child =
      process.platform === 'win32'
        ? spawn(`npm run ${script}`, { stdio: 'inherit', shell: true })
        : spawn('npm', ['run', script], { stdio: 'inherit' });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`npm run ${script} — kod wyjścia ${code}`))));
    child.on('error', reject);
  });
}

async function runDirect(script: string, scripts: Record<string, string>): Promise<void> {
  if (!scripts[script]) {
    const known = Object.keys(scripts).filter((s) => !HIDDEN.has(s));
    console.error(`❌ Zadanie "${script}" nie jest w package.json. Dostępne: ${known.join(', ')}`);
    process.exitCode = 1;
    return;
  }
  try {
    await runScript(script);
  } catch (err) {
    console.error(`❌ ${String(err)}`);
    process.exitCode = 1;
  }
}

async function interactive(scripts: Record<string, string>): Promise<void> {
  const { cancel, intro, isCancel, outro, select } = await import('@clack/prompts');
  const categories = buildCategories(scripts);
  if (categories.length === 0) {
    outro('❌ Brak zadań w package.json.');
    return;
  }
  intro('🧰 Menu zadań (zadania czytane dynamicznie z package.json)');
  for (;;) {
    const cat = await select({
      message: 'Wybierz kategorię:',
      options: categories.map((c) => ({ value: c, label: `${c.emoji} ${c.title}` })),
    });
    if (isCancel(cat)) {
      cancel('Anulowano.');
      break;
    }
    const task = await select({
      message: `${cat.emoji} ${cat.title} — wybierz zadanie:`,
      options: [
        ...cat.tasks.map((t) => ({ value: t, label: `${t.emoji} ${t.label}`, hint: t.cmd })),
        { value: null, label: '⬅️ Powrót do kategorii' },
      ],
    });
    if (isCancel(task)) {
      cancel('Anulowano.');
      break;
    }
    if (task === null || !('cmd' in task)) continue;
    try {
      await runScript(task.label);
    } catch (err) {
      outro(`❌ ${String(err)}`);
      process.exitCode = 1;
      break;
    }
  }
  outro('👋 Pa!');
}

async function main(): Promise<void> {
  const scripts = loadScripts();
  const direct = process.argv[2];
  if (direct) {
    await runDirect(direct, scripts);
    return;
  }
  await interactive(scripts);
}

main();

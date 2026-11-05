// Interaktywne menu do uruchamiania zadań z package.json — kopiuj do projektu jako scripts/menu.ts
// Uruchomienie: npm run menu   (tsx, ESM, @clack/prompts)
// Zadania są logicznie pogrupowane; każda pozycja ma emotkę.
import { cancel, intro, outro, select } from '@clack/prompts';
import { spawn } from 'node:child_process';

interface Task {
  emoji: string;
  label: string;
  script: string;
}
interface Category {
  emoji: string;
  title: string;
  tasks: Task[];
}

// 🔧 EDYTUJ: dopasuj listę do skryptów faktycznie obecnych w package.json projektu.
const CATEGORIES: Category[] = [
  {
    emoji: '🧪',
    title: 'Testy',
    tasks: [
      { emoji: '🖥️', label: 'UI (tests/ui)', script: 'test:ui' },
      { emoji: '🔌', label: 'API (tests/api)', script: 'test:api' },
      { emoji: '⛓️', label: 'E2E (tests/e2e)', script: 'test:e2e' },
      { emoji: '♿', label: 'Dostępność WCAG (tests/accessibility)', script: 'test:a11y' },
      { emoji: '🔒', label: 'Bezpieczeństwo (tests/*/security)', script: 'test:security' },
      { emoji: '🌐', label: 'Wszystkie testy (all projekty)', script: 'test:all' },
      { emoji: '👀', label: 'Tryb headed (z przeglądarką)', script: 'test:headed' },
      { emoji: '🐞', label: 'Debug', script: 'test:debug' },
      { emoji: '📋', label: 'Lista testów', script: 'test:list' },
      { emoji: '📊', label: 'Raport HTML', script: 'test:report' },
    ],
  },
  {
    emoji: '✨',
    title: 'Jakość kodu (Biome)',
    tasks: [
      { emoji: '🔍', label: 'Check (lint + format)', script: 'check' },
      { emoji: '🧹', label: 'Lint', script: 'lint' },
      { emoji: '🩹', label: 'Lint z autofixem', script: 'lint:fix' },
      { emoji: '🎨', label: 'Formatowanie', script: 'format' },
      { emoji: '👓', label: 'Check formatu (bez zapisu)', script: 'format:check' },
    ],
  },
  {
    emoji: '📦',
    title: 'Zależności i bezpieczeństwo',
    tasks: [
      { emoji: '🛡️', label: 'npm audit', script: 'audit' },
      { emoji: '🔧', label: 'npm audit fix', script: 'audit:fix' },
      { emoji: '🔎', label: 'Sprawdź aktualizacje (ncu)', script: 'deps:check' },
      { emoji: '⬆️', label: 'Aktualizuj zależności (ncu -u)', script: 'deps:update' },
      { emoji: '🚀', label: 'Aktualizuj majors', script: 'deps:update:major' },
      { emoji: '🧭', label: 'ncu interaktywnie', script: 'deps:interactive' },
    ],
  },
  {
    emoji: '🛠️',
    title: 'Inne',
    tasks: [
      { emoji: '📜', label: 'Skrypt tsx (npm run script -- ...)', script: 'script' },
      { emoji: '🚪', label: 'Wyjście', script: '__exit__' },
    ],
  },
];

function runScript(script: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // shell: true na Windows (npm to cmd), bez shell na Linux/macOS
    const child = spawn('npm', ['run', script], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });
    child.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`npm run ${script} — kod wyjścia ${code}`)),
    );
    child.on('error', reject);
  });
}

async function main(): Promise<void> {
  intro('🧰 qa-tools — menu zadań');

  for (;;) {
    const category = await select({
      message: 'Wybierz kategorię:',
      options: CATEGORIES.map((c) => ({ value: c, label: `${c.emoji} ${c.title}` })),
    });
    if (typeof category === 'symbol') {
      cancel('Anulowano.');
      break;
    }

    const task = await select({
      message: `${category.emoji} ${category.title} — wybierz zadanie:`,
      options: category.tasks.map((t) => ({ value: t, label: `${t.emoji} ${t.label}` })),
    });
    if (typeof task === 'symbol') {
      cancel('Anulowano.');
      break;
    }
    if (task.script === '__exit__') break;

    try {
      await runScript(task.script);
    } catch (err) {
      outro(`❌ ${String(err)}`);
      process.exitCode = 1;
      break;
    }
  }

  outro('👋 Pa!');
}

main();

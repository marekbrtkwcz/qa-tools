// Skrypt porządkujący artefakty projektu — kopiuj jako scripts/clean.ts
// Uruchomienie: npm run clean   (tsx, ESM, @clack/prompts)
// Wybierasz co usunąć (multiselect + emotki), potwierdzasz, skrypt kasuje foldery.
import { cancel, confirm, intro, outro, spinner, multiselect } from '@clack/prompts';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { join } from 'node:path';

interface Target {
  emoji: string;
  label: string;
  dir: string;
  heavy?: boolean; // wymaga osobnego potwierdzenia (np. node_modules)
}

// 🔧 EDYTUJ: lista artefaktów do wyczyszczenia (zgodna z shared/gitignore)
const TARGETS: Target[] = [
  { emoji: '📊', label: 'playwright-report/ (raport HTML)', dir: 'playwright-report' },
  { emoji: '🧪', label: 'test-results/ (wyniki Playwright)', dir: 'test-results' },
  { emoji: '🎬', label: 'blob-report/ (bloby Playwright)', dir: 'blob-report' },
  { emoji: '📈', label: 'coverage/ (pokrycie)', dir: 'coverage' },
  { emoji: '📦', label: 'dist/ i build/ (build output)', dir: 'dist' },
  { emoji: '⚡', label: 'k6-results/ (wyniki k6)', dir: 'k6-results' },
  { emoji: '📋', label: 'logs/ i *.log', dir: 'logs' },
  { emoji: '🗑️', label: '.tmp/ i .cache/ i .nyc_output/', dir: '.tmp' },
  { emoji: '🧨', label: 'node_modules/ (ciężkie — npm install od nowa)', dir: 'node_modules', heavy: true },
];

function sizeOf(dir: string): string {
  try {
    let bytes = 0;
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = join(d, e.name);
        if (e.isDirectory()) walk(p);
        else bytes += statSync(p).size;
      }
    };
    walk(dir);
    return bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.ceil(bytes / 1e3)} KB`;
  } catch {
    return '?';
  }
}

async function main(): Promise<void> {
  intro('🧹 qa-tools — porządki w projekcie');

  const present = TARGETS.filter((t) => existsSync(t.dir));
  if (present.length === 0) {
    outro('✨ Projekt już czysty — nie znaleziono artefaktów do usunięcia.');
    return;
  }

  const picked = await multiselect({
    message: 'Zaznacz co usunąć:',
    options: present.map((t) => ({
      value: t,
      label: `${t.emoji} ${t.label}  (${sizeOf(t.dir)})`,
      selected: !t.heavy,
    })),
    required: true,
  });
  if (typeof picked === 'symbol') {
    cancel('Anulowano — nic nie usunięto.');
    return;
  }

  const heavies = picked.filter((t) => t.heavy);
  if (heavies.length > 0) {
    const ok = await confirm({
      message: `🧨 Potwierdź usunięcie ciężkich katalogów: ${heavies.map((t) => t.dir).join(', ')}?`,
    });
    if (typeof ok === 'symbol' || !ok) {
      cancel('Anulowano — nic nie usunięto.');
      return;
    }
  }

  const s = spinner();
  let removed = 0;
  for (const t of picked) {
    s.start(`Usuwam ${t.emoji} ${t.dir} ...`);
    try {
      rmSync(t.dir, { recursive: true, force: true });
      removed++;
      s.stop(`✅ Usunięto ${t.emoji} ${t.dir}`);
    } catch (err) {
      s.stop(`❌ Nie udało się usunąć ${t.dir}: ${String(err)}`);
    }
  }

  outro(removed === picked.length ? `🎉 Wyczyszczono ${removed}/${picked.length} pozycji!` : `🧹 Usunięto ${removed}/${picked.length} pozycji (część się nie udała).`);
}

main();

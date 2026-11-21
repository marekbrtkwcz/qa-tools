import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

// E2E testy walidatora pluginu (scripts/validate-plugin.py).
// Każdy test buduje w katalogu tymczasowym kompletny lub uszkodzony plugin,
// uruchamia walidator jako proces i sprawdza exit code + kluczowe komunikaty.
// Konwencje: nazwa should <rezultat> when <warunek>, tylko expect(), tagi @smoke @regression.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO, 'scripts', 'validate-plugin.py');
const PLUGIN_SRC = path.join(REPO, '.vibe', 'plugins', 'qa-tools');

/** Kopiuje całe repo do katalogu tymczasowego i zwraca ścieżkę do katalogu głównego. */
function makeTempRepo(): string {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'qa-tools-e2e-'));
  // Kopiujemy wszystko poza .git i node_modules (walidator czyta tylko strukturę pluginu)
  for (const entry of fs.readdirSync(REPO, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'test-results' || entry.name === 'playwright-report') continue;
    fs.cpSync(path.join(REPO, entry.name), path.join(tmp, entry.name), { recursive: true });
  }
  return tmp;
}

/** Uruchamia walidator (z podanego katalogu) w tym katalogu, zwraca { code, stdout, stderr }. */
function runValidator(cwd: string): { code: number; stdout: string; stderr: string } {
  const validatorInTmp = path.join(cwd, 'scripts', 'validate-plugin.py');
  try {
    const stdout = execSync(`python "${validatorInTmp}"`, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { code: 0, stdout, stderr: '' };
  } catch (err: any) {
    return {
      code: err.status ?? 1,
      stdout: err.stdout?.toString() ?? '',
      stderr: err.stderr?.toString() ?? '',
    };
  }
}

test.describe('E2E walidatora pluginu', () => {
  test('@smoke @regression should exit 0 when plugin structure is valid', () => {
    const tmp = makeTempRepo();
    const result = runValidator(tmp);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain('WSZYSTKO OK');
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('@smoke @regression should exit 1 when plugin.json is missing', () => {
    const tmp = makeTempRepo();
    fs.rmSync(path.join(tmp, '.vibe', 'plugins', 'qa-tools', 'plugin.json'));
    const result = runValidator(tmp);
    expect(result.code).toBe(1);
    expect(result.stdout).toContain('plugin.json: brak pliku');
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('@smoke @regression should exit 1 when version mismatches between plugin.json and CHANGELOG', () => {
    const tmp = makeTempRepo();
    const pluginJsonPath = path.join(tmp, '.vibe', 'plugins', 'qa-tools', 'plugin.json');
    const data = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
    data.version = '9.9.9';
    fs.writeFileSync(pluginJsonPath, JSON.stringify(data, null, 2));
    const result = runValidator(tmp);
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/wersja.*niezgodna|version.*mismatch|1\.|9\.9\.9/);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('@smoke @regression should exit 1 when an agent TOML file is missing', () => {
    const tmp = makeTempRepo();
    const agentFile = path.join(tmp, '.vibe', 'plugins', 'qa-tools', 'ai.mistral.vibe', 'agents', 'ui-test-writer.toml');
    fs.rmSync(agentFile);
    const result = runValidator(tmp);
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/ui.*writer|brak|missing/i);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('@smoke @regression should exit 1 when a skill frontmatter is invalid', () => {
    const tmp = makeTempRepo();
    const skillPath = path.join(tmp, '.vibe', 'plugins', 'qa-tools', 'skills', 'unit-testing', 'SKILL.md');
    const content = fs.readFileSync(skillPath, 'utf-8');
    // Usuń linię z description z frontmatter (obsługa CRLF i LF)
    const broken = content.replace(/description:.*(\r?\n)/, '$1');
    fs.writeFileSync(skillPath, broken);
    const result = runValidator(tmp);
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/unit-testing|frontmatter|description/i);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('@regression should exit 1 when hooks.toml has an invalid regex match pattern', () => {
    const tmp = makeTempRepo();
    const hooksPath = path.join(tmp, '.vibe', 'plugins', 'qa-tools', 'ai.mistral.vibe', 'hooks.toml');
    let content = fs.readFileSync(hooksPath, 'utf-8');
    // Wstaw nieprawidłowy regex (over-escaped backslash)
    content = content.replace('re:file_system\\\\.', 're:file_system\\\\\\\\.');
    fs.writeFileSync(hooksPath, content);
    const result = runValidator(tmp);
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/hook|regex|match/i);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  test('@regression should exit 1 when README subagent count does not match actual files', () => {
    const tmp = makeTempRepo();
    const readmePath = path.join(tmp, 'README.md');
    let content = fs.readFileSync(readmePath, 'utf-8');
    content = content.replace('**60 subagents**', '**99 subagents**');
    fs.writeFileSync(readmePath, content);
    const result = runValidator(tmp);
    expect(result.code).toBe(1);
    expect(result.stdout).toMatch(/subagent|60|99|liczba/i);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

function runScaffold(args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync('node', ['scripts/new-project.ts', ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
    timeout: 30_000,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

describe('new-project.ts', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = mkdtempSync(join(tmpdir(), 'qa-tools-test-'));
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('odrzuca nieznany setup z exit 1', () => {
    const { status, stderr } = runScaffold(['--setup=nie-istnieje', `--dir=${tmpDir}/projekt`]);
    expect(status).toBe(1);
    expect(stderr).toContain('Nieznany setup');
  });

  it('--dry-run pokazuje plan bez tworzenia plików', () => {
    const target = join(tmpDir, 'projekt-dry');
    const { status, stdout } = runScaffold(['--setup=playwright-ui-only', `--dir=${target}`, '--dry-run']);
    expect(status).toBe(0);
    expect(stdout).toContain('DRY-RUN');
    expect(stdout).toContain('katalogi');
    expect(stdout).toContain('pliki');
    expect(existsSync(target)).toBe(false);
  });

  it('tworzy projekt playwright-ui-only z poprawną strukturą', () => {
    const target = join(tmpDir, 'projekt-ui');
    const { status, stdout } = runScaffold(['--setup=playwright-ui-only', `--dir=${target}`, '--name=test-ui']);
    expect(status).toBe(0);
    expect(stdout).toContain('Projekt utworzony');

    // Struktura katalogów
    expect(existsSync(join(target, 'src/ui/pages'))).toBe(true);
    expect(existsSync(join(target, 'tests/ui'))).toBe(true);
    expect(existsSync(join(target, 'docs/scenarios/ui'))).toBe(true);

    // Pliki konfiguracyjne
    expect(existsSync(join(target, 'package.json'))).toBe(true);
    expect(existsSync(join(target, 'tsconfig.json'))).toBe(true);
    expect(existsSync(join(target, 'biome.json'))).toBe(true);
    expect(existsSync(join(target, 'playwright.config.ts'))).toBe(true);
    expect(existsSync(join(target, '.env.example'))).toBe(true);
    expect(existsSync(join(target, '.gitignore'))).toBe(true);

    // package.json ma type: module i odpowiednie skrypty
    const pkg = JSON.parse(readFileSync(join(target, 'package.json'), 'utf-8'));
    expect(pkg.type).toBe('module');
    expect(pkg.name).toBe('test-ui');
    expect(pkg.scripts['test:ui']).toBeDefined();
    expect(pkg.scripts['test:api']).toBeUndefined(); // ui-only nie ma testów API

    // tsconfig nie ma aliasów @api/*
    const tsconfig = JSON.parse(readFileSync(join(target, 'tsconfig.json'), 'utf-8'));
    expect(tsconfig.compilerOptions.paths['@ui/pages/*']).toBeDefined();
    expect(tsconfig.compilerOptions.paths['@api/consts/*']).toBeUndefined();
  });

  it('tworzy projekt unit-testing-vitest z vitest.config.ts ale bez playwright.config.ts', () => {
    const target = join(tmpDir, 'projekt-unit');
    const { status } = runScaffold(['--setup=unit-testing-vitest', `--dir=${target}`, '--name=test-unit']);
    expect(status).toBe(0);

    expect(existsSync(join(target, 'vitest.config.ts'))).toBe(true);
    expect(existsSync(join(target, 'playwright.config.ts'))).toBe(false);
    expect(existsSync(join(target, 'tests/unit'))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(target, 'package.json'), 'utf-8'));
    expect(pkg.scripts['test:unit']).toBeDefined();
    expect(pkg.scripts['coverage']).toBeDefined();
    expect(pkg.scripts['test:ui']).toBeUndefined();
  });

  it('odrzuca niepusty katalog docelowy', () => {
    const target = join(tmpDir, 'zajety');
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, 'plik.txt'), 'zajęte');
    const { status, stderr } = runScaffold(['--setup=playwright-ui-only', `--dir=${target}`]);
    expect(status).toBe(1);
    expect(stderr).toContain('nie jest pusty');
  });

  it('security-and-data kopiuje szablony security', () => {
    const target = join(tmpDir, 'projekt-sec');
    const { status } = runScaffold(['--setup=security-and-data', `--dir=${target}`, '--name=test-sec']);
    expect(status).toBe(0);
    expect(existsSync(join(target, 'src/data/security-payloads.ts'))).toBe(true);
    expect(existsSync(join(target, 'src/fixtures/auth.fixture.ts'))).toBe(true);
    expect(existsSync(join(target, 'docs/scenarios/security/_plan-template.md'))).toBe(true);
  });
});

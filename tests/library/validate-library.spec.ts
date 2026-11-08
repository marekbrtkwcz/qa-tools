import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = fileURLToPath(new URL('../..', import.meta.url));

function runScript(script: string, args: string[] = []): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync('node', [script, ...args], {
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

describe('validate-library.ts', () => {
  it('zwraca exit 0 gdy biblioteka jest spójna', () => {
    const { status, stdout, stderr } = runScript('scripts/validate-library.ts');
    // Walidator może zakończyć się błędem tylko gdy biblioteka jest niespójna — w tym repo powinien przejść.
    expect(status).toBe(0);
    expect(stdout).toContain('Biblioteka spójna');
    expect(stderr).toBe('');
  });

  it('raportuje liczbę skilli, agentów, setupów i szablonów', () => {
    const { stdout } = runScript('scripts/validate-library.ts');
    expect(stdout).toMatch(/\d+ skilli/);
    expect(stdout).toMatch(/\d+ agentów/);
    expect(stdout).toMatch(/\d+ setupów/);
    expect(stdout).toMatch(/\d+ szablonów/);
  });
});

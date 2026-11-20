#!/usr/bin/env python3
"""Testy jednostkowe do scripts/validate-plugin.py (tylko stdlib: unittest + tempfile).

Uruchomienie:  python -m unittest discover -s tests -v   (z katalogu głównego repo)

Każdy test buduje w katalogu tymczasowym kompletny (minimalny) plugin
i podmienia modułowe ROOT/PLUGIN walidatora, po czym sprawdza exit code main().
"""

import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

spec = importlib.util.spec_from_file_location(
    "validate_plugin", REPO / "scripts" / "validate-plugin.py"
)
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

GOOD_INSTRUCTIONS = (
    "Piszesz testy UI. Konwencja nazewnictwa: should <rezultat> when <warunek>. "
    "Asercje tylko przez await expect(...); NIGDY waitForTimeout. "
    + "Instrukcja celowo wydłużona, aby przekroczyć wymagane 200 znaków. " * 3
)

GOOD_SPEC = """import { test, expect } from '@playwright/test';

test('should show dashboard when user logs in', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL('/dashboard');
});
"""

GOOD_PLAN = """# Plan
Nazwa scenariusza: logowanie
Warunki wstępne: użytkownik istnieje
Kroki: 1. otwórz /login
Punkty walidacji: URL = /dashboard
Dane testowe: test.user@example.com
Poza zakresem: reset hasła
"""

GOOD_HOOKS = """[[hooks]]
name = "qa-conventions"
type = "session_start"
command = "echo ok"
"""

GOOD_SKILL = """---
name: example-skill
description: Przykładowy skill testowy.
user-invocable: true
---

# Example
"""


def build_good_plugin(root: Path, version: str = "1.0.0") -> Path:
    """Buduje minimalny, poprawny plugin qa-tools i zwraca ścieżkę do katalogu pluginu."""
    plugin = root / ".vibe" / "plugins" / "qa-tools"
    agents = plugin / "ai.mistral.vibe" / "agents"
    agents.mkdir(parents=True)
    (plugin / "ai.mistral.vibe" / "knowledge" / "qa-glossary").mkdir(parents=True)
    (plugin / "skills" / "example-skill").mkdir(parents=True)

    (plugin / "plugin.json").write_text(json.dumps({
        "name": "qa-tools",
        "version": version,
        "extensions": {"ai.mistral.vibe": {"toolNamespace": "qaTools"}},
    }), encoding="utf-8")

    (agents / "ui-test-writer.toml").write_text(
        'schema_version = 1\n'
        'agent_type = "subagent"\n'
        'display_name = "UI Test Writer"\n'
        'description = "Pisze testy UI."\n'
        'safety = "safe"\n'
        f'instructions = """{GOOD_INSTRUCTIONS}"""\n'
        'enabled_tools = ["read_file", "write_file"]\n'
        'disabled_tools = []\n',
        encoding="utf-8",
    )
    (plugin / "ai.mistral.vibe" / "hooks.toml").write_text(GOOD_HOOKS, encoding="utf-8")
    (plugin / "ai.mistral.vibe" / "knowledge" / "qa-glossary" / "KNOWLEDGE.md").write_text(
        "# Słownik\n" + "definicja " * 20, encoding="utf-8"
    )
    (plugin / "skills" / "example-skill" / "SKILL.md").write_text(GOOD_SKILL, encoding="utf-8")

    examples = root / "examples"
    (examples / "docs" / "scenarios" / "ui").mkdir(parents=True)
    (examples / "tests" / "ui").mkdir(parents=True)
    (examples / "docs" / "scenarios" / "ui" / "login.md").write_text(GOOD_PLAN, encoding="utf-8")
    (examples / "tests" / "ui" / "login.spec.ts").write_text(GOOD_SPEC, encoding="utf-8")

    (root / "CHANGELOG.md").write_text(f"# Changelog\n\n## [{version}] - 2026-11-20\n", encoding="utf-8")
    (root / "README.md").write_text(
        "# QA Tools\n\n**1 subagentów**, **1 skillów**, 3 hooki.\n", encoding="utf-8"
    )
    return plugin


class ValidatorTestCase(unittest.TestCase):
    def setUp(self):
        self._tmp = tempfile.TemporaryDirectory()
        self.root = Path(self._tmp.name)
        self.plugin = build_good_plugin(self.root)
        self._orig_root = validator.ROOT
        self._orig_plugin = validator.PLUGIN
        validator.ROOT = self.root
        validator.PLUGIN = self.plugin
        validator.errors = []
        validator.oks = 0

    def tearDown(self):
        validator.ROOT = self._orig_root
        validator.PLUGIN = self._orig_plugin
        self._tmp.cleanup()

    def run_validator(self) -> int:
        validator.errors = []
        validator.oks = 0
        buf = io.StringIO()
        with redirect_stdout(buf):
            code = validator.main()
        self.output = buf.getvalue()
        return code

    def test_good_plugin_exit_0(self):
        code = self.run_validator()
        self.assertEqual(code, 0, self.output)
        self.assertEqual(validator.errors, [])

    def test_camelcase_keys_exit_1(self):
        agent = self.plugin / "ai.mistral.vibe" / "agents" / "ui-test-writer.toml"
        agent.write_text(
            'schemaVersion = 1\nagentType = "subagent"\ndisplayName = "X"\n'
            'description = "d"\nsafety = "safe"\ninstructions = "x"\n'
            'enabledTools = ["read_file"]\n',
            encoding="utf-8",
        )
        code = self.run_validator()
        self.assertEqual(code, 1)
        self.assertTrue(any("schema_version" in e for e in validator.errors))

    def test_version_mismatch_exit_1(self):
        (self.root / "CHANGELOG.md").write_text(
            "# Changelog\n\n## [9.9.9] - 2026-11-20\n", encoding="utf-8"
        )
        code = self.run_validator()
        self.assertEqual(code, 1)
        self.assertTrue(any("CHANGELOG" in e and "9.9.9" in e for e in validator.errors))

    def test_readme_counts_mismatch_exit_1(self):
        (self.root / "README.md").write_text(
            "# QA Tools\n\n**99 subagentów**, **1 skillów**.\n", encoding="utf-8"
        )
        code = self.run_validator()
        self.assertEqual(code, 1)
        self.assertTrue(any("README" in e and "subagent" in e for e in validator.errors))

    def test_writer_without_waitForTimeout_ban_fails(self):
        """Regresja: stage musi być wyprowadzane jako 'writer', nie 'test-writer'."""
        agent = self.plugin / "ai.mistral.vibe" / "agents" / "ui-test-writer.toml"
        instr = GOOD_INSTRUCTIONS.replace("NIGDY waitForTimeout. ", "")
        agent.write_text(
            'schema_version = 1\nagent_type = "subagent"\ndisplay_name = "X"\n'
            'description = "d"\nsafety = "safe"\n'
            f'instructions = """{instr}"""\n'
            'enabled_tools = ["read_file"]\ndisabled_tools = []\n',
            encoding="utf-8",
        )
        code = self.run_validator()
        self.assertEqual(code, 1)
        self.assertTrue(any("waitForTimeout" in e for e in validator.errors))

    def test_planner_without_scenarios_path_fails(self):
        agent = self.plugin / "ai.mistral.vibe" / "agents" / "ui-test-planner.toml"
        agent.write_text(
            'schema_version = 1\nagent_type = "subagent"\ndisplay_name = "X"\n'
            'description = "d"\nsafety = "safe"\n'
            f'instructions = """{GOOD_INSTRUCTIONS}"""\n'
            'enabled_tools = ["read_file"]\ndisabled_tools = []\n',
            encoding="utf-8",
        )
        code = self.run_validator()
        self.assertEqual(code, 1)
        self.assertTrue(any("docs/scenarios/" in e for e in validator.errors))

    def test_spec_with_waitForTimeout_fails(self):
        spec_file = self.root / "examples" / "tests" / "ui" / "login.spec.ts"
        spec_file.write_text(GOOD_SPEC.replace(
            "await page.getByRole", "await page.waitForTimeout(500);\n  await page.getByRole"
        ), encoding="utf-8")
        code = self.run_validator()
        self.assertEqual(code, 1)
        self.assertTrue(any("waitForTimeout" in e for e in validator.errors))


if __name__ == "__main__":
    unittest.main()

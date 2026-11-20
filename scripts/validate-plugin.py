#!/usr/bin/env python3
"""Walidator pluginu qa-tools — sprawdza strukturę i spójność wszystkich komponentów.

Wymaga Pythona 3.11+ (tomllib w stdlib).
Użycie:  py scripts/validate-plugin.py        (z katalogu głównego repo)
Exit code 0 = wszystko OK, 1 = znaleziono błędy.
"""
import json
import re
import sys
import tomllib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PLUGIN = ROOT / ".vibe" / "plugins" / "qa-tools"
BS = chr(92)

PLAYWRIGHT_AREAS = {"ui", "api", "e2e", "mobile", "visual", "db", "contract"}  # db i contract też używają konwencji nazewnictwa (bez waitForTimeout — to nie UI)
CODE_STAGES = {"writer", "refactor", "code-reviewer"}
HOOK_TYPES = {"session_start", "session_end", "pre_tool", "post_tool",
              "pre_agent", "post_agent", "user_prompt", "stop"}
NAMING = "should <rezultat> when <warunek>"
NAMING_VISUAL = "should match"  # visual używa wyspecjalizowanej konwencji nazw screenshotów

errors = []
oks = 0


def ok(msg):
    global oks
    oks += 1
    print(f"  OK  {msg}")


def err(msg):
    errors.append(msg)
    print(f"  ERR {msg}")


def check_plugin_json():
    print("plugin.json")
    p = PLUGIN / "plugin.json"
    if not p.exists():
        err("plugin.json: brak pliku")
        return
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        err(f"plugin.json: błąd JSON: {e}")
        return
    for key in ("name", "version", "extensions"):
        if key not in data:
            err(f"plugin.json: brak klucza '{key}'")
    ext = data.get("extensions", {}).get("ai.mistral.vibe")
    if not ext or "toolNamespace" not in ext:
        err("plugin.json: brak extensions.ai.mistral.vibe.toolNamespace")
    else:
        ok(f"name={data.get('name')} v{data.get('version')} namespace={ext['toolNamespace']}")


def check_agents():
    print("agents (subagenty)")
    files = sorted((PLUGIN / "ai.mistral.vibe" / "agents").glob("*.toml"))
    if not files:
        err("agents: brak plików .toml")
        return
    required = ["schema_version", "agent_type", "display_name", "description",
                "safety", "instructions", "enabled_tools"]
    per_area = {}
    for f in files:
        try:
            d = tomllib.loads(f.read_text(encoding="utf-8"))
        except Exception as e:
            err(f"{f.name}: błąd TOML: {e}")
            continue
        name = f.stem
        area = name.split("-")[0]
        stage = name[len(area) + len("-test-"):]  # ui-test-writer -> writer
        per_area.setdefault(area, []).append(stage)
        missing = [k for k in required if k not in d]
        if missing:
            err(f"{name}: brak kluczy {missing}")
            continue
        instr = d["instructions"]
        if d["schema_version"] != 1:
            err(f"{name}: schema_version != 1")
        if d["agent_type"] != "subagent":
            err(f"{name}: agent_type != subagent")
        if BS in instr:
            err(f"{name}: backslash w instructions (ryzyko escape TOML)")
        if len(instr) < 200:
            err(f"{name}: instructions za krótkie (<200 znaków)")
        if not d["enabled_tools"]:
            err(f"{name}: puste enabled_tools")
        naming = NAMING_VISUAL if area == "visual" else NAMING
        if area in PLAYWRIGHT_AREAS and naming not in instr:
            err(f"{name}: brak konwencji nazewnictwa '{naming}'")
        if area in PLAYWRIGHT_AREAS - {"api", "contract", "db"} and stage in CODE_STAGES and "waitForTimeout" not in instr:
            err(f"{name}: brak zakazu waitForTimeout")
        if area == "load":
            if "__ENV" not in instr:
                err(f"{name}: brak reguły __ENV")
            if "thresholds" not in instr:
                err(f"{name}: brak reguły thresholds")
        if stage == "planner" and "docs/scenarios/" not in instr:
            err(f"{name}: planner bez ścieżki docs/scenarios/")
    ok(f"{len(files)} agentów w obszarach: " +
       ", ".join(f"{a} ({len(s)}): {'/'.join(sorted(set(s)))}" for a, s in sorted(per_area.items())))


def check_skills():
    print("skills")
    base = PLUGIN / "skills"
    dirs = sorted(d for d in base.iterdir() if d.is_dir())
    if not dirs:
        err("skills: brak katalogów")
        return
    for d in dirs:
        f = d / "SKILL.md"
        if not f.exists():
            err(f"skills/{d.name}: brak SKILL.md")
            continue
        text = f.read_text(encoding="utf-8")
        m = re.match(r"^---\n(.*?)\n---\n", text, re.S)
        if not m:
            err(f"skills/{d.name}: brak frontmatter ---...---")
            continue
        fm = m.group(1)
        for key in ("name:", "description:"):
            if key not in fm:
                err(f"skills/{d.name}: brak '{key}' w frontmatter")
        if "user-invocable: true" not in fm:
            err(f"skills/{d.name}: user-invocable != true")
    ok(f"{len(dirs)} skillów z poprawnym frontmatter")


def check_hooks():
    print("hooks.toml")
    f = PLUGIN / "ai.mistral.vibe" / "hooks.toml"
    if not f.exists():
        err("hooks.toml: brak pliku")
        return
    try:
        d = tomllib.loads(f.read_text(encoding="utf-8"))
    except Exception as e:
        err(f"hooks.toml: błąd TOML: {e}")
        return
    hooks = d.get("hooks", [])
    if not hooks:
        err("hooks.toml: pusta lista [[hooks]]")
        return
    for h in hooks:
        name = h.get("name", "?")
        for key in ("type", "command"):
            if key not in h:
                err(f"hook '{name}': brak '{key}'")
        if h.get("type") not in HOOK_TYPES:
            err(f"hook '{name}': nieznany typ '{h.get('type')}'")
    ok(f"{len(hooks)} hooków: " + ", ".join(f"{h.get('name')}({h.get('type')})" for h in hooks))


def check_knowledge():
    print("knowledge")
    base = PLUGIN / "ai.mistral.vibe" / "knowledge"
    dirs = sorted(d for d in base.iterdir() if d.is_dir())
    if not dirs:
        err("knowledge: brak katalogów")
        return
    for d in dirs:
        f = d / "KNOWLEDGE.md"
        if not f.exists() or f.stat().st_size < 100:
            err(f"knowledge/{d.name}: brak lub pusty KNOWLEDGE.md")
    ok(f"{len(dirs)} wpisów wiedzy")


def check_version_consistency():
    print("spójność wersji i liczb (plugin.json / CHANGELOG / README)")
    pj = json.loads((PLUGIN / "plugin.json").read_text(encoding="utf-8"))
    version = pj.get("version", "")

    changelog = ROOT / "CHANGELOG.md"
    if not changelog.exists():
        err("CHANGELOG.md: brak pliku")
    else:
        m = re.search(r"^## \[(\d+\.\d+\.\d+)\]", changelog.read_text(encoding="utf-8"), re.M)
        if not m:
            err("CHANGELOG.md: brak wpisu '## [x.y.z]'")
        elif m.group(1) != version:
            err(f"CHANGELOG.md: najnowszy wpis [{m.group(1)}] != version w plugin.json [{version}]")
        else:
            ok(f"wersja {version} zgodna w plugin.json i CHANGELOG.md")

    n_agents = len(list((PLUGIN / "ai.mistral.vibe" / "agents").glob("*.toml")))
    n_skills = len([d for d in (PLUGIN / "skills").iterdir() if d.is_dir()])
    readme = ROOT / "README.md"
    if not readme.exists():
        err("README.md: brak pliku")
    else:
        text = readme.read_text(encoding="utf-8")
        ma = re.search(r"\*\*(\d+) subagent", text)
        ms = re.search(r"\*\*(\d+) skill", text)
        if not ma or int(ma.group(1)) != n_agents:
            err(f"README.md: liczba subagentów ({ma.group(1) if ma else 'brak'}) != faktyczna ({n_agents})")
        else:
            ok(f"README.md: liczba subagentów zgodna ({n_agents})")
        if not ms or int(ms.group(1)) != n_skills:
            err(f"README.md: liczba skillów ({ms.group(1) if ms else 'brak'}) != faktyczna ({n_skills})")
        else:
            ok(f"README.md: liczba skillów zgodna ({n_skills})")


def check_examples():
    print("examples (przykłady referencyjne)")
    plan = ROOT / "examples" / "docs" / "scenarios" / "ui" / "login.md"
    test = ROOT / "examples" / "tests" / "ui" / "login.spec.ts"
    api_plan = ROOT / "examples" / "docs" / "scenarios" / "api" / "users.md"
    api_test = ROOT / "examples" / "tests" / "api" / "users.spec.ts"
    if not plan.exists():
        err("examples: brak docs/scenarios/ui/login.md")
    else:
        text = plan.read_text(encoding="utf-8")
        for section in ("Nazwa scenariusza", "Warunki wstępne", "Kroki",
                        "Punkty walidacji", "Dane testowe", "Poza zakresem"):
            if section not in text:
                err(f"examples/login.md: brak sekcji '{section}'")
    if not test.exists():
        err("examples: brak tests/ui/login.spec.ts")
    else:
        raw = test.read_text(encoding="utf-8")
        code = re.sub(r"//[^\n]*", "", raw)  # bez komentarzy — konwencja może być w nich opisana
        if not re.search(r"test\('should .+ when .+'", code):
            err("examples/login.spec.ts: nazwa testu niezgodna z konwencją should...when...")
        if "waitForTimeout" in code:
            err("examples/login.spec.ts: użyty waitForTimeout")
        if "await expect(" not in code:
            err("examples/login.spec.ts: brak await expect(...)")
        if not re.search(r"getBy(Role|Label|Text|TestId)", code):
            err("examples/login.spec.ts: brak selektorów getBy*")
    if not api_plan.exists():
        err("examples: brak docs/scenarios/api/users.md")
    else:
        text = api_plan.read_text(encoding="utf-8")
        for section in ("Nazwa scenariusza", "Warunki wstępne", "Kroki",
                        "Punkty walidacji", "Dane testowe", "Poza zakresem"):
            if section not in text:
                err(f"examples/api/users.md: brak sekcji '{section}'")
    if not api_test.exists():
        err("examples: brak tests/api/users.spec.ts")
    else:
        raw = api_test.read_text(encoding="utf-8")
        code = re.sub(r"//[^\n]*", "", raw)
        if not re.search(r"test\('should .+ when .+'", code):
            err("examples/api/users.spec.ts: nazwa testu niezgodna z konwencją should...when...")
        if "waitForTimeout" in code:
            err("examples/api/users.spec.ts: użyty waitForTimeout")
        if "expect(res.status()).toBe(" not in code:
            err("examples/api/users.spec.ts: brak asercji expect(res.status()).toBe(...)")
        if "{ request }" not in code:
            err("examples/api/users.spec.ts: brak fixture'a request")
        if re.search(r"https?://", raw):  # na raw — strip komentarzy zjada '//' w URL-u
            err("examples/api/users.spec.ts: hardkodowany URL — baseURL tylko z env/config")
    if not errors or all("examples" not in e for e in errors):
        ok("plany scenariuszy i testy UI/API zgodne z konwencjami")


def main():
    print(f"Walidacja pluginu qa-tools ({PLUGIN.relative_to(ROOT)})")
    print(f"Python: {sys.version.split()[0]} (wymagany 3.11+)" + chr(10))
    if sys.version_info < (3, 11):
        print("ERR za stary Python — tomllib wymaga 3.11+")
        return 1
    check_plugin_json()
    check_agents()
    check_skills()
    check_hooks()
    check_knowledge()
    check_version_consistency()
    check_examples()
    print(chr(10) + f"Sprawdzeń OK: {oks} | Błędów: {len(errors)}")
    if errors:
        print("BŁĘDY:")
        for e in errors:
            print(" -", e)
        return 1
    print("WSZYSTKO OK — plugin qa-tools jest strukturalnie poprawny.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

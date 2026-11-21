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

PLAYWRIGHT_AREAS = {"ui", "api", "e2e", "mobile", "visual", "db", "contract", "a11y", "security", "chaos", "i18n", "versioning", "graphql", "webhook", "email", "observability", "testcontainers"}  # db/contract/versioning/graphql/webhook/email/observability/testcontainers też używają konwencji nazewnictwa (bez waitForTimeout — to nie UI)
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
    print(f"  ✅ OK  {msg}")


def err(msg):
    errors.append(msg)
    print(f"  ❌ ERR {msg}")


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
        if area in PLAYWRIGHT_AREAS - {"api", "contract", "db", "versioning", "graphql", "webhook", "email", "observability", "testcontainers"} and stage in CODE_STAGES and "waitForTimeout" not in instr:
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
        match = h.get("match", "")
        if match.startswith("re:"):
            pattern = match[3:]
            try:
                re.compile(pattern)
            except re.error as e:
                err(f"hook '{name}': nieprawidłowy regex w match: {e}")
            if BS + BS + "." in pattern:
                err(f"hook '{name}': match wygląda na over-escaped ('{BS}{BS}.' = literalny backslash + dowolny znak, nie kropka) — wzorce typu 'file_system.bash' nigdy nie zawierają backslasha")
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


MCP_VALID_CAPS = {"vision", "pdf", "devtools"}  # per `npx @playwright/mcp@latest --help`


def check_mcp():
    print("mcp.json")
    p = PLUGIN / "mcp.json"
    if not p.exists():
        err("mcp.json: brak pliku")
        return
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        err(f"mcp.json: błąd JSON (np. przecinek przed ] lub \\r\\n): {e}")
        return
    servers = data.get("mcpServers", {})
    if not servers:
        err("mcp.json: puste mcpServers")
        return
    for name, srv in servers.items():
        if "command" not in srv:
            err(f"mcp.json: serwer '{name}' bez klucza 'command'")
        args = srv.get("args", [])
        for i, a in enumerate(args):
            if a == "--caps":
                caps = set()
                if i + 1 < len(args):
                    caps = {c.strip() for c in args[i + 1].split(",") if c.strip()}
                invalid = caps - MCP_VALID_CAPS
                if invalid:
                    err(f"mcp.json: serwer '{name}' ma nieistniejące --caps {sorted(invalid)} (dozwolone: {sorted(MCP_VALID_CAPS)})")
    if not errors or all("mcp.json" not in e for e in errors):
        ok(f"{len(servers)} serwer(ów) MCP, --caps zgodne z dozwolonymi {sorted(MCP_VALID_CAPS)}")


def check_version_consistency():
    print("spójność wersji i liczb (plugin.json / package.json / CHANGELOG / README)")
    pj = json.loads((PLUGIN / "plugin.json").read_text(encoding="utf-8"))
    version = pj.get("version", "")

    pkg = ROOT / "package.json"
    if pkg.exists():
        try:
            pkg_version = json.loads(pkg.read_text(encoding="utf-8")).get("version", "")
            if pkg_version != version:
                err(f"package.json: version [{pkg_version}] != version w plugin.json [{version}]")
            else:
                ok(f"wersja {version} zgodna w plugin.json i package.json")
        except Exception as e:
            err(f"package.json: błąd JSON: {e}")

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
    # --- przykład a11y ---
    a11y_plan = ROOT / "examples" / "docs" / "scenarios" / "a11y" / "login.md"
    a11y_test = ROOT / "examples" / "tests" / "a11y" / "login.spec.ts"
    if not a11y_plan.exists():
        err("examples: brak docs/scenarios/a11y/login.md")
    else:
        text = a11y_plan.read_text(encoding="utf-8")
        for section in ("Nazwa scenariusza", "Warunki wstępne", "Kroki",
                        "Punkty walidacji", "Dane testowe", "Poza zakresem"):
            if section not in text:
                err(f"examples/a11y/login.md: brak sekcji '{section}'")
    if not a11y_test.exists():
        err("examples: brak tests/a11y/login.spec.ts")
    else:
        raw = a11y_test.read_text(encoding="utf-8")
        code = re.sub(r"//[^\n]*", "", raw)
        if not re.search(r"test\('should .+ when .+'", code):
            err("examples/a11y/login.spec.ts: nazwa testu niezgodna z konwencją should...when...")
        if "waitForTimeout" in code:
            err("examples/a11y/login.spec.ts: użyty waitForTimeout")
        if "AxeBuilder" not in code:
            err("examples/a11y/login.spec.ts: brak użycia AxeBuilder (axe-core)")
        if not re.search(r"getBy(Role|Label|Text|TestId)", code):
            err("examples/a11y/login.spec.ts: brak selektorów getBy*")

    # --- przykład security ---
    sec_plan = ROOT / "examples" / "docs" / "scenarios" / "security" / "comment-xss.md"
    sec_test = ROOT / "examples" / "tests" / "security" / "comment-xss.spec.ts"
    if not sec_plan.exists():
        err("examples: brak docs/scenarios/security/comment-xss.md")
    else:
        text = sec_plan.read_text(encoding="utf-8")
        for section in ("Nazwa scenariusza", "Warunki wstępne", "Kroki",
                        "Punkty walidacji", "Dane testowe", "Poza zakresem"):
            if section not in text:
                err(f"examples/security/comment-xss.md: brak sekcji '{section}'")
    if not sec_test.exists():
        err("examples: brak tests/security/comment-xss.spec.ts")
    else:
        raw = sec_test.read_text(encoding="utf-8")
        code = re.sub(r"//[^\n]*", "", raw)
        if not re.search(r"test\('should .+ when .+'", code):
            err("examples/security/comment-xss.spec.ts: nazwa testu niezgodna z konwencją should...when...")
        if "waitForTimeout" in code:
            err("examples/security/comment-xss.spec.ts: użyty waitForTimeout")
        if not re.search(r"expect\(", code):
            err("examples/security/comment-xss.spec.ts: brak asercji expect(...)")
        if re.search(r"https?://", raw):
            err("examples/security/comment-xss.spec.ts: hardkodowany URL")

    # --- przykłady chaos i mobile ---
    for area, spec_name, must_have in (
        ("chaos", "orders-500.spec.ts", "page.route"),
        ("mobile", "checkout.spec.ts", "getBy"),
        ("i18n", "locale.spec.ts", "getBy"),
        ("versioning", "users.spec.ts", "Accept-Version"),
    ):
        plan_f = ROOT / "examples" / "docs" / "scenarios" / area
        spec_f = ROOT / "examples" / "tests" / area / spec_name
        plan_file = next(plan_f.glob("*.md"), None) if plan_f.exists() else None
        if not plan_file:
            err(f"examples: brak planu docs/scenarios/{area}/*.md")
        else:
            text = plan_file.read_text(encoding="utf-8")
            for section in ("Nazwa scenariusza", "Warunki wstępne", "Kroki",
                            "Punkty walidacji", "Dane testowe", "Poza zakresem"):
                if section not in text:
                    err(f"examples/{area}: brak sekcji '{section}'")
        if not spec_f.exists():
            err(f"examples: brak tests/{area}/{spec_name}")
        else:
            raw = spec_f.read_text(encoding="utf-8")
            code = re.sub(r"//[^\n]*", "", raw)
            if not re.search(r"test\('should .+ when .+'", code):
                err(f"examples/{area}/{spec_name}: nazwa testu niezgodna z konwencją should...when...")
            if "waitForTimeout" in code:
                err(f"examples/{area}/{spec_name}: użyty waitForTimeout")
            if must_have not in code:
                err(f"examples/{area}/{spec_name}: brak '{must_have}'")

    # --- szablon CI (e2e.yml) ---
    ci = ROOT / "examples" / "ci" / "e2e.yml"
    if not ci.exists():
        err("examples: brak ci/e2e.yml")
    else:
        text = ci.read_text(encoding="utf-8")
        if "npx playwright test" not in text:
            err("examples/ci/e2e.yml: brak kroku 'npx playwright test'")
        if "upload-artifact" not in text or "if: always()" not in text:
            err("examples/ci/e2e.yml: brak upload-artifact z if: always() (raport także przy failu)")

    # --- szablon playwright.config.ts ---
    cfg = ROOT / "examples" / "playwright.config.ts"
    if not cfg.exists():
        err("examples: brak playwright.config.ts")
    else:
        text = cfg.read_text(encoding="utf-8")
        if "baseURL: process.env.BASE_URL" not in text:
            err("examples/playwright.config.ts: baseURL musi być z env (process.env.BASE_URL)")
        if "projects" not in text or "devices[" not in text:
            err("examples/playwright.config.ts: brak projektów per przeglądarka/device")

    if not errors or all("examples" not in e for e in errors):
        ok("plany scenariuszy i testy UI/API/a11y/security + config zgodne z konwencjami")


def main():
    print(f"Walidacja pluginu qa-tools ({PLUGIN.relative_to(ROOT)})")
    print(f"Python: {sys.version.split()[0]} (wymagany 3.11+)" + chr(10))
    if sys.version_info < (3, 11):
        print("ERR za stary Python — tomllib wymaga 3.11+")
        return 1
    check_plugin_json()
    check_mcp()
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

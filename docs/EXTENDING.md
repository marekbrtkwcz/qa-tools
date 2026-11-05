# 🧩 Extending — jak rozbudować zestaw

## 🧪 1. Nowa domena testów (np. data, mobile, accessibility)

1. `mkdir agents/<domena>` i skopiuj szkielet 4 ról z `agents/security/` (planner/writer/refactor/code-review).
2. Zachowaj strukturę każdego agenta: frontmatter (name/description z keywords PL+EN/tools) → Hard Rules → Mandatory Workflow → Output Format → obowiązkowy Work Summary.
3. Dodaj skill: `.vibe/skills/qa-<domena>/SKILL.md` (format wg `vibe:skill-creator`: frontmatter `name` + `description`, treść = pipeline + setup + reguły).
4. Dodaj setup: `setups/<typ>.instructions.md`.
5. Zaktualizuj tabelę w `docs/ARCHITECTURE.md` i `README.md`.

## 🗂️ 2. Nowa rola w istniejącej domenie

Skopiuj dowolnego agenta z tej domeny, zmień frontmatter i zakres. Trzymaj zasadę: jedna rola = jedna odpowiedzialność.

## 🎨 3. Nowy typ projektu (setup)

Skopiuj najbliższy `setups/*.instructions.md`, przytnij warstwy (`paths` w tsconfig, katalogi), zostaw: Biome z `shared/`, dotenv, `.env.example`, skrypty npm, najnowsze wersje bibliotek.

## 📐 4. Zmiana konwencji globalnej

Edytuj `shared/conventions.md` + `shared/biome.json` / `shared/tsconfig.base.json` — projekty kopiują te pliki, więc zmiana propaguje się przy kolejnym setupie.

## 🖌️ 5. Skill globalny (poza projektem)

Skopiuj `.vibe/skills/qa-*` do `~/.vibe/skills/` — skill będzie dostępny we wszystkich projektach (wg `vibe:skill-creator`).

## 🌱 Zasady przy rozbudowie

- Nie nadpisuj nazw wbudowanych skilli (są zarezerwowane).
- Opisy (frontmatter `description`) zawierają słowa kluczowe PL i EN — to one jedyny tekst widoczny przed załadowaniem skilla.
- Agenci refaktoryzują TYLKO pliki podane przez użytkownika (SCOPE RULE).

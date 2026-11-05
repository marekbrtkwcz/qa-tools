# 🧩 Extending — jak rozbudować zestaw

## 🧪 1. Nowa domena testów (np. data, mobile, accessibility)

1. `mkdir agents/<domena>` i skopiuj szkielet 4 ról z `agents/security/` (planner/writer/refactor/code-review).
2. Zachowaj strukturę każdego agenta: frontmatter (name/description z keywords PL+EN/tools) → Hard Rules → Mandatory Workflow → Output Format → obowiązkowy Work Summary. **NIE dodawaj pola `model:`** — agent dziedziczy aktywny model sesji Vibe (bez pinu działa zawsze, niezależnie jaki model jest aktualnie dostępny; pin `model:`/`active_model` stosuj tylko gdy świadomie chcesz wymusić konkretny model).
3. Dodaj skill: `.vibe/skills/qa-<domena>/SKILL.md` (format wg `vibe:skill-creator`: frontmatter `name` + `description`, treść = pipeline + setup + reguły).
4. Dodaj setup: `setups/<typ>.instructions.md`.
5. Zaktualizuj tabelę w `docs/ARCHITECTURE.md` i `README.md`.

## 🗂️ 2. Nowa rola w istniejącej domenie

Skopiuj dowolnego agenta z tej domeny, zmień frontmatter i zakres. Trzymaj zasadę: jedna rola = jedna odpowiedzialność.

## 🎨 3. Nowy typ projektu (setup)

Scaffold czyta setupy z mapy `SETUPS` w `scripts/new-project.ts` — przy dodawaniu nowego pliku `setups/<typ>.instructions.md` dodaj tam wpis (aliases, srcDirs, tests, scenariusze, flagi playwright/vitest), żeby `new-project.ts` umiał go wygenerować. Szkielet setupu skopiuj z najbliższego `setups/*.instructions.md`, przytnij warstwy (`paths` w tsconfig, katalogi), zostaw: Biome z `shared/`, dotenv, `.env.example`, skrypty npm, najnowsze wersje bibliotek.

## 📐 4. Zmiana konwencji globalnej

Edytuj `shared/conventions.md` oraz szablony w `shared/` — kanoniczne pliki: `biome.json`, `tsconfig.base.json`, `playwright.config.ts`, `vitest.config.ts`, `env.ts`, `ci/github-actions.yml`. Projekty kopiują te pliki, więc zmiana propaguje się przy kolejnym setupie.

## 🖌️ 5. Skill globalny (poza projektem)

Skopiuj `.vibe/skills/qa-*` do `~/.vibe/skills/` — skill będzie dostępny we wszystkich projektach (wg `vibe:skill-creator`).

## 🌱 Zasady przy rozbudowie

- **Przed commitem zmian w bibliotece uruchom walidator**: `node scripts/validate-library.ts` (Node ≥ 23.6) lub `npx tsx scripts/validate-library.ts` — sprawdza frontmatter skilli, zakaz pola `model:` w agentach, komplet 4 ról per domena, sync tabel README/ARCHITECTURE z katalogami oraz komplet szablonów `shared/`. Exit 1 = popraw błędy przed commitem.
- Nie nadpisuj nazw wbudowanych skilli (są zarezerwowane).
- Opisy (frontmatter `description`) zawierają słowa kluczowe PL i EN — to one jedyny tekst widoczny przed załadowaniem skilla.
- Agenci refaktoryzują TYLKO pliki podane przez użytkownika (SCOPE RULE).

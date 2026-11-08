# 🧪 demo-project

Projekt testowy wygenerowany z qa-tools (setup: **playwright-fullstack** na bazie pit).

## ⚡ Szybki start

```bash
npm install -D typescript @types/node @biomejs/biome tsx dotenv dotenv-cli npm-check-updates @faker-js/faker @clack/prompts @playwright/test vitest @vitest/coverage-v8 && npm install zod
cp .env.example .env   # uzupełnij BASE_URL / API_URL
npm run menu           # menu zadań (zadania z package.json)
```

Pełny setup krok po kroku: `setups/playwright-fullstack.instructions.md` w repo qa-tools.
Konwencje: `docs/adr` (szablon `shared/adr-template.md`), scenariusze w `docs/scenarios/ui/api/e2e`.

---
description: "Set up a k6 performance testing workspace (no heavy npm project needed): install k6 binary, workspace structure, thresholds conventions. Trigger: k6 setup, testy wydajnościowe setup, load test project."
---

# 🧪 k6 Performance Testing Setup

k6 is a single binary — the "setup" is a lightweight workspace, not an npm project.

## 🌟 Steps

1. Install k6 (latest):
   - Windows: `winget install k6` or `choco install k6`
   - Linux/macOS: `brew install k6` or see https://k6.io/docs/get-started/installation/
   - Verify: `k6 version`
2. Workspace structure:
   ```
   tests/performance/*.test.js   ← k6 scripts
   docs/scenarios/performance/  ← plans from performance-test-planner
   scripts/                      ← helpery TS uruchamiane przez tsx (npm run script -- scripts/x.ts)
   data/                         ← CSV/JSON test data (k6 reads via open())
   ```
3. Optional JS/TS helpers: if you add an npm project for helpers, use `shared/biome.json` for lint/format and **npm-check-updates** (`npm i -D npm-check-updates`, `shared/ncurc.json` → `.ncurc.json`, skrypty `deps:check` / `deps:update`) — ncu działa tylko tam, gdzie jest `package.json`. Samą binarkę k6 aktualizuj przez menedżera pakietów: `winget upgrade k6` (Windows) / `brew upgrade k6` (Linux/macOS), weryfikacja: `k6 version`
4. Run: `k6 run tests/performance/smoke.test.js`; smoke first, then the full profile
5. Zmienne środowiskowe przez **dotenv**: `npm i -D dotenv-cli`, plik `.env` lokalnie (gitignored) + `.env.example` w repo; uruchomienie k6 przez wrapper, np. skrypt npm `"perf:smoke": "dotenv -e .env -- k6 run tests/performance/smoke.test.js"`. W skrypcie wartości czytasz przez `__ENV.X` — nigdy nie hardcoduj URL ani sekretów.
6. Optional Grafana Cloud k6: use the built-in `k6-manage` / `k6-cloud-investigate-test` / `k6-trend-analysis` skills

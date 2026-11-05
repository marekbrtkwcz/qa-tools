# 🌐 Cross-Platform — Windows + Linux

Zestaw działa na obu systemach. Zasady:

## 🌟 Ścieżki
- W skryptach npm używaj ścieżek względnych (`scripts/sql/001.sql`), nigdy `C:\...` ani `/home/...`.
- Do dzielenia ścieżek w kodzie TS używaj `path.join()` z `node:path`.

## 🌍 Env vars
- Windows cmd: `%DATABASE_URL%`; PowerShell: `$env:DATABASE_URL`; Linux/macOS: `$DATABASE_URL`.
- Uniwersalnie: `dotenv-cli` (`npm i -D dotenv-cli`), wtedy skrypt `dotenv -e .env -- psql "$DATABASE_URL" -f ...` działa tak samo na Windows i Linux.

## 🧭 Line endings
- Biome wymusza LF (`lineEnding: "lf"`); w git ustaw `core.autocrlf=false` w projektach testowych lub polegaj na Biome.

## 🧰 Instalacja narzędzi
- Playwright: `npx playwright install` (Windows), `npx playwright install --with-deps` (Linux).
- k6: Windows `winget install k6` / `choco install k6`; Linux `brew install k6` (więcej: k6.io/docs/get-started/installation).

## 📚 Ścieżki w dokumentacji
- W przykładach używamy formatu Unix (`/c/projects/...` w Git Bash na Windows); w PowerShell/cmd odpowiada im `C:\projects\...`.

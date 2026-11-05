---
name: qa-data-sql
description: Load when the user works with SQL scripts, data conversion, data validation, or database seed/fixture scripts (any RDBMS: PostgreSQL, MySQL, SQL Server, SQLite). Uses shared conventions and data factories; extensible with agents/data later.
---

# 🗄️ QA Data & SQL

Workflow for SQL scripts and data conversion/validation tasks.

## 🔧 Conventions (see shared/conventions.md)

- Scripts live in `scripts/sql/` (or `db/migrations`, `db/seeds`), named `NNN_description.sql` when ordered
- One statement per line, explicit transactions (`BEGIN`/`COMMIT`), idempotent where possible (`IF NOT EXISTS`, `MERGE`, upserts)
- No credentials in scripts — in TS scripts use the env singleton (`env.DATABASE_URL` from `src/config/env.ts`, dotenv + zod); for DB CLIs use the dotenv-cli wrapper; `.env.example` committed, `.env` ignored
- Test data generation goes through factories in `src/data/` / `src/api/factories/`, reused by SQL seeds and Playwright tests

## 🗄️ Data conversion / validation checklist

1. Define source and target schemas explicitly (columns, types, nullability)
2. Map formats (dates ISO 8601 in API layer vs UI format DD/MM/YYYY — never mix)
3. Validate counts, checksums, and samples after conversion; assert with SQL, not by eye
4. Wrap conversions in transactions with rollback on validation failure

## 📜 Running scripts

Cross-platform (Windows/Linux): prefer CLI tools (`psql`, `mysql`, `sqlcmd`) via npm scripts in `package.json`, e.g. `"db:seed": "psql $DATABASE_URL -f scripts/sql/seed.sql"`. Never rely on OS-specific paths.

## 🧩 Extending

Add `agents/data/` (planner/writer/review) later following the same 4-role pattern — see docs/EXTENDING.md.

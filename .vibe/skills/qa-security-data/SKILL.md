---
name: qa-security-data
description: Load when the user wants security testing of web apps/APIs (OWASP Top 10 verification, auth/access control, sensitive data exposure) — safe, non-destructive automated checks. Orchestrates agents/security; setup via setups/security-and-data.
---

# 🔒 QA Security & Data Protection

Workflow for automated security verification (OWASP-based, non-destructive).

## ⛓️ Pipeline

1. **Plan** — `agents/security/security-test-planner.agent.md`: scope + rules of engagement, OWASP classes, save to `docs/scenarios/security/`
2. **Write** — `agents/security/security-test-writer.agent.md`: safe verification specs in `tests/api/` and `tests/ui/`; a failing security test = reported vulnerability finding
3. **Refactor** — `agents/security/security-test-refactor.agent.md`: payload factories, role-based auth fixtures
4. **Review** — `agents/security/security-test-code-review.agent.md`: coverage + safety checklist

## 📏 Rules

- NEVER destructive payloads, NEVER DoS, NEVER production without written authorization
- NEVER real credentials in code — test accounts via env singleton (`env.TEST_USER_*` from `src/config/env.ts`, validated by zod)
- Minimum coverage: injection, broken access control (IDOR), auth/session, sensitive data exposure, security headers
- Lint/format with Biome (`shared/biome.json`)

## 🧪 Gdzie mieszkają testy security

Testy bezpieczeństwa runą **wewnątrz tego samego projektu Playwright** jako spec files w `tests/api/security/` i `tests/ui/security/`, uruchamiane przez `request` / `page` — bez osobnego narzędzia. Setup: `setups/security-and-data.instructions.md`.

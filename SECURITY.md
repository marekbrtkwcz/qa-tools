# Security Policy

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Report privately via:

- GitHub private vulnerability reporting (Security tab → "Report a vulnerability"), or
- email to the repository owner (see the GitHub profile of `marekbrtkwcz`)

You will get a response within 72 hours. Please include: affected version (`plugin.json`), steps to reproduce, and potential impact.

## Scope

This repository is a **Vibe CLI plugin** (test-automation tooling: subagent definitions, skills, hooks, a Python validator, examples). It contains no runtime application code and no secrets.

What we consider in scope:

- Malicious instructions embedded in agent TOMLs, skills, hooks, or knowledge files (prompt injection that could steer an AI agent into unsafe actions)
- The validator script (`scripts/validate-plugin.py`) executing untrusted input in CI in an unsafe way
- Leaked credentials/tokens accidentally committed to the repo history
- Vulnerable dependencies used by the example CI workflows

Out of scope: issues in the example test code itself (it targets fictional/test apps only).

## Safe use of this plugin

- The plugin only reads/writes files inside the trusted project folder — add the project to `~/.vibe/trusted_folders.toml` deliberately.
- Example tests use **fictitious payloads only**; never point them at real systems with real data.
- All credentials in examples come from env vars (`.env.example`) — never commit a real `.env`.
- DB-touching examples must run against a dedicated test database; the validator and docs enforce env-only connection strings.

## Supported versions

| Version | Supported |
|---|---|
| Latest release (`main`) | ✅ |
| Older releases | ❌ (upgrade to the latest tag) |

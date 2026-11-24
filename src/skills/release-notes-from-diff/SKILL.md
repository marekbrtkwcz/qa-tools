---
name: release-notes-from-diff
description: "Generates release notes / changelog entries from a diff or PR list: groups changes by audience (users, operators, developers), classifies each entry (feature, fix, breaking, security, chore), and marks breaking changes loudly. Use when preparing a release, writing a CHANGELOG section, or drafting upgrade notes. For the go/no-go decision itself see assessing-release-readiness."
argument-hint: "The diff range or PR list to summarize, the target audience, and the changelog format in use (Keep a Changelog or other)"
user-invocable: true
---

# Release Notes from Diff

Release notes written from memory miss the breaking change. This skill derives them from the actual diff, so what ships is what is documented.

## Operating Principles

- **The diff is the source of truth; the PR titles are hints.** Read the diff, classify by what changed, not by what the title claims.
- **Breaking changes go first and in bold.** A consumer should never discover a breaking change by reading the third paragraph.
- **One entry per user-visible change**, not per commit. Squash noise ("fix typo", "bump dep") into a chore line or omit per the project convention.
- **Security fixes are named without the exploit detail** - enough to know to upgrade, not a how-to for attackers.
- **Audience variants matter:** user-facing notes say what changed for them; operator notes say what to redeploy/rotate/migrate.

## Workflow

1. **Collect the range:** `git log main..HEAD --oneline` plus PR titles, or the merged PR list from the tracker.
2. **Classify each change:** feature / fix / breaking / security / performance / chore. Diff inspection beats title parsing for breaking detection (removed export, changed response field, renamed env var, migration).
3. **Group by audience:** users, operators, developers (API changes).
4. **Draft entries** in the project's changelog format (Keep a Changelog sections: Added/Changed/Deprecated/Removed/Fixed/Security).
5. **Flag for human review:** every breaking and security entry is marked "needs maintainer wording" - the skill drafts, a human approves the wording.

## Red Flags

- release notes written from PR titles without reading the diff
- a removed export or changed response field not marked breaking
- a security fix described with enough detail to exploit it
- dependency bumps listed as features
- notes that promise behavior the diff does not implement

## Related Skills

- `assessing-release-readiness` (quality-gates) - whether the release should ship at all
- `scoping-change-relevance` (quality-gates) - the same diff tags (new endpoint, migration, breaking) reused for classification
- `recording-change-intent` (quality-gates) - Intent trailers make classification easier; link entries to them
- `communicating-quality-findings` (qa-core) - audience-shaped communication patterns

## Definition of Done

- every merged change in the range is classified or consciously omitted (chore)
- breaking changes listed first, marked, with migration note where applicable
- security entries name the affected component without exploit detail
- output matches the project's changelog format and is marked for human wording review

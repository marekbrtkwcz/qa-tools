---
description: Turn a diff, PR summary, or hotfix description into a prioritized regression scope (must / should / sample / defer) with a minimal confidence suite. Argument: the change — diff, PR link, changed files, or release notes (default: git diff main...HEAD). Analysis only — does not edit code or run the suite. For an automated diff gate with coverage and intent checks, see the quality-gates skill.
---

# Analyze regression scope

If the `quality-gates` skill is available, load it (regression scoping section); for a full risk-sorted analysis you can delegate to the `qa-tools:qa-strategist` subagent.

Decide what must be retested after the change given as the command argument, and what can safely stay out of the first-pass regression pack.

## Inputs

| Input | If missing |
|---|---|
| The change (command argument) | If the workspace is a git repo, use `git diff main...HEAD --stat` and the diff itself, and say so. Otherwise ask and stop until you have it. |
| Critical user journeys / business flows | Infer from the codebase, routes, and existing tests; list as assumptions |
| Release context (hotfix, major release, time available) | Assume a normal release and say so |

Ask at most one question at a time, only when the answer would change the scope.

## Steps

1. **Map the change surface** into four rings: direct (changed code and its features), adjacent (callers/consumers), shared (common components, config, dependencies, schemas), data/state (migrations, stored data, caches, sessions). Cite the file or hunk behind each item.
2. **Rate each affected area** high / medium / low regression risk, with a one-line reason (business impact, change size, defect history, missing tests).
3. **Check existing coverage**: for each high-risk area, find the automated tests that already cover it, so the pack does not ask testers to repeat what CI proves.
4. **Build the retest pack** in four tiers: must retest, should retest, can sample, can defer with caution.
5. **Pick the minimal confidence suite**: the smallest set of checks that would catch a broken release, with estimated duration.

## Output (Markdown)

```markdown
# Regression scope: <change>
Change: <n files, areas> · Risk: High/Medium/Low · Assumptions: <…>

## Change surface
| Ring | Area | Evidence (file/hunk) | Risk | Why |

## Retest pack
| Tier | Area / flow | What to check | Covered by automation? | Est. time |

## Minimal confidence suite
1. …

## Blind spots and open questions
## Automation candidates
```

## Guardrails

- Analysis only: do not edit code or tests, do not run the suite unless asked.
- Do not mark an area out of scope without a reason; "unchanged" is a reason only if nothing it depends on changed.
- Name what the diff cannot show: config-driven behaviour, feature flags, data shape, services outside this repository.

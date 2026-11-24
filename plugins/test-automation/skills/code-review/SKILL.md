---
name: code-review
description: 'Performs a quick review of a small diff, single file, function, or snippet: checks the change against its stated goal, names each finding with file:line, a severity, and a fix, and ends with a verdict. Use when the user asks to review, look over, or sanity-check a small, low-risk change before merging or pushing, including when the code is pasted inline and the request only asks whether anything is wrong. For multi-file pull requests, refactors, or high-risk areas, use code-review-advanced; for a test-code-only audit, use unslop-tests.'
argument-hint: 'The diff, file, or snippet to review, plus the goal of the change'
user-invocable: true
---

# Quick Code Review

A fast, bounded review of a small change. It reads the diff against its goal, runs a short checklist, and returns a few findings and a verdict. It does not try to assess architecture, long-term design, or debt; those need `code-review-advanced`.

## When to Use

- someone asks to review, look over, or sanity-check a small change: one file, a function, a pasted snippet, a short diff
- the change is low-risk and the question is only whether anything is wrong before it merges or is pushed

Route elsewhere:

- multi-file pull requests, refactors, or high-risk areas (auth, payments, persistence, CI, shared fixtures): use `code-review-advanced`
- the code is test code: use `unslop-tests`


## Scope check (do this first)

Stay in this skill only if all of these hold:

- the change is one file, or a diff you can read in full in one pass
- it does not touch authentication, authorization, payments, persistence or migrations, CI pipelines, or shared test fixtures
- the goal of the change is known (from the user, the PR description, or the commit message)

If the goal is unknown, ask for it in one question; without it, correctness cannot be judged. If any other condition fails, say which one and switch to `code-review-advanced`; a quick pass on a risky change produces false confidence.

## Checklist

Work through it in order and stop adding findings once the verdict is clear. Each item names the evidence to look at.

1. **Does it do what it claims?** Compare the diff with the stated goal. Look for behaviour the goal requires but the diff does not implement, and for changes the goal does not explain.
2. **Edge and failure paths.** For each new branch, input, or external call in the diff: what happens on empty, null, invalid, or failing input? Look at the error handling actually written, not what the comments promise.
3. **Changed contracts.** Return shapes, function signatures, exported names, config keys, or log/event formats that changed. Search for callers of anything changed; a caller that was not updated is a finding.
4. **Tests.** Is there a test that would fail if the new behaviour broke? Read its assertions: an assertion on the outcome counts, "it ran without throwing" or a snapshot of unrelated output does not. New branches with no test are a finding.
5. **Obvious risks.** Secrets or tokens in code or logs; untrusted input reaching a query, shell, path, or HTML without validation or escaping; a request or loop that now runs per item inside another loop over data that can grow.
6. **Readability that blocks review.** Only names or structure that made you misread the code. Formatting and style the linter already enforces are not findings.

## Severity

- **Must fix** - wrong behaviour, a broken caller, a security exposure, or a new branch with no test that could catch a regression
- **Should fix** - a real risk or gap that can land in a follow-up if the author agrees
- **Nit** - optional; at most three, and none if there are Must-fix findings

If you are unsure whether something is a problem, say what you would need to see to decide, instead of raising its severity.

## Output

```markdown
**Change:** <one sentence: what the diff does> - matches goal: yes / partly / no

**Findings**
1. [Must fix] `src/cart/total.ts:42` - <what is wrong>. <why it matters>. Fix: <smallest change>.
2. [Should fix] `src/cart/total.test.ts` - <...>
3. [Nit] `src/cart/total.ts:57` - <...>

**Not checked:** <anything out of reach, e.g. callers outside the diff, runtime behaviour>

**Verdict:** approve | request changes | comment
```

- Every finding has a location (`file:line` when you have line numbers, `file` and function name otherwise).
- Order findings by severity. No findings is a valid result; say "No findings" and give the verdict.
- `request changes` if there is any Must fix; `approve` if there are none and the goal matches; `comment` when you could not verify something material.
- One line of strengths only if it helps the author keep a pattern; no praise padding.

## Related Skills

- `code-review-advanced` - full, severity-ranked review for multi-file, risky, or architectural changes
- `unslop-tests` - when the diff is mostly test code and the question is whether those tests prove anything
- `testing-application-security` - when the quick pass finds a possible security exposure that needs real testing
- `static-code-analysis-typescript` - when recurring nits should become lint rules instead of review comments
- `tech-debt-analysis` - when recurring review findings suggest a broader debt assessment

## Definition of Done

- the scope check passed, or the review was handed to `code-review-advanced` with the reason
- the change is summarised in one sentence with its match to the goal
- every finding has a location, a severity, and a concrete fix
- untested new branches are reported, or the test that covers them is named
- what was not checked is stated
- a verdict is given that follows the severity rule above
---

## 🎨 Emoji in output

Emoji in this collection carry meaning; they never replace words. Use them in chat replies, summary messages, reports and generated markdown artifacts.

### Core Testing Status

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done | | ⏳ | waiting / pending / queued |
| ❌ | failed / confirmed defect | | ➡️ | skipped / not applicable / out of scope |
| ⚠️ | risk / warning / needs attention | | 🔄 | rerun / retry / regenerated |
| 🚧 | blocked / in progress / WIP | | 🧪 | test / under test / experimenting |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / high priority |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.

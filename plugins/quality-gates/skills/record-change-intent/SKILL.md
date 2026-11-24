---
name: record-change-intent
description: Finds the high-risk surface in a change range, checks whether a rationale already exists in commit trailers, ADRs, or a module intent register, and drafts an Intent trailer for the author to confirm (why now, what constrained the shape, what was rejected). Use when a change touches auth, schemas, public APIs, or removed guards and its reason is not written down, or before merging a change someone will need to understand later. For a full scope, coverage, and intent gate on a diff, use the scope-change-gate command. For the standing intent-gate rule that reports every high-risk change without a rationale, use recording-change-intent.
argument-hint: "[range]"
disable-model-invocation: true
---

# Record the intent behind a change

## Inputs

Take these from what the user typed after the command, or from the conversation. Ask for any you need that are missing.

- `range`: git range to check, e.g. main..HEAD (default: main..HEAD)

# Task

If the `recording-change-intent` skill is installed, load it before starting.

Make sure this change carries a recorded reason, and that the reason is worth reading.

Use the `recording-change-intent` skill for the trailer grammar, the high-risk surface rules and the validation rules.

## Inputs to collect

| Input | Required | Notes |
| --- | --- | --- |
| Change range | ✅ | `<range>` - e.g. `main..HEAD`, or `HEAD~1..HEAD` |
| Why this change was made | ⬜ | If you can tell me, this becomes the rationale rather than a draft |
| Where rationale lives here | ⬜ | Commit trailers, `docs/adr/`, an issue tracker, `.qa/intent.md` |

## Steps

1. **Find the high-risk surface** in the range: new public exports, new endpoints, modified auth, schema or migration changes, removed guards or validation or tests, new external dependencies or calls, contract changes, and anything under a `critical-path` module. If there is none, say so and stop - no rationale is required.
2. **Look for existing rationale**, in all four places:
   - `git log <range> --format='%(trailers:key=Intent,valueonly)'`
   - `git log <range> --format='%(trailers:key=Intent-Ref,valueonly)'`
   - an ADR under `docs/adr/` that this change implements
   - a `.qa/intent.md` module register entry covering the touched paths
3. **Classify each high-risk change**: covered, undeclared, malformed (a trailer that fails its rule), restated-diff (a rationale that only says what the diff says), or waived by a path-scoped intent waiver.
4. **Draft what is missing.** From the diff, the branch name, the linked ticket and the surrounding code, write a rationale answering three questions:
   - **why now** - the trigger: a bug, a requirement, a limit that was hit
   - **what constrained the shape** - why it is not the obvious implementation
   - **what was rejected** - the alternative someone will propose in six months
5. **Hand the draft over.** Mark it clearly as a draft and give me the exact command to apply it:

   ```bash
   git commit --amend --trailer "Intent: <rationale>"
   git commit --amend --trailer "Intent-Ref: ADR-0042"
   ```

## Rules

- **Intent is why, not what.** The diff already says what changed. `refactor: extract computeRefund` is a restated diff, not a rationale.
- **A human confirms it.** You draft; the author confirms or rewrites. A generated rationale nobody read is intent theatre, and it is the exact failure this practice exists to prevent - so never commit one as final.
- **Report malformed separately from missing.** One needs fixing, the other needs writing. Quote the failing rule and the corrected form.
- **Reject filler.** "Implements the requirements from the ticket" passes a length check and carries nothing. The test: would this help someone six months from now who is about to change this code?
- **Only high-risk surface needs a record.** Say explicitly when a change needs nothing - that is what keeps the practice from being read as a tax.
- **Do not fetch tickets or URLs.** Validate the reference shape only; the check must work offline.
- **Never amend or rewrite commits yourself.** Print the command; the author runs it after confirming the text. Amending rewrites history, so warn when the commits are already pushed.

## Output

1. High-risk surface found, with the rule that made each item high-risk - or a clear "none, no rationale required".
2. Existing rationale, and what it covers.
3. Per change: covered / undeclared / malformed / restated / waived.
4. Drafted rationales, marked as drafts, with the `git commit --amend --trailer` command for each.
5. A note on squash-merge if this repo squashes: where the trailer must live to survive, and how to verify after merge.
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

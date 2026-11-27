---
name: git-for-testers
description: "Git as a daily tool and debugging instrument for testers: the file lifecycle (untracked → staged → committed, .gitignore, stash, remote connect/disconnect), git hooks (pre-commit/commit-msg via Husky or plain .git/hooks) and how to test them, `git bisect run` to find the commit that broke a test, `git worktree` for parallel work, shallow/sparse clones in CI, and `git blame`/`git log -L` when behavior changed. Use when a test starts failing after a merge and you need the breaking commit, when setting up hooks in a project, or when onboarding to a repo's git workflow."
argument-hint: "The git problem at hand: broken test after merge, hooks setup, slow CI clone, or workflow onboarding"
user-invocable: true
---

# Git for Testers

Testers live in git even when they never write app code: tests break after merges, hooks guard the repo, CI clones the repo. This skill covers the git knowledge and the recurring problems around it.

## When to Use

- a test passes on `main` but fails on a PR branch — find the breaking commit with `git bisect`
- setting up or reviewing git hooks (pre-commit, commit-msg) in a project
- "how do files move through git" onboarding: add/commit/push, .gitignore, stash
- disconnecting a local project from GitHub or re-attaching a new remote
- CI clones taking forever — shallow/sparse checkout
- "when did this behavior change?" — `git blame` / `git log -L`

## File lifecycle (the mental model)

`untracked` → `git add` → `staged` → `git commit` → `committed` → `git push` → on remote. Reverse moves: `git restore --staged` (unstage), `git restore` (discard working-tree changes — careful, destructive), `git reset --soft/mixed` (undo commits keeping changes), `git stash` (park changes aside), `git revert` (safe undo on a pushed commit — never force-push shared branches). `.gitignore` keeps generated files (artifacts, traces, `.env`, `node_modules`) out of history. Remote attach/detach: `git remote add origin <url>`, `git remote remove origin`, `git remote -v`.

## Finding the breaking commit: git bisect

When a test is green on an old commit and red on HEAD:

```bash
git bisect start
git bisect bad HEAD
git bisect good <known-good-tag-or-sha>   # e.g. v0.7.0
# automated: the test command decides good/bad
git bisect run npx playwright test tests/cart.spec.ts   # exit 0 = good, non-zero = bad
```

- The bisect script must be deterministic: run the single failing test with `--workers=1`, no retries; a flaky test poisons bisect (use `stabilizing-flaky-tests` first if the failure is intermittent).
- `git bisect reset` when done. Bisect between release tags to answer "did v0.7.0 break it?"
- Pair with `diagnosing-test-failures`: bisect finds *which* commit, diagnosis finds *why*.

## Git hooks — and testing them

Hooks live in `.git/hooks/` (plain shell) or via Husky (`husky prepare`, `.husky/pre-commit`). Typical QA-relevant hooks: lint/format staged files (Biome via lint-staged), validate commit message (commitlint — conventional commits), block test-file deletion without review (this repo's own `red-test-deletion-guard`, see `scripts/assets/`).

Problems and how to test hooks:

- **Hooks are not tested code by default** — test them like CLI tools (`testing-cli-tools`): run the hook script directly with fixture input (e.g. a bad commit message → exit non-zero + message; a staged test deletion → blocked).
- Hooks don't run on CI clones (`git clone` doesn't copy `.git/hooks`) — enforce the same checks in CI (`biome ci`, `npm run check`), never rely on the hook alone (`automating-ci-test-pipelines`).
- `--no-verify` bypasses hooks — a policy question, not a technical one; if it matters, enforce server-side (branch protection).
- Hook env differs from dev shell (minimal PATH in hooks) — use `#!/usr/bin/env sh` + explicit `npx`/`bunx` paths.

## CI clone speed

- `actions/checkout` with `fetch-depth: 1` (shallow) for PR builds — but bisect/tag comparisons need history: fetch more or fetch tags (`fetch-depth: 0`) on jobs that bisect.
- Sparse checkout for monorepos when CI only tests one package.
- Cache `node_modules`/`bun.lock`-based installs — cloning is rarely the bottleneck after that (`automating-ci-test-pipelines`).

## When did it change: blame and log -L

- `git blame <file>` — which commit touched each line (find the commit that changed an assertion or fixture).
- `git log -L '/function name/,/^}/:file.ts'` — history of one function, e.g. to see when a test helper's behavior changed.
- `git log --oneline -- tests/` — recent changes to the suite itself.

## Red Flags

- `git bisect run` on a flaky test — bisect assumes deterministic pass/fail; quarantine the flake first
- force-push or `reset --hard` on a shared branch — use `git revert`; destructive git ops are a blast-radius action
- committing `.env`, traces, or HAR files with tokens — `.gitignore` + `handling-sensitive-test-data`; if already committed, rotate the secret, then scrub history
- hooks as the only gate — CI must enforce the same checks
- shallow clone in a job that needs `git describe`/tags/bisect — check `fetch-depth` per job

## Related Skills

- `svn-for-testers` - the same tester workflows in an SVN checkout (its resources hold the git↔svn command map; a git-svn bridge working copy still counts as git here)- `diagnosing-test-failures` - root-causing the failure bisect points at (mentions `git bisect run`)
- `stabilizing-flaky-tests` - a flake must be deterministic before bisect
- `testing-cli-tools` - hooks are testable as subprocesses
- `creating-hooks` / `static-code-analysis-typescript` - authoring hooks and Husky+Biome setup in this collection's stack
- `automating-ci-test-pipelines` - CI enforcement of the same checks, clone caching
- `handling-sensitive-test-data` - secrets in history
- `monorepo-affected-tests` - diff-based test selection (merge-base vs HEAD^1 pitfall)

## Definition of Done

- for a broken-after-merge test: the breaking commit is identified via scripted `git bisect run` and handed to diagnosis
- hooks in the project have at least one automated test (good input passes, bad input blocked) and run in CI too
- file-lifecycle operations used by the team are written down (add/commit/push/revert/stash) with the destructive ones marked
- CI clones use explicit `fetch-depth` appropriate to each job
## 🎨 Emoji in output

Emoji carry meaning; they never replace words. Use them in chat replies, reports and generated markdown artifacts — never in code identifiers, test names, file names, commit messages or branch names; where the destination enforces a blanket ban (generated YAML/CSV/JSON), the ban wins. One emoji per header, bullet or status cell, never two in a row or mid-sentence; if a reader has to ask what it stands for, use a word.

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ✅ | passed / verified / done / resolved | | ❌ | failed / confirmed defect |
| ⚠️ | risk / warning / needs attention | | 🚧 | blocked / in progress |
| ⏳ | waiting / pending | | 🔄 | rerun / retry / regenerated |
| 🟡 | flaky / unstable / investigate | | 🐛 | defect / bug |
| 🚨 | critical / severe / P0-P1 | | 🔍 | gap / missing coverage / investigation |
| 🧪 | test / under test | | 📊 | metrics / report / measurement |
| 🛡️ | security test / guardrail | | 🚢 | released / shipped / go |
| ⛔ | no-go / rejected / denied | | 🎯 | target / scope / priority |

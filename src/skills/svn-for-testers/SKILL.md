---
name: svn-for-testers
description: "Subversion for testers as a daily debugging instrument: the working-copy lifecycle (`svn status/add/update/commit` — commit publishes immediately, no local history), trunk/branches/tags layout, changelists instead of staging, `svn:ignore`, externals, server-side hooks, binary search over `svn update -r` for the revision that broke a test, `svn blame`/`svn log` when behavior changed. Use when the working copy is an SVN checkout (`.svn/`), the trunk/branch layout is unclear, or a git-based workflow needs its SVN equivalent. Closest neighbour: `git-for-testers` — same workflows in a git repo."
argument-hint: "The SVN problem at hand: broken test after update, repo layout, ignore rules, or workflow onboarding"
user-invocable: true
---

# SVN for Testers

Testers meet SVN in codebases where the working copy talks straight to a central server: tests break after an update, hooks live on the server, CI checks out a revision. This skill covers SVN knowledge and the recurring problems around it, plus the translation from git habits (`svn-for-testers` is the SVN twin of `git-for-testers`).

## When to Use

- a test was green at r1234 and red after `svn update` — find the breaking revision by binary search
- "is this trunk or a branch?" — repo layout questions (trunk/branches/tags is convention, not enforcement)
- a git-based workflow needs its SVN equivalent: diff coverage, release notes from a revision range, blame-driven diagnosis, comprehension-debt signals from log
- keeping artifacts, traces and `.env` out of the repo — `svn:ignore`, not `.gitignore`
- "how do files move through SVN" onboarding: add/update/commit/revert

## Working-copy lifecycle (the mental model)

Central server, no local history: `unversioned` → `svn add` → `modified` → `svn commit` — and commit **publishes immediately**. There is no local commit to amend, no push, no stash. `svn update` pulls server-side changes into the working copy; `svn revert <file>` discards local modifications (careful — destructive on the working copy, everything not committed is gone). Changelists approximate staging: `svn changelist smoke <files>` groups changes, `svn commit --changelist smoke` commits just that group.

The consequence for daily work: everything git lets you fix after the fact (message amended, history rewritten, secrets scrubbed) is either impossible or a server-admin job here — so checks run **before** commit, not after push.

```bash
svn status          # M modified, A added, ? unversioned, D deleted, C conflict
svn diff            # what your commit would send — read it before committing
svn update          # pull server changes; resolve conflicts before continuing
svn commit -m "..."
```

## Repo layout: trunk/branches/tags

The layout is convention, not enforced: `svn ls ^/` shows what this repo actually has. Branching is a server-side copy — cheap and instant: `svn copy ^/trunk ^/branches/checkout-fix -m "branch"`. Keep changes alive with `svn merge ^/trunk` and re-commit. **Tags are writable copies** — nothing stops a commit to `^/tags/v1.0`; if immutability matters, enforce it with a `pre-commit` hook on the server.

## Finding the breaking revision: manual bisect

SVN has no `git bisect`. Binary search works the same way, driven by hand:

```bash
svn log -l 20 -v path/to/area      # candidates: recent changes in the failing area
svn update -r 1300                 # working copy at r1300
npx playwright test tests/checkout.spec.ts --workers=1 --retries=0
# exit 0 = good: move forward; non-zero = bad: move back; halve until one revision remains
```

Same rules as `git bisect run`: the test must be deterministic (`--workers=1`, retries off; a flake poisons the search — `stabilizing-flaky-tests` first). If the test file itself changed inside the range, keep a copy of the current test outside the working copy so every revision is judged by the same question. Hand the surviving revision to `diagnosing-test-failures` for the *why*.

## When did it change: blame, log, diff

- `svn blame <file>` — author and revision per line (which revision changed that assertion or fixture)
- `svn log -r 1200:1300 <path>` and `svn log -v` (changed paths per revision)
- `svn diff -c 1300 <path>` — one revision's change; `svn diff -r BASE:HEAD` — what your working copy is behind; `svn diff -r 1200:HEAD` — everything between a release point and now

## Keeping junk out of the repository: svn:ignore

`.gitignore` does nothing here. Ignores are a per-directory **property**, set with `svn propedit svn:ignore .` (better than `propset` from the shell — multi-line values):

```text
node_modules
test-results
playwright-report
.env
```

Not recursive by default — set it per directory (or with `svn propset -R`, carefully). New ignores only protect new files; already-committed junk needs `svn delete --keep-local <path>` to stay on disk but leave the repo. The user-level fallback is `global-ignores` in `~/.subversion/config`. Never commit `.env`, traces, or HAR files with tokens (`handling-sensitive-test-data`); if one is already in, rotate the secret — scrubbing server history is an `svnadmin` job, near-permanent in practice.

## Externals: dependencies pinned in properties

`svn:externals` is the analogue of git submodules — a property mapping a local directory to another repo URL. Pin a revision (`url -r1300 dir`) for reproducible checkouts; floating externals are how a green suite breaks overnight.

## Hooks live on the server — and still need tests

Hooks (`pre-commit`, `start-commit`) live in the repository's `hooks/` directory **on the server** — enforced for every client, unlike `.git/hooks` which CI clones never get. QA-relevant uses: block commits deleting test files without a review marker, require a message format, keep tags immutable. They are still untested code by default — test them like CLI tools (`testing-cli-tools`): one commit that must pass, one that must be blocked.

## Red Flags

- bisecting a flaky test — determinism first, exactly like `git bisect run`
- committing `.env`, traces, or HARs with tokens — `svn:ignore` first; after a leak, rotate, because server history is near-permanent
- treating a tag as immutable without a hook — tags are writable copies
- `svn revert -R .` as a convenience — it discards every uncommitted change in the working copy
- credentials cached in plaintext (`~/.subversion/auth/`) — `store-plaintext-passwords = no` in `~/.subversion/config`
- parsing `svn status` output by eyeball in CI — use `svn status --xml` for machine-readable checks

## When NOT to Use

- the workspace is a git repo — that is `git-for-testers`, end to end
- the repo is consumed through the git-svn bridge — the working copy looks like git to every tool; treat it as git
- the need is migrating SVN history to git — out of scope; plan it as a one-time project, this skill only covers working *in* SVN

## Resource Map

- `./resources/git-svn-for-testers.md` — read when a git-based workflow (diff coverage, release notes, blame, bisect, ignore rules, hooks) must run in an SVN checkout, or a git habit needs its exact SVN translation

## Related Skills

- `git-for-testers` — same workflows in a git repo; `./resources/git-svn-for-testers.md` is the translation table between the two
- `diagnosing-test-failures` - root-causing the failure the revision search points at
- `stabilizing-flaky-tests` - a flake must be deterministic before any revision search
- `handling-sensitive-test-data` - auth cache, artifacts, and near-permanent server history
- `testing-cli-tools` - hooks are testable as subprocesses
- `verifying-change-coverage` / `release-notes-from-diff` / `assessing-comprehension-debt` - git-shaped workflows this skill translates into SVN

## Definition of Done

- for a broken-after-update test: the breaking revision is identified via binary search with a deterministic one-test command, and handed to diagnosis
- generated files (artifacts, traces, `.env`) are covered by `svn:ignore` in the touched directories — nothing versioned that should be ignored
- destructive operations used by the team are written down (`svn revert`, `svn delete`, `svn merge`) with the destructive ones marked
- server hooks protecting tests verified by one good and one blocked commit attempt, with the hook's path and match rule recorded

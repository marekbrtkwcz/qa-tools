# Git ↔ SVN for Testers — the translation table

Tester workflows, expressed in both systems. Read when a skill written against git must run in an SVN checkout (or the other way round). Assumes plain SVN (`svn` client against a central server); a git-svn bridge working copy behaves like git to every tool — treat it as git.

| Tester workflow | git | svn | Note |
| --- | --- | --- | --- |
| See what changed locally | `git status` / `git diff` | `svn status` / `svn diff` | `svn status` flags: `M` `A` `?` `D` `C` (conflict); `--xml` for CI parsing |
| Stage part of the work | `git add` (index) | `svn add` + `svn changelist <name> <files>`, then `svn commit --changelist <name>` | Changelists group only; there is no true staging area |
| Publish | `git commit` + `git push` | `svn commit` | Commit publishes straight to the server — no local history, nothing to amend afterwards |
| Park changes aside | `git stash` | `svn diff > parked.patch` + `svn revert`, restore with `svn patch` | Shelve exists in SVN ≥1.10 (`svn x-shelf`) but is experimental — the patch round-trip is the dependable route |
| Changes not yet on the server | (implicit — local commits) | `svn diff -r BASE:HEAD` | BASE = revision the working copy was updated to |
| History of a range | `git log A..B` | `svn log -r A:B` | Revisions are global, monotonic integers — no SHAs, no rebase, no force-anything |
| Which commit broke the test | `git bisect run` | manual binary search: `svn update -r N` + deterministic test, halve the range | `svn log -v <path>` shortlists candidate revisions |
| Who changed this line | `git blame file` | `svn blame file` | Both answer "which change touched this assertion" |
| History of one function | `git log -L '/name/,/^}/:file'` | `svn log <file>` narrowed by blame + `svn diff -c` per revision | No direct `-L` equivalent |
| One change in detail | `git show <sha>` | `svn diff -c <rev>` | |
| Diff between two points | `git diff main...HEAD` | `svn diff -r <base>:HEAD` | No merge-base concept — ranges use revision numbers, e.g. last tagged release to HEAD |
| Changed files only (CI gates) | `git diff --name-only main...HEAD` | `svn diff --summarize -r <base>:HEAD` | This is what diff-coverage and affected-test selection consume |
| Ignore artifacts | `.gitignore` | `svn propedit svn:ignore .` (per-directory property) | Not recursive; committed junk needs `svn delete --keep-local`; global fallback: `global-ignores` in `~/.subversion/config` |
| Peer-repo dependencies | `.gitmodules` | `svn:externals` property | Pin `-r<rev>` for reproducible checkouts |
| Client hooks | `.git/hooks/`, Husky | nothing client-side — hooks live in the repo's `hooks/` on the server | Server hooks (`pre-commit`) apply to everyone; test them as CLI tools |
| Branch / parallel work | `git branch` + merge | `svn copy ^/trunk ^/branches/x`; sync with `svn merge ^/trunk` | Copy is cheap on the server; layout (trunk/branches/tags) is convention |
| Tags | tags (immutable by convention + server rules) | `^/tags/x` is a writable copy | Immutability only via a server `pre-commit` hook |
| Full copy for CI | `git clone` | `svn checkout <url>` | `--depth` for sparse checkouts in monorepos |
| Undo a published change | `git revert <sha>` | `svn merge -c -<rev> .` + commit | Both add a new change; neither rewrites history |
| Scrub a leaked secret | history rewrite (filter-repo) | server-side `svnadmin` dump/filter/load — near-permanent in practice | In SVN: rotate the credential and treat the revision as burned |

## Where this matters to this collection

- `verifying-change-coverage`, `test-impact-analysis`, `monorepo-affected-tests` — all consume a diff; in SVN the base is a **revision number** (`svn diff --summarize -r <base>:HEAD`), not a merge-base ref.
- `release-notes-from-diff` — the range is `svn log -r <release-rev>:HEAD`; revisions are already linearly ordered, so no topology to reason about.
- `assessing-comprehension-debt`, `recording-change-intent` — git commit trailers have no machine equivalent; write the same `Intent:` / `Assisted-by:` lines as plain text in the commit message (`svn commit -F message.txt`) and grep `svn log` output for them.
- `diagnosing-test-failures` — the bisect loop becomes the binary search above; keep the one-test command deterministic (`--workers=1`, retries off).

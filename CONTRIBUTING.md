# Contributing to qa-tools

This collection is a set of **native Mistral Vibe CLI plugins** (Agent Plugins 1.0 format), built from single sources in `src/` into `plugins/` by `scripts/build.ts`. Everything the build writes is regenerated — edit `src/` and `bundles.yaml`, never `plugins/`.

## Where things live

| Asset | Source | Consumed by the build as |
| --- | --- | --- |
| Skill (model-invoked) | `src/skills/<name>/SKILL.md` + `resources/` | `skills/<name>/` in the plugin |
| Command (user-invoked) | the same shape as a skill, with `disable-model-invocation: true` | a command is a skill that never auto-triggers |
| Agent | `src/agents/<name>.md` | `ai.mistral.vibe/agents/<name>.toml` |
| Knowledge | `src/knowledge/<name>.md` | `ai.mistral.vibe/knowledge/<name>/KNOWLEDGE.md` |
| Hook | `scripts/assets/<name>.js` (+ `<name>.test.js`) | `ai.mistral.vibe/hooks.toml` + `vibe-hooks/` in the plugin |

Every asset belongs to **exactly one bundle** — the lists in `bundles.yaml`, alphabetical. Every bundle `version:` is **quoted** (`"0.4.1"`); `--set-version` refuses to rewrite bare values, and `checkVersionQuoting` fails on them.

## Documentation

Documentation lives next to the asset it describes — there is no separate `docs/`:

- a **bundle** documents itself in `src/knowledge/<bundle>.md` (routing table, "what this bundle does not do", evidence) — required, `npm run check` enforces it;
- a **skill** documents itself in its `SKILL.md` (When to Use / Workflow / Definition of Done) plus `resources/` for templates and worked examples;
- a **user-facing change** gets a `CHANGELOG.md` entry under the current version;
- the **README table** counts are updated in the same commit as `bundles.yaml` (build gate fails otherwise).

## Frontmatter rules (enforced by `npm run check`)

**Skill `SKILL.md`:**
- `name` — equals the folder name.
- `description` — ends with a period; hard limit 1024 chars, warning past 700, and this collection's target is **≤600** (routing signal blurs past it). Include `Use when …` triggers and a routing clause that names the closest neighbour.
- Command extras: `argument-hint: "[what the user passes]"`, and `disable-model-invocation: true` so it never competes with skills for auto-triggering. Commands that should appear in the user's command menu also carry `user-invocable: true`.
- The skill body names no host unless the skill is about hosts (the validator warns).

**Agent `.md`:** `name` (equals the file name), `title`, `description` (**warn past 300** — the build silently truncates at 300 in the TOML), `capabilities` (or `tools`), optional `mcp`. The body after the frontmatter is the agent's instructions; `truncateDescription` applies to the description only.

**Knowledge `.md`:** the first non-`#` paragraph becomes the plugin's knowledge description — keep it under **297 characters** (the build's slice point; the validator warns past it).

**Hooks:** plain Node CJS in `scripts/assets/` — no dependencies, `'use strict'`, unit-tested with `node:test` in `<name>.test.js`, listed under `hooks:` in the bundle entry. The build emits one `[[hooks]]` block per matcher (`type = "pre_tool"`, `match` on `file_system.write_file` / `edit` / `bash`, `command = "node vibe-hooks/<name>.js"`, `strict = false`). A crashing hook **fails open** — this is required, not optional.

## House skill structure

Skills that the model triggers on its own carry: `## When to Use` with explicit triggers, `## When NOT to Use` (or Boundary), `## Resource Map` where each resource gets a "read when" condition (one level deep), and `## Definition of Done`. Commands carry a Workflow with checkable steps and a Guardrails section instead. Long reference material moves to `resources/` — progressive disclosure, keep bodies lean.

## Commands

```bash
npm run check    # validate sources: membership, frontmatter rules, README gates
npm run build    # regenerate plugins/ from src/ (atomic swap, all-or-nothing)
npm run verify   # drift gate: committed plugins/ must match a fresh build
npm run validate-manifests   # plugin.json / mcp.json (JSON) + agent TOML syntax
npm test         # build unit tests + hook guard tests (node:test, no deps)
npm run lint     # Biome on scripts/ (TS + JS)
npm run typecheck  # tsc --noEmit — type gate for scripts/*.ts
npm run ci       # all of the above
```

Top-level scripts in `scripts/` are **TypeScript**, executed directly by Node ≥ 24 (native type stripping — no build step, no loader); `engines.node` requires `>=24` and CI runs Node 24. Biome lints and formats both `.ts` and `.js` under `scripts/`. Hooks in `scripts/assets/` stay plain CJS `.js` on purpose: Vibe runs them via `node vibe-hooks/<name>.js`, so they must not depend on type stripping.

### P2 Automation Commands

P2 (Periodic Maintenance) tasks are automated for consistency:

```bash
# Maintenance validation (runs on CI)
npm run p2              # Check CHANGELOG, README stats, and links
npm run p2:all          # Generate CHANGELOG, update README stats, validate links

# Individual maintenance tasks
npm run changelog              # Generate CHANGELOG.md from conventional commits
npm run changelog:preview      # Preview generator output (real CHANGELOG validation runs in npm run check)
npm run readme:stats           # Update README.md statistics (bundle counts)
npm run readme:stats:check     # Validate README stats match bundles.yaml
npm run links                  # Validate all markdown links (report mode)
npm run links:check            # Validate all markdown links (CI mode, exits 1 on errors)
```

### P3 Testing Commands

P3 (Test Coverage) includes unit tests for maintenance scripts:

```bash
npm run test:p3        # Run all P3 unit tests (validate-links, generate-changelog, update-readme-stats)
npm run test:all       # Run all tests (P2 + P3)
```

## Maintenance Workflows (P2)

### CHANGELOG Generation
- **Script:** `scripts/generate-changelog.ts`
- **Trigger:** Manual or CI (on tag push)
- **Input:** Git commit history (conventional commits format)
- **Output:** `CHANGELOG.md` with categorized changes
- **Types:** `feat`/`feature`/`dodano` → ✅ Dodane, `fix`/`naprawiono` → 🐛 Naprawione, `chore`/`refactor`/`docs` → 🔄 Zmienione, `BREAKING CHANGE` → ⚠️ BREAKING CHANGE
- **Preview:** `npm run changelog:preview` (dry-run generatora; prawdziwa walidacja CHANGELOG siedzi w `npm run check`)

### README Statistics
- **Script:** `scripts/update-readme-stats.ts`
- **Trigger:** Manual or CI (on release)
- **Input:** `bundles.yaml` + source directory structure
- **Output:** Updated counts in README.md bundle table
- **Validation:** `npm run readme:stats:check` (verifies counts match bundles.yaml)

### Link Validation
- **Script:** `scripts/validate-links.ts`
- **Trigger:** CI (on every push/PR)
- **Scope:** All `.md` files (excluding `node_modules/`, `plugins/`, `resources/`, `.vibe/`, `.git/`)
- **Checks:**
  - Internal file links (relative paths)
  - Anchor links (`#section-id`)
  - Cross-bundle links (`bundle:skill` format)
  - External links (optional, can be skipped)
- **Validation:** `npm run links:check` (exits 1 on broken links)

## Test Coverage (P3)

### Unit Tests for P2 Scripts

All P2 maintenance scripts have comprehensive unit tests:

| Script | Test File | Coverage |
|--------|-----------|----------|
| `validate-links.ts` | `validate-links.test.ts` | Link extraction, validation logic |
| `generate-changelog.ts` | `generate-changelog.test.ts` | Commit parsing, type mapping |
| `update-readme-stats.ts` | `update-readme-stats.test.ts` | Bundle counting, stats validation, table rewrite |

### Running Tests

```bash
# Run P3 tests only
node --test scripts/validate-links.test.ts
node --test scripts/generate-changelog.test.ts
node --test scripts/update-readme-stats.test.ts

# Or use npm scripts
npm run test:p3    # All P3 tests
npm run test:all  # All tests including P2
```

### Test Structure

Tests use Node.js built-in `node:test` framework:
- **No external dependencies** required
- **Fast execution** (~5 seconds for all 68 tests)
- **Comprehensive coverage** of edge cases
- **Integration tests** (E2E) for real-world scenarios

After editing `src/`, run `npm run check`, then `npm run build`, and commit sources and the regenerated `plugins/` **together** — CI's drift gate (`--verify`, ubuntu + windows) fails if they diverge.

## README gates

The build also enforces two README properties in every mode: the MCP install lines stay documented verbatim (`checkGlobalBinaryInstallDoc`), and the bundle-table / totals / model-visible numbers match `bundles.yaml` and the actual frontmatters (`checkReadmeCounts`). Adding a skill means updating the README numbers in the same commit — the gate will tell you exactly which.

## Releases

One release = one version for the whole collection: `node scripts/build.ts --set-version x.y.z` (rewrites every bundle), a `## [x.y.z] - YYYY-MM-DD` header in `CHANGELOG.md`, the same version in `package.json`, and the tag `vx.y.z`. `scripts/check-release.ts --tag vx.y.z` (CI runs it on tags) verifies all four agree.

## Provenance

`src/` content is adapted from [awesome-agents-for-quality](https://github.com/jaktestowac/awesome-agents-for-quality) (MIT, jaktestowac.pl); native assets written for this repository are house-native.

---

## P4 Quality Gates

P4 (Quality Gates) extends the automation with advanced quality assurance workflows:

### Quality Gates Commands

```bash
# Run all P4 gates
npm run p4                     # Security scan + flaky test detection + benchmarking

# Individual P4 tools
npm run security:scan          # Scan for security vulnerabilities
npm run flaky:check            # Check for flaky tests (CI mode, exits 1 on flaky tests)
npm run flaky:detect           # Detect flaky tests (report mode, 5 runs)
npm run benchmark              # Run performance benchmarks (3 runs)
npm run benchmark:full         # Run full benchmarks with save (5 runs, save results)
```

### P4 Test Commands

```bash
npm run test:p4        # Run all P4 unit tests
npm run test:all:p4    # Run all tests (P2 + P3 + P4)
```

---

### Security Scanning (P4.2)

**Script:** `scripts/security-scan.ts`

**Features:**
- **Secret detection:** Scans for API keys, passwords, tokens, private keys in code
- **Dependency auditing:** Checks for vulnerable npm dependencies using `npm audit`
- **File permission checks:** Detects world-writable and sensitive files
- **Pattern matching:** Comprehensive regex patterns for common secret formats
- **Safe output:** Secrets are automatically redacted in output

**Checks:**
- API keys (OpenAI, GitHub, AWS, etc.)
- Passwords and credentials in files
- Bearer tokens and JWTs
- Private keys (RSA, EC, OpenSSH)
- World-writable files
- Sensitive files with incorrect permissions
- Outdated dependency versions

**Usage:**
```bash
# Scan the entire repository
npm run security:scan

# Scan with JSON output
node scripts/security-scan.ts --json

# Run in CI (exits 1 on issues)
npm run security:scan
```

**Example output:**
```
================================================================================
🔒 SECURITY SCAN RESULTS
================================================================================

📊 Summary:
   Total Issues: 0
   Total Warnings: 1

✅ No secrets detected
✅ No vulnerabilities detected
✅ No permission issues detected

ℹ️  WARNINGS:
--------------------------------------------------------------------------------
   📁 package.json
      Issue: Package @vitest/coverage-v8 uses caret (^) version
      Version: ^5.1.1
      Severity: info

================================================================================
```

---

### Flaky Test Detection (P4.3)

**Script:** `scripts/detect-flaky-tests.ts`

**Features:**
- **Multiple runs:** Executes tests multiple times to detect inconsistencies
- **Statistical analysis:** Identifies tests with inconsistent pass/fail patterns
- **Threshold configuration:** Configurable sensitivity for flaky detection
- **Comprehensive reporting:** Detailed output with stability scores

**Detection Criteria:**
- **Inconsistent tests:** Pass sometimes, fail sometimes → **Flaky (0% stability)**
- **Consistent failures:** Fail every time → **Broken (50% stability)**
- **Consistent passes:** Pass every time → **Stable (100% stability)**

**Usage:**
```bash
# Quick check (3 runs)
npm run flaky:check

# Detailed detection (5 runs)
npm run flaky:detect

# With custom options
node scripts/detect-flaky-tests.ts --runs 10 --threshold 2 --check
```

**Options:**
- `--runs, -r`: Number of test runs (default: 5)
- `--threshold, -T`: Failure threshold (default: 1)
- `--check, -c`: Exit with code 1 if flaky tests found
- `--json, -j`: Output results as JSON
- `--test, -t`: Test specific file only

**Example output:**
```
================================================================================
🔍 FLAKY TEST DETECTION RESULTS
================================================================================

📊 Summary:
   Runs: 5
   Tests analyzed: 68
   Flaky tests found: 1
   Threshold: 1

⚠️  FLAKY TESTS DETECTED:
--------------------------------------------------------------------------------

   📝 Network-dependent test
      Type: INCONSISTENT
      Passed: 3/5
      Failed: 2/5
      Stability: 0%
      Results: ✅ ❌ ✅ ❌ ✅

--------------------------------------------------------------------------------

💡 Recommendations:
   1. Investigate tests with inconsistent results (✅❌✅❌)
   2. Check for timing issues, race conditions, or external dependencies
   3. Add retries with quarantine for flaky tests
   4. Consider marking flaky tests with test.skip() temporarily

================================================================================
```

---

### Performance Benchmarking (P4.4)

**Script:** `scripts/benchmark-performance.ts`

**Features:**
- **Comprehensive benchmarks:** Measures P2, P3, and build performance
- **Statistical analysis:** Calculates min, max, mean, median, and standard deviation
- **Trend tracking:** Compares with previous results to detect regressions
- **Result persistence:** Saves benchmark data for historical comparison

**Benchmarkable Scripts:**
- P2 automation (changelog, readme stats, links)
- P3 tests (unit tests)
- Build process
- Full check and verify
- Linting

**Usage:**
```bash
# Quick benchmark (3 runs)
npm run benchmark

# Full benchmark with save (5 runs)
npm run benchmark:full

# Benchmark specific script
node scripts/benchmark-performance.ts --script "npm run build" --runs 3

# Compare with previous results
node scripts/benchmark-performance.ts --compare --runs 3
```

**Options:**
- `--runs, -r`: Number of benchmark runs (default: 3)
- `--script, -s`: Specific script to benchmark
- `--save, -S`: Save results to file
- `--compare, -c`: Compare with previous results
- `--json, -j`: Output results as JSON

**Example output:**
```
================================================================================
⚡ PERFORMANCE BENCHMARKING RESULTS
================================================================================

📊 Summary:
   Benchmarks: 10
   Runs per benchmark: 3
   Total execution time: 12.50s

📋 P2: CHANGELOG check
--------------------------------------------------------------------------------
   Run 1: 1.23s ✅
   Run 2: 1.18s ✅
   Run 3: 1.21s ✅

   📈 Statistics:
      Min: 1.18s
      Max: 1.23s
      Mean: 1.21s
      Median: 1.21s
      Std Dev: 0.02s
      Success Rate: 100.0%

💡 Recommendations:
   ✅ All benchmarks are performing well!

================================================================================
```

---

### Quality Gates Workflow (P4.1)

**Workflow:** `.github/workflows/quality-gates.yml`

**Features:**
- **Automated execution:** Runs on every push, PR, and nightly
- **Comprehensive gates:** Core gates, security scan, flaky detection, performance
- **Non-blocking by default:** Reports warnings without blocking merges
- **Detailed reporting:** Full summary of all gate results

**Jobs:**

1. **Core Gates** (Blocking)
   - P2 automation checks
   - P3 unit tests
   - Full test suite
   - Linting
   - Build validation
   - Drift gate

2. **Security Scan** (Non-blocking)
   - Dependency vulnerabilities
   - Secret detection
   - File permission checks

3. **Flaky Test Detection** (Non-blocking)
   - Runs tests 3 times
   - Identifies inconsistent results

4. **Performance Benchmarking** (Non-blocking)
   - Measures all P2 and P3 scripts
   - Tracks performance trends

**Trigger Configuration:**
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Nightly at 2 AM
  workflow_dispatch:       # Manual trigger
```

**Integration with existing CI:**
- Quality Gates workflow is **nightly-only** (schedule + workflow_dispatch): full regression at rest plus what only makes sense on a schedule (security scan, flake detection, performance history)
- Core gates on push/PR live in `ci.yml` (job `full`); `release.yml` is the single owner of `v*` tags
- P4 jobs call the same npm scripts (`security:scan`, `flaky:check`, `benchmark:full`) the repo ships in `package.json` — one source of truth

---

## P4 Test Coverage

All P4 scripts have comprehensive unit tests using `node:test`:

| Script | Test File | Coverage |
|--------|-----------|----------|
| `security-scan.js` | `security-scan.test.js` | Secret detection, permission checks |
| `detect-flaky-tests.js` | `detect-flaky-tests.test.js` | Flaky detection, statistical analysis |
| `benchmark-performance.js` | `benchmark-performance.test.js` | Benchmarking, statistics |

**Total P4 Tests:** 20+ new tests

**Running P4 tests:**
```bash
npm run test:p4
npm run test:all:p4
```

---

## P5 Quality Enforcement

P5 (Quality Enforcement) adds proactive quality enforcement mechanisms that go beyond detection:

### P5 Commands

```bash
# Run all P5 enforcement
npm run p5                     # Quarantine + security enforce + performance check

# Flaky Test Quarantine
npm run quarantine:detect      # Detect and quarantine flaky tests
npm run quarantine:list        # List quarantined tests
npm run quarantine:add [test]  # Add test to quarantine
npm run quarantine:remove [test] # Remove test from quarantine
npm run quarantine:clear       # Clear all quarantined tests
npm run quarantine:restore     # Restore all quarantined tests

# Security Enforcement
npm run security:enforce       # Run security gates (blocking)
npm run security:validate      # Validate security configuration

# Performance Monitoring
npm run perf:baseline         # Create performance baseline
npm run perf:check            # Check performance against baseline
npm run perf:alert            # Generate alert if regression detected
npm run perf:history          # Show performance history
npm run perf:clear            # Clear performance data
```

### P5 Test Commands

```bash
npm run test:p5        # Run all P5 unit tests
npm run test:all:p5    # Run all tests (P2 + P3 + P4 + P5)
```

---

### Quality Gate Hooks (P5.1)

**Script:** `scripts/assets/quality-gate-hook.js`
**Test File:** `scripts/assets/quality-gate-hook.test.js`

**Purpose:** Real-time quality gate enforcement through Vibe CLI hooks.

**Features:**
- **Pre-tool Hook:** Runs before file modifications and dangerous commands
- **Automatic Checks:** Runs P2, P3, linting, build validation, and drift gate
- **Caching:** Caches results for 30 seconds to avoid redundant checks
- **Non-blocking:** Allows operations to proceed if quality gates pass
- **Blocking:** Blocks operations if quality gates fail

**Integration:**
To enable the hook, add it to your `bundles.yaml`:

```yaml
hooks:
  - type: pre_tool
    match: [file_system.write_file, edit, bash]
    command: node vibe-hooks/quality-gate-hook.js
    strict: false
```

**Behavior:**
- Checks run automatically before file modifications
- If all gates pass: operation proceeds
- If any gate fails: operation is blocked with error message
- Results are cached for 30 seconds

---

### Auto-update Dependencies (P5.2)

**Configuration:** `.github/dependabot.yml`

**Features:**
- **Automated Updates:** Dependabot automatically creates PRs for dependency updates
- **Scheduled:** Runs daily for npm dependencies, weekly for GitHub Actions
- **Grouped:** Groups updates by type (dev vs production)
- **Auto-merge:** Automatically merges patch updates if CI passes
- **Labels:** Adds labels for easy filtering
- **Reviewers:** Assigns reviewers to dependency PRs

**Configuration Details:**
- **npm dependencies:** Daily checks, allows minor and patch updates
- **GitHub Actions:** Weekly checks, allows minor and patch updates
- **Auto-merge:** Enabled for patch updates only
- **Labels:** `dependencies`, `auto-update`, `P5`

**Benefits:**
- Keeps dependencies up-to-date automatically
- Reduces manual maintenance
- Security patches applied quickly
- Breaking changes reviewed manually

---

### Advanced Flaky Test Quarantine (P5.3)

**Script:** `scripts/quarantine-flaky-tests.ts`
**Test File:** `scripts/quarantine-flaky-tests.test.ts`

**Purpose:** Automatically quarantine flaky tests to prevent CI failures.

**Features:**
- **Automatic Detection:** Uses flaky test detection from P4.3
- **Automatic Quarantine:** Adds `test.skip()` to flaky tests
- **Quarantine File:** Persists quarantine list to `.flaky-tests.json`
- **Management Commands:** Add, remove, list, clear quarantined tests
- **Restore:** Temporarily restore tests for testing

**Commands:**

```bash
# Detect and quarantine flaky tests (automatic)
npm run quarantine:detect

# Manually add a test to quarantine
npm run quarantine:add "Test name"

# Manually remove a test from quarantine
npm run quarantine:remove "Test name"

# List all quarantined tests
npm run quarantine:list

# Clear all quarantined tests
npm run quarantine:clear

# Restore all quarantined tests (remove skip)
npm run quarantine:restore
```

**Quarantine File Format:**
```json
{
  "quarantinedTests": [
    "Test 1",
    "Test 2"
  ],
  "lastUpdated": "2024-11-25T10:00:00.000Z",
  "detectedAt": "2024-11-25T09:00:00.000Z",
  "version": "1.0"
}
```

**Workflow:**
1. Run `quarantine:detect` to find flaky tests
2. Tests are automatically added to quarantine
3. Tests are marked with `test.skip()` in source files
4. CI runs without flaky tests
5. When tests are fixed, remove from quarantine

---

### Performance Regression Alerts (P5.4)

**Script:** `scripts/performance-regression-alerts.ts`
**Test File:** `scripts/performance-regression-alerts.test.ts`

**Purpose:** Monitor performance and alert when regressions are detected.

**Features:**
- **Baseline Creation:** Create performance baseline measurements
- **Regression Detection:** Compare current performance against baseline
- **Threshold Configuration:** Configurable regression threshold (default: 10%)
- **History Tracking:** Save performance history for trend analysis
- **Alert Generation:** Generate alerts when regressions are detected
- **Auto-blocking:** Block CI on high-severity regressions

**Commands:**

```bash
# Create baseline measurements
npm run perf:baseline

# Check current performance against baseline
npm run perf:check

# Check with custom threshold (5%)
npm run perf:check --threshold 5

# Generate alert if regression detected
npm run perf:alert

# Show performance history
npm run perf:history

# Clear baseline and history
npm run perf:clear

# Continuous monitoring (runs every hour)
npm run perf:monitor
```

**Files:**
- `.performance-baseline.json` - Baseline measurements
- `.performance-history.json` - Performance history

**Baseline Format:**
```json
{
  "benchmarks": [
    {
      "name": "P2: CHANGELOG preview",
      "command": "npm run changelog:preview",
      "runs": 5,
      "durations": [120, 125, 118, 122, 121],
      "statistics": {
        "min": 118,
        "max": 125,
        "mean": 121.2,
        "median": 121,
        "stdDev": 2.5
      }
    }
  ],
  "createdAt": "2024-11-25T10:00:00.000Z",
  "version": "1.0"
}
```

**Alert Levels:**
- **Medium:** Regression > threshold%
- **High:** Regression > 2x threshold%

**Integration with CI:**
- Run `perf:check` in CI to detect regressions
- Use `--threshold` to control sensitivity
- High severity alerts cause CI to fail

---

### Security Gate Enforcement (P5.5)

**Script:** `scripts/security-gate-enforce.ts`
**Test File:** `scripts/security-gate-enforce.test.ts`

**Purpose:** Make security checks blocking instead of just reporting.

**Features:**
- **Blocking Mode:** Prevents merges when security issues are found
- **Severity Threshold:** Only block on issues above threshold (default: high)
- **Strict Mode:** Block on warnings too
- **Comprehensive Checks:** Vulnerabilities, secrets, permissions, sensitive files
- **Detailed Reporting:** Clear output with actionable recommendations

**Commands:**

```bash
# Run security gates (blocking)
npm run security:enforce

# Run with strict mode (block on warnings too)
npm run security:enforce --strict

# Run with custom severity threshold
npm run security:enforce --severity medium

# Validate security configuration
npm run security:validate
```

**Severity Levels:**
- **Low:** Informational, non-blocking by default
- **Medium:** Warning, blocking in strict mode
- **High:** Error, always blocking
- **Critical:** Critical error, always blocking

**Checks Performed:**
1. **npm audit:** Check for vulnerable dependencies
2. **Secret Scan:** Check for secrets in code
3. **Permission Check:** Check for world-writable files
4. **Sensitive Files:** Check for sensitive files in git

**Example Output:**
```
================================================================================
🔒 SECURITY GATE ENFORCEMENT RESULTS
================================================================================

📊 Configuration:
   Severity threshold: high
   Strict mode: Disabled

📋 Summary:
   Vulnerabilities: 2
   Secrets: 0
   Permissions: 1
   Warnings: 3
   Total: 6

⚠️  Vulnerabilities:
--------------------------------------------------------------------------------
   📦 test-package@1.0.0
      Severity: HIGH
      Fix Available: ✅ Yes

--------------------------------------------------------------------------------
❌ SECURITY GATES FAILED
   Merge is BLOCKED until issues are resolved.

   Blocking issues:
      - [HIGH] test-package

   Recommended actions:
      1. Fix vulnerabilities with npm audit fix
      2. Remove or redact secrets from code
      3. Fix file permissions
      4. Remove sensitive files from git
================================================================================
```

**Integration:**
- Add to CI workflow before merge
- Run in PR checks
- Block merge if exit code is non-zero

**CI Integration Example:**
```yaml
- name: Security Gate Enforcement
  run: npm run security:enforce
```

---

## P5 Test Coverage

All P5 scripts have comprehensive unit tests using `node:test`:

| Script | Test File | Tests | Coverage |
|--------|-----------|-------|----------|
| `quality-gate-hook.js` | `quality-gate-hook.test.js` | 10+ | Hook logic, formatting |
| `quarantine-flaky-tests.js` | `quarantine-flaky-tests.test.js` | 10+ | Quarantine management |
| `performance-regression-alerts.js` | `performance-regression-alerts.test.js` | 10+ | Alerting, statistics |
| `security-gate-enforce.js` | `security-gate-enforce.test.js` | 10+ | Enforcement, formatting |

**Total P5 Tests:** 40+ new tests

**Running P5 tests:**
```bash
npm run test:p5
npm run test:all:p5
```

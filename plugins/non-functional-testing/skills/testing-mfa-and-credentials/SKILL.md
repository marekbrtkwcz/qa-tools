---
name: testing-mfa-and-credentials
description: 'Tests credential handling and multi-factor authentication: password policy enforcement, account lockout and throttling, credential-stuffing resistance, MFA enrolment and verification (TOTP, WebAuthn passkeys, SMS), MFA bypass paths, and recovery flows (password reset, backup codes). Use when login security is under review, when accounts can be brute-forced, when a reset link can be abused, or when passkey enrolment and sign-in flows need automation (CDP virtual authenticator).'
argument-hint: 'The auth endpoints in a test environment, test accounts per role, and which MFA factors are enabled'
user-invocable: true
---

# Testing MFA and Credentials

Use this skill when the question is "can an attacker get in with someone else's credentials or around the second factor". Covers password policy, lockout/throttling, MFA enrolment and bypass, and recovery flows. Rate-limit behaviour under load belongs to `testing-abuse-limits`; the broad security pass to `testing-application-security`.

**Test accounts only, synthetic data, non-production.** Credential attacks against real accounts are out of scope even in staging.

## When to Use

- MFA is being rolled out or changed (TOTP / WebAuthn / SMS)
- passkeys are being introduced: enrolment, usernameless sign-in, and recovery need automated verification
- password reset or account recovery flows exist and their token handling is unknown
- lockout / throttling behaviour needs verification
- a bypass of the second factor is suspected (e.g. endpoint that skips MFA)
- credential stuffing resistance needs a check

## Operating Principles

- **Recovery flows are attack surface.** Reset tokens: single-use, expiring, rate-limited, not guessable, and the response does not reveal whether the account exists.
- **Lockout must not be a DoS.** Locking an account after N failures is right; an attacker must not be able to lock out arbitrary users — verify the policy (per-account vs per-IP, unlock path, admin override).
- **MFA must be enforced server-side on every protected path.** A "trusted device" or step-up skip must be checked per endpoint, not assumed.
- **Backup codes are credentials.** Single-use, stored hashed, revocable, and regenerating them invalidates the old set.
- **Never test with real user credentials or real phone numbers.** Synthetic accounts only.

## Workflow

### Phase 1: Map the credential surface

- login, password reset, change password, MFA enrol/verify/disable, backup codes, account lockout endpoints
- which factors are enabled per role, and the step-up policy

### Phase 2: Password and lockout

Work through `./resources/mfa-credentials-checklist.md`:

- weak passwords rejected per policy (length, common-password list, breached-password check if used)
- password change requires the current password; reset requires a valid single-use token
- N failed logins → lockout/throttle per policy; response does not leak account existence; unlock path documented
- lockout cannot be weaponized against arbitrary accounts (verify the policy boundary)

### Phase 3: MFA

- enrolment binds the factor to the account (TOTP secret / WebAuthn credential); verification requires a valid code
- wrong code rejected; replayed code rejected (TOTP window abuse); too many attempts → throttle/lock
- MFA required on all protected endpoints — check for bypass paths (API endpoints, old sessions, "remember this device" scope)
- disable/change MFA requires re-authentication (current password or a valid second factor)
- backup codes: work once each, stored hashed, regeneration invalidates the old set

### WebAuthn and passkeys (automating the ceremony)

The WebAuthn prompt is OS-chrome the page cannot drive — typing into it is impossible from normal automation. Automate the ceremony with a **CDP virtual authenticator** instead of the real prompt:

```ts
// Playwright: a virtual authenticator replaces the platform prompt
const cdp = await context.newCDPSession(page);
await cdp.send('WebAuthn.enable');
const { authenticatorId } = await cdp.send('WebAuthn.addVirtualAuthenticator', {
  protocol: 'ctap2',
  transport: 'internal',        // platform authenticator = the passkey profile
  hasResidentKey: true,         // passkeys are discoverable credentials
  hasLargeBlob: true,
  hasUserVerification: true,
  isUserVerified: true,         // auto-passes the biometric/PIN step
});
// enrolment: the page's navigator.credentials.create() completes without UI
// sign-in:   navigator.credentials.get() returns the stored credential
await cdp.send('WebAuthn.clearCredentials', { authenticatorId }); // reset between tests
```

- The test drives the real JS flow — only the OS sheet is virtual. Say exactly that in the notes: ceremony executed, platform prompt not exercised.
- Assertions stay server-side: after sign-in, verify the credential is bound to the account (credential list endpoint or the stored record), not just that the dashboard rendered.
- **Conditional UI** (the username field's passkey autofill, `mediation: 'conditional'`) cannot be clicked by automation either — it lives in the browser's autofill surface. Verify the code path (the `credentials.get` call is present and callable) and mark the visual autofill row as a manual check, honestly.
- Cross-device passkeys (QR / hybrid transport) are out of UI-automation scope: verify the policy level — `allowCredentials` and the transport regular expression state whether cross-device is permitted.
- `addVirtualAuthenticator` gained fields across CDP versions — if a field is rejected, check the protocol version before improvising.
- **Passkey recovery is launch-blocking surface**: removing a passkey must require re-auth with a remaining factor, and with all passkeys removed the account must still be recoverable through the reset path. A passkey-only account with a dead recovery flow is a high-severity finding, not a backlog note.

### Phase 4: Recovery flows

- reset link/token: single-use, expires, invalidated by use or by password change; not guessable
- reset does not reveal account existence (same response for known/unknown email)
- reset rate-limited per account and per IP

### Phase 5: Report

Findings through the security disclosure path (`testing-application-security`), with endpoint, attempt, and observed behaviour. Never include real credentials in reports.

## Resource Map

- `./resources/mfa-credentials-checklist.md` - password, lockout, MFA, and recovery check matrix. Read during Phases 2–4.

## Related Skills

- `testing-abuse-limits` - rate limiting and resource exhaustion under deliberate load
- `testing-oauth2-oidc` - token-based auth and JWT validation
- `testing-session-management` - session lifecycle after login
- `testing-application-security` - authorization gate and the broad pass
- `handling-sensitive-test-data` - keeping credentials and phone numbers synthetic

## Definition of Done

This skill is complete when:

- password policy enforced on set/change; reset tokens single-use, expiring, non-enumerable
- lockout/throttle matches policy and cannot be weaponized; account-existence not leaked
- MFA verified per factor (TOTP/WebAuthn/SMS as applicable): enrolment, wrong-code and replay rejection, bypass paths checked per endpoint
- backup codes single-use, hashed, revocable
- only synthetic accounts and non-production environments were used
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
| 🟢 | passing / healthy / green | | 🔴 | failing / broken / red |
| 🟡 | flaky / unstable / needs investigation | | ⚪ | neutral / unknown / unset |

### Test Types and Levels

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧪 | unit test / isolated test | | 🖥️ | integration test / component test |
| 🌐 | end-to-end test / E2E | | 📱 | mobile test / device test |
| 🎯 | acceptance test / ATDD | | 🔍 | exploratory test / ad-hoc |
| 📊 | performance test / load test | | 🛡️ | security test / pentest |
| ♿ | accessibility test / a11y | | 🧠 | AI test / LLM evaluation |
| 📋 | regression test / smoke test | | ⚙️ | contract test / API validation |

### Findings and Issues

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🐛 | defect / bug / issue | | 🎲 | flaky / non-deterministic / unstable |
| 🔍 | gap / missing coverage / investigation needed | | 🔙 | regression / broken / re-opened |
| 💳 | technical debt / cleanup needed | | 🚨 | critical / severe / P0/P1 |
| 🟠 | medium priority / P2 | | 🔵 | low priority / P3 |
| 📝 | documentation issue / missing docs | | ❓ | question / needs clarification |
| ✅ | resolved / fixed / closed | | 🔄 | in progress / being fixed |
| 🗑️ | duplicate / won't fix / invalid | | 🔒 | blocked / waiting on dependency |

### Quality, Metrics and Observability

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📊 | metrics / measurement / data | | 📈 | improvement / trend up / getting better |
| 📉 | degradation / trend down / getting worse | | 🔬 | analysis / deep dive / investigation |
| 📋 | checklist / requirements / criteria | | 📖 | documentation / guide / reference |
| 🎯 | target / goal / scope / objective | | 📌 | pinned / tracked / monitored |
| 🔭 | observability / logging / tracing | | 📡 | monitoring / alert / signal |
| 📏 | measurement / KPI / SLI | | 🎖️ | SLO / service level / quality gate |
| 📊 | dashboard / visualization / report | | 🔢 | count / total / summary |

### Code and Development

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 💻 | code / implementation / development | | 🔧 | refactor / cleanup / maintenance |
| 📦 | library / dependency / package | | 🏗️ | architecture / design / structure |
| 🧱 | building block / component | | 🔗 | interface / API / connection |
| 📂 | file / directory / module | | 📄 | document / spec / contract |
| 🎨 | styling / UI / design | | 🛠️ | utility / helper / tool |
| 📝 | commit / change / PR | | 🏷️ | label / tag / version |
| 🔁 | merge / rebase / sync | | 🔄 | update / upgrade / migrate |

### Process and Workflow

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🚢 | release go / shipped / deployed | | ⛔ | no-go / forbidden / rejected |
| ✨ | new feature / enhancement / added | | 🗑️ | deprecated / removed / obsolete |
| 👀 | review / inspection / verification | | 🤝 | collaboration / handoff / paired |
| 📅 | scheduled / planned / roadmap | | ⏰ | timeout / deadline / due |
| ✏️ | draft / editing / work in progress | | 🔗 | linked / related / connected |
| 🚦 | gate / approval / checkpoint | | 📍 | milestone / phase / checkpoint |
| 🏁 | finish line / completion | | 🎯 | priority / focus / important |
| 📤 | push / publish / upload | | 📥 | pull / fetch / download |

### Automation and Infrastructure

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🤖 | automation / bot / script | | ⚙️ | configuration / setup / settings |
| 🏗️ | build / pipeline / CI | | 🚀 | deploy / delivery / launch |
| 🛠️ | tool / utility / helper | | 🔌 | plugin / integration / connector |
| 📦 | package / artifact / bundle | | 🗃️ | repository / storage / archive |
| ⚡ | execution / run / trigger | | 📊 | CI job / workflow / step |
| 🖨️ | build artifact / output | | 🗂️ | registry / registry / index |
| 🌐 | network / remote / cloud | | 🖥️ | local / development / dev |
| 🔐 | secret / token / credential | | 🛡️ | security / protection / safety |

### Security and Compliance

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🔒 | secured / encrypted / locked | | 🛡️ | protected / guarded / safeguarded |
| ♿ | accessibility / a11y / inclusive | | 🔐 | authorization / permissions / ACL |
| 🕵️ | audit / pentest / security review | | 🚫 | denied / blocked / access refused |
| 🔓 | vulnerability / exposure / leak | | 🛑 | critical security issue / CVE |
| 📜 | compliance / standard / regulation | | ✅ | compliant / passed audit |
| ❌ | non-compliant / failed audit | | 🔍 | security investigation |

### Performance and Load

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⚡ | fast / performant / optimized | | 🐌 | slow / sluggish / underperforming |
| 📉 | bottleneck / constraint / limitation | | 🌊 | load / traffic / volume |
| ⚖️ | balanced / baseline / benchmark | | 📤 | throughput / output / capacity |
| 📈 | latency / response time | | 🔥 | hot path / critical path |
| ❄️ | cold start / cache miss | | 📊 | profiling / flame graph |
| 🎯 | target SLO / performance goal | | 🏆 | performance optimization |

### Orchestration and Agents

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🎼 | orchestrator / coordinator | | 🎭 | actor / role / persona |
| 🧠 | reasoning / thinking / cognition | | 💬 | message / prompt / input |
| 🔁 | loop / iteration / repeat | | ⏹️ | stop / halt / interrupt |
| 🧩 | component / module / part | | 🔀 | switch / change / toggle |
| 📡 | signal / event / trigger | | 🌐 | distributed / network / remote |
| 🏗️ | framework / scaffold | | 🎛️ | control / management / admin |

### Data and Storage

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🗃️ | database / storage / persistence | | 📋 | data / dataset / collection |
| 🔍 | query / search / filter | | 📊 | analytics / aggregation |
| 📤 | export / output / dump | | 📥 | import / input / load |
| 🔄 | sync / replication / mirror | | 🗂️ | index / catalog / registry |
| 📦 | backup / archive / snapshot | | 🗑️ | purge / cleanup / delete |
| 🔒 | encrypted data | | 🔓 | decrypted / plaintext |

### AI and LLMs

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🧠 | AI / LLM / model | | 💬 | prompt / input / query |
| 📝 | output / response / answer | | 🔍 | retrieval / RAG / search |
| 🎯 | fine-tuning / training | | ⚖️ | evaluation / benchmark |
| 🛡️ | guardrail / safety / moderation | | 🔒 | privacy / data protection |
| 📊 | metrics / accuracy / score | | ⚡ | inference / generation |
| 🔄 | context / history / memory | | 🧩 | plugin / tool / function |

### Documentation and Knowledge

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📖 | documentation / manual | | 📚 | knowledge base / wiki |
| 📝 | notes / draft / scratch | | 🎓 | learning / tutorial |
| 🏷️ | tag / label / category | | 🔗 | reference / link / citation |
| 📋 | example / sample / template | | 📊 | diagram / visualization |
| ✏️ | edit / update / revision | | 🗂️ | catalog / index / table of contents |
| 📌 | pinned / important / must-read | | 🔍 | search / find / locate |

### Communication and Collaboration

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 📧 | email / notification | | 💬 | chat / message / discussion |
| 🎯 | announcement / update | | 📢 | broadcast / alert |
| 👥 | team / group / contributors | | 👤 | user / person / author |
| 🤝 | collaboration / partnership | | 📅 | meeting / sync / calendar |
| ✅ | agreement / approval | | ❌ | disagreement / rejection |
| ❓ | question / help needed | | 💡 | idea / suggestion / proposal |
| 🙏 | request / ask / please | | 🎉 | celebration / success |

### Time and Scheduling

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| ⏰ | time / deadline / due | | ⏳ | waiting / pending / elapsed |
| 📅 | date / schedule / calendar | | ⏸️ | pause / suspended / on hold |
| ▶️ | start / resume / begin | | ⏹️ | stop / end / finish |
| 🔄 | repeat / loop / retry | | ⏱️ | timer / duration / timeout |
| ⏮️ | previous / before / earlier | | ⏭️ | next / after / later |
| 📆 | roadmap / timeline / plan | | 🎯 | milestone / target date |

### Environment and Platforms

| Emoji | Meaning | | Emoji | Meaning |
|---|---|---|---|---|
| 🌐 | web / browser / HTTP | | 📱 | mobile / Android / iOS |
| 💻 | desktop / local / development | | ☁️ | cloud / server / remote |
| 🏢 | enterprise / on-prem | | 🌍 | global / distributed |
| 🔌 | API / endpoint / service | | 📦 | container / Docker / VM |
| ⚡ | CLI / command line | | 🖥️ | UI / frontend / interface |
| 🗄️ | database / backend | | 📡 | network / connectivity |

---

## Rules

- One emoji per header, bullet or status cell. Never two in a row, never mid-sentence.
- Emoji belong in prose and markdown artifacts only — never in code identifiers, test names, file names, commit messages or branch names.
- The emoji must point at the meaning; if a reader has to ask what it stands for, use a word instead.
- Blanket emoji ban overrides this section where the destination enforces it (e.g. generated OpenAPI YAML, CSV, JSON).
- Prefer **one emoji per row** in tables; in narrow contexts, a single emoji can carry the row's status.

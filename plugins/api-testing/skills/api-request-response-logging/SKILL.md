---
name: api-request-response-logging
description: "Adds request/response logging to Playwright API tests via a custom `request` fixture that wraps APIRequestContext in a transparent Proxy — zero extra dependencies (raw ANSI colors, no chalk), env-gated (LOGGER=true), with automatic redaction of Authorization/Cookie/API-key headers so secrets never reach CI logs, plus an attach-on-failure variant (test.info().attach) for CI artifacts instead of console noise. Adapted from the pwapi-logger pattern (AkademiaQA), adjusted to Biome + strict TS. Use when API tests are hard to debug locally, when CI failures lack the request/response evidence, or when you want readable API traffic in test output without plugins."
argument-hint: "Whether logging is for local debugging, CI artifacts on failure, or both"
user-invocable: true
---

# API Request/Response Logging in Playwright

Playwright's built-in `request` fixture makes raw API calls in tests. This skill shows how to wrap it so every call is logged — for local debugging — and how to attach the evidence to the test report on failure, which is what CI actually needs. The pattern comes from the pwapi-logger project, cleaned up: no `chalk`, no `any`, strict-TS-safe, secrets redacted.

## When to Use

- debugging API tests locally: "what exactly was sent and what came back?"
- CI failures where the trace viewer is not enough and you want request/response attached to the report
- demo/recording of API traffic in test output (with redaction)
- NOT for: permanent console logging in CI (noise + leak risk) — use attach-on-failure there

## The pattern

Override the `request` fixture in `src/fixtures/test.ts` (or `tests/fixtures.ts`):

```ts
import { test as base, expect, type APIRequestContext, type APIResponse } from '@playwright/test';

const LOGGER = process.env.LOGGER === 'true';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'fetch';
const HTTP_METHODS: readonly HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'fetch'];

const REDACTED = '[REDACTED]';
const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'set-cookie', 'x-api-key', 'proxy-authorization']);

function redact(headers: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(headers).map(([k, v]) => [k, SENSITIVE_HEADERS.has(k.toLowerCase()) ? REDACTED : v]),
  );
}

function wrapRequest(ctx: APIRequestContext): APIRequestContext {
  return new Proxy(ctx, {
    get(target, prop: string | symbol) {
      if (typeof prop === 'string' && (HTTP_METHODS as readonly string[]).includes(prop)) {
        const method = prop as HttpMethod;
        return async (url: string | URL, options?: Parameters<APIRequestContext[HttpMethod]>[1]) => {
          const t0 = Date.now();
          const call = target[method] as (u: string | URL, o?: unknown) => Promise<APIResponse>;
          const response: APIResponse = await call(url, options);
          if (LOGGER) {
            logCall(method, response.url(), options, response, Date.now() - t0);
          }
          return response;
        };
      }
      const value = Reflect.get(target, prop);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

export const test = base.extend<{ request: APIRequestContext }>({
  request: async ({ request }, use) => {
    await use(wrapRequest(request));
  },
});

export { expect };
```

`logCall` prints method + URL, redacted request headers/payload, then status + elapsed ms + redacted response headers + pretty-printed JSON body (guarded try/catch for non-JSON). Full ready-to-paste implementation with ANSI colors: `./resources/api-logger-fixture.md`.

## CI variant: attach on failure, not console

In CI, console logging is noise; attach the exchange to the test artifact only when the test fails:

```ts
test.afterEach(async ({ request }, testInfo) => {
  if (testInfo.status !== 'failed') return;
  // exchange log collected per test via a test-scoped buffer in the fixture
  await testInfo.attach('api-traffic.log', { body: getTrafficLog(), contentType: 'text/plain' });
});
```

Rules: buffer per test (clear in `beforeEach`), redact before attaching, keep bodies truncated (e.g. first 4 KB) so artifacts stay small. Playwright's own trace already records API responses — this logger is for readable, greppable text (`test-reports-and-artifacts` covers trace/video/screenshot retention).

## Rules

- **Always redact** `Authorization`, `Cookie`, `Set-Cookie`, `X-Api-Key`, and any header matching your secret naming — before printing AND before attaching. Default-deny: redact unknown `*-key`/`*token*` headers too.
- **Env-gated**: `LOGGER=true` locally; off by default in CI. Never commit a `.env` with real values (`.env` in `.gitignore`).
- **Zero-dep colors**: raw ANSI escapes (`\x1b[36m` etc.), not `chalk` — keeps Biome strict happy and avoids a CJS-only dependency.
- **Proxy must be transparent**: non-method properties (e.g. `storageState`, `dispose`) must pass through bound to the target — a broken Proxy breaks every API test in subtle ways.
- **Body reading is safe**: `response.json()`/`text()` cache the body in Playwright; logging does not consume it for the test.
- **Performance**: skip logging entirely when the flag is off (check before doing any formatting work).

## Red Flags

- logging headers without redaction into CI artifacts — secret leak (`handling-sensitive-test-data`)
- `chalk`/other color lib added just for this — one less dep, Biome-cleaner without it
- Proxy that forgets to bind non-method functions — `request.storageState()` etc. break
- permanent `console.log` of full payloads in CI — log size and PII risk; attach-on-failure instead
- asserting on log output — the logger is observability, not a test oracle; assert on responses

## Related Skills

- `api-playwright-test-developer` - the request fixture and API test structure this extends
- `test-reports-and-artifacts` - traces, attachments, CI artifact retention (the CI-side home of this evidence)
- `diagnosing-test-failures` - when an API test fails and you need the exact exchange
- `debugging-with-chrome-devtools-mcp` - the browser-side equivalent for UI-driven network traffic
- `handling-sensitive-test-data` - redaction rules and secrets hygiene
- `mocking-network-and-time` - when instead of logging you should stub the API entirely

## Definition of Done

- `request` fixture is wrapped once in a shared fixtures file; all API tests log through it with zero changes to test bodies
- sensitive headers are redacted in both console and attached output
- logging is off by default, enabled via env flag; CI uses attach-on-failure, not console
- the fixture file passes `tsc --noEmit` (strict) and `biome ci` with no suppressions
- one real API test was debugged locally using the logger and the output shown
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

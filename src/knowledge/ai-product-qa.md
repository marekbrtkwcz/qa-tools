# AI product QA

A guide to testing products that **ship an LLM** - prompts, agents, RAG, tool-calling - as opposed to using AI to write tests.

It exists because the usual suite cannot see the failures that matter here. The same input produces different output. A prompt or model change degrades quality without breaking a single test. Coverage stays green while the feature gets worse, and the first person to notice is a user. On top of that, anything the model _reads_ is an input channel: a retrieved document, a tool result, or another user's profile field can carry instructions.

Three suites, distinct and complementary: **evals** for normal input, **guardrails** for wrong output, **red team** for hostile input.

## What you use

Everything below ships in the `ai-quality` plugin, except the rule, which you copy in from [`rules/`](../../../rules/).

| Resource | Type | Purpose |
| --- | --- | --- |
| [`testing-llm-features`](../skills/testing-llm-features/SKILL.md) | Skill | Offline eval suite: golden cases per prompt template, cheapest-scoring-first, pinned determinism, regression gate against a committed baseline |
| [`testing-llm-guardrails`](../skills/testing-llm-guardrails/SKILL.md) | Skill | Runtime controls and the adversarial suite - schema, PII, moderation, rendering, tool authorization, caps, and injection through every content channel |
| [`reviewing-ai-output-groundedness`](../skills/reviewing-ai-output-groundedness/SKILL.md) | Skill | The human review no eval replaces: claim-by-claim attribution, citation verification, omission, and a responsible-AI pass |
| [`llm-feature-test-engineer`](../agents/llm-feature-test-engineer.md) | Agent | Builds all three suites and wires the gate; opens with the authorization gate before any adversarial work |
| [`/design-llm-eval-suite`](../skills/design-llm-eval-suite/SKILL.md) | Command | Feature and quality bar in, eval suite and CI gate out |
| [`/test-llm-guardrails`](../skills/test-llm-guardrails/SKILL.md) | Command | Trust-boundary map, guardrail coverage table, adversarial pass scored on effect |
| [`llm-evals`](../../../rules/claude/.claude/rules/llm-evals.md) | Rule | Rules for `evals/`, `prompts/` and promptfoo configs: determinism, golden-case discipline, judge rubrics, cost control |

Pairs naturally with [`handling-sensitive-test-data`](../../qa-core/skills/handling-sensitive-test-data/SKILL.md) (in `qa-core`) for fixtures built from real content, and [`testing-application-security`](../../non-functional-testing/skills/testing-application-security/SKILL.md) (in `non-functional-testing`) for the wider security scope.

## Before the adversarial work

Injection and jailbreak testing is security testing. The guardrails skill opens with an authorization gate, and it is not decorative: confirm in writing that the system is yours or that you have the owner's permission, name the target environment, agree a window, and know who to notify on a finding. If any of that is missing, the honest move is to stop and say what is needed.

## The rules that carry the most weight

- **Pin the model to a dated version.** `latest` makes every result unattributable and every regression unexplainable.
- **Gate on regressions, not on an absolute score.** A case that used to pass and now fails is a signal; a threshold on a hard case set either blocks forever or gates nothing.
- **Cheapest scoring that can actually fail.** Schema, required content, citations-resolve - most real regressions trip a free check. An LLM judge without a rubric is a random number with an API bill.
- **Prompt instructions are not controls.** "Never reveal the system prompt" is a hope. A check in the tool handler is a control.
- **Score adversarial results on effect, not on wording.** A refusal message means nothing if the tool call went through.
- **Test the channels the model reads, not just the chat box.** Poisoned retrieval, hostile tool output, and stored user content are how the realistic attack arrives.
- **Groundedness ends in an attestation with limitations**, never a bare percentage.

## How to use

1. Install the `ai-quality` plugin (see the quick start in the main README) and copy the `llm-evals` rule for your tool from `rules/`.
2. Run `/design-llm-eval-suite` (`$design-llm-eval-suite` in Codex). Supply the feature and - this one is required - what "good output" means as a sentence. Without a stated promise the suite ends up asserting that the output is non-empty.
3. Let it build the cheap deterministic layer first, then golden cases, then the gate. Measure the noise band before turning the gate on.
4. Run `/test-llm-guardrails` once authorization is confirmed. Expect the guardrail coverage table to produce findings before a single adversarial case runs - prompt-only tool authorization and fail-open moderation are the usual two.
5. Run a groundedness review (`reviewing-ai-output-groundedness`) on a sample before launch, and feed every fabricated or contradicted claim back into the eval suite as a permanent regression case. That feedback loop is what makes the human review compound instead of evaporate.

## What this will not do for you

- It will not tune your prompts. It builds the measurement; the feature owner decides what to change.
- It will not test a third party's model or infrastructure.
- It will not settle bias, fairness or policy questions. The responsible-AI pass is a tester's observation of output and behaviour, and it says so.
- It will not prove factuality by automation. That part is sampled, human, and recorded with its limitations.

## Mapping to the AI testing course outline (foundations → DeepEval → RAG → agents → RAGAS)

This collection covers the same syllabus with skills instead of a notebook. Section-by-section:

- **Section 1 — Foundations of AI application testing** (LLM testing intro, app types, eval metrics, eval libraries) → `ai-concepts-for-testers` (vocabulary) + `testing-llm-features` (metric design: cheapest-scoring-first, judge rubrics)
- **Section 2 — Local LLM deployment with Ollama** (running LLMs locally, Ollama as API) → the "pin the model to a dated version" rule above: a local pinned model is the determinism tool; see `testing-llm-features` (pinned determinism, offline eval runs)
- **Section 3 — Environment setup** (Jupyter, Confident AI) → `evals/` + the `llm-evals` rule + `design-llm-eval-suite` (the collection's equivalent of a hosted eval UI: committed golden cases + CI gate instead of a dashboard)
- **Section 4 — DeepEval basics** (AnswerRelevance, ContextPrecision, LLMTestCase, Goldens) → `testing-llm-features`: LLMTestCase ≈ one golden case, Golden ≈ the committed baseline the regression gate diffs against; Confident AI ≈ `test-reports-and-artifacts` for run history
- **Section 5 — Advanced LLM evaluation** (LangChain eval chains, GEval custom criteria, bias detection) → `testing-llm-features` (custom criteria = judge rubric) + `reviewing-ai-output-groundedness` (bias/fairness = the responsible-AI pass, human and attested)
- **Section 6 — RAG testing with DeepEval** (RAG intro, GEval for RAG, conciseness/completeness) → `evaluating-rag-retrieval` (retrieval quality: context precision/recall as first-class metrics)
- **Section 7 — Advanced RAG testing** (datasets, actual output vs retrieval context, LLMTestCases from dataset) → `evaluating-rag-retrieval` + `test-data-factories` (dataset-as-fixtures, seeded and reproducible)
- **Section 8 — AI agents and tool calling** (agents with/without real systems, multi-dataset) → `testing-llm-guardrails` (tool-call authorization, fail-open checks, injection through tool results) + `testing-agent-skills` (activation/output-contract/collision cases) + `testing-multi-turn-conversations`
- **Section 9 — RAGAS for LLMs** (Context Recall, Noise Sensitivity, MultiTurnSample, summary/harmfulness metrics) → `evaluating-rag-retrieval` (RAGAS metrics map to retrieval-context checks) + `testing-multi-turn-conversations` (MultiTurnSample ≈ multi-turn golden cases)
- **Section 10 — RAG with RAGAS** (retrievers, vector stores, RAG eval) → `evaluating-rag-retrieval` end-to-end: retriever quality gates the whole RAG pipeline, so test retrieval before testing generation

Course logistics (certificates, hosted dashboards) have no counterpart here — this collection covers the knowledge, the eval-suite discipline and the gates, not course administration.

## Tooling notes: Ollama, DeepEval, RAGAS, LangChain, Jupyter/Confident AI

The course names specific tools; this collection names conventions. When you meet these tools in a course or a project, translate them like this:

- **Ollama (local LLMs).** Running a model locally via Ollama (`ollama serve`, GUI or CLI, model pulled by tag) is the determinism tool for evals: a pinned local model (`llama3.2:3b`, not `latest`) makes runs reproducible without an API bill. Treat the Ollama endpoint as just another model provider behind your typed client wrapper — the "pin the model to a dated version" rule applies verbatim: a moving tag makes every result unattributable. Never point eval suites at a local model in CI unless the model file is pinned and cached; otherwise CI results are not comparable across runs.
- **DeepEval.** Its vocabulary maps onto this collection's: `LLMTestCase` ≈ one golden case in `evals/`, `Golden` ≈ the committed baseline the regression gate diffs against, `AnswerRelevance`/`ContextPrecision` ≈ judge-rubric metrics in `testing-llm-features`, `GEval` (custom criteria) ≈ a rubric with a stated definition of "good". Where DeepEval gives you a hosted dashboard (Confident AI), this collection gives you committed eval files + CI gate (`design-llm-eval-suite`) + run history (`test-reports-and-artifacts`) — same loop, different surface: measure → diff against baseline → gate.
- **RAGAS.** Its named metrics are retrieval-quality checks, and they belong in `evaluating-rag-retrieval`: Context Recall / Context Precision = did the retriever surface the passage that answers the question; Noise Sensitivity = does irrelevant retrieved content degrade the answer; `MultiTurnSample` ≈ multi-turn golden cases in `testing-multi-turn-conversations`; summary/harmfulness metrics = the responsible-AI pass in `reviewing-ai-output-groundedness`. Rule: test retrieval (vector store + retriever) before generation — a perfect prompt cannot fix a bad context.
- **Vector stores / retrievers.** Treat the vector store as an infrastructure dependency with its own test layer: embedding-model version pinned, index built from a seeded fixture corpus, retrieval asserted on known queries (expected document IDs in top-k) before any LLM sees the context. This is the Python/JS-agnostic version of "test the data layer before the model layer".
- **LangChain.** An orchestration framework, not a testing tool — its eval chains are the same judge-rubric pattern as above. In this collection the equivalent discipline lives in `testing-llm-features` (offline eval suite) and `testing-llm-guardrails` (tool-call authorization: a LangChain tool is a tool, and "the model was told not to call it" is a hope, not a control).
- **Jupyter notebooks / Confident AI.** Notebooks are for exploration; evals that live only in a notebook are evals that die with the laptop. Port every exploratory metric into `evals/` as a committed golden case with a rubric — that is the `llm-evals` rule. Confident AI (hosted eval UI) ≈ `test-reports-and-artifacts` + CI gate: same run history, but owned by the repo, not a SaaS.

## AI red teaming: tooling and taxonomy

Red teaming an LLM app is security testing, so the authorization gate above applies first — in writing: target system, environment, window, notification path. After that, the course-style toolkit maps onto this collection like this:

- **Promptfoo (the red-team runner).** Install/config (`promptfoo init`, `promptfo.yaml`) with `targets` (your HTTP endpoint or a local model), `providers` (cloud APIs **and** local LLMs — Ollama endpoint included, which is how you red team without cloud cost), `strategies` (single-turn vs multi-turn attack chains), `plugins`/`policies` (OWASP categories, PII, business rules), `graders` (assertions: `not-contains`, `llm-rubric`, `similar`...) and the HTML report. In this collection the same loop lives in `test-llm-guardrails`: adversarial corpus per content channel, scored **on effect, not wording**, plus a regression gate so every run is comparable — the `llm-evals` rule covers promptfoo configs in `evals/`.
- **OWASP LLM Top 10 as the taxonomy.** Name the risks, don't just "test jailbreaks": LLM01 prompt injection, LLM02 sensitive-data disclosure (PII leakage), LLM06 excessive agency (the model calling tools it should not — in this collection: tool-call authorization checks in `testing-llm-guardrails`, "prompt instructions are not controls"), hallucination/groundedness (LLM09-ish — `reviewing-ai-output-groundedness`), bias (responsible-AI pass), and RAG-specific: context injection, **data poisoning** of the retriever corpus, **source attribution** (can the answer be traced to a retrieved source — citation checks). Each maps to a guardrail + an adversarial case, not to a hope in the system prompt.
- **Named attack strategies.** Meta-style jailbreaks, **Hydra** (multi-turn escalation), **Crescendo** (gradual boundary erosion) are multi-turn strategies: they exist in Promptfoo's strategy set and in this collection as multi-turn adversarial cases in `test-llm-guardrails` / `testing-multi-turn-conversations`. The point is not the name — it is that single-turn attacks miss what multi-turn conversation state enables, so both layers must be in the suite.
- **Reports and regression.** An attack that "passed" means the harmful output or tool call actually happened — read the report per case, not the aggregate percentage. Make the suite repeatable and gate on it: committed adversarial corpus + pinned model + CI run = AI security regression tests (`testing-llm-features` gate, `automating-ci-test-pipelines` for the CI-only retry policy so flaky attacks are reported, not retried green).

## Mapping to the DeepEval + pytest course outline

Same syllabus as a DeepEval/pytest course, expressed as this collection's skills. Section-by-section:

- **Section 1 — Getting Started with DeepEval** → `testing-llm-features` + `design-llm-eval-suite` (eval suite as committed files, not a notebook)
- **Section 2 — Running Local LLMs with Ollama** → tooling note above + `python-for-testers` (venv/uv, pinned local model = determinism)
- **Section 3 — LLM-as-a-Judge with local models** → the judge-rubric pattern in `testing-llm-features` ("an LLM judge without a rubric is a random number with an API bill"); a local pinned model via Ollama is the judge when cloud calls are not allowed — same rule: rubric first, model second. **Gap:** the named "LLM-as-a-Judge" technique with a local judge is only implicit here
- **Section 4 — Testing real LangChain applications** → tooling note above (LangChain = orchestration, not a test tool); app-level behavior is tested through `testing-llm-features` (golden cases per chain) and tool-call safety through `testing-llm-guardrails`. **Gap:** no dedicated "LangChain app as AUT" guide
- **Section 5 — Test Cases, Datasets & Goldens** → LLMTestCase ≈ golden case, dataset ≈ seeded eval fixtures (`test-data-factories`), Golden ≈ committed baseline the gate diffs against
- **Section 6 — Metrics + Custom Metrics** → built-in metrics ≈ judge rubrics in `testing-llm-features`; **custom metrics ≈ your own rubric with a stated definition of "good"** — cheapest deterministic check first, LLM judge only where a human would also need judgment. **Gap:** "write your own metric in pytest" as a pattern is thin here (1 mention)
- **Section 7 — Application Under Test (AUT)** → the AUT is just the system under test: wrap it behind a typed client (HTTP endpoint, CLI, function) so the eval can call it deterministically; the wrapper is where retries/timeouts/auth live, not in the eval
- **Section 8 — End-to-End testing with pytest + DeepEval** → pytest runs the evals as ordinary tests (`pytest tests/evals/`); the gate is CI: `pytest -n auto` + coverage + report (`automating-ci-test-pipelines`, `test-reports-and-artifacts`). **Gap:** no ready-made "eval-as-pytest-test" harness in this collection — the pieces exist, the wiring pattern is not written down
- **Section 9 — Advanced pytest patterns** → `python-for-testers` + `resources/pytest-project-config.md` (fixture scopes, conftest hierarchy, markers, xdist, rerunfailures as CI-only flake reporting)
- **Section 10 — Conversational chatbots** → `testing-multi-turn-conversations` (multi-turn golden cases, session state, per-turn assertions)
- **Section 11 — RAG systems** → `evaluating-rag-retrieval` (retrieval before generation; context precision/recall first-class)
- **Crash course pytest basic→advanced** → `python-for-testers` is the "basic"; the "advanced" (plugins, hooks, custom fixtures at scale) is covered piecemeal in `pytest-project-config.md`. **Gap:** no single progressive pytest curriculum

Net: the collection covers the concepts behind every section; what it does not have is the DeepEval-specific wiring (custom metrics in pytest, eval-as-test harness, LangChain AUT pattern) — those are the three places a course would go beyond what is written down here.

## Mapping to the GenAI agents & multi-agent course outline

A course about building QA agents with GenAI (LangChain tools, RAG agents, AutoGen multi-agent) maps onto this collection's own orchestration model. Point by point:

- **GenAI / AI Agents / Multi-Agent Systems core concepts** → `ai-concepts-for-testers` (glossary, concept-to-skill map) + `orchestration-basics` (the minimal orchestrator + helpers pattern — read this before any framework)
- **Open-source LLMs locally via Ollama (no paid API)** → tooling note above + `python-for-testers`; pinned local model = free, deterministic agent brain for dev loops
- **LangChain for QA tools/agents** → tooling note above: LangChain is orchestration, the testable units are the tools; custom tools (PDF reader, log parser, test-case writer) are just functions behind a typed interface, tested like any other unit (`writing-unit-tests`). **Gap:** no ready-made "QA toolbelt" tool implementations
- **Custom tools: read PDFs, parse logs, generate test cases** → PDF handling exists for uploads (`testing-file-uploads-and-exports`); **log parsing / log-analyzing agent: gap**; test-case generation from requirements → `test-generator` + `beyond-codegen` (design scenarios → human review → code)
- **Vector stores + embeddings** → tooling note above + `evaluating-rag-retrieval`: pin the embedding model, seed the index from fixtures, assert top-k on known queries
- **RAG-powered log-analysis agent** → composition of the two above (retrieval over logs + generation); **gap** as a named pattern — the pieces are here, the "RAG over logs" recipe is not
- **Test Case Generator Agent from requirements** → `test-generator` / `designing-functional-tests` / `beyond-codegen`; in agent form this is a one-agent pack — see `orchestration-basics` for the minimal shape. **Gap:** no turnkey "requirements in → test cases out" agent
- **Playwright with agents (scraping, behavior testing)** → `playwright-explore-website` + `qa-mcp` (Playwright MCP server) driven by pack agents (`ui-api-automation`); **web scraping as a goal: gap** — exploration yes, scraping no
- **AutoGen / AutoGen Studio multi-agent orchestration** → **gap**: no AutoGen; the collection's answer is its own packs (`orchestration-basics`, `plan-explore-review-commit`, `ui-api-automation`) — orchestrator + narrow subagents + handoff contract instead of a framework. Same idea, different vehicle: prefer the pack when the workflow is fixed, reach for AutoGen-style frameworks when agents must negotiate dynamically
- **Fully automated agents: requirements → test cases** → closest is `ui-api-automation` (explore → plan → implement → run) and `beyond-codegen` (human review gate before codegen). The collection deliberately keeps a human approval in the loop — "minimal human input" is a design choice here, not an omission
- **Multi-agent QA systems mimicking real QA workflows** → `plan-explore-review-commit` (planner, architect, implementer, reviewer, QA strategist as separate agents) — this is the collection's multi-agent QA workflow, reviewable phase by phase

## Build-side frameworks (LangChain/LangGraph/LangSmith) vs the test side

Courses teach the build side — LangChain chains, `RunnableParallel`, `ChatMessageHistory`, Streamlit chatbots, LangGraph `StateGraph`/`MessagesState`/`ToolNode`/conditional edges/fan-out/subgraphs, LangSmith tracing, ChromaDB. This collection deliberately does not re-teach those frameworks; it maps each build-side concept to what a **tester** does with it:

- **StateGraph / MessagesState / agent memory** → conversation state is tested as multi-turn behavior: `testing-multi-turn-conversations` (multi-turn golden cases, per-turn assertions, session state)
- **ToolNode / tool calling / custom tools** → `testing-llm-guardrails`: tool-call authorization, fail-open checks, injection through tool results — "the prompt said not to" is not a control
- **Fan-out/fan-in, RunnableParallel, conditional edges, routing** → more execution paths in the app = more coverage obligations; on the test side that means parallel/sharded CI runs (`automating-ci-test-pipelines`), not testing the graph itself
- **Subgraphs / sub-agents / parent-agent architectures** → the collection's own packs are the test-side equivalent: orchestrator + narrow subagents + handoff contract (`orchestration-basics`, `plan-explore-review-commit`)
- **LangSmith / LangSmith Studio (tracing, debugging)** → observability of the shipped app: `monitoring-llm-in-production` + run history in `test-reports-and-artifacts`
- **ChromaDB / vector store / embeddings** → tooling note above: pin the embedding model, seed the index from fixtures, assert top-k on known queries (`evaluating-rag-retrieval`)
- **Streamlit / chatbot UI** → UI tested through the browser (`qa-mcp` Playwright MCP, `writing-playwright-tests-best-practices`); conversation logic through multi-turn evals

Rule: if a course section teaches you to **build** with LangChain/LangGraph, the corresponding skill here teaches you to **test** what that build produces.

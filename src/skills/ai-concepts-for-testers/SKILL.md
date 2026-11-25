---
name: ai-concepts-for-testers
description: "Introduction to AI concepts for testers before they test AI-powered features: what an LLM is (tokens, context window, temperature, determinism), prompts and system prompts, RAG (embeddings, chunking, retrieval), agents and tool calling, MCP servers and tools, hallucination vs groundedness, guardrails, evals, and cost/latency basics — plus a map from each concept to the skill in this collection that tests it. Use when onboarding testers to AI products, leveling up a QA team on AI terminology, or planning what an AI feature needs tested. For testing a specific LLM feature, start at testing-llm-features."
argument-hint: "Team's current AI familiarity and the AI-powered feature/product to be tested"
user-invocable: true
---

# AI Concepts for Testers

You do not need to build models to test them — but you need the vocabulary and the failure modes. This skill is the shared language layer: every concept below names **what can go wrong** and **which skill in this collection covers testing it**. Full glossary in `./resources/glossary.md`, concept→skill map in `./resources/concept-to-skill-map.md`.

## The mental model

An AI-powered feature is: **a prompt + a model + (optionally) retrieved documents + (optionally) tools/agents** → output that a user acts on. Testing it means testing each link and the seams between them, not just "does it answer".

## Concepts, in order of importance for QA

1. **LLM basics.** A model predicts text token by token; it has a **context window** (max input+output tokens) and is **not deterministic** — same prompt can yield different outputs (temperature controls randomness; tests must not assert exact free text unless temperature is 0 and even then prefer structure). Tokens ≈ words/4 for English — cost and latency scale with tokens.
2. **Prompts.** The system prompt sets behavior; the user prompt carries the request. Prompt changes are **code changes** — they need regression tests (`design-llm-eval-suite`).
3. **RAG (Retrieval-Augmented Generation).** The app embeds documents, retrieves the most similar chunks at query time, and injects them into the prompt. Failure modes: wrong chunk retrieved, stale index, chunk too large/small. Test with `evaluating-rag-retrieval`.
4. **Agents and tool calling.** The model decides to call tools (search, DB, HTTP) in a loop until it answers. Failure modes: wrong tool, wrong arguments, infinite loop, tool result ignored. Test with `testing-llm-features`, guardrails with `test-llm-guardrails`.
5. **MCP (Model Context Protocol).** A standard for exposing tools/resources to AI clients as "MCP servers" — this collection ships Playwright, Chrome DevTools and k6 MCP servers in the `qa-mcp` bundle, so agents can drive a browser and run load tests. QA angle: MCP tools are untrusted input surfaces — see `test-llm-guardrails`.
6. **Hallucination vs groundedness.** A hallucination is a confident, unsupported claim. **Groundedness** = every claim traceable to a source (retrieved doc, tool result). Test with `reviewing-ai-output-groundedness`.
7. **Guardrails.** Runtime validation around model output: schema conformance, PII leakage, moderation, refusal behavior, tool-call safety — plus adversarial tests (prompt injection, jailbreaks, indirect injection via retrieved documents). `test-llm-guardrails`.
8. **Evals.** A repeatable scored test set for LLM outputs (golden cases, rubric scoring) that gates prompt/model/retrieval changes — the LLM equivalent of a regression suite. `design-llm-eval-suite`.
9. **Observability, cost, latency in production.** Log prompts/outputs (redacted), track token spend and latency, alert on drift. `monitoring-llm-in-production`, `testing-llm-cost-and-latency`.
10. **Multi-turn conversations.** State across turns (context, memory) — test whole conversations, not single prompts. `testing-multi-turn-conversations`.

## How to read an AI feature as a tester

Ask, in order: What is the prompt and where does it live? What documents/tools can the model see or call? What is the output contract (schema, tone, refusal rules)? What is logged? Each question maps to a skill in the map — that is your test plan skeleton.

## Red Flags

- testing only happy-path prompts — the interesting failures are adversarial and edge inputs
- asserting exact output text of a non-deterministic model — assert structure/invariants, or use evals with rubric scoring
- no eval suite, so every prompt tweak is "verified by eyeballing" — that is not verification
- retrieved documents treated as trusted — they are an injection vector (`test-llm-guardrails`)
- ignoring cost/latency until production complains — token spend is a testable budget (`testing-llm-cost-and-latency`)

## Related Skills

- `testing-llm-features` - the entry point for testing one LLM-powered feature
- `design-llm-eval-suite` - build the eval regression gate
- `evaluating-rag-retrieval` - RAG-specific quality metrics
- `test-llm-guardrails` / `testing-llm-guardrails` - runtime validation + adversarial suite
- `reviewing-ai-output-groundedness` - claim-by-claim verification protocol
- `monitoring-llm-in-production` - observability after launch
- `testing-agent-skills` - testing skills/agents as products
- `unslop-answers` - cutting AI-tells from AI-generated reports and answers

## Definition of Done

- the team shares one vocabulary for LLM/RAG/agent/MCP/eval concepts (glossary circulated)
- for the AI feature under test, each relevant concept has a named test approach from the concept→skill map
- the feature has an eval suite or a written reason why eyeballing is acceptable (it usually is not)
- prompt/tool/retrieval changes are gated by evals, not by manual spot checks

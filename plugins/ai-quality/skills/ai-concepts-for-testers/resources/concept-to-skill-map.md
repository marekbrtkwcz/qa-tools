# Concept → skill map: what tests each AI concept in this collection

Use as a test-plan skeleton: for the AI feature under test, tick every row that applies and assign the named skill.

| AI concept / surface | Failure mode to test | Skill in this collection |
| --- | --- | --- |
| Prompt (system/user) | regression on prompt edits, injection | `design-llm-eval-suite`, `testing-llm-features` |
| Model output quality | hallucination, tone, format | `testing-llm-features`, `design-llm-eval-suite` |
| Output schema/structure | invalid JSON, missing fields | `test-llm-guardrails` (schema conformance) |
| RAG retrieval | wrong/stale chunk, bad chunking | `evaluating-rag-retrieval` |
| Retrieved documents as input | indirect prompt injection | `test-llm-guardrails` (adversarial suite) |
| Agent tool calls | wrong tool, wrong args, loops | `testing-llm-features`, `test-llm-guardrails` (tool-call safety) |
| MCP servers (browser, k6…) | unauthorized tool use, bad args | `test-llm-guardrails`, `qa-mcp` bundle |
| Guardrails / moderation | bypass, PII leakage, overblocking | `test-llm-guardrails`, `testing-llm-guardrails` |
| Groundedness / citations | unsupported claims, missing citations | `reviewing-ai-output-groundedness` |
| Multi-turn conversation | state leaks, memory bugs | `testing-multi-turn-conversations` |
| Cost & latency | token spend regression, slow responses | `testing-llm-cost-and-latency` |
| Production behavior | drift, incidents, log quality | `monitoring-llm-in-production` |
| Skills/agents as products | activation, collisions, output contract | `testing-agent-skills` |
| AI-generated text in reports | AI-tells, unsupported claims | `unslop-answers` |

Rule: if a row applies and has no test yet, that is a coverage gap — file it against the mapped skill before calling the feature done.

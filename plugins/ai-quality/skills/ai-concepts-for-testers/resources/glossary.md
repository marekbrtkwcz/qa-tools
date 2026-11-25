# AI glossary for testers

One line per term, written for a QA audience: what it is + what can fail.

| Term | What it is | What can fail / test angle |
| --- | --- | --- |
| LLM | Large language model: predicts the next token given previous tokens | non-determinism, hallucination, cutoff knowledge — test with evals, not exact text |
| Token | A chunk of text the model processes (~4 chars of English) | context window limits, cost per token — budget tests |
| Context window | Max tokens (input + output) the model can see at once | truncation of long docs/conversations — test long inputs |
| Temperature | Randomness knob (0 = most deterministic) | even at 0, assert structure not exact strings |
| System prompt | Hidden instruction that steers behavior | prompt injection, drift on edits — regression-test prompt changes |
| Prompt injection | Malicious instructions smuggled in user input or retrieved docs | direct + indirect injection — adversarial guardrail tests |
| RAG | Retrieval-Augmented Generation: fetch relevant doc chunks, inject into prompt | wrong/stale chunk retrieved, chunking quality — retrieval evals |
| Embedding | Numeric vector representing text meaning | poor similarity → wrong retrieval |
| Chunking | Splitting documents into indexable pieces | too big = diluted context; too small = lost context |
| Agent | LLM in a loop that plans, calls tools, observes results | wrong tool/args, loops, ignored errors |
| Tool calling | Model emits a structured call to an external function | schema violations, unsafe calls — validate args before execution |
| MCP | Model Context Protocol: standard way to expose tools to AI clients | tool surface = untrusted input; authz on every tool |
| Hallucination | Confident output not supported by any source | groundedness checks, citation verification |
| Groundedness | Every claim traceable to a source | missing citations, paraphrased-away caveats |
| Guardrail | Runtime check on model output (schema, PII, moderation, refusals) | bypass via jailbreak — adversarial suite needed |
| Eval | Scored test set for LLM outputs (golden cases + rubric) | eval drift after prompt/model change; rubric gaming |
| Fine-tuning | Training the model on your data | overfitting, cost — usually RAG first |
| Embedding model | Model that produces vectors for retrieval | version skew between index and query model |
| Latency / TTFT | Time to first token and total response time | SLOs on p95 — perf tests for LLM endpoints |
| Token cost | Price per input/output token | cost regression per feature — track spend per run |
| Drift | Model/provider behavior changing under you (version bumps) | pin versions in evals; alert on output distribution shift |
| Moderation | Filtering harmful inputs/outputs | false positives/negatives — test the filter itself |
| PII leakage | Personal data in prompts, logs, or outputs | redaction before logging; guardrail tests with canary PII |
| Multi-turn | Conversation state across messages | context accumulation, memory bugs — test whole sessions |
| Function calling schema | JSON schema describing callable tools | model emitting invalid JSON — schema-validate every call |

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
| LangChain | Framework for building LLM apps: chains, prompt templates, tools, agents | every chain is a prompt — regression-test chain/prompt edits; version bumps change behavior |
| Chain / Runnable | Composable unit of an LLM pipeline (prompt → model → parser) | output of one stage is input of next — assert at stage boundaries |
| RunnableParallel | Runs multiple runnables concurrently, merges results | race conditions, partial failure if one branch errors — test each branch + merged output |
| ChatMessageHistory | Stores conversation messages for context | unbounded growth → context overflow; stale state between sessions — multi-turn tests |
| Streamlit | Python UI framework often used for LLM chat demos | UI logic mixed with prompts — test logic separately, UI via Playwright |
| LangGraph | Stateful graph framework for agents (nodes, edges, StateGraph) | graph state creates many execution paths — test every conditional branch and state transition |
| StateGraph / MessagesState | Graph + message-list state definition in LangGraph | state validation gaps, invalid transitions — test state schema and each edge |
| Conditional edge | Routing in a graph based on state | untested branch = silent wrong path — enumerate branches, test each |
| Fan-out / Fan-in | Parallel split of work, then merge in a graph | partial failures swallowed at merge; ordering assumptions — test failure of each parallel branch |
| Subgraph | A graph nested as a node in a parent graph | test subgraph in isolation + integration at the parent boundary |
| ToolNode | LangGraph node that executes tool calls | same as tool calling: schema-validate args, authz before execution, log every call |
| Agent memory | Persistent state an agent carries across turns/sessions | stale or leaked memory between users — test memory isolation and eviction |
| LangSmith / LangSmith Studio | Platform for tracing, debugging, evaluating LLM apps | traces are observability input, not tests — mirror critical evals into committed eval suites |
| ChromaDB | Open-source vector store for embeddings | embedding-model version skew, index drift — pin versions, assert top-k on known queries |
| Prompt engineering | Crafting instructions to steer model output | brittle prompts — regression evals on prompt changes, not manual eyeballing |
| Context engineering | Designing what goes into the model's context window (not just the prompt) | context overflow, wrong chunk priority — test long inputs and retrieval ranking |

---
name: testing-multi-turn-conversations
description: 'Tests LLM conversations across turns: state and instruction persistence, context-window limits, memory of earlier facts, tool calls across turns, and graceful degradation at the limit. Use when a chatbot or agent loses instructions after a few turns, forgets earlier facts, or degrades as the conversation grows.'
argument-hint: 'The conversational feature (chatbot/agent), its system prompt, the context window limit, and the scenarios in scope'
user-invocable: true
---

# Testing Multi-Turn Conversations

Use this skill when the feature is a conversation, not a single call. Multi-turn failures are distinct: the model forgets the system prompt, drops a fact from turn 3 by turn 8, calls tools with stale arguments, or degrades when the context window fills. Single-turn evals (`testing-llm-features`) do not catch these.

## When to Use

- a chatbot/agent loses instructions or facts over turns
- long conversations degrade (slower, lower quality, higher cost — see `testing-llm-cost-and-latency`)
- tool-using agents repeat or mis-call tools across turns
- context-window limit behaviour is unknown (truncation vs error vs silent loss)

## Operating Principles

- **Script the conversation, assert per turn.** A multi-turn case is a sequence of user turns with expected behaviour per turn — not one prompt and one answer.
- **State is the contract.** Facts established early (name, preference, decision) must hold at turn N; test recall explicitly.
- **Context limit is a designed behaviour.** Decide: truncate, summarize, error, or sliding window — then test that it does what was designed.
- **Tool calls across turns must use current state.** A tool called at turn 8 with arguments from turn 2 is a bug.
- **Determinism where possible:** fixed temperature/seed for eval runs; record it.

## Workflow

### Phase 1: Define conversation scenarios

- per scenario: a scripted sequence of turns, the facts/instructions that must persist, the expected response per turn, and any tool calls expected
- include: simple Q&A chain, task with constraints, correction ("no, I meant X"), long task (10+ turns)

### Phase 2: Run and assert per turn

Work through `./resources/multi-turn-checklist.md`:

- instruction persistence: system-prompt rules still followed at turn N
- fact recall: established facts answered correctly later
- corrections override earlier turns
- tool-call arguments reflect the latest state, not stale context
- context limit: behaviour at the window edge matches the design (truncate/summarize/error), no silent wrong answers
- cost/latency growth across turns recorded (`testing-llm-cost-and-latency`)

### Phase 3: Automate as regression cases

- each scenario is a golden conversation in the eval suite (`testing-llm-features`); run on prompt/model/memory changes
- score per turn (pass/fail per assertion), not one verdict per conversation

## Resource Map

- `./resources/multi-turn-checklist.md` - the per-turn assertion matrix. Read during Phase 2.

## Related Skills

- `testing-llm-features` - single-turn golden evals and the eval harness these plug into
- `testing-llm-guardrails` - injection over multi-turn (user steering the agent across turns)
- `testing-llm-cost-and-latency` - context growth cost
- `evaluating-rag-retrieval` - when retrieval is part of each turn

## Definition of Done

This skill is complete when:

- conversation scenarios exist with per-turn assertions (instructions, facts, corrections, tools)
- recall and instruction persistence verified at later turns, not just turn 1
- context-limit behaviour tested and matches the design
- scenarios run as golden cases in CI on prompt/model changes, scored per turn

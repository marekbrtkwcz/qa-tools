---
name: creating-knowledge-folders
description: "Creates knowledge assets — long-form reference documents the agent loads on demand: what belongs in knowledge rather than a skill or a rule, the first-paragraph-becomes-the-description contract, provenance and licence notes, and the bundle wiring that makes the knowledge visible or invisible at runtime. Use when a method needs more depth than a skill body, when an orchestration pack needs its GUIDE, or when the same reference material keeps being pasted into prompts. For an asset that must trigger on requests, use creating-skills; for standing rules, use creating-instructions."
---

Create a knowledge asset: a durable reference document the agent reads when it needs the depth, not something that competes for attention on every turn.

## When to Use

- reference material too large or too stable to inline into a skill body (methodology deep-dives, protocol details, catalogues the model cannot guess)
- an orchestration pack needs its GUIDE — how the workflow runs, step by step, next to the driver skill and the agents
- a domain reference keeps being re-typed or pasted into prompts, or two skills carry drifted copies of the same explanation
- a team's hard-won context (what the audit found, why the architecture is the way it is) should live where agents can load it

## When NOT to Use

- the asset must **trigger on requests** — a skill's description is the router; knowledge loads by explicit reference, not by matching a request (`creating-skills`)
- a fixed workflow with steps and an output contract — that is a skill (`creating-skills`) or a command (`creating-prompts`)
- standing rules the agent applies without being asked — that is instructions (`creating-instructions`)
- transient facts: changelogs, roadmaps, meeting notes. Knowledge must be durable or it rots in place and quietly misleads every load
- something a tool already answers (`--help`, the repo docs, a lint error). Point at it; do not copy it

## Where you are writing

| Writing for | Source | Check |
| --- | --- | --- |
| **This collection** | `src/knowledge/<name>.md`, declared under `knowledge:` in the bundle's `bundles.yaml` entry (see the repository's `CONTRIBUTING.md`, "Knowledge") | `npm run check` — it warns when the first paragraph crosses 297 characters, because the build slices it into the runtime description |
| **A user's project** | The host's knowledge or docs-on-demand location; where none exists, a plain `docs/` file the skills reference with a read-when condition | Load it once from a real task and check the agent stopped quoting its own guesses |

At runtime the build publishes the document as a knowledge folder (`ai.mistral.vibe/knowledge/<name>/KNOWLEDGE.md` in the plugin) with the description the host shows next to it. In an orchestration pack, the GUIDE is the bundle's `knowledge:` entry — the driver skill, the agents and the GUIDE together are the pack (`creating-orchestration-packs`).

## What makes good knowledge

- **The first paragraph is the description, so write it as one.** One or two sentences: what the document covers and when to load it. Under 297 characters, or the build's slice cuts it mid-thought — and the sliced stub is all the reader sees when deciding whether to open the file.
- **One document, one topic.** A knowledge file answers one family of questions; cross-link instead of merging. "Everything about testing" is three documents pretending to be one.
- **Depth, not repetition.** The skill bodies stay lean; knowledge is where the long explanations, catalogues and worked examples live. If a sentence could sit in the skill body without hurting its leanness, it should.
- **Durable, dated, attributed.** Facts that expire get a "last verified" date and an owner; borrowed material gets provenance and a licence note in the document.
- **Structured for loading, not for cover-to-cover reading.** Headings that name the question the reader brings; no narrative throat-clearing; examples near the rules they illustrate.
- **No secrets, no environment captures.** Knowledge gets committed, copied and shipped. Point at config instead of restating it.

## Workflow

1. **Settle the slot.** Name the reader's question in one sentence ("how do we evaluate RAG retrieval quality without a golden set?"). If the answer is a workflow, a skill fits better — stop and route there (`creating-skills`).
2. **Check the neighbours.** List the collection's knowledge and skills nearby; if one already covers the topic, extend it instead of adding a near-duplicate.
3. **Write the first paragraph last-but-one.** Draft the body, then compress what it covers into the description paragraph and check it survives the 297-character slice.
4. **Wire it.** In this collection: the source lands in `src/knowledge/<name>.md`, the name goes under `knowledge:` in the owning bundle, and `npm run check` must pass clean — including the slice warning. Reusable knowledge belongs to the bundle whose skills load it.
5. **Prove it loads.** Start a session and load it from a real task: the description showed up, the agent opened the document, quoted it instead of improvising, and the task got further than without it.

## Resource Map

- [`resources/knowledge-quality-checklist.md`](resources/knowledge-quality-checklist.md) — read when the document is drafted and needs one pass before wiring it into the bundle.

## Definition of Done

- One topic, one file; the reader's question names itself in a heading.
- The first paragraph is under 297 characters and works as a standalone description.
- Nothing in it expires silently: dated facts carry a date, borrowed facts carry provenance and a licence note.
- The skills that need it reference it by name with a read-when condition; nothing links to it blindly.
- This collection: the `bundles.yaml` `knowledge:` entry exists and `npm run check` passes. A user's project: the file loaded from one real task and changed the answer the agent gave.

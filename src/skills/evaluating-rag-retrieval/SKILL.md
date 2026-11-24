---
name: evaluating-rag-retrieval
description: 'Evaluates the retrieval half of a RAG system: chunk quality and boundaries, recall@k and precision@k against a golden set of query→document pairs, reranker effectiveness, and source attribution in answers. Use when answers cite the wrong documents, miss relevant ones, or when the index/chunking/embedding changes and retrieval quality must be regression-checked before the LLM layer is even involved.'
argument-hint: 'The RAG pipeline (index, chunker, embedder, reranker), the golden query set, and the retrieval endpoint or function to test'
user-invocable: true
---

# Evaluating RAG Retrieval

Use this skill when the question is "did the right documents come back" — independent of how well the LLM used them (that is `reviewing-ai-output-groundedness` and `testing-llm-features`). Retrieval regressions are silent: the LLM still answers fluently, just from the wrong sources.

## When to Use

- RAG answers cite wrong or missing sources
- chunking, embedding model, index, or reranker changed and needs a regression check
- a golden set of query→expected-documents exists (or needs building)
- retrieval latency or cost per query is in question

## Operating Principles

- **Retrieval is measurable without the LLM.** recall@k / precision@k / MRR against a golden set are deterministic metrics — run them in CI on pipeline changes.
- **The golden set is the asset.** Queries a real user would ask, each mapped to the documents that must come back; built from logs, support tickets, and known answers.
- **Chunk boundaries are where recall dies.** Overlap, size, and semantic splitting matter more than the embedder brand; test chunk quality directly.
- **Reranker helps only if first-stage recall is decent.** Measure both stages separately.
- **Attribution must be checkable.** Every cited source in an answer should be a retrieved document; invented citations are a finding.

## Workflow

### Phase 1: Build or refresh the golden set

- collect realistic queries (logs, tickets, FAQs); per query, list the documents/chunks that must be retrieved
- target: enough queries to catch regressions (start 50–200), spanning easy and hard cases
- version the golden set like code

### Phase 2: Measure retrieval metrics

Work through `./resources/retrieval-eval-checklist.md`:

- recall@k and precision@k per query, aggregated; MRR for "first relevant doc" quality
- per-query failures listed: which expected doc missed, what came back instead
- chunk quality: boundary cases (a fact split across chunks), duplicate content, stale documents in the index
- reranker on/off comparison on the same first-stage results

### Phase 3: Regression-gate pipeline changes

- on chunker/embedder/index/reranker change: run the golden set, compare metrics against the baseline; a drop beyond a threshold blocks the change
- track retrieval latency p95 and cost per query alongside quality

### Phase 4: Attribution check

- sample answers: each citation maps to a retrieved document id; hallucinated citations counted as a defect

### Phase 5: Report

- metrics table (baseline vs current), per-query failure list, chunk-quality findings; feed answer-quality review to `reviewing-ai-output-groundedness`

## Resource Map

- `./resources/retrieval-eval-checklist.md` - golden-set format and the metric/check matrix. Read during Phases 1–3.

## Related Skills

- `testing-llm-features` - golden-case evals for the full LLM feature, including the generation half
- `reviewing-ai-output-groundedness` - human groundedness review of answers
- `testing-llm-guardrails` - injection through retrieved documents
- `testing-llm-cost-and-latency` - retrieval cost/latency budget checks

## Definition of Done

This skill is complete when:

- a versioned golden set of query→expected-documents exists
- recall@k / precision@k / MRR measured and baselined; reranker on/off compared
- chunk-boundary failure cases identified; stale/duplicate index content checked
- pipeline changes are gated on metric regression in CI
- citation attribution sampled: no invented sources

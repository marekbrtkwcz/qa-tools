---
name: reviewing-ai-output-groundedness
description: 'Human review protocol for whether AI output is grounded in its sources: claim-by-claim attribution, hallucination verdict classes, citation verification, defensible sampling, and a recorded attestation because groundedness cannot be fully automated. Also covers the responsible-AI pass — harmful output, bias, disclosure, privacy, confidence calibration. Use when checking whether RAG answers or summaries are supported by the retrieved documents, when factuality matters more than fluency, or when an eval suite needs the human check it cannot replace. Adapted from jaktestowac/awesome-agents-for-quality.'
user-invocable: true
---

# 🔍 Reviewing AI Output Groundedness

An eval suite catches structural regressions and can approximate faithfulness with a judge. It cannot tell you whether a confident, fluent, well-cited paragraph is quietly wrong in a way that matters to this domain. That judgement is human, sampled rather than exhaustive, and ends in an **attestation**, never a pass. Fluency is the trap: ungrounded output does not look broken — it looks better than grounded output, because nothing in it is hedged.

## 🎯 When to Use

- a RAG, summarisation, extraction, or research feature is going in front of users
- output is used to make a decision: medical, legal, financial, operational
- an eval suite reports high faithfulness and someone is not convinced
- users report answers that were "wrong but sounded right"
- a release needs a factuality attestation, not just a score
- a responsible-AI review is required before launch

## 🧭 Operating Principles

- **A claim is the unit, not the answer.** A four-sentence answer contains eight claims; reviewing "the answer" misses the invented one every time.
- **Grounded means present in the retrieved source** — not "true", not "plausible". A claim that is true but absent from the sources is still ungrounded: the system got lucky.
- **Citations are checked, not counted.** A citation that does not support its claim manufactures confidence.
- **Sample defensibly and say how** — size, selection method, claimed confidence. A convenience sample of ten happy-path outputs supports no conclusion.
- **Classify, don't just flag** — fabrication, unsupported inference, conflation, stale source, omission need different fixes.
- **Omission is a groundedness failure.** A summary that drops the one caveat that mattered is faithful to the source and useless to the reader.
- **Absence of a source is a required behaviour.** "The documents do not say" is a correct answer; a feature that cannot produce it will invent instead.
- **The output is an attestation with limitations**, never a percentage presented as a guarantee.

## 🔄 Workflow

### Phase 0: Fix the factuality bar

Before reading a single output, write down what the domain requires (from the domain owner, not the reviewer): which claim types must be exactly right (numbers, dates, names, identifiers, prices), which may be paraphrased, whether every claim needs a citation, what to do when sources are silent or contradict, who is harmed by a confident wrong answer. A triage summariser and a clinical-notes summariser have the same architecture and completely different bars.

### Phase 1: Build the sample

20–30 outputs is a working review; below ten you are collecting anecdotes. A defensible sample includes each of: **random** outputs from real traffic (the baseline, usually missing), **hard** cases (long/contradictory/sparse sources, multi-document synthesis), **high-stakes** cases (claims that would cause harm if wrong), **user-reported** cases (complaints are pre-labelled findings). Each output must come with **the sources actually retrieved for it** — reviewing against the corpus instead of its own retrieval measures the wrong system.

### Phase 2: Decompose and verify, claim by claim

Split each output into atomic claims and verify each against the retrieved sources:

| Verdict | Meaning |
| --- | --- |
| **Grounded** | stated in a retrieved source; cite the location |
| **Unsupported inference** | follows from the sources but not stated |
| **Fabricated** | not in the sources and not derivable |
| **Contradicted** | the sources say otherwise |
| **Conflated** | merges two sources/entities into one wrong statement |
| **Stale** | correct in an outdated source that was retrieved |
| **Unverifiable** | cannot be checked from the available sources |

Then check **citations separately**: does each cited source exist, was it retrieved, and does it support the specific claim attached? A real document making a different point is the most damaging failure — it survives every automated check. Finally check **omission**: caveats, conditions, exceptions, "applies only to X" clauses.

### Phase 3: Separate retrieval from generation

For every ungrounded claim, attribute the layer: right document never retrieved → **retrieval** (index/chunking/query); retrieved and misread → **generation** (prompt/model); retrieved and correct but output contradicts → **generation**, the worst kind; no document exists → **coverage** (the feature should say so). Skipping this is how teams spend weeks on prompt engineering to fix an indexing bug.

### Phase 4: Responsible-AI pass

While the sample is open: harmful/unsafe content, bias across groups where the domain makes that meaningful, privacy leakage into output, disclosure (does the user know it is AI-generated and can be wrong), appropriate refusal, and **confidence calibration** — output that hedges well-supported claims and states thin ones flatly is actively misleading even when technically grounded. Scoped to a tester's judgement, and it says so.

### Phase 5: Attest

Record the review as an attestation (`attesting-manual-verification`), never a score: feature, model, sample size, selection method, date; claim-level results by verdict class; citation accuracy (checked, not counted); omissions; retrieval-vs-generation attribution; responsible-AI findings; **limitations**; the factuality bar and whether it was met. Then feed what is mechanisable back into the eval suite: every fabricated or contradicted claim becomes a permanent regression case (`llm-testing`) — that is how human review compounds instead of evaporating.

## ⚠️ Common Failure Modes

Reviewing answers instead of claims; grading against your own knowledge (true-but-absent is ungrounded); counting citations; reviewing against the corpus, not the retrieval; convenience samples; ignoring omission; no factuality bar (every reviewer applies their own); a percentage as a guarantee; not feeding findings back into evals.

## ✅ Definition of Done

- the factuality bar is written down and came from the domain owner
- the sample is stated with size and selection method, including random, hard, high-stakes, and user-reported cases
- every output reviewed claim by claim against the sources actually retrieved for it
- each ungrounded claim carries a verdict class and a retrieval-vs-generation attribution
- citations verified for support, not counted; omissions recorded as findings
- responsible-AI pass run and reported
- result is an attestation with explicit limitations, not a bare percentage
- every fabricated/contradicted claim became a regression case in the eval suite

## 🔗 Related Skills

- `llm-testing` + `ai-product-qa` knowledge — the automated layer; findings here become eval cases there
- `attesting-manual-verification` — where this review's attestation lives and how it expires
- `qa-best-practices` — filing individual groundedness failures as bugs with evidence
- `quality-gates` — the attestation is release evidence, with its limitations attached
- `test-data-management` — real outputs and sources often contain personal data

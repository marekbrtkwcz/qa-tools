# Retrieval evaluation checklist

## Golden set format (versioned)

```yaml
- query: "how do I reset my password?"
  must_retrieve: ["docs/auth/reset.md", "docs/faq/account.md"]
  nice_to_retrieve: ["docs/auth/mfa.md"]
- query: ...
```

## Metrics per golden set

| Metric | Meaning | Gate |
| --- | --- | --- |
| recall@k | expected docs found in top k | drop > threshold blocks change |
| precision@k | top k are relevant | report |
| MRR | rank of first relevant doc | report |
| p95 latency, cost/query | retrieval stage only | budget |

## Chunk quality cases

- fact split across two chunks → both retrieved or answer degrades (note)
- duplicate/near-duplicate content in index → dedup check
- stale document still indexed after source deleted → freshness check
- reranker on vs off on identical first-stage results

## Attribution

- sample answers: every citation maps to a retrieved doc id; count invented citations

# Database performance checklist

Per hot query, record: query, EXPLAIN summary, p95 at volume, budget, result.

## EXPLAIN ANALYZE reading

| Signal | Meaning | Action |
| --- | --- | --- |
| Seq Scan on big table | missing index | candidate index; re-measure |
| Rows scanned >> rows returned | bad selectivity | index on filter columns, or query rewrite |
| Temp files / sort in memory overflow | sort spills to disk | index matching ORDER BY, or more work_mem (record) |
| Nested loop with large inner | join order problem | index inner side, or restructure join |

## Patterns

| Pattern | Detection | Fix |
| --- | --- | --- |
| N+1 | query count grows with list size | eager load / batch IN |
| Missing index | seq scan in EXPLAIN | add index; measure write cost |
| Lock contention | lock waits under concurrent load | shorter transactions, row-level targeting |
| Long transaction | blocks vacuum/locks | split into batches |

## Gate

- critical query set, p95 budget each, run in CI on volume-shaped dataset
- index changes: read gain AND write cost both measured

# Multi-turn assertion matrix

Per scenario, assert per turn. Record: turn, assertion, result.

| Assertion | When |
| --- | --- |
| System-prompt rules still followed | every turn |
| Fact from turn k answered correctly at turn N | after fact established |
| Correction overrides earlier turn | after "no, I meant X" |
| Tool args use latest state | every tool call after state change |
| No repeated identical tool call | consecutive turns |
| Context-limit behaviour per design (truncate/summarize/error) | at window edge |
| Latency/cost growth recorded | turns 1/5/10/20 |

## Scenario starters

- simple Q&A chain (5 turns)
- constrained task ("plan a trip under budget X") — constraint holds to the end
- correction mid-conversation
- long task (10–20 turns) approaching the context window

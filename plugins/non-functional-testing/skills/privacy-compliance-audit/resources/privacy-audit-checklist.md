# Privacy compliance checklist (GDPR-shaped)

Record per item: requirement, check, evidence, result.

## Data subject rights

| Right | Check |
| --- | --- |
| Access | complete export within deadline, identity verified |
| Deletion | gone from primary + logs + backups in cycle + vendors notified; stays deleted on re-check |
| Portability | machine-readable standard format |
| Rectification / objection / restriction | mechanism works |

## Consent and transparency

| Check | Expected |
| --- | --- |
| Consent granular per purpose, not bundled | yes |
| Pre-ticked / dark patterns | none |
| Withdrawal as easy as giving | yes |
| Privacy notice accurate (purposes, retention, rights, DPO) | yes |

## Retention and minimization

| Check | Expected |
| --- | --- |
| Retention jobs actually delete/anonymize past-period data | verified in test env |
| Every collected field has a purpose | yes |

## PII leak scan

| Surface | Check |
| --- | --- |
| App/server logs | no emails, names, ids, IPs, free text |
| Error/crash reporters | PII scrubbed |
| Analytics events | no PII, consent-gated |
| Session replay | masked fields |
| Third-party SDKs | list + contract (processor agreement) |

## DPIA

- activities with systematic monitoring / large-scale sensitive data / new tech flagged for DPIA

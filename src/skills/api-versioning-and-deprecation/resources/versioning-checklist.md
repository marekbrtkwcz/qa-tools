# Versioning and deprecation checklist

Run per API and per version transition. Record: check, request, observed, expected, result.

## Negotiation

| Check | Expected |
| --- | --- |
| No version specified | documented default version |
| Unsupported version | 400/406 with a clear message, never a silent default |
| Deprecated but live version | works + deprecation signal present |
| Scheme consistency | path/header/media-type behave per the chosen scheme, everywhere |

## Dual-run equivalence

| Check | Expected |
| --- | --- |
| Same request to v1 and v2 | semantically equivalent response per migration guide |
| Side effects under dual-run | one event / one row — no duplication |

## Deprecation signalling

| Check | Expected |
| --- | --- |
| `Deprecation` header on old version | present, correct date/version |
| `Sunset` header | present, correct removal date |
| Changelog / docs | sunset date, migration path, breaking changes listed |
| Known consumers notified | recorded: who, when, how |

## Sunset

| Check | Expected |
| --- | --- |
| Usage of old version | zero over measurement window (or only notified stragglers) |
| Contract verification | passes against remaining consumers |
| Post-removal response | 410 Gone (documented), not 404 |
| Post-removal monitoring | no surprise callers in logs |

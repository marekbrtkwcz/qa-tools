# Smoke / sanity derivation checklist

## Smoke case categories (pick per critical path)

| Category | Example case |
| --- | --- |
| Environment | health endpoint 200, config loaded, migrations applied |
| Auth | login + logout for a standard role |
| Core create | main entity created and visible |
| Core read/list | list loads, search/filter basic works |
| Core update/delete | edit and delete the entity |
| Critical integration | payment/email/external API happy path |
| Hygiene | no blocking errors in logs/console during the run |

## Sanity derivation per change

| Change area | Sanity covers |
| --- | --- |
| The changed behaviour itself | direct cases proving the fix/feature |
| Immediate neighbours | adjacent flows the change touches |
| Past defects in the area | one regression case per known bug |

## Budget discipline

- smoke fits its time box; if over, cut lowest-risk cases first
- review quarterly: remove cases that never failed, add new critical paths

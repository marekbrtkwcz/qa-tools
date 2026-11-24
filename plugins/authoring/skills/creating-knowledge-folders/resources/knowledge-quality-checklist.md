# Knowledge quality checklist

One pass before wiring a knowledge document into a bundle. The document is drafted; this decides whether it is an asset or a liability.

## Content

- [ ] One topic, one file; the reader's question appears as a heading.
- [ ] Depth lives here, not in the skill bodies — and no skill body lost leanness to keep this file short.
- [ ] Every dated fact carries a "last verified" date and an owner.
- [ ] Borrowed material names its source and licence.
- [ ] No secrets, credentials, or machine-specific paths; no environment captures that rot.
- [ ] Examples sit next to the rules they illustrate; no narrative throat-clearing before the first heading.

## The description contract

- [ ] The first non-`#` paragraph describes what the document covers and when to load it — in one or two sentences.
- [ ] It is under 297 characters (in this collection the build slices it into the runtime description; the validator warns past the slice point).
- [ ] It reads correctly as a standalone sentence — the stub a reader sees before opening the file.

## Wiring (this collection)

- [ ] Source is `src/knowledge/<name>.md`, and `<name>` is listed under `knowledge:` in exactly one bundle's `bundles.yaml` entry.
- [ ] The owning bundle is the one whose skills load this knowledge, not the one that merely mentions the topic.
- [ ] The skills that reference it name it with a read-when condition (progressive disclosure, one level deep).
- [ ] In an orchestration pack, the GUIDE is that bundle's `knowledge:` entry (`creating-orchestration-packs`).
- [ ] `npm run check` passes with no warning about the knowledge description.

## Wiring (a user's project)

- [ ] The file sits where the host can load it (or a plain `docs/` file the skills reference).
- [ ] One real task loaded it: the agent quoted the document instead of improvising, and the answer measurably improved.

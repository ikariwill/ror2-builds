# 0003: Static JSON data, one file per survivor

- **Date:** 2026-10-13
- **Status:** accepted

## Context
The builds are hand-researched editorial content (wiki + game text) that changes rarely and needs review.

## Decision
Each build is a JSON file in `src/data/builds/<id>.json`, imported at build time through `import.meta.glob`. The
format is typed in `src/types.ts` and checked by `npm run validate`.

## Consequences
- Fixes become readable diffs in a PR.
- No database or API; the whole site is static.
- A format change requires updating `types.ts`, the validator and `docs/data.md` together.

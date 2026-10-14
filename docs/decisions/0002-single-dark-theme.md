# 0002: Single dark theme

- **Date:** 2026-10-13
- **Status:** accepted

## Context
The site is checked in the middle of a run, often on a second monitor or on a phone next to the game, which is dark.
The item icons were designed for a dark background and lose contrast on a light one.

## Decision
A single theme, dark, with `color-scheme: dark`. No light/dark toggle for now.

## Consequences
- Less work per component; the contrast pairs are checked only once.
- If a light theme is ever requested, it comes in as a new set of tokens in `@theme`, not as `dark:` classes
  scattered around.

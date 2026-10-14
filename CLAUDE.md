# ror2-builds — Logbook de Builds

Static site with one recommended build per Risk of Rain 2 survivor, written in Brazilian Portuguese.
For people who play regular runs and want to know what to pick, how many and why.

## Stack

Vite 6 · React 18 · TypeScript (strict) · Tailwind CSS v4 (`@tailwindcss/vite` plugin). No backend.
Deployed on Vercel from the `main` branch (Vite auto-detection). Details: `docs/deploy.md`.

## Commands

```bash
npm install
npm run dev         # local server
npm run format:data # formats src/data/builds/*.json to the standard (2 spaces)
npm run validate    # checks src/data/builds/*.json (format, icons, essentials)
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + production build into dist/
```

Before any commit: `npm run validate && npm run build` must pass.

## Structure

```
src/
  data/builds/<id>.json   one build per survivor (format in src/types.ts and docs/data.md)
  data/roster.ts          order, DLC groups, rarities, priorities, helpers
  types.ts                data types
  useBuildState.ts        page state: survivor (#/id in the URL), filters, selected item, run checklist
  components/ui.tsx       design system primitives (Chip, Label, Heading, PrioTag, ItemIcon…)
  components/build-parts.tsx  content blocks (item detail, checklist, rotation, skills…)
  components/command-order.tsx  pick order for the Artifact of Command, with a counter
  views/Desktop.tsx       layout ≥ 761px: survivor rail (≥ 1180px) | content | sticky detail panel
  views/Mobile.tsx        layout ≤ 760px: Build/Itens/Partida tabs + detail sheet
  styles.css              design system tokens (@theme) — source of truth for colors and type
public/icons/<slug>.webp  original item icons (see docs/data.md › Sources)
scripts/                  format-builds.mjs and validate-builds.mjs
docs/                     project documentation (start at docs/README.md)
```

## Project rules

### Language
- **English** for everything that is not read by the site's visitors: code, identifiers, comments, JSDoc, CSS
  comments, script output, internal keys and ids (tier ids, section anchors, localStorage keys, JSON keys and
  enum-like values), documentation, commit messages and PR text.
- **Brazilian Portuguese (pt-BR)** only for site content: the text fields of the build JSON files and the UI strings
  shown to the reader (labels, headings, `aria-*` text, button text, empty states, footer, page title and meta).
- Docs may quote a pt-BR UI string when referring to it (e.g. the "Núcleo" section), but explain it in English.

### Build content (the most important part)
- Accuracy above all. Mechanics and numbers come from the official community wiki (riskofrain2.wiki.gg).
  Never invent an effect, number or interaction. If the wiki does not confirm it, do not claim it; record it in the
  build's `notes`.
- Item effects: translate the exact item text, keeping every number and the stacking.
- Names: the game's Portuguese name + the original English name in parentheses. The pt-BR names come from the
  game's language file (docs/data.md). No official translation: use the English name in both fields.
- Recommend an item because of the survivor's kit (proc coefficient, cooldowns, charges, melee vs. ranged),
  never just because "it is good in general". A Void item that corrupts another recommended item: say so.
- Writing: natural Brazilian Portuguese, short and direct sentences. No em dash as an aside, no "não é X, é Y",
  no filler.
- Changed build data? Run `npm run validate` and update `docs/data.md` if the format changed.

### Interface
- Follow `docs/design-system.md`. Colors, fonts, radii and sizes only through the tokens in `src/styles.css`
  (`bg-panel`, `text-ink-2`, `rounded-card`…). Tailwind's default palette is turned off on purpose.
- No literal color in JSX (`text-[#abc]`, `bg-slate-800`), gradient, glow, frosted glass, emoji as an
  icon or decorative shadow. Saturated colors only for item rarity; the gold (`accent`) is the only accent.
- Reuse the primitives in `components/ui.tsx` before creating another one. A new reusable component goes there
  and gets a row in `docs/design-system.md › Components`.
- Accessibility is not optional: real `<button>`/`<a>`, correct `aria-*`, touch targets ≥ 44px on
  mobile, visible focus, 4.5:1 contrast for text.
- Single dark theme, by decision (`docs/decisions/0002-single-dark-theme.md`).

### Documentation
- `docs/` keeps what needs to survive between conversations: decisions, data sources, design system, roadmap.
- An architecture or design decision that changes direction: a new ADR in `docs/decisions/NNNN-short-title.md`
  (copy `docs/decisions/_template.md`).
- Learned something important about the game, the data or the deploy? Record it in the right doc in the same commit.

### Git
- Default branch `main` (automatic deploy). Small commits.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/), in English, imperative mood:
  `type(scope): summary` with types such as `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `build`, `ci`,
  `test` (e.g. `docs: translate design system to English`, `refactor(data): rename tier ids to English`).
- PR titles and descriptions are in English too.
- Commits are authored by the repository owner (the user's own git identity). No AI co-author trailers
  (`Co-Authored-By: Claude …` or similar) in commit messages or PR descriptions.

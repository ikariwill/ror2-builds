# Design system — Logbook

> Status: **v0.2, being refined.** The tokens below are already in `src/styles.css`. The layout will still change;
> the "what not to do" rules apply from now on.

## 1. Direction

**A survivor's field log.** The game has a *Logbook* with entries for items, monsters and environments.
The site is that for builds: a quick-reference tool for the middle of a run, not a landing page.

What this means in practice:

- **Density with hierarchy.** The screen shows a lot of information, but the reading order is always the same:
  *what to pick* (core) → *all items* → *why* (detail, synergy).
- **The game icons are the imagery.** There is no illustration, photo, mascot or background art. The original item
  icons carry the color and the recognition.
- **Technical labels.** Slots, fields and counters use an uppercase mono font, like a log entry.
- **Color with meaning.** Saturated color means *item rarity*. Everything else is bluish ink and a single
  gold accent.

Quick test for any new screen: *can you find what to pick in 3 seconds, without reading a paragraph?*

## 2. What to avoid (anti "AI slop")

These choices make a page look mass-produced. Do not use them, even if they look nice:

| Avoid | Why / what to do instead |
| --- | --- |
| Gradients (purple→blue, "aurora", mesh) | Backgrounds are a solid token color. Depth comes from 5 surface levels. |
| Glow, neon, `glow`, colored shadows | No decorative shadow. Separation through a `line` border and a surface change. |
| Frosted glass (`backdrop-blur`) | Solid color only. |
| Emoji as an icon or section marker | Game icons or simple stroke SVG. |
| Giant full-height hero | The build title fits in a line and a half; the core shows above the fold. |
| Identical cards with large radius and shadow | Border/background only where they separate an object. Small radii with a role (table 3.4). |
| Colored left bar as decoration | A colored bar only when it carries **rarity** (icon strip, list row on mobile) or the active navigation item. |
| Decorative 01/02/03 numbering | Numbers only where the order is information (rotation). |
| Inter, Roboto, Arial, Space Grotesk | Saira Condensed + IBM Plex Sans + IBM Plex Mono. |
| Tailwind's default palette (`slate-800`, `indigo-500`) | Turned off in `@theme`. Use the tokens. |
| Marketing copy ("Domine suas runs!") | Guide language: direct, specific, with numbers from the game. |
| Generic library icons everywhere | Only where there is an action (search, close, expand). |

## 3. Tokens

Source of truth: `src/styles.css` (`@theme`). Each token becomes a Tailwind utility (`bg-panel`, `text-ink-3`,
`border-line`, `rounded-card`, `font-display`…).

### 3.1 Surfaces (from deepest to highest)

| Token | Hex | Use |
| --- | --- | --- |
| `ground` | `#0D1318` | top bar, mobile tab bar |
| `surface` | `#10161D` | page background |
| `sunken` | `#141C24` | secondary reading blocks (synergy, run mode, search) |
| `panel` | `#17202A` | highlighted objects (core, item detail, loadout slots) |
| `raised` | `#1E2934` | hover and selected item |

### 3.2 Lines and text

| Token | Hex | Use |
| --- | --- | --- |
| `line-soft` / `line` / `line-strong` | `#222D38` / `#273341` / `#3A4856` | dividers, card borders, controls |
| `ink` | `#E7ECEF` | main text, headings |
| `ink-2` | `#C3CDD5` | body text |
| `ink-3` | `#93A1AE` | secondary text, English names |
| `ink-4` | `#7D8B98` | mono labels (`.label`) |
| `ink-off` | `#5F6E7B` | disabled, crossed-out checklist items |

### 3.3 Accent and semantics

| Token | Hex | Use |
| --- | --- | --- |
| `accent` | `#E8B04A` | **the only accent**: Essential priority, active filter, selection, focus, quantity badge |
| `accent-hi` | `#F4CC7A` | link hover |
| `on-accent` | `#10161D` | text on the accent |
| `prio-avoid` / `prio-avoid-ink` | `#5A2328` / `#F3B5B9` | "Evitar" (Avoid) priority |

**Rarities** (the game's colors; **only** for rarity). The token suffix is the tier id used in code and data:

| Token | Hex | Rarity (pt-BR label) |
| --- | --- | --- |
| `tier-common` | `#C9CED3` | Common — Comum (white) |
| `tier-uncommon` | `#7BC86C` | Uncommon — Incomum (green) |
| `tier-legendary` | `#E5534B` | Legendary — Lendário (red) |
| `tier-boss` | `#E3C24A` | Boss — Chefe (yellow) |
| `tier-equipment` | `#F0913A` | Equipment — Equipamento (orange) |
| `tier-lunar` | `#5AA9E6` | Lunar — Lunar (blue) |
| `tier-void` | `#B678E0` | Void — Vazio (purple) |

Rarity is never conveyed by color alone: the rarity name appears in the detail panel and in the tabs.

### 3.4 Radii

| Token | Value | Use |
| --- | --- | --- |
| `rounded-tag` | 4px | badges (priority, quantity) |
| `rounded-control` | 6px | rail links, inner fields |
| `rounded-card` | 8px | cards, item tiles, search |
| `rounded-panel` | 12px | main panels (core, detail, run mode) |
| `rounded-full` | — | filter chips, rotation numbers |

## 4. Typography

| Role | Font | Use |
| --- | --- | --- |
| Display | **Saira Condensed** 600/700, uppercase | headings (`.heading`), brand name |
| Text | **IBM Plex Sans** 400/500/600 | everything that is read |
| Data | **IBM Plex Mono** 500 | labels (`.label`), counters, quantities, badges |

Scale (`text-*` tokens): `label` 11 · `meta` 13 · `body` 15 · `lede` 16 · `h-md` 22 · `h-lg` 26 · `h-xl` 56.
Reading lines of at most ~72 characters (`max-w-[72ch]`).

## 5. Components

Primitives in `src/components/ui.tsx`:

| Component | What it is |
| --- | --- |
| `Heading` | section heading (`size` md/lg/xl) |
| `Label` | technical mono label |
| `Chip` | tab pill (`variant="tab"`) or filter pill (`variant="filter"`) |
| `PrioTag` | priority badge (Essencial, Alta, Média, Situacional, Evitar) |
| `ItemIcon` | item icon with the rarity strip underneath — the visual signature of the system |
| `QtyBadge` | gold quantity badge over the icon |
| `SearchField` | search with an accessible label |

In `command-order.tsx`: `CommandOrder` (pick order per rarity with a "got the next one" counter, saved in the browser) and `CommandSection`.

Also in `build-parts.tsx`: `SurvivorSelect` (native selector grouped by DLC, used on mobile and on narrow desktop).

Blocks in `src/components/build-parts.tsx`: `TierTabs`, `PrioChips`, `ItemDetail`, `Checklist`, `Rotation`,
`Notes`, `Skills`, `Synergy`, `Fallbacks`, `Summary`, `Sources`, `SiteFooter`.

## 6. Layout

- **Wide desktop (≥ 1180px):** three-column grid, max width 1680px.
  - Survivor rail (232px), fixed on screen with its own scrolling; the brand sits at its top.
  - Content: build header (survivor name in `h-xl`, build name below, loadout in cards),
    then a **sticky section bar** (Núcleo · Itens · Habilidades · Sinergia · Substitutos + search; anchors
    `#core`, `#order` when the build has a pick order, `#items`, `#skills`, `#synergy`, `#fallbacks`).
  - Side panel (360px), fixed on screen with its own scrolling: item detail, run mode ("Modo partida") and rotation.
    The detail stays visible while scrolling the item grid.
- **Narrow desktop (761–1179px):** the rail disappears; the survivor selector (`SurvivorSelect`) moves to the top of
  the content. Two columns: content + panel (340px).
- **Mobile (≤ 760px):** sticky header with the survivor selector; bottom tabs (Build, Itens, Partida; keys
  `build`, `items`, `run`); item detail in a sheet that slides up from the bottom. Respects `safe-area-inset`.
- **Build core:** one row when the container is ≥ 680px; otherwise two balanced rows
  (`ceil(n/2)` columns, via container query). A single item is never left alone on a row.
- Spacing between siblings with `gap`, never loose margins.

## 7. Accessibility

- Contrast: text ≥ 4.5:1 against its background (the token pairs above already pass).
- Visible focus on everything (gold `:focus-visible`, defined in the base CSS).
- Touch targets ≥ 44px on mobile. Real buttons and links; no `onClick` on a `div`.
- `prefers-reduced-motion` turns transitions off.

## 8. Before opening a PR with a UI change

- [ ] Tokens only; no hex, `text-[#…]` or Tailwind default color in JSX.
- [ ] Nothing from the "What to avoid" table.
- [ ] Works at 390px and at 1440px, with no horizontal page scroll.
- [ ] Keyboard navigable; visible focus.
- [ ] A new reusable component lives in `ui.tsx` and is listed in section 5.

## 9. Open questions (for the refinement)

- ~~Side panel too tall on 900px screens~~ → fixed panel with its own scrolling (v0.2).
- ~~7-item core breaking into 6 + 1~~ → one row or two balanced ones (v0.2).
- ~~Heading scale on mobile~~ → survivor name and build name separated (v0.2).
- Survivor portrait or silhouette in the rail? Only if it is official art with a clear license.
- "Item marked as picked up" state tied to run mode.
- Test the section bar search with the keyboard (`/` shortcut?).

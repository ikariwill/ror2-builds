# Design system: Logbook

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
| `tier-common` | `#C9CED3` | Common / Comum (white) |
| `tier-uncommon` | `#7BC86C` | Uncommon / Incomum (green) |
| `tier-legendary` | `#E5534B` | Legendary / Lendário (red) |
| `tier-boss` | `#E3C24A` | Boss / Chefe (yellow) |
| `tier-equipment` | `#F0913A` | Equipment / Equipamento (orange) |
| `tier-lunar` | `#5AA9E6` | Lunar / Lunar (blue) |
| `tier-void` | `#B678E0` | Void / Vazio (purple) |

Rarity is never conveyed by color alone: the rarity name appears in the detail panel and in the tabs.

### 3.4 Radii

| Token | Value | Use |
| --- | --- | --- |
| `rounded-tag` | 4px | badges (priority, quantity) |
| `rounded-control` | 6px | rail links, inner fields |
| `rounded-card` | 8px | cards, item tiles, search |
| `rounded-panel` | 12px | main panels (core, detail, run mode) |
| `rounded-full` | full | filter chips, rotation numbers |

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
| `Chip` | tab pill with an optional rarity dot; selected = raised with the accent ring; `size="lg"` is 44px for touch |
| `PrioTag` | priority badge (Essencial, Alta, Média, Situacional, Evitar) |
| `ItemIcon` | item icon with the rarity strip underneath: the visual signature of the system |
| `QtyBadge` | gold quantity badge over the icon |
| `SearchField` | search with an accessible label; `compact` for the section bar, `hint` shows a key such as `/` |
| `Segmented` | two or more mutually exclusive options in one control (group by priority or rarity, run mode) |

`cx` joins class names through tailwind-merge, configured with the Logbook tokens: when a component receives a
class that sets the same property (`text-[28px]` over `text-h-md`), the later one wins. A new token in `@theme`
must also be added to the merge config in `ui.tsx`, or the merge can drop the wrong class.

Blocks in `src/components/build-parts.tsx`:

| Block | What it is |
| --- | --- |
| `SurvivorSelect` | native selector grouped by DLC (mobile and narrow desktop) |
| `ItemLanesGrid` / `ItemLanesList` | items in lanes (by priority, by rarity or search results); grid on desktop, list on mobile |
| `AvoidNote` | "Evite" callout for the build's Avoid items, under the core |
| `ItemDetail` | item detail, with "Se não aparecer" when the item has a fallback |
| `Skills` | one row per slot: what to use and the alternatives |
| `Rotation` | numbered steps (`list` or `cards`) |
| `Reminders` | the build checklist shown as run reminders |
| `Notes`, `Synergy`, `Fallbacks`, `Summary`, `Sources`, `SiteFooter` | reading blocks |

Run mode in `src/components/run-mode.tsx` (`RunDesktop`, `RunMobile`), state in `src/useRunState.ts`.
Search palette in `src/components/palette.tsx` (`CommandPalette`, `usePaletteShortcuts`).

## 6. Layout

- **Wide desktop (≥ 1180px):** three-column grid, max width 1680px.
  - Survivor rail (232px), fixed on screen with its own scrolling; the brand sits at its top.
  - Content: build header (survivor name in `h-xl`, build name below, lede, loadout chips, "Modo partida" button),
    then a **sticky section bar** (Núcleo · Itens · Habilidades · Rotação · Sinergia · Substitutos + search; anchors
    `#core`, `#items`, `#skills`, `#rotation`, `#synergy`, `#fallbacks`).
  - Reading order: the core ("Núcleo da build", the only place the essentials appear) with the "Evite" callout,
    then "Depois do núcleo" (the other items in priority lanes; "Por raridade" lists all items by rarity), then the
    explanations.
  - Side panel (360px), fixed on screen with its own scrolling: the selected item's detail and, for core items,
    what to do if it does not show up.
- **Run mode (`#/<id>/partida`):** full width, no rail, made for a second monitor. "Run normal" shows one column per
  rarity with the next pick highlighted; "Artefato da Autoridade" shows the pick order and the bag computed from it.
  See `docs/decisions/0004-run-mode.md`.
- **Search palette:** Ctrl+K (⌘K) on desktop, also from the rail button; `/` focuses the build search.
- **Narrow desktop (761–1179px):** the rail disappears; the survivor selector (`SurvivorSelect`) moves to the top of
  the content. Two columns: content + panel (340px).
- **Mobile (≤ 760px):** sticky header with the survivor selector (and the search on the Itens tab); bottom tabs
  (Build, Itens, Partida; keys `build`, `items`, `run`; Build is the default). Build has the core; Itens lists every
  item, the core first; Partida is run mode. Item detail in a sheet that slides up from the bottom. Respects
  `safe-area-inset`.
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
- ~~"Item marked as picked up" state tied to run mode~~ → run mode counts per item (v0.3).
- ~~Section bar search with the keyboard~~ → `/` focuses it; Ctrl+K opens the palette (v0.3).
- Run mode targets come from the build quantities. Some builds may need an explicit pick order for regular runs.

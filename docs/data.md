# Build data

## Sources

| What | Source | Notes |
| --- | --- | --- |
| Skill mechanics, numbers and notes | [Risk of Rain 2 Wiki](https://riskofrain2.wiki.gg/) (wiki.gg, the official community wiki) | Each survivor's page, including Notes/Tips |
| Exact item text, rarity and DLC | Wiki data modules (`Module:Items/Data`, `Module:Equipment/Data`), via [Petrichor Index](https://github.com/tsieck/petrichor-index) | Checked on **2026-08-10**. Does not include the Hallowed Concepts DLC (released 2026-10-08) |
| Item icons | Original game sprites, via Petrichor Index | 142 `.webp` files in `public/icons/`, only the items some build lists |
| Portuguese names | The game's pt-BR language file (`output-portuguese_br.json`), via [maicogtbr/Descricoes-datalhadas-Risk-of-Rain-2-PT-BR](https://github.com/maicogtbr/Descricoes-datalhadas-Risk-of-Rain-2-PT-BR) | Snapshot from Dec 2025. Does not have the Hallowed Concepts texts |
| What to pick, priorities, loadout | Players: Steam Community guides and threads, YouTube guides and Eclipse runs (read through their transcripts), community tier lists with reasoning | At least 2 per build (`kind` guide, video or forum). A priority changes only when 3+ credible sources agree; disagreements are written in the item's `why` or in `notes`. SEO listicles and AI-written pages (e.g. Rogue Ranker) are never the basis for a choice |

Two layers, never mixed: the **wiki** (and patch notes) says what an item or skill does and its numbers; **players**
say what to pick and in which order. A build that rests on the wiki alone tends to rate "on paper" items as essential
(the community audit found this in almost every build; see `docs/reviews/2026-10-14-community-audit.md`).

The icons and names are property of Hopoo Games/Gearbox; the site is a non-commercial fan site.
Petrichor Index does not state a license in its README; if we publish widely, it is worth confirming with the author or
downloading the icons straight from the wiki.

## Format

One file per survivor: `src/data/builds/<id>.json`. Types in `src/types.ts` (`Build`).

Keys, ids and enum-like values (`id`, `sections[].id`, `sections[].color`, `command.tiers[].tier`, `prio`, `icon`)
are code and stay in English. Every text field shown to the reader is pt-BR.

```jsonc
{
  "id": "bandit",                 // = file name; also the URL (#/bandit)
  "name_pt": "Bandido", "name_en": "Bandit",
  "title": "Bandido: Build de Crítico",
  "tagline": "short phrase for the selector",
  "lede": "2–3 sentences: what the build does and why",
  "loadout": [{ "slot": "Primária", "skill": "Rajada (Burst)" }],
  "skills": [{ "slot", "pt", "en", "pick": "Recomendada|Variante|Fixa|Única opção", "spec": "numbers", "why": "…" }],
  "sections": [{                  // in this order: common, uncommon, legendary, boss, equipment, lunar, void
    "id": "common", "name": "Comum", "color": "white", "intro": "1 sentence",
    "items": [{ "icon": "lens-makers-glasses", "pt": "…", "en": "Lens-Maker's Glasses",
                "prio": 1, "qty": "4 a 8", "effect": "translated item text", "why": "why on this survivor" }]
  }],
  "synergy":   [{ "title", "text" }],
  "rotation":  [{ "step", "text" }],
  "essentials":[{ "pt", "en" }],   // become the "Núcleo da build" (build core); each "en" must exist in some section
  "situational_note": "Situacionais: …",
  "fallbacks": [{ "pt", "en", "text" }],
  "summary": "3–4 sentences",
  "checklist": [{ "title", "text" }],
  "sources": [{ "title", "url", "kind": "wiki|patch|guide|video|forum", "date": "YYYY-MM-DD | YYYY-MM | YYYY" }],
  "reviewed": "YYYY-MM-DD",         // optional: when the choices were last checked against player sources
  "notes": ["caveats: DLC, unconfirmed data, discrepancies"],
  "command": {                     // optional: pick order for the Artifact of Command (Artefato da Autoridade)
    "intro": "2 sentences",
    "tiers": [{ "tier": "common", "steps": [{ "en": "Backup Magazine", "n": 2, "why": "1 sentence" }], "then": "Depois: …" }]
  }
}
```

Section `color` values by tier: `common` white · `uncommon` green · `legendary` red · `boss` yellow ·
`equipment` orange · `lunar` blue · `void` purple.

Priority (`prio`): `1` Essential (Essencial) · `2` High (Alta) · `3` Medium (Média) · `4` Situational (Situacional) ·
`0` Avoid/careful (Evitar).

`npm run validate` checks the source kinds and dates (and warns when a build has fewer than 2 player sources), the formatting (2 spaces), required keys, section order and names, valid priority, that every
icon exists in `public/icons/`, that every essential appears in a section and, in the pick order, that every item exists
in the cards of the same rarity.

## How to create or fix a build

1. Read the survivor's page on the wiki (skills, Notes, Tips).
2. For each item, use the exact item text and translate it keeping the numbers and the stacking.
3. Explain the `why` through the survivor's kit. If an interaction is not on the wiki, do not claim it.
4. A new item needs its icon in `public/icons/<slug>.webp` (lowercase slug with hyphens, like the existing ones).
5. `npm run format:data && npm run validate && npm run build`.
6. Discrepancy between the wiki and the game text: use the wiki number and mention the difference in the skill's `spec`.

## Artifact of Command (Artefato da Autoridade)

Official pt-BR name: **Artefato da Autoridade**. The pick order (`command`) follows what the wiki confirms:
each essence lets you choose any unlocked item of that rarity; printers, scrappers, multishop terminals and
Cleansing Pools do not appear; **Pearl and Irradiant Pearl cannot be obtained** (Irradiant Pearl page);
Void cradles limit the choice to one rarity. Lunar equipment stays out of the orange order.

Ordering criterion: **stack** the items that grow with each copy (AtG Missile, the Bands, Leeching Seed,
Ignition Tank, Ukulele…) instead of spreading 1 of each. In the greens, 1 or 2 stacking items add up to at least half
of the ~12 picks; items that grow little (Scythe, Instincts, Bandolier, Death Mark…) come in with 1 or 2 copies.
Regenerating Scrap is useless with the artifact (there are no printers). The validator rejects an order that exceeds the
maximum of the card's `qty`.

Kjaro's and Runald's Bands **trigger together** and share the 10 s cooldown (wiki, Kjaro's Band). Critical strikes and
Armor-Piercing Rounds do not push a weak hit past the 400% threshold.

## Known pending verifications

Updated in the community audit (`docs/reviews/2026-10-14-community-audit.md`). Each build also lists its own in `notes`,
including where players and the wiki disagree.

- **Enforcer and Acolyte** (Hallowed Concepts, 2026-10-08): the builds are marked preliminary, from the first week of
  player material. Review in 3 to 6 weeks (creator guides, first balance patch). Some challenge requirements are not on
  the wiki yet and the skills have no pt-BR name.
- **Hallowed Concepts items and new skills**: items are still outside the dataset; the new skills of six older survivors
  are only in `notes` until players evaluate them.
- **Bands threshold**: the item text says "more than 400%", the wiki notes say "400% or more". Affects exact-400% hits
  (Railgunner HH44, Acrid's third primary hit, CHEF's boosted Dice).
- **Huntress (Caçadora)**: Arrow Rain has conflicting numbers on the wiki itself (330%/s in the table, 2090% total in the notes).
- **REX**: Bramble Volley cooldown 5.5 s (table) vs. 5 s (patch note); whether allies pick up the fruit from
  DIRECTIVE: Harvest; whether Tougher Times blocks the HP cost of his skills.
- **Seeker (Exploradora)**: skill numbers now confirmed on the wiki. Still open: Meditate radius (+100% per stack in the
  skill text, +2 m in the V1.3.8 history) and when Sojourn's self-damage starts (1.4 s in the notes, 1.8 s in Tips).
  The language file has an alternate primary, Soul Search (Busca de Alma), which the wiki does not list.
- **CHEF**: Yes, CHEF! (10 s) and Glaze are now on the wiki. Open: whether oil quadruples item burns (Gasoline, Ignition
  Tank); players say Ice Box executes Mithrix, the wiki says bosses are not frozen.
- **Operator (Operador)**: Nanorrecipiente exists only in the language file; no guide or wiki page shows it in game.
  Open: whether Empathy Cores add ADMIN-OVERRIDE charges; whether the Spare Drone Parts text reflects the 50% cut.
- **Drifter (Andarilho)**: rarity of the items from Salvage and Substandard Duplicator with temporary items. The wiki now
  says luck helps Junk, without numbers.
- **Heretic (Herege)**: the wiki contradicts itself on what the Blockade Breaker challenge (Destruidor de Barreiras)
  unlocks; whether Rejuvenation Rack amplifies her negative regeneration needs an in-game test.
- **Railgunner (Canhoneira)**: players say Cryocharge executes Mithrix; the wiki says it does not freeze bosses.
- **Acrid**: players report that Poison and Blight ticks never crit or trigger on-hit items; the wiki does not say.
- **Mercenary (Mercenário)**: 0.6 s of invulnerability per dash (current wiki) vs. 0.2 s at the end of the dash (old patch).
- **Bandit (Bandido)**: duration of Smoke Bomb's invisibility; whether Runic Lens is reduced by Burst's coefficient;
  which kills grant Desperado tokens beyond the shot itself and its Behemoth explosion (players say Bands and bleed do not).
- **Lunar pods with the Artifact of Command**: the wiki does not confirm whether they give a choice. The game's language
  file has the string "Essência da Autoridade Azul", which suggests they do. The orders treat lunar as conditional.
- **Challenge names** are in English in the builds, although the pt-BR file has translations. Decide and standardize.

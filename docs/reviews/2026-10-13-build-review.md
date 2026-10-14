# Build review — 2026-10-13

Full review of the 21 builds, done by independent reviewers (not the authors), plus an automated check.

## Method

1. **Automated check** against the wiki item data (Petrichor Index, 2026-08-10) and the game's pt-BR file:
   numbers in each `effect` vs. the exact item text, rarity/section, pt-BR name, and whether Void items that corrupt
   another recommended item say so in the `why`.
2. **Manual review** per survivor against the wiki (riskofrain2.wiki.gg, consulted on 2026-10-13): skill numbers,
   claims in the `why`, consistency of priority/quantity with the kit, internal consistency and writing.

Final result of the automated check: 0 problems. `npm run validate`: all valid.

## Fixes that change the recommendation

- **Bandit:** Serrated Dagger (default secondary) and Blast (alternate primary) were missing. Shatterspleen
  2 → 3 (the wiki says Burst pairs poorly with it). Soldier's Syringe: the text said it does not speed up Burst; it does.
- **Commando:** Harvester's Scythe 2 → 1 (it was already essential). Suppressive Fire is only cancelled by Phase
  Round/Phase Blast, not by any skill.
- **Huntress:** Lysate Cell 1 → 2. Movement speed only lengthens Blink, not both teleports.
- **Engineer:** Spare Drone Parts was added (it affects turrets, contrary to what the text said).
  Transcendence 3 → 4 (the wiki advises against it on turrets).
- **MUL-T:** Multifunctional passive added; Power Mode reduces speed to about 66%, not −60%.
- **Artificer:** ENV Suit and rotation fixed (the wiki recommends fighting on the ground).
- **REX:** Repulsion Armor Plate 2 → 1. Planula is not triggered by the health cost of Tangling Growth.
- **Loader:** Backup Magazine was in the wrong section (uncommon → common).
- **Acrid:** Alien Head does not "almost double" Epidemic (10 s → 7.5 s). The claim that Poison is not affected
  by crits was removed (the wiki does not say).
- **Captain:** Beacon: Hacking hacks nearby purchasables one at a time, not "one object per stage", and does not work
  on printers.
- **Railgunner:** HH44 deals exactly 400%, not "more than 400%"; triggering the Bands remains unconfirmed.
- **Drifter:** Bludgeon is not an alternate primary; it is the smash ("Esmagar") of Repossess. Leeching Seed and
  Gorag's Opus 2 → 1 (they were already essential).
- **Heretic:** Alien Head barely reduces Hungering Gaze (0.5 s on the first stack); it stays priority 1 for the
  rest of the kit. Unlocking the Heresy items: the wiki contradicts itself.
- **Enforcer/Acolyte:** numbers completed (cooldowns, charges, range); the extra Conviction (Convicção) comes from Sacrifice.

Also: Void corruption warnings in every build where they were missing, completed `effect` texts (Runald's Band
missing the cooldown, Blast Shower missing "debuffs", Spinel Tonic with an invented "permanent"), and full item names.

## Left unconfirmed

See `docs/data.md › Known pending verifications`.

# 0004: Run mode answers "what do I pick next?"

- **Date:** 2026-10-13
- **Status:** accepted

## Context
The first run mode was a checklist plus the Artifact of Command counter. Most visitors play regular runs, where the
question at a printer, chest or Void cradle is "which item do I take?". The Command counter and a manual item count
also asked for the same pick twice.

## Decision
- Run mode is its own route (`#/<id>/partida`) and the mobile "Partida" tab. "Run normal" is the default.
- Each rarity lists the build's Essential, High and Medium items with a count and the target range from `qty`.
- The **next pick** of a rarity is the highest-priority Essential or High item still under the minimum of its range.
  Medium items are counted but never pushed as the next pick. A rarity with only Medium items says "Só se aparecer".
- Equipment is one slot: the visitor marks the one in hand; the next pick is the best Essential or High equipment.
- With the Artifact of Command, the visitor records one click per essence and the bag is computed from the pick order.
- Counts live in localStorage (`ror2-builds:run`, `ror2-builds:command`) and follow changes from other tabs, so a
  second-monitor window and the main window stay in sync.
- The build checklist is shown as reminders, not as tasks to tick.

## Consequences
- No new data field: targets come from `qty` and `prio`. A build that needs a different order in regular runs will
  need an explicit field later.
- Item keys (`<tier>:<English name>`) are part of the saved state; renaming an item resets its count.

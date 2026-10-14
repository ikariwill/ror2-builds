# Roadmap

## Now
- [x] UX v0.3 from the "RoR2 Builds UI/UX Redesign" canvas: core first, priority lanes, run mode with next pick,
  Ctrl+K palette with global item search (2026-10-13).
- [ ] Evolve the Logbook design system (see `design-system.md › Open questions`).
- [x] First deploy on Vercel (2026-10-13).

## Next
- [ ] Include the Hallowed Concepts DLC items once the wiki data is complete.
- [ ] Review Enforcer and Acolyte once the wiki and the pt-BR translation are out.
- [ ] Resolve the items in `data.md › Known pending verifications`.
- [ ] Decide whether challenge names use the game's pt-BR translation, and standardize.
- [ ] Bring into the repository a script that checks item effects against the wiki data (today it runs outside).
- [x] Mark "already picked up" per item, tied to the run mode ("Modo partida").
- [ ] Load each build on demand (today the JS bundle is ~215 KB gzip with all 21 builds).

## Ideas
- Compare two builds side by side.
- ~~Global item search: "on which survivors is this item essential?"~~ (done in the Ctrl+K palette).
- Export the run checklist as an image for the second monitor.

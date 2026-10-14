// Validates src/data/builds/*.json against the format in src/types.ts and checks that every icon exists.
// Usage: npm run validate
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIR = join(ROOT, 'src/data/builds');
const ICONS = join(ROOT, 'public/icons');

const TOP = ['id', 'name_pt', 'name_en', 'title', 'tagline', 'lede', 'loadout', 'skills', 'sections', 'synergy', 'rotation', 'essentials', 'situational_note', 'fallbacks', 'summary', 'checklist', 'sources', 'notes'];
const TIERS = ['common', 'uncommon', 'legendary', 'boss', 'equipment', 'lunar', 'void'];
const ITEM = ['icon', 'pt', 'en', 'prio', 'qty', 'effect', 'why'];
const SKILL = ['slot', 'pt', 'en', 'pick', 'spec', 'why'];

/** Maximum of a pt-BR quantity such as "3 a 6", "1", "2 a 4 (…)". No maximum ("ou mais", "+", "sem limite"): null. */
function qtyMax(q) {
  if (!q) return null;
  const head = String(q).split(' (')[0];
  if (/ou mais|\+|sem limite|não tem limite/i.test(q)) return null;
  const nums = head.match(/\d+/g);
  return nums ? Math.max(...nums.map(Number)) : null;
}

let failed = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()) {
  const errs = [];
  let d;
  try {
    d = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  } catch (e) {
    console.log(`✗ ${file}: invalid JSON (${e.message})`);
    failed++;
    continue;
  }
  const raw = readFileSync(join(DIR, file), 'utf8');
  if (raw !== JSON.stringify(d, null, 2) + '\n') errs.push('formatting does not match the standard (run npm run format:data)');
  for (const k of TOP) if (!(k in d)) errs.push(`missing key "${k}"`);
  if (d.id && `${d.id}.json` !== file) errs.push(`id "${d.id}" does not match the file name`);

  const names = new Set();
  let order = -1;
  for (const s of d.sections ?? []) {
    const i = TIERS.indexOf(s.id);
    if (i < 0) errs.push(`unknown section "${s.id}"`);
    if (i < order) errs.push(`section "${s.id}" out of order`);
    order = i;
    if (!s.items?.length) errs.push(`section "${s.id}" has no items`);
    for (const it of s.items ?? []) {
      for (const k of ITEM) if (!(k in it)) errs.push(`${it.en ?? '?'}: missing "${k}"`);
      if (![0, 1, 2, 3, 4].includes(it.prio)) errs.push(`${it.en}: invalid priority (${it.prio})`);
      if (!existsSync(join(ICONS, `${it.icon}.webp`))) errs.push(`${it.en}: icon public/icons/${it.icon}.webp does not exist`);
      names.add(it.en);
    }
  }
  for (const s of d.skills ?? []) for (const k of SKILL) if (!(k in s)) errs.push(`skill ${s.en ?? '?'}: missing "${k}"`);
  for (const e of d.essentials ?? []) if (!names.has(e.en)) errs.push(`essential "${e.en}" is not in any section (the core would miss it)`);

  // Pick order (Artifact of Command): optional, but if present it must match the item cards.
  if (d.command) {
    const qtyOf = Object.fromEntries((d.sections ?? []).flatMap((s) => s.items.map((i) => [i.en, i.qty])));
    const byTier = Object.fromEntries((d.sections ?? []).map((s) => [s.id, new Set(s.items.map((i) => i.en))]));
    if (typeof d.command.intro !== 'string') errs.push('command: missing "intro"');
    const seen = new Set();
    for (const t of d.command.tiers ?? []) {
      if (!TIERS.includes(t.tier)) errs.push(`command: unknown rarity "${t.tier}"`);
      if (seen.has(t.tier)) errs.push(`command: duplicate rarity "${t.tier}"`);
      seen.add(t.tier);
      if (!t.steps?.length) errs.push(`command.${t.tier}: no steps`);
      if (typeof t.then !== 'string') errs.push(`command.${t.tier}: missing "then"`);
      const total = {};
      for (const st of t.steps ?? []) {
        if (!byTier[t.tier]?.has(st.en)) errs.push(`command.${t.tier}: "${st.en}" is not among the item cards of this rarity`);
        if (!Number.isInteger(st.n) || st.n < 1) errs.push(`command.${t.tier}: "${st.en}" has invalid n (${st.n})`);
        if (!st.why) errs.push(`command.${t.tier}: "${st.en}" missing "why"`);
        total[st.en] = (total[st.en] ?? 0) + (st.n ?? 0);
      }
      // The total copies in the order cannot exceed the maximum of the card's quantity.
      for (const [en, n] of Object.entries(total)) {
        const max = qtyMax(qtyOf[en]);
        if (max !== null && n > max) errs.push(`command.${t.tier}: ${n}× "${en}" exceeds the card maximum ("${qtyOf[en]}")`);
      }
    }
  }

  const n = (d.sections ?? []).reduce((a, s) => a + (s.items?.length ?? 0), 0);
  if (errs.length) {
    failed++;
    console.log(`✗ ${file} (${n} items)\n  - ${errs.join('\n  - ')}`);
  } else {
    console.log(`✓ ${file} (${n} items)`);
  }
}
if (failed) {
  console.log(`\n${failed} file(s) with errors.`);
  process.exit(1);
}
console.log('\nAll builds are valid.');

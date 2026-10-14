// Valida src/data/builds/*.json contra o formato de src/types.ts e confere se cada ícone existe.
// Uso: npm run validate
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

/** Máximo de uma quantidade como "3 a 6", "1", "2 a 4 (…)". Sem máximo ("ou mais", "+", "sem limite"): null. */
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
    console.log(`✗ ${file}: JSON inválido (${e.message})`);
    failed++;
    continue;
  }
  const raw = readFileSync(join(DIR, file), 'utf8');
  if (raw !== JSON.stringify(d, null, 2) + '\n') errs.push('formatação fora do padrão (rode npm run format:data)');
  for (const k of TOP) if (!(k in d)) errs.push(`falta a chave "${k}"`);
  if (d.id && `${d.id}.json` !== file) errs.push(`id "${d.id}" não bate com o nome do arquivo`);

  const names = new Set();
  let order = -1;
  for (const s of d.sections ?? []) {
    const i = TIERS.indexOf(s.id);
    if (i < 0) errs.push(`seção desconhecida "${s.id}"`);
    if (i < order) errs.push(`seção "${s.id}" fora de ordem`);
    order = i;
    if (!s.items?.length) errs.push(`seção "${s.id}" sem itens`);
    for (const it of s.items ?? []) {
      for (const k of ITEM) if (!(k in it)) errs.push(`${it.en ?? '?'}: falta "${k}"`);
      if (![0, 1, 2, 3, 4].includes(it.prio)) errs.push(`${it.en}: prioridade inválida (${it.prio})`);
      if (!existsSync(join(ICONS, `${it.icon}.webp`))) errs.push(`${it.en}: ícone public/icons/${it.icon}.webp não existe`);
      names.add(it.en);
    }
  }
  for (const s of d.skills ?? []) for (const k of SKILL) if (!(k in s)) errs.push(`habilidade ${s.en ?? '?'}: falta "${k}"`);
  for (const e of d.essentials ?? []) if (!names.has(e.en)) errs.push(`essencial "${e.en}" não está em nenhuma seção (o núcleo fica sem ele)`);

  // Ordem de compra (Artefato da Autoridade): opcional, mas se existir precisa bater com os cards.
  if (d.command) {
    const qtyOf = Object.fromEntries((d.sections ?? []).flatMap((s) => s.items.map((i) => [i.en, i.qty])));
    const byTier = Object.fromEntries((d.sections ?? []).map((s) => [s.id, new Set(s.items.map((i) => i.en))]));
    if (typeof d.command.intro !== 'string') errs.push('command: falta "intro"');
    const seen = new Set();
    for (const t of d.command.tiers ?? []) {
      if (!TIERS.includes(t.tier)) errs.push(`command: raridade desconhecida "${t.tier}"`);
      if (seen.has(t.tier)) errs.push(`command: raridade "${t.tier}" repetida`);
      seen.add(t.tier);
      if (!t.steps?.length) errs.push(`command.${t.tier}: sem passos`);
      if (typeof t.then !== 'string') errs.push(`command.${t.tier}: falta "then"`);
      const total = {};
      for (const st of t.steps ?? []) {
        if (!byTier[t.tier]?.has(st.en)) errs.push(`command.${t.tier}: "${st.en}" não está nos cards dessa raridade`);
        if (!Number.isInteger(st.n) || st.n < 1) errs.push(`command.${t.tier}: "${st.en}" com n inválido (${st.n})`);
        if (!st.why) errs.push(`command.${t.tier}: "${st.en}" sem "why"`);
        total[st.en] = (total[st.en] ?? 0) + (st.n ?? 0);
      }
      // A soma de cópias na ordem não pode passar do máximo da quantidade do card.
      for (const [en, n] of Object.entries(total)) {
        const max = qtyMax(qtyOf[en]);
        if (max !== null && n > max) errs.push(`command.${t.tier}: ${n}× "${en}" passa do máximo do card ("${qtyOf[en]}")`);
      }
    }
  }

  const n = (d.sections ?? []).reduce((a, s) => a + (s.items?.length ?? 0), 0);
  if (errs.length) {
    failed++;
    console.log(`✗ ${file} (${n} itens)\n  - ${errs.join('\n  - ')}`);
  } else {
    console.log(`✓ ${file} (${n} itens)`);
  }
}
if (failed) {
  console.log(`\n${failed} arquivo(s) com erro.`);
  process.exit(1);
}
console.log('\nTodas as builds estão válidas.');

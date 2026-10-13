// Valida src/data/builds/*.json contra o formato de src/types.ts e confere se cada ícone existe.
// Uso: npm run validate
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIR = join(ROOT, 'src/data/builds');
const ICONS = join(ROOT, 'public/icons');

const TOP = ['id', 'name_pt', 'name_en', 'title', 'tagline', 'lede', 'loadout', 'skills', 'sections', 'synergy', 'rotation', 'essentials', 'situational_note', 'fallbacks', 'summary', 'checklist', 'sources', 'notes'];
const TIERS = ['comum', 'incomum', 'lendario', 'chefe', 'equipamento', 'lunar', 'vazio'];
const ITEM = ['icon', 'pt', 'en', 'prio', 'qty', 'effect', 'why'];
const SKILL = ['slot', 'pt', 'en', 'pick', 'spec', 'why'];

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

// Reescreve src/data/builds/*.json no formato padrão (2 espaços, quebra de linha no fim).
// Uso: npm run format:data
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(fileURLToPath(new URL('..', import.meta.url)), 'src/data/builds');
let changed = 0;
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json'))) {
  const p = join(DIR, f);
  const raw = readFileSync(p, 'utf8');
  const out = JSON.stringify(JSON.parse(raw), null, 2) + '\n';
  if (out !== raw) {
    writeFileSync(p, out);
    changed++;
  }
}
console.log(changed ? `${changed} arquivo(s) formatado(s).` : 'Formatação já estava em dia.');

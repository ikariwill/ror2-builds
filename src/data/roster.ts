import type { Build, FlatItem, Prio, TierId } from '../types.ts';

const modules = import.meta.glob<Build>('./builds/*.json', { eager: true, import: 'default' });

export const BUILDS: Record<string, Build> = {};
for (const path in modules) {
  const b = modules[path];
  BUILDS[b.id] = b;
}

export const GROUPS = [
  { label: 'Jogo base', ids: ['commando', 'huntress', 'bandit', 'mult', 'engineer', 'artificer', 'mercenary', 'rex', 'loader', 'acrid', 'captain'] },
  { label: 'Survivors of the Void', ids: ['railgunner', 'voidfiend'] },
  { label: 'Seekers of the Storm', ids: ['seeker', 'falseson', 'chef'] },
  { label: 'Alloyed Collective', ids: ['operator', 'drifter'] },
  { label: 'Hallowed Concepts', ids: ['enforcer', 'acolyte'] },
  { label: 'Secreta', ids: ['heretic'] },
].map((g) => ({ ...g, ids: g.ids.filter((id) => BUILDS[id]) }));

export const ORDER: string[] = GROUPS.flatMap((g) => g.ids);
export const DEFAULT_ID = BUILDS.bandit ? 'bandit' : ORDER[0];

export interface Tier {
  id: TierId | 'all';
  name: string;
  /** valor CSS do token da raridade (docs/design-system.md › Raridades) */
  color: string;
}

export const TIERS: Tier[] = [
  { id: 'all', name: 'Todos', color: 'var(--color-ink-3)' },
  { id: 'comum', name: 'Comum', color: 'var(--color-tier-comum)' },
  { id: 'incomum', name: 'Incomum', color: 'var(--color-tier-incomum)' },
  { id: 'lendario', name: 'Lendário', color: 'var(--color-tier-lendario)' },
  { id: 'chefe', name: 'Chefe', color: 'var(--color-tier-chefe)' },
  { id: 'equipamento', name: 'Equipamento', color: 'var(--color-tier-equipamento)' },
  { id: 'lunar', name: 'Lunar', color: 'var(--color-tier-lunar)' },
  { id: 'vazio', name: 'Vazio', color: 'var(--color-tier-vazio)' },
];
export const TIER = Object.fromEntries(TIERS.map((t) => [t.id, t])) as Record<Tier['id'], Tier>;

export type PrioFilter = 'all' | `${Prio}`;
export const PRIOS: { id: PrioFilter; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: '1', label: 'Essencial' },
  { id: '2', label: 'Alta' },
  { id: '3', label: 'Média' },
  { id: '4', label: 'Situacional' },
  { id: '0', label: 'Evitar' },
];
export const PRIO_LABEL: Record<Prio, string> = { 1: 'Essencial', 2: 'Alta', 3: 'Média', 4: 'Situacional', 0: 'Evitar' };

/** Ordenação por prioridade: 1 primeiro, "Evitar" (0) por último. */
export const rank = (p: Prio): number => (p === 0 ? 9 : p);

export function flatItems(build: Build): FlatItem[] {
  const essentials = new Set(build.essentials.map((e) => e.en));
  return build.sections.flatMap((s) =>
    s.items.map((it) => ({ ...it, tier: s.id, key: `${s.id}:${it.en}`, core: essentials.has(it.en) }))
  );
}

/** "3 a 6 (mais não faz mal)" → "3 a 6" para caber no selo do ícone. */
export const shortQty = (q: string): string => q.split(' (')[0].replace(' ou mais', '+');

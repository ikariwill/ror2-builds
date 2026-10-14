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
  id: TierId;
  name: string;
  /** CSS value of the rarity token (docs/design-system.md › Rarities) */
  color: string;
}

export const TIERS: Tier[] = [
  { id: 'common', name: 'Comum', color: 'var(--color-tier-common)' },
  { id: 'uncommon', name: 'Incomum', color: 'var(--color-tier-uncommon)' },
  { id: 'legendary', name: 'Lendário', color: 'var(--color-tier-legendary)' },
  { id: 'boss', name: 'Chefe', color: 'var(--color-tier-boss)' },
  { id: 'equipment', name: 'Equipamento', color: 'var(--color-tier-equipment)' },
  { id: 'lunar', name: 'Lunar', color: 'var(--color-tier-lunar)' },
  { id: 'void', name: 'Vazio', color: 'var(--color-tier-void)' },
];
export const TIER = Object.fromEntries(TIERS.map((t) => [t.id, t])) as Record<TierId, Tier>;

export const PRIO_LABEL: Record<Prio, string> = { 1: 'Essencial', 2: 'Alta', 3: 'Média', 4: 'Situacional', 0: 'Evitar' };
/** One-line meaning of each priority, shown next to its lane. */
export const PRIO_HINT: Record<Prio, string> = { 1: 'Pegue sempre', 2: 'Quando aparecer', 3: 'Bom, não urgente', 4: 'Só em certos casos', 0: 'Atrapalha a build' };
/** Lane marker color per priority (tokens only; the accent is reserved for Essential). */
export const PRIO_COLOR: Record<Prio, string> = {
  1: 'var(--color-accent)',
  2: 'var(--color-ink-2)',
  3: 'var(--color-ink-4)',
  4: 'var(--color-line-strong)',
  0: 'var(--color-prio-avoid)',
};
export const PRIO_ORDER: Prio[] = [1, 2, 3, 4, 0];

/** Sort by priority: 1 first, "Evitar" (Avoid, 0) last. */
export const rank = (p: Prio): number => (p === 0 ? 9 : p);

export function flatItems(build: Build): FlatItem[] {
  const essentials = new Set(build.essentials.map((e) => e.en));
  return build.sections.flatMap((s) =>
    s.items.map((it) => ({ ...it, tier: s.id, key: `${s.id}:${it.en}`, core: essentials.has(it.en) }))
  );
}

/** "Bandido: Build de Crítico" → { name: "Bandido", build: "Build de Crítico" }. */
export function splitTitle(title: string): { name: string; build: string } {
  const i = title.indexOf(':');
  return i < 0 ? { name: title, build: '' } : { name: title.slice(0, i).trim(), build: title.slice(i + 1).trim() };
}

/** Group (DLC) name of a survivor. */
export const groupOf = (id: string): string => GROUPS.find((g) => g.ids.includes(id))?.label ?? '';

/** "3 a 6 (mais não faz mal)" → "3-6", "4 ou mais (empilhe)" → "4+", so it fits a badge. */
export const shortQty = (q: string): string =>
  q
    .split(' (')[0]
    .replace(' ou mais', '+')
    .replace(/^(\d+) a (\d+)$/, '$1-$2');

/**
 * Target range parsed from a pt-BR quantity: "4 a 8" → 4..8, "1 ou mais" → 1..∞, "1" → 1..1, "0" → 0..0.
 * Text that does not start with a number gives 0..0 (never a pick target).
 */
export function qtyRange(q: string): { min: number; max: number } {
  const m = q.match(/^(\d+)(?: a (\d+))?( ou mais)?/);
  if (!m) return { min: 0, max: 0 };
  const min = Number(m[1]);
  return { min, max: m[2] ? Number(m[2]) : m[3] ? Infinity : min };
}

/** Range as a compact label: 4..8 → "4-8", 1..∞ → "1+", 1..1 → "1". */
export const rangeLabel = ({ min, max }: { min: number; max: number }): string =>
  max === Infinity ? `${min}+` : min === max ? `${min}` : `${min}-${max}`;

/** Lowercase without accents, for search: "Lendário" → "lendario". */
export const norm = (s: string): string => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const matches = (it: { pt: string; en: string }, q: string): boolean => {
  const n = norm(q.trim());
  return !n || norm(it.pt).includes(n) || norm(it.en).includes(n);
};

export type ItemView = 'prio' | 'tier';

export interface Lane {
  id: string;
  label: string;
  hint: string;
  /** CSS color of the lane marker */
  color: string;
  /** priority lanes tint their label; rarity lanes show a priority tag on each item instead */
  prio?: Prio;
  items: FlatItem[];
}

export interface ItemLanes {
  title: string;
  sub: string;
  lanes: Lane[];
  searching: boolean;
}

const plural = (n: number) => `${n} ${n === 1 ? 'item' : 'itens'}`;

/**
 * Groups the build's items for the "all items" section.
 * By priority it skips the core (already shown above it); by rarity and in search it lists everything.
 */
export function itemLanes(all: FlatItem[], view: ItemView, query: string): ItemLanes {
  const byRank = (a: FlatItem, b: FlatItem) => rank(a.prio) - rank(b.prio);
  if (query.trim()) {
    const hits = all.filter((i) => matches(i, query)).sort(byRank);
    return {
      title: 'Busca',
      sub: hits.length ? `${plural(hits.length)} com “${query.trim()}”.` : '',
      searching: true,
      lanes: hits.length ? [{ id: 'search', label: 'Resultados', hint: plural(hits.length), color: 'var(--color-accent)', items: hits }] : [],
    };
  }
  if (view === 'prio') {
    const rest = all.filter((i) => !i.core);
    return {
      title: 'Depois do núcleo',
      sub: `Os outros ${rest.length} itens da build, do mais ao menos útil.`,
      searching: false,
      lanes: PRIO_ORDER.map((p) => ({
        id: `p${p}`,
        label: PRIO_LABEL[p],
        hint: PRIO_HINT[p],
        color: PRIO_COLOR[p],
        prio: p,
        items: rest.filter((i) => i.prio === p),
      })).filter((l) => l.items.length),
    };
  }
  return {
    title: 'Todos os itens',
    sub: `Os ${all.length} itens da build por raridade, do mais ao menos útil.`,
    searching: false,
    lanes: TIERS.map((t) => {
      const items = all.filter((i) => i.tier === t.id).sort(byRank);
      return { id: t.id, label: t.name, hint: plural(items.length), color: t.color, items };
    }).filter((l) => l.items.length),
  };
}

/** First sentence of a text, for one-line summaries. */
export const firstSentence = (s: string): string => {
  const m = s.match(/^.+?[.!?](?=\s|$)/);
  return m ? m[0] : s;
};

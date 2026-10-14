import { useCallback, useEffect, useMemo, useState } from 'react';
import { TIER, TIERS, qtyRange, rank } from './data/roster.ts';
import type { Build, FlatItem, TierId } from './types.ts';

export type RunMode = 'normal' | 'command';

/** Per build: run mode, item counts by item key, and the equipment in hand. */
const RUN_KEY = 'ror2-builds:run';
/** Artifact of Command picks made per `${buildId}:${tier}` (kept from the first version of the counter). */
const CMD_KEY = 'ror2-builds:command';

interface RunSave {
  mode?: RunMode;
  bag?: Record<string, number>;
  equip?: string | null;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* no storage: counts only last for this visit */
  }
}

/** A value kept in localStorage that also follows changes made in another tab (the second-monitor window). */
function useStored<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [v, setV] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === key) setV(read(key, fallback));
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
    // fallback is a constant literal at every call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = useCallback(
    (nv: T) => {
      setV(nv);
      write(key, nv);
    },
    [key]
  );
  return [v, set];
}

export interface RunRow {
  item: FlatItem;
  n: number;
  min: number;
  max: number;
  /** reached the minimum of the build's quantity */
  met: boolean;
  /** reached the maximum: more copies add little */
  full: boolean;
  /** the next pick for this rarity */
  target: boolean;
  /** equipment only: the one in hand */
  held: boolean;
}

export interface RunGroup {
  tier: TierId;
  name: string;
  color: string;
  equipment: boolean;
  rows: RunRow[];
  /** next pick for this rarity; for equipment, the best one when another (or none) is in hand */
  target?: FlatItem;
  /** equipment only: something is already in hand */
  holding: boolean;
  /** only Medium items here: nothing to chase, pick them if they show up */
  optional: boolean;
}

export interface CommandRow {
  item: FlatItem;
  n: number;
  why: string;
  from: number;
  to: number;
  done: boolean;
  next: boolean;
}

export interface CommandTierState {
  tier: TierId;
  count: number;
  total: number;
  rows: CommandRow[];
  next?: CommandRow;
  then: string;
}

export interface RunState {
  mode: RunMode;
  setMode: (m: RunMode) => void;
  hasCommand: boolean;
  /** core items whose minimum is reached (equipment: in hand) */
  coreDone: number;
  coreTotal: number;
  groups: RunGroup[];
  add: (it: FlatItem, delta: number) => void;
  hold: (it: FlatItem) => void;
  command: CommandTierState[];
  commandIntro: string;
  setCommandCount: (tier: TierId, n: number) => void;
  /** items in the bag when following the pick order (derived, never typed twice) */
  commandBag: { item: FlatItem; n: number }[];
  reset: () => void;
}

/** Items worth tracking during a run: Essential to Medium with a real target quantity. */
const tracked = (i: FlatItem) => i.prio >= 1 && i.prio <= 3 && qtyRange(i.qty).min >= 1;

export function useRunState(build: Build, all: FlatItem[]): RunState {
  const [runs, setRuns] = useStored<Record<string, RunSave>>(RUN_KEY, {});
  const [counts, setCounts] = useStored<Record<string, number>>(CMD_KEY, {});
  const save = runs[build.id] ?? {};
  const hasCommand = !!build.command;
  const mode: RunMode = hasCommand ? (save.mode ?? 'normal') : 'normal';
  const update = (patch: RunSave) => setRuns({ ...runs, [build.id]: { ...save, ...patch } });

  const command = useMemo<CommandTierState[]>(() => {
    if (!build.command) return [];
    return build.command.tiers.map((t) => {
      const count = counts[`${build.id}:${t.tier}`] ?? 0;
      let pos = 0;
      const rows: CommandRow[] = [];
      for (const st of t.steps) {
        const item = all.find((i) => i.tier === t.tier && i.en === st.en);
        if (!item) continue;
        const from = pos + 1;
        pos += st.n;
        rows.push({ item, n: st.n, why: st.why, from, to: pos, done: count >= pos, next: false });
      }
      const next = rows.find((r) => count < r.to);
      if (next) next.next = true;
      return { tier: t.tier, count, total: pos, rows, next, then: t.then.replace(/^Depois:\s*/, '') };
    });
  }, [build, all, counts]);

  const commandBagMap = useMemo(() => {
    const bag: Record<string, number> = {};
    for (const t of command) {
      for (const r of t.rows) {
        const got = Math.max(0, Math.min(r.n, t.count - r.from + 1));
        if (got) bag[r.item.key] = (bag[r.item.key] ?? 0) + got;
      }
    }
    return bag;
  }, [command]);

  const bag = mode === 'command' ? commandBagMap : (save.bag ?? {});
  const equip = mode === 'command' ? null : (save.equip ?? null);

  const groups = useMemo<RunGroup[]>(
    () =>
      TIERS.map((t) => {
        const equipment = t.id === 'equipment';
        const items = all.filter((i) => i.tier === t.id && tracked(i)).sort((a, b) => rank(a.prio) - rank(b.prio));
        // Only Essential and High items are ever "the next pick"; Medium ones are tracked but never pushed.
        const pushable = items.filter((i) => i.prio <= 2);
        const best = equipment ? pushable[0] : undefined;
        const target = equipment
          ? equip === best?.key
            ? undefined
            : best
          : pushable.find((i) => (bag[i.key] ?? 0) < qtyRange(i.qty).min);
        const rows = items.map((item) => {
          const { min, max } = qtyRange(item.qty);
          const n = bag[item.key] ?? 0;
          return { item, n, min, max, met: n >= min, full: n >= max, target: target?.key === item.key, held: equip === item.key };
        });
        return { tier: t.id, name: TIER[t.id].name, color: TIER[t.id].color, equipment, rows, target, holding: !!equip, optional: !pushable.length };
      }).filter((g) => g.rows.length),
    [all, bag, equip]
  );

  const core = all.filter((i) => i.core);
  const coreDone = core.filter((i) =>
    i.tier === 'equipment' && mode === 'normal' ? equip === i.key : (bag[i.key] ?? 0) >= Math.max(1, qtyRange(i.qty).min)
  ).length;

  return {
    mode,
    setMode: (m) => update({ mode: m }),
    hasCommand,
    coreDone,
    coreTotal: core.length,
    groups,
    add: (it, delta) => {
      const b = { ...(save.bag ?? {}) };
      b[it.key] = Math.max(0, (b[it.key] ?? 0) + delta);
      update({ bag: b });
    },
    hold: (it) => update({ equip: save.equip === it.key ? null : it.key }),
    command,
    commandIntro: build.command?.intro ?? '',
    setCommandCount: (tier, n) => {
      const t = command.find((c) => c.tier === tier);
      if (!t) return;
      setCounts({ ...counts, [`${build.id}:${tier}`]: Math.max(0, Math.min(t.total, n)) });
    },
    commandBag: Object.entries(commandBagMap)
      .map(([key, n]) => ({ item: all.find((i) => i.key === key)!, n }))
      .filter((x) => x.item),
    reset: () => {
      setRuns({ ...runs, [build.id]: { mode } });
      const c = { ...counts };
      for (const k of Object.keys(c)) if (k.startsWith(`${build.id}:`)) delete c[k];
      setCounts(c);
    },
  };
}

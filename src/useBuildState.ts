import { useEffect, useMemo, useState } from 'react';
import { BUILDS, DEFAULT_ID, flatItems, rank, type PrioFilter } from './data/roster.ts';
import type { Build, FlatItem, TierId } from './types.ts';

const DONE_KEY = 'ror2-builds:done';

function readHash(): string {
  const id = (window.location.hash || '').replace(/^#\/?/, '').split('/')[0];
  return BUILDS[id] ? id : DEFAULT_ID;
}

function loadDone(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveDone(v: Record<string, boolean>) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(v));
  } catch {
    /* sem armazenamento: a lista vale só nesta visita */
  }
}

export function useMedia(query: string): boolean {
  const [m, setM] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

export interface BuildState {
  sid: string;
  build: Build;
  all: FlatItem[];
  core: FlatItem[];
  list: FlatItem[];
  selected: FlatItem | undefined;
  select: (it: FlatItem) => void;
  tier: TierId | 'all';
  setTier: (t: TierId | 'all') => void;
  prio: PrioFilter;
  setPrio: (p: PrioFilter) => void;
  query: string;
  setQuery: (q: string) => void;
  done: Record<string, boolean>;
  toggle: (k: string) => void;
  resetChecks: () => void;
  go: (id: string) => void;
}

/** Estado da página: sobrevivente (pela URL #/id), filtros, item selecionado e lista da partida. */
export function useBuildState(): BuildState {
  const [sid, setSid] = useState(readHash);
  const [tier, setTier] = useState<TierId | 'all'>('all');
  const [prio, setPrio] = useState<PrioFilter>('all');
  const [query, setQuery] = useState('');
  const [selKey, setSelKey] = useState<string | null>(null);
  const [done, setDone] = useState(loadDone);

  useEffect(() => {
    const on = () => setSid(readHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const build = BUILDS[sid];

  useEffect(() => {
    setTier('all');
    setPrio('all');
    setQuery('');
    setSelKey(null);
    document.title = `${build.name_pt} · Logbook de Builds · Risk of Rain 2`;
    window.scrollTo(0, 0);
  }, [build]);

  const all = useMemo(() => flatItems(build), [build]);
  const core = useMemo(() => all.filter((i) => i.core).sort((a, b) => rank(a.prio) - rank(b.prio)), [all]);
  const selected = all.find((i) => i.key === selKey) ?? core[0] ?? all[0];

  const q = query.trim().toLowerCase();
  const list = all
    .filter((it) => (tier === 'all' || it.tier === tier) && (prio === 'all' || String(it.prio) === prio))
    .filter((it) => !q || it.pt.toLowerCase().includes(q) || it.en.toLowerCase().includes(q))
    .sort((a, b) => rank(a.prio) - rank(b.prio));

  const toggle = (k: string) => {
    const nd = { ...done, [k]: !done[k] };
    setDone(nd);
    saveDone(nd);
  };
  const resetChecks = () => {
    const nd = { ...done };
    build.checklist.forEach((_, i) => delete nd[`${sid}:${i}`]);
    setDone(nd);
    saveDone(nd);
  };

  return {
    sid, build, all, core, list, selected,
    select: (it) => setSelKey(it.key),
    tier, setTier, prio, setPrio, query, setQuery,
    done, toggle, resetChecks,
    go: (id) => {
      window.location.hash = `/${id}`;
    },
  };
}

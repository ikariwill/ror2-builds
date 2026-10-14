import { useEffect, useMemo, useState } from 'react';
import { BUILDS, DEFAULT_ID, flatItems, itemLanes, rank, type ItemLanes, type ItemView } from './data/roster.ts';
import type { Build, FlatItem } from './types.ts';

/** Hash route: `#/<survivor>` is the build page, `#/<survivor>/partida` is run mode. */
function readRoute(): { sid: string; run: boolean } {
  const [id, sub] = (window.location.hash || '').replace(/^#\/?/, '').split('/');
  return { sid: BUILDS[id] ? id : DEFAULT_ID, run: sub === 'partida' };
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
  /** items for the "all items" section, grouped by the current view or by the search */
  lanes: ItemLanes;
  selected: FlatItem | undefined;
  select: (it: FlatItem) => void;
  view: ItemView;
  setView: (v: ItemView) => void;
  query: string;
  setQuery: (q: string) => void;
  /** true on the run mode route */
  run: boolean;
  go: (id: string) => void;
  runHref: string;
  buildHref: string;
}

/** Page state: survivor and run mode (from the URL hash), item grouping, search and selected item. */
export function useBuildState(): BuildState {
  const [route, setRoute] = useState(readRoute);
  const [view, setView] = useState<ItemView>('prio');
  const [query, setQuery] = useState('');
  const [selKey, setSelKey] = useState<string | null>(null);
  const { sid, run } = route;

  useEffect(() => {
    const on = () => setRoute(readRoute());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const build = BUILDS[sid];

  useEffect(() => {
    setQuery('');
    setSelKey(null);
    document.title = `${build.name_pt} · Logbook de Builds · Risk of Rain 2`;
  }, [build]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [build, run]);

  const all = useMemo(() => flatItems(build), [build]);
  const core = useMemo(() => all.filter((i) => i.core).sort((a, b) => rank(a.prio) - rank(b.prio)), [all]);
  const lanes = useMemo(() => itemLanes(all, view, query), [all, view, query]);
  const selected = all.find((i) => i.key === selKey) ?? core[0] ?? all[0];

  return {
    sid, build, all, core, lanes, selected,
    select: (it) => setSelKey(it.key),
    view, setView, query, setQuery,
    run,
    go: (id) => {
      window.location.hash = `/${id}`;
    },
    runHref: `#/${sid}/partida`,
    buildHref: `#/${sid}`,
  };
}

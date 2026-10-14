// Ctrl+K (⌘K on macOS): jump to a survivor, or look an item up across every build.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { BUILDS, GROUPS, PRIO_LABEL, PRIO_ORDER, TIER, matches, splitTitle } from '../data/roster.ts';
import type { Prio, TierId } from '../types.ts';
import { Label, cx, icon } from './ui.tsx';

interface IndexedItem {
  en: string;
  pt: string;
  icon: string;
  tier: TierId;
  /** survivor ids per priority; Avoid (0) is left out, it is not a reason to open a build */
  by: Partial<Record<Prio, string[]>>;
  count: number;
}

/** Every item across the 21 builds, keyed by English name. Built once. */
const ITEM_INDEX: IndexedItem[] = (() => {
  const map = new Map<string, IndexedItem>();
  for (const id of GROUPS.flatMap((g) => g.ids)) {
    for (const s of BUILDS[id].sections) {
      for (const it of s.items) {
        if (it.prio === 0) continue;
        const e = map.get(it.en) ?? { en: it.en, pt: it.pt, icon: it.icon, tier: s.id, by: {}, count: 0 };
        (e.by[it.prio] ??= []).push(id);
        e.count++;
        map.set(it.en, e);
      }
    }
  }
  return [...map.values()];
})();

type Result = { kind: 'item'; item: IndexedItem; go: string } | { kind: 'survivor'; id: string; group: string };

export function CommandPalette({ open, onClose, go }: { open: boolean; onClose: () => void; go: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setQ('');
      setActive(0);
      d.showModal();
    } else if (!open && d.open) d.close();
  }, [open]);

  const results = useMemo<Result[]>(() => {
    const items: Result[] =
      q.trim().length < 2
        ? []
        : ITEM_INDEX.filter((i) => matches(i, q))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3)
            .map((item) => ({ kind: 'item', item, go: PRIO_ORDER.flatMap((p) => item.by[p] ?? [])[0] }));
    const survivors: Result[] = GROUPS.flatMap((g) =>
      g.ids
        .filter((id) => matches({ pt: BUILDS[id].name_pt, en: BUILDS[id].name_en }, q))
        .map((id) => ({ kind: 'survivor' as const, id, group: g.label }))
    );
    return [...items, ...survivors];
  }, [q]);

  const pick = (r: Result | undefined) => {
    if (!r) return;
    go(r.kind === 'item' ? r.go : r.id);
    onClose();
  };

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = results.length;
      if (n) setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + n) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(results[active]);
    }
  };

  const items = results.filter((r): r is Extract<Result, { kind: 'item' }> => r.kind === 'item');
  const survivorGroups = GROUPS.map((g) => ({
    label: g.label,
    rows: results.map((r, i) => ({ r, i })).filter((x) => x.r.kind === 'survivor' && x.r.group === g.label),
  })).filter((g) => g.rows.length);

  return (
    <dialog
      ref={ref}
      aria-label="Buscar sobrevivente ou item"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto mt-[8vh] max-h-[80vh] w-[min(780px,calc(100vw-32px))] overflow-hidden rounded-panel border border-line-strong bg-panel p-0 text-ink backdrop:bg-black/70"
    >
      <div className="flex max-h-[80vh] flex-col">
        <div className="flex h-15 flex-none items-center gap-3 border-b border-line px-4">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-3"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input
            autoFocus
            type="search"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results.length ? `palette-${active}` : undefined}
            aria-label="Sobrevivente ou item"
            placeholder="Sobrevivente ou item (ex.: Mira Laser, Canhoneira)"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
            className="h-full min-w-0 flex-1 border-0 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-4"
          />
          <kbd className="rounded-tag border border-line-strong px-1.5 font-mono text-label text-ink-2">Esc</kbd>
        </div>

        <div id="palette-list" role="listbox" aria-label="Resultados" className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-3 pb-4">
          {items.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>Item · em quais builds ele entra</Label>
              {items.map((r) => {
                const i = results.indexOf(r);
                const it = r.item;
                return (
                  <div
                    key={it.en}
                    id={`palette-${i}`}
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    className={cx('flex gap-3.5 rounded-card border border-line-soft p-3.5', i === active ? 'bg-raised ring-1 ring-accent ring-inset' : 'bg-sunken')}
                  >
                    <img src={icon(it.icon)} alt="" width={48} height={48} className="size-12 flex-none object-contain" />
                    <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                        <span className="text-base font-semibold">{it.pt}</span>
                        {it.pt !== it.en && <span className="text-meta text-ink-3">{it.en}</span>}
                        <span className="font-mono text-label tracking-[0.06em] uppercase" style={{ color: TIER[it.tier].color }}>{TIER[it.tier].name}</span>
                        <span className="ml-auto text-xs text-ink-3">em {it.count} de {GROUPS.flatMap((g) => g.ids).length} builds</span>
                      </div>
                      {PRIO_ORDER.filter((p) => it.by[p]).map((p) => (
                        <div key={p} className="flex items-start gap-2.5">
                          <span className={cx('w-28 flex-none pt-1 font-mono text-label tracking-[0.06em] uppercase', p === 1 ? 'text-accent' : 'text-ink-2')}>
                            {PRIO_LABEL[p]} · {it.by[p]!.length}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {it.by[p]!.map((id) => (
                              <a
                                key={id}
                                href={`#/${id}`}
                                tabIndex={-1}
                                onClick={onClose}
                                className={cx(
                                  'inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-medium no-underline',
                                  p === 1 ? 'bg-accent text-on-accent hover:text-on-accent' : 'text-ink-2 ring-1 ring-line ring-inset hover:text-ink'
                                )}
                              >
                                {BUILDS[id].name_pt}
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {survivorGroups.map((g) => (
            <div key={g.label} className="flex flex-col gap-1">
              <Label>{g.label}</Label>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-1">
                {g.rows.map(({ r, i }) => {
                  if (r.kind !== 'survivor') return null;
                  const b = BUILDS[r.id];
                  return (
                    <a
                      key={r.id}
                      id={`palette-${i}`}
                      role="option"
                      aria-selected={i === active}
                      href={`#/${r.id}`}
                      tabIndex={-1}
                      onClick={onClose}
                      onMouseEnter={() => setActive(i)}
                      className={cx('flex min-h-13 flex-col justify-center gap-0.5 rounded-card px-3 py-1.5 no-underline', i === active ? 'bg-raised ring-1 ring-accent ring-inset' : 'hover:bg-sunken')}
                    >
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold text-ink">{b.name_pt}</span>
                        {b.name_pt !== b.name_en && <span className="truncate font-mono text-label text-ink-4">{b.name_en}</span>}
                      </span>
                      <span className="text-xs text-ink-3">{splitTitle(b.title).build}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}

          {!results.length && <p className="m-0 p-6 text-center text-sm text-ink-3">Nada com “{q.trim()}”. Tente o nome em inglês, como “Laser Scope”.</p>}
        </div>

        <div className="flex flex-none gap-4 border-t border-line bg-sunken px-4 py-2.5 font-mono text-label text-ink-3">
          <span>↑ ↓ escolher</span>
          <span>Enter abrir</span>
          <span>Esc fechar</span>
          <span className="ml-auto">/ busca só na build aberta</span>
        </div>
      </div>
    </dialog>
  );
}

/** Opens the palette on Ctrl+K / ⌘K and focuses the build search on "/". */
export function usePaletteShortcuts(setOpen: (v: boolean) => void, searchId: string) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.closest('input, textarea, select, [contenteditable="true"]') !== null);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === '/' && !typing) {
        const el = document.getElementById(searchId);
        if (el) {
          e.preventDefault();
          el.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen, searchId]);
}

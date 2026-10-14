// Ordem de compra para o Artefato da Autoridade (Artifact of Command), com contador por raridade para usar durante a run.
import { useEffect, useMemo, useState } from 'react';
import { TIER } from '../data/roster.ts';
import type { Build, BuildItem, CommandTier, TierId } from '../types.ts';
import { Chip, Heading, ItemIcon, Label, cx } from './ui.tsx';

const KEY = 'ror2-builds:command';

function load(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}
function save(v: Record<string, number>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* sem armazenamento: o contador vale só nesta visita */
  }
}

interface Row {
  idx: number;
  from: number;
  to: number;
  item: BuildItem;
  n: number;
  why: string;
}

function rows(build: Build, t: CommandTier): Row[] {
  const items = build.sections.find((s) => s.id === t.tier)?.items ?? [];
  let pos = 0;
  return t.steps.flatMap((st, idx) => {
    const item = items.find((i) => i.en === st.en);
    if (!item) return [];
    const from = pos + 1;
    pos += st.n;
    return [{ idx, from, to: pos, item, n: st.n, why: st.why }];
  });
}

const range = (r: Row) => (r.from === r.to ? `${r.from}º` : `${r.from}º–${r.to}º`);

export function CommandOrder({ build, idPrefix, compact }: { build: Build; idPrefix: string; compact?: boolean }) {
  const order = build.command;
  const [tier, setTier] = useState<TierId>(order?.tiers[0]?.tier ?? 'common');
  const [counts, setCounts] = useState(load);

  useEffect(() => setTier(order?.tiers[0]?.tier ?? 'common'), [build.id, order]);

  const current = order?.tiers.find((t) => t.tier === tier) ?? order?.tiers[0];
  const list = useMemo(() => (current ? rows(build, current) : []), [build, current]);
  if (!order || !current) return null;

  const key = `${build.id}:${current.tier}`;
  const count = counts[key] ?? 0;
  const total = list.length ? list[list.length - 1].to : 0;
  const next = list.find((r) => count < r.to);
  const color = TIER[current.tier].color;

  const set = (v: number) => {
    const nc = { ...counts, [key]: Math.max(0, v) };
    setCounts(nc);
    save(nc);
  };

  return (
    <div className="flex flex-col gap-4">
      {!compact && <p className="m-0 max-w-[72ch] text-sm text-ink-2">{order.intro}</p>}

      <div role="tablist" aria-label="Raridade da essência" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 md:flex-wrap md:overflow-visible">
        {order.tiers.map((t) => {
          const on = t.tier === current.tier;
          const done = counts[`${build.id}:${t.tier}`] ?? 0;
          return (
            <Chip key={t.tier} role="tab" aria-selected={on} on={on} onClick={() => setTier(t.tier)}>
              <span aria-hidden="true" className="size-2 rounded-[2px]" style={{ background: TIER[t.tier].color }} />
              {TIER[t.tier].name}
              {done > 0 && <span className="font-mono text-label opacity-75">{done}</span>}
            </Chip>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-panel border border-line bg-panel p-4" style={{ boxShadow: `inset 0 3px 0 ${color}` }}>
        <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
          {next ? (
            <>
              <ItemIcon slug={next.item.icon} color={color} size={52} className="flex-none" />
              <div className="flex min-w-0 flex-col">
                <Label>Próxima escolha · {count + 1}º</Label>
                <span className="text-body leading-tight font-semibold">{next.item.pt}</span>
                {next.item.pt !== next.item.en && <span className="text-meta text-ink-3">{next.item.en}</span>}
              </div>
            </>
          ) : (
            <div className="flex min-w-0 flex-col">
              <Label>Lista completa</Label>
              <span className="text-sm text-ink-2">{current.then}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2" role="group" aria-label={`Essências de ${TIER[current.tier].name} já usadas`}>
          <button
            type="button"
            onClick={() => set(count - 1)}
            disabled={count === 0}
            aria-label="Desfazer uma escolha"
            className="grid size-11 cursor-pointer place-items-center rounded-card bg-raised text-ink disabled:cursor-default disabled:text-ink-off"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
          </button>
          <output id={`${idPrefix}-cmd-count`} aria-live="polite" className="min-w-16 text-center">
            <span className="block font-mono text-h-md leading-none text-ink">{count}</span>
            <span className="label">de {total}</span>
          </output>
          <button
            type="button"
            onClick={() => set(count + 1)}
            aria-label="Peguei o próximo item"
            className="grid size-11 cursor-pointer place-items-center rounded-card bg-accent text-on-accent"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </button>
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-1 p-0">
        {list.map((r) => {
          const done = count >= r.to;
          const isNext = next?.idx === r.idx;
          return (
            <li
              key={r.idx}
              className={cx(
                'flex items-start gap-3 rounded-card px-3 py-2.5',
                isNext ? 'bg-raised ring-1 ring-inset ring-accent' : done ? 'opacity-55' : ''
              )}
            >
              <span className="w-12 flex-none pt-1 font-mono text-meta text-ink-3 tabular-nums md:w-16">{range(r)}</span>
              <ItemIcon slug={r.item.icon} color={color} size={40} className="flex-none" />
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm leading-tight font-semibold">
                  {r.item.pt} <span className="font-mono text-label text-ink-3">×{r.n}</span>
                  {done && <span className="sr-only"> (feito)</span>}
                </span>
                <span className="text-meta text-ink-2">{r.why}</span>
              </span>
              {done && (
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" className="mt-1 flex-none text-accent">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
      <p className="m-0 text-sm text-ink-3">
        <strong className="font-semibold text-ink-2">Depois:</strong> {current.then.replace(/^Depois:\s*/, '')}
      </p>
      {count > 0 && (
        <button type="button" onClick={() => set(0)} className="cursor-pointer self-start text-meta text-ink-3 underline underline-offset-4 hover:text-ink">
          Zerar contador de {TIER[current.tier].name.toLowerCase()}
        </button>
      )}
    </div>
  );
}

export function CommandSection({ build, idPrefix }: { build: Build; idPrefix: string }) {
  if (!build.command) return null;
  return (
    <section id="ordem" aria-labelledby={`${idPrefix}-ordem-h`} className="flex scroll-mt-16 flex-col gap-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <Heading id={`${idPrefix}-ordem-h`}>Ordem de compra</Heading>
        <Label>Artefato da Autoridade (Artifact of Command)</Label>
      </div>
      <CommandOrder build={build} idPrefix={idPrefix} />
    </section>
  );
}

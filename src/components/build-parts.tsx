// Content blocks of a build, used by the desktop and mobile views.
import { BUILDS, GROUPS, PRIO_LABEL, PRIOS, TIER, TIERS, type PrioFilter } from '../data/roster.ts';
import type { Build, FlatItem, TierId } from '../types.ts';
import { Chip, Heading, Label, cx, icon } from './ui.tsx';

/** Native survivor selector, grouped by DLC. Used on mobile and on narrow desktop (no rail). */
export function SurvivorSelect({ id, sid, go, className }: { id: string; sid: string; go: (id: string) => void; className?: string }) {
  return (
    <div className={cx('relative', className)}>
      <label htmlFor={id} className="sr-only">
        Sobrevivente
      </label>
      <select
        id={id}
        value={sid}
        onChange={(e) => go(e.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-card border border-line bg-panel pr-10 pl-3.5 text-body font-semibold text-ink"
      >
        {GROUPS.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.ids.map((sv) => (
              <option key={sv} value={sv}>
                {BUILDS[sv].name_pt}
                {BUILDS[sv].name_pt !== BUILDS[sv].name_en ? ` (${BUILDS[sv].name_en})` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute top-3.5 right-3.5 text-ink-3">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

export function TierTabs({ all, tier, setTier }: { all: FlatItem[]; tier: TierId | 'all'; setTier: (t: TierId | 'all') => void }) {
  return (
    <div role="tablist" aria-label="Raridade" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 md:flex-wrap md:overflow-visible">
      {TIERS.map((t) => {
        const n = t.id === 'all' ? all.length : all.filter((x) => x.tier === t.id).length;
        if (!n) return null;
        const on = tier === t.id;
        return (
          <Chip key={t.id} role="tab" aria-selected={on} on={on} onClick={() => setTier(t.id)}>
            <span aria-hidden="true" className="size-2 rounded-[2px]" style={{ background: t.color }} />
            {t.name}
            <span className="font-mono text-label opacity-75">{n}</span>
          </Chip>
        );
      })}
    </div>
  );
}

export function PrioChips({ prio, setPrio }: { prio: PrioFilter; setPrio: (p: PrioFilter) => void }) {
  return (
    <div role="group" aria-label="Prioridade" className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-meta text-ink-3">Prioridade</span>
      {PRIOS.map((p) => (
        <Chip key={p.id} variant="filter" aria-pressed={prio === p.id} on={prio === p.id} onClick={() => setPrio(p.id)}>
          {p.label}
        </Chip>
      ))}
    </div>
  );
}

export function ItemDetail({ it }: { it: FlatItem | undefined; build?: Build }) {
  if (!it) return null;
  const t = TIER[it.tier];
  const prioColor = it.prio === 1 ? 'text-accent' : it.prio === 0 ? 'text-prio-avoid-ink' : 'text-ink';
  return (
    <div className="overflow-hidden rounded-panel border border-line bg-panel">
      <div className="h-1.5" style={{ background: t.color }} />
      <div className="flex flex-col gap-3.5 p-5">
        <div className="flex items-start gap-4">
          <img src={icon(it.icon)} alt={`Ícone de ${it.pt}`} width={88} height={88} className="size-[88px] flex-none object-contain" />
          <div className="flex min-w-0 flex-col gap-1">
            <Label style={{ color: t.color }}>{t.name}</Label>
            <Heading size="md" className="text-[28px] leading-none">{it.pt}</Heading>
            {it.pt !== it.en && <span className="text-sm text-ink-3">{it.en}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-0.5 rounded-control bg-surface px-3 py-2.5">
            <Label>Prioridade</Label>
            <span className={cx('font-semibold', prioColor)}>{PRIO_LABEL[it.prio]}</span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-control bg-surface px-3 py-2.5">
            <Label>Quantidade</Label>
            <span className="font-semibold">{it.qty}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label>Efeito</Label>
          <p className="m-0 text-sm text-ink-2">{it.effect}</p>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-accent">Por que nesta build</Label>
          <p className="m-0 text-sm text-ink-2">{it.why}</p>
        </div>
      </div>
    </div>
  );
}

export interface ChecklistProps {
  build: Build;
  done: Record<string, boolean>;
  toggle: (k: string) => void;
  resetChecks: () => void;
  idPrefix: string;
}

export function Checklist({ build, done, toggle, resetChecks, idPrefix }: ChecklistProps) {
  const items = build.checklist;
  const n = items.filter((_, i) => done[`${build.id}:${i}`]).length;
  return (
    <section aria-labelledby={`${idPrefix}-run`} className="flex flex-col gap-3.5 rounded-panel border border-line-soft bg-sunken p-5">
      <div className="flex items-center justify-between gap-3">
        <Heading id={`${idPrefix}-run`} size="md" className="whitespace-nowrap">Modo partida</Heading>
        <span className="flex-none font-mono text-meta text-ink-3">{n}/{items.length} feito</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-line-soft" aria-hidden="true">
        <div className="h-full bg-accent transition-[width]" style={{ width: `${items.length ? (n / items.length) * 100 : 0}%` }} />
      </div>
      {items.map((c, i) => {
        const k = `${build.id}:${i}`;
        const id = `${idPrefix}-ck-${i}`;
        return (
          <label key={k} htmlFor={id} className="flex cursor-pointer items-start gap-3">
            <input id={id} type="checkbox" checked={!!done[k]} onChange={() => toggle(k)} className="mt-0.5 size-5 flex-none" />
            <span className={cx('text-sm leading-relaxed', done[k] ? 'text-ink-off line-through' : 'text-ink-2')}>
              <strong className="font-semibold">{c.title}.</strong> {c.text}
            </span>
          </label>
        );
      })}
      {n > 0 && (
        <button type="button" onClick={resetChecks} className="cursor-pointer self-start text-meta text-ink-3 underline underline-offset-4 hover:text-ink">
          Limpar marcações
        </button>
      )}
    </section>
  );
}

export function Rotation({ build, idPrefix }: { build: Build; idPrefix: string }) {
  return (
    <section aria-labelledby={`${idPrefix}-rot`} className="flex flex-col gap-2.5">
      <Heading id={`${idPrefix}-rot`} size="md">Rotação</Heading>
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {build.rotation.map((r, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="grid size-6.5 flex-none place-items-center rounded-full bg-line-soft font-mono text-label text-accent">{i + 1}</span>
            <span className="text-sm text-ink-2">
              <strong className="font-semibold text-ink">{r.step}.</strong> {r.text}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Notes({ build }: { build: Build }) {
  if (!build.notes?.length) return null;
  return (
    <aside className="flex flex-col gap-1.5 rounded-card border border-dashed border-line px-4 py-3">
      <h3 className="m-0 text-sm font-semibold">Observações</h3>
      <ul className="m-0 flex flex-col gap-1 pl-4 text-sm text-ink-3">
        {build.notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </aside>
  );
}

export function Skills({ build }: { build: Build }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3">
      {build.skills.map((s, i) => (
        <article key={i} className="flex min-w-0 flex-col gap-2 rounded-card border border-line bg-panel px-4 py-4">
          <Label>{s.slot}</Label>
          <h3 className="m-0 text-base font-semibold">
            {s.pt}
            {s.pt !== s.en && <span className="font-normal text-ink-3"> ({s.en})</span>}
          </h3>
          <span
            className={cx(
              'self-start rounded-tag px-2 py-0.5 font-mono text-label uppercase',
              s.pick === 'Recomendada' ? 'bg-accent text-on-accent' : 'text-ink-3 ring-1 ring-inset ring-line'
            )}
          >
            {s.pick}
          </span>
          <p className="m-0 text-sm font-semibold">{s.spec}</p>
          <p className="m-0 text-sm text-ink-2">{s.why}</p>
        </article>
      ))}
    </div>
  );
}

export function Synergy({ build }: { build: Build }) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      {build.synergy.map((s, i) => (
        <div key={i} className="flex min-w-0 flex-col gap-1.5 rounded-card border border-line-soft bg-sunken px-4 py-4">
          <h3 className="m-0 text-base font-semibold">{s.title}</h3>
          <p className="m-0 text-sm text-ink-2">{s.text}</p>
        </div>
      ))}
    </div>
  );
}

export function Fallbacks({ build }: { build: Build }) {
  return (
    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {build.fallbacks.map((f, i) => (
        <div key={i} className="flex flex-col gap-1 rounded-card border border-line-soft px-4 py-3">
          <span className="text-sm font-semibold">Sem {f.pt}</span>
          <p className="m-0 text-sm text-ink-2">{f.text}</p>
        </div>
      ))}
    </div>
  );
}

export function Summary({ build }: { build: Build }) {
  return (
    <section className="flex flex-col gap-2 rounded-panel bg-ink px-6 py-5 text-surface">
      <Heading size="md" className="text-surface">Resumo</Heading>
      <p className="m-0">{build.summary}</p>
    </section>
  );
}

export function Sources({ build }: { build: Build }) {
  return (
    <footer className="text-sm text-ink-3">
      <p className="m-0">Fontes desta build</p>
      <ul className="mt-2 flex flex-col gap-1 pl-4">
        {build.sources.map((s, i) => (
          <li key={i}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink-2 hover:text-ink">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto max-w-5xl px-4 py-8 text-meta text-ink-4">
      <p className="m-0">
        Mecânicas da{' '}
        <a href="https://riskofrain2.wiki.gg/" target="_blank" rel="noopener noreferrer">Risk of Rain 2 Wiki</a>. Textos e ícones dos itens a partir dos módulos de dados
        da wiki (via{' '}
        <a href="https://github.com/tsieck/petrichor-index" target="_blank" rel="noopener noreferrer">Petrichor Index</a>, verificado em 10/08/2026). Nomes em português do
        arquivo de idioma pt-BR do jogo. Itens da DLC Hallowed Concepts ainda não entram nas listas. Site de fã, sem afiliação com a Hopoo Games ou a Gearbox.
      </p>
    </footer>
  );
}

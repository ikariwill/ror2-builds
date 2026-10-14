// Run mode: what to pick next during a run. Desktop (second monitor) and the mobile "Partida" tab.
import { useEffect, useState } from 'react';
import { TIER, rangeLabel, splitTitle } from '../data/roster.ts';
import type { Build, FlatItem, TierId } from '../types.ts';
import { useRunState, type CommandTierState, type RunGroup, type RunRow, type RunState } from '../useRunState.ts';
import { AvoidNote, Reminders, Rotation } from './build-parts.tsx';
import { Chip, Heading, ItemIcon, Label, Segmented, cx, icon } from './ui.tsx';

/** Where each rarity comes from during a regular run: names the next pick as an answer to "this printer turns into what?". */
const SOURCE: Record<TierId, string> = {
  common: 'Impressora branca',
  uncommon: 'Impressora verde',
  legendary: 'Impressora vermelha',
  boss: 'Item de chefe',
  equipment: 'Barril de equipamento',
  lunar: 'Bazar lunar',
  void: 'Berço do Vazio',
};

const MODES: [RunState['mode'], string][] = [
  ['normal', 'Run normal'],
  ['command', 'Artefato da Autoridade'],
];

function nextText(g: RunGroup): string {
  if (g.optional) return 'Só se aparecer';
  if (g.equipment) return g.target ? `${g.holding ? 'Troque por' : 'Pegue'} ${g.target.pt}` : 'Pronto';
  return g.target ? g.target.pt : 'Metas cumpridas';
}

/** Two clicks to clear the run, so a stray click does not wipe the counters. */
function ResetButton({ onReset, className }: { onReset: () => void; className?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = window.setTimeout(() => setArmed(false), 4000);
    return () => window.clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={() => {
        if (armed) {
          onReset();
          setArmed(false);
        } else setArmed(true);
      }}
      className={cx(
        'min-h-10 cursor-pointer rounded-card border px-3.5 text-meta font-medium',
        armed ? 'border-prio-avoid bg-prio-avoid text-prio-avoid-ink' : 'border-line-strong text-ink-2 hover:text-ink',
        className
      )}
    >
      {armed ? 'Clique de novo para zerar' : 'Nova partida'}
    </button>
  );
}

function CoreCount({ run }: { run: RunState }) {
  const done = run.coreDone === run.coreTotal;
  return (
    <span className="inline-flex items-baseline gap-2" aria-label={`Núcleo: ${run.coreDone} de ${run.coreTotal} itens na meta`}>
      <Label>Núcleo</Label>
      <span className={cx('font-mono text-h-md leading-none', done ? 'text-accent' : 'text-ink')}>
        {run.coreDone}/{run.coreTotal}
      </span>
    </span>
  );
}

function rowLabel(r: RunRow, equipment: boolean) {
  return equipment ? (r.held ? 'EM MÃOS' : '') : `${r.n} / ${rangeLabel(r)}`;
}

function rowAria(r: RunRow, equipment: boolean) {
  return equipment
    ? `${r.held ? 'Soltar' : 'Estou com'} ${r.item.pt}`
    : `Peguei ${r.item.pt}. Tenho ${r.n}, meta ${rangeLabel(r)}`;
}

/** Desktop row: the whole row adds one; the small minus undoes. */
function RowDesktop({ r, g, run }: { r: RunRow; g: RunGroup; run: RunState }) {
  return (
    <li className={cx('flex items-center rounded-card', r.target ? 'bg-raised ring-1 ring-accent ring-inset' : r.held ? 'bg-raised' : 'bg-sunken')}>
      <button
        type="button"
        aria-label={rowAria(r, g.equipment)}
        onClick={() => (g.equipment ? run.hold(r.item) : run.add(r.item, 1))}
        className="flex min-h-10 min-w-0 flex-1 cursor-pointer items-center gap-2 px-2 text-left"
      >
        <img src={icon(r.item.icon)} alt="" width={30} height={30} className="size-7.5 flex-none object-contain" />
        <span className={cx('min-w-0 flex-1 truncate text-meta font-medium', r.full || (g.equipment && g.holding && !r.held) ? 'text-ink-3' : 'text-ink')}>
          {r.item.pt}
        </span>
        <span className={cx('flex-none font-mono text-xs', r.met && !g.equipment ? 'text-accent' : r.held ? 'text-accent' : 'text-ink-3')}>
          {rowLabel(r, g.equipment)}
        </span>
      </button>
      {!g.equipment && r.n > 0 && (
        <button type="button" aria-label={`Tirar um ${r.item.pt}`} onClick={() => run.add(r.item, -1)} className="grid h-10 w-8 flex-none cursor-pointer place-items-center text-ink-4 hover:text-ink">
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
        </button>
      )}
    </li>
  );
}

function GroupDesktop({ g, run }: { g: RunGroup; run: RunState }) {
  return (
    <section aria-label={g.name} className="flex flex-col gap-1">
      <h2 className="m-0 flex min-h-7 items-center gap-2">
        <span aria-hidden="true" className="size-2 rounded-[2px]" style={{ background: g.color }} />
        <span className="font-mono text-label tracking-[0.08em] text-ink-2 uppercase">{g.name}</span>
        <span className={cx('ml-auto truncate text-xs', g.target ? 'text-accent' : 'text-ink-3')}>
          {g.target && !g.equipment && <span className="text-ink-3">{SOURCE[g.tier]}: </span>}
          {nextText(g)}
        </span>
      </h2>
      <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
        {g.rows.map((r) => (
          <RowDesktop key={r.item.key} r={r} g={g} run={run} />
        ))}
      </ul>
    </section>
  );
}

/** Pick order for the Artifact of Command: one click per essence; the bag is computed from it. */
function CommandPanel({ run, tier, setTier, compact }: { run: RunState; tier: TierId; setTier: (t: TierId) => void; compact?: boolean }) {
  const cur: CommandTierState | undefined = run.command.find((c) => c.tier === tier) ?? run.command[0];
  if (!cur) return null;
  const color = TIER[cur.tier].color;
  return (
    <div className="flex flex-col gap-3">
      <div role="tablist" aria-label="Raridade da essência" className={cx('flex gap-1.5', compact ? '-mx-4 overflow-x-auto px-4 pb-0.5' : 'flex-wrap')}>
        {run.command.map((c) => {
          const on = c.tier === cur.tier;
          return (
            <Chip key={c.tier} role="tab" aria-selected={on} on={on} dot={TIER[c.tier].color} size={compact ? 'lg' : 'md'} onClick={() => setTier(c.tier)}>
              {TIER[c.tier].name}
              <span className="font-mono text-label text-ink-3">
                {c.count}/{c.total}
              </span>
            </Chip>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-panel border border-line bg-panel p-3.5" style={{ boxShadow: `inset 0 3px 0 ${color}` }}>
        {cur.next ? (
          <div className="flex min-w-0 flex-[1_1_220px] items-center gap-3">
            <img src={icon(cur.next.item.icon)} alt="" width={56} height={56} className="size-14 flex-none object-contain" />
            <div className="flex min-w-0 flex-col">
              <Label>
                Próxima essência {TIER[cur.tier].name.toLowerCase()} · {cur.count + 1}º de {cur.total}
              </Label>
              <span className="text-body leading-tight font-semibold">{cur.next.item.pt}</span>
              <span className="text-meta text-ink-2">{cur.next.why}</span>
            </div>
          </div>
        ) : (
          <p className="m-0 flex-[1_1_220px] text-sm text-ink-2">
            <strong className="font-semibold text-accent">Ordem completa.</strong> {cur.then}
          </p>
        )}
        <div className={cx('flex gap-2', compact && 'w-full')}>
          <button
            type="button"
            aria-label="Desfazer a última escolha"
            disabled={cur.count === 0}
            onClick={() => run.setCommandCount(cur.tier, cur.count - 1)}
            className={cx('grid flex-none cursor-pointer place-items-center rounded-card bg-raised text-ink disabled:cursor-default disabled:text-ink-off', compact ? 'size-14' : 'size-11')}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14l-4-4 4-4" /><path d="M5 10h9a5 5 0 010 10h-2" /></svg>
          </button>
          <button
            type="button"
            disabled={!cur.next}
            onClick={() => run.setCommandCount(cur.tier, cur.count + 1)}
            className={cx(
              'inline-flex cursor-pointer items-center justify-center gap-2 rounded-card bg-accent px-4 font-semibold text-on-accent disabled:cursor-default disabled:bg-line-soft disabled:text-ink-4',
              compact ? 'h-14 flex-1 text-body' : 'h-11'
            )}
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
            Escolhi
          </button>
        </div>
      </div>

      <ol className="m-0 flex list-none flex-col gap-0.5 p-0">
        {cur.rows.map((r) => (
          <li
            key={r.from}
            className={cx('flex min-h-9 items-center gap-2.5 rounded-control px-2.5', r.next ? 'bg-raised ring-1 ring-accent ring-inset' : r.done && 'opacity-55')}
          >
            <span className="w-14 flex-none font-mono text-xs text-ink-3 tabular-nums">{r.from === r.to ? `${r.from}º` : `${r.from}º-${r.to}º`}</span>
            <img src={icon(r.item.icon)} alt="" width={28} height={28} className="size-7 flex-none object-contain" />
            <span className="min-w-0 flex-1 truncate text-meta font-medium">
              {r.item.pt} <span className="font-mono text-label text-ink-3">×{r.n}</span>
            </span>
            {r.done && <span className="font-mono text-label text-accent">FEITO</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CommandBag({ run }: { run: RunState }) {
  if (!run.commandBag.length) {
    return <p className="m-0 rounded-card border border-dashed border-line p-5 text-meta text-ink-3">Nada ainda. Cada “Escolhi” entra aqui.</p>;
  }
  return (
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1.5 p-0">
      {run.commandBag.map(({ item, n }) => (
        <li key={item.key} title={item.pt} className="relative flex flex-col items-center gap-1 rounded-card bg-sunken px-1 pt-2 pb-1.5">
          <ItemIcon slug={item.icon} color={TIER[item.tier].color} size={40} alt={item.pt} />
          <span className="absolute top-1 right-1.5 font-mono text-xs text-ink">×{n}</span>
        </li>
      ))}
    </ul>
  );
}

const firstCommandTier = (run: RunState): TierId => run.command[0]?.tier ?? 'common';

/** Desktop run mode, made to sit on a second monitor next to the game. */
export function RunDesktop({ build, all, buildHref }: { build: Build; all: FlatItem[]; buildHref: string }) {
  const run = useRunState(build, all);
  const [tier, setTier] = useState<TierId>(firstCommandTier(run));
  const { name } = splitTitle(build.title);

  return (
    <div className="min-h-dvh bg-ground">
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line-soft bg-ground px-5 py-2.5">
        <a href={buildHref} className="inline-flex min-h-11 items-center gap-1.5 text-meta text-ink-3 no-underline hover:text-ink">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
          Build
        </a>
        <h1 className="heading m-0 text-h-lg">{name}</h1>
        <Label className="text-accent">Modo partida</Label>
        {run.hasCommand && <Segmented label="Tipo de partida" value={run.mode} options={MODES} onChange={run.setMode} />}
        <div className="ml-auto flex items-center gap-5">
          <CoreCount run={run} />
          <ResetButton onReset={run.reset} />
        </div>
      </header>

      {run.mode === 'normal' ? (
        <main className="flex flex-col gap-6 px-5 pt-4 pb-10">
          <p className="m-0 text-meta text-ink-3">
            Clique no item que pegou. Em cada raridade, o destaque dourado mostra o próximo alvo: o item mais importante que ainda não chegou à quantidade mínima.
          </p>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] items-start gap-x-5 gap-y-6">
            {run.groups.map((g) => (
              <GroupDesktop key={g.tier} g={g} run={run} />
            ))}
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,360px),1fr))] gap-4">
            <section aria-labelledby="run-tips" className="flex flex-col gap-3 rounded-panel border border-line-soft bg-sunken p-4">
              <Heading id="run-tips" size="md">Lembretes</Heading>
              <AvoidNote all={all} />
              <Reminders build={build} />
            </section>
            <section aria-labelledby="run-rot" className="flex flex-col gap-3 rounded-panel border border-line-soft p-4">
              <Heading id="run-rot" size="md">Rotação</Heading>
              <Rotation build={build} />
            </section>
          </div>
        </main>
      ) : (
        <main className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] items-start gap-6 px-5 pt-4 pb-10">
          <section aria-label="Ordem de compra">
            <CommandPanel run={run} tier={tier} setTier={setTier} />
          </section>
          <section aria-labelledby="run-bag" className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <Heading id="run-bag" size="md">Sua mochila</Heading>
              <span className="text-xs text-ink-3">calculada pelas escolhas</span>
            </div>
            <CommandBag run={run} />
            <p className="m-0 rounded-panel border border-line-soft bg-sunken px-4 py-3 text-sm text-ink-2">{run.commandIntro}</p>
            <AvoidNote all={all} />
          </section>
        </main>
      )}
    </div>
  );
}

/** Mobile "Partida" tab: the next pick in one big button, then the full list for the rarity. */
export function RunMobile({ build, all }: { build: Build; all: FlatItem[] }) {
  const run = useRunState(build, all);
  const [tier, setTier] = useState<TierId>('common');
  const [cmdTier, setCmdTier] = useState<TierId>(firstCommandTier(run));
  const g = run.groups.find((x) => x.tier === tier) ?? run.groups[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <CoreCount run={run} />
        <ResetButton onReset={run.reset} className="min-h-11" />
      </div>
      {run.hasCommand && <Segmented label="Tipo de partida" value={run.mode} options={[['normal', 'Run normal'], ['command', 'Autoridade']]} onChange={run.setMode} className="w-full" />}

      {run.mode === 'command' ? (
        <>
          <CommandPanel run={run} tier={cmdTier} setTier={setCmdTier} compact />
          <section aria-labelledby="m-run-bag" className="flex flex-col gap-2">
            <h2 id="m-run-bag" className="label m-0">Mochila · calculada pelas escolhas</h2>
            <CommandBag run={run} />
          </section>
        </>
      ) : (
        g && (
          <>
            <div role="tablist" aria-label="Raridade" className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5">
              {run.groups.map((x) => {
                const on = x.tier === g.tier;
                return (
                  <Chip key={x.tier} role="tab" aria-selected={on} on={on} dot={x.color} size="lg" onClick={() => setTier(x.tier)}>
                    {x.name}
                  </Chip>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 rounded-panel border border-line bg-panel p-3.5" style={{ boxShadow: `inset 0 3px 0 ${g.color}` }}>
              <Label>{SOURCE[g.tier]}</Label>
              {g.target ? (
                <div className="flex items-center gap-3">
                  <img src={icon(g.target.icon)} alt="" width={56} height={56} className="size-14 flex-none object-contain" />
                  <div className="flex min-w-0 flex-col">
                    <span className="text-body leading-tight font-semibold">{nextText(g)}</span>
                    {!g.equipment && (
                      <span className="text-meta text-ink-2">
                        Você tem {g.rows.find((r) => r.target)?.n ?? 0} · meta {rangeLabel(g.rows.find((r) => r.target)!)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="m-0 text-sm text-ink-2">
                  {g.optional
                    ? 'Nada aqui é prioridade nesta build. Pegue só se aparecer.'
                    : g.equipment
                      ? 'Você já está com o melhor equipamento da build.'
                      : 'Todas as metas desta raridade foram cumpridas.'}
                </p>
              )}
              {g.target && (
                <button
                  type="button"
                  onClick={() => (g.equipment ? run.hold(g.target!) : run.add(g.target!, 1))}
                  className="inline-flex h-14 cursor-pointer items-center justify-center gap-2 rounded-card bg-accent text-body font-semibold text-on-accent"
                >
                  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>
                  {g.equipment ? 'Estou com ele' : 'Peguei'}
                </button>
              )}
            </div>

            <section aria-label={`Todos de ${g.name}`} className="flex flex-col gap-1">
              <h2 className="label m-0 mb-1">Todos de {g.name.toLowerCase()} · toque no que pegou</h2>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {g.rows.map((r) => (
                  <li key={r.item.key} className={cx('flex min-h-13 items-center gap-2.5 rounded-card pl-2.5', r.target ? 'bg-raised ring-1 ring-accent ring-inset' : 'bg-sunken')}>
                    <img src={icon(r.item.icon)} alt="" width={34} height={34} className="size-8.5 flex-none object-contain" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-meta leading-tight font-medium">{r.item.pt}</span>
                      <span className={cx('font-mono text-label', (g.equipment ? r.held : r.met) ? 'text-accent' : 'text-ink-3')}>
                        {g.equipment ? (r.held ? 'EM MÃOS' : 'equipamento') : `${r.n} / ${rangeLabel(r)}`}
                      </span>
                    </span>
                    {g.equipment ? (
                      <button type="button" aria-pressed={r.held} onClick={() => run.hold(r.item)} className="min-h-11 flex-none cursor-pointer rounded-card px-3 text-meta text-ink-2">
                        {r.held ? 'Soltar' : 'Estou com'}
                      </button>
                    ) : (
                      <>
                        <button type="button" aria-label={`Tirar um ${r.item.pt}`} disabled={r.n === 0} onClick={() => run.add(r.item, -1)} className="grid size-11 flex-none cursor-pointer place-items-center text-ink-3 disabled:cursor-default disabled:text-ink-off">
                          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14" /></svg>
                        </button>
                        <button type="button" aria-label={`Peguei ${r.item.pt}`} onClick={() => run.add(r.item, 1)} className="grid size-11 flex-none cursor-pointer place-items-center rounded-card bg-raised text-ink">
                          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )
      )}

      <AvoidNote all={all} />
      <details className="group rounded-card border border-line-soft">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold">
          Lembretes
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-3 transition-transform group-open:rotate-180"><path d="M6 9l6 6 6-6" /></svg>
        </summary>
        <div className="px-4 pb-4">
          <Reminders build={build} />
        </div>
      </details>
    </div>
  );
}

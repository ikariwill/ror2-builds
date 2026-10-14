import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TIER, groupOf, shortQty, splitTitle } from '../data/roster.ts';
import type { BuildState } from '../useBuildState.ts';
import type { FlatItem } from '../types.ts';
import { Heading, Label, QtyBadge, SearchField, Segmented, cx, icon } from '../components/ui.tsx';
import {
  AvoidNote, Fallbacks, ItemDetail, ItemLanesList, Notes, Rotation, SiteFooter, Skills, Sources, Summary, Synergy, SurvivorSelect, itemAria,
} from '../components/build-parts.tsx';
import { RunMobile } from '../components/run-mode.tsx';

type Tab = 'build' | 'items' | 'run';
const TABS: [Tab, string][] = [
  ['build', 'Build'],
  ['items', 'Itens'],
  ['run', 'Partida'],
];

function More({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group rounded-card border border-line-soft">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold">
        {title}
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-ink-3 transition-transform group-open:rotate-180">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="px-3 pb-3">{children}</div>
    </details>
  );
}

export function Mobile(s: BuildState) {
  const { build, all, core, lanes, selected, sid } = s;
  const [tab, setTab] = useState<Tab>(s.run ? 'run' : 'build');
  const [sheet, setSheet] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setSheet(false), [sid]);
  useEffect(() => {
    if (s.run) setTab('run');
  }, [s.run]);
  useEffect(() => {
    if (!sheet) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);

  const open = (it: FlatItem) => {
    s.select(it);
    setSheet(true);
  };
  const { name, build: buildName } = splitTitle(build.title);

  return (
    <div className="min-h-dvh bg-surface pb-[calc(72px+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-10 flex flex-col gap-3 border-b border-line-soft bg-ground px-4 pt-[calc(14px+env(safe-area-inset-top))] pb-3">
        <div className="flex items-center justify-between">
          <span className="heading text-xl tracking-[0.04em]">Logbook de builds</span>
          <span className="font-mono text-label text-ink-3">RoR2</span>
        </div>
        <SurvivorSelect id="m-sv" sid={sid} go={s.go} />
        {tab === 'items' && <SearchField id="m-search" value={s.query} onChange={s.setQuery} />}
      </header>

      <main className="px-4 pt-4.5 pb-6">
        {tab === 'build' && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-accent">{build.name_en} · {groupOf(sid)}</Label>
              <Heading as="h1" className="text-[40px] leading-[0.95]">{name}</Heading>
              {buildName && <p className="heading m-0 text-lg font-semibold tracking-normal text-ink-2 normal-case">{buildName}</p>}
              <p className="m-0 mt-1 text-sm text-ink-2">{build.lede}</p>
            </div>
            <dl className="m-0 grid grid-cols-2 gap-2">
              {build.loadout.map((l, i) => (
                <div key={i} className="flex min-w-0 flex-col gap-0.5 rounded-card border border-line bg-panel px-3 py-2.5">
                  <dt className="label">{l.slot}</dt>
                  <dd className="m-0 text-sm leading-snug font-semibold">{l.skill.replace(/\s*\([^)]*\)$/, '')}</dd>
                </div>
              ))}
            </dl>
            <section aria-labelledby="m-core-h" className="flex flex-col gap-2.5">
              <div className="flex items-baseline justify-between">
                <Heading id="m-core-h" size="md">Núcleo</Heading>
                <span className="text-meta text-ink-3">toque para ver o motivo</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {core.map((it) => (
                  <button
                    key={it.key}
                    type="button"
                    aria-label={itemAria(it)}
                    onClick={() => open(it)}
                    className="relative grid aspect-square max-w-full cursor-pointer place-items-center rounded-card bg-panel"
                    style={{ boxShadow: `inset 0 -3px 0 ${TIER[it.tier].color}` }}
                  >
                    <img src={icon(it.icon)} alt="" width={52} height={52} className="size-13 object-contain" />
                    <QtyBadge small>{shortQty(it.qty)}</QtyBadge>
                  </button>
                ))}
              </div>
              <AvoidNote all={all} onShow={open} />
            </section>
            <section aria-labelledby="m-rot-h" className="flex flex-col gap-2.5">
              <Heading id="m-rot-h" size="md">Rotação</Heading>
              <Rotation build={build} />
            </section>
            <More title="Habilidades e alternativas"><Skills build={build} /></More>
            <More title="Como as peças se encaixam"><Synergy build={build} /></More>
            <More title="Quando faltar um essencial"><Fallbacks build={build} all={all} /></More>
            <Summary build={build} />
            <Notes build={build} />
            <Sources build={build} />
          </div>
        )}

        {tab === 'items' && (
          <div className="flex flex-col gap-4">
            {lanes.searching ? (
              lanes.sub && <p className="m-0 text-meta text-ink-3">{lanes.sub}</p>
            ) : (
              <Segmented label="Agrupar itens" value={s.view} options={[['prio', 'Por prioridade'], ['tier', 'Por raridade']]} onChange={s.setView} className="w-full" />
            )}
            {lanes.lanes.length ? (
              <ItemLanesList data={{ ...lanes, lanes: lanes.searching || s.view === 'tier' ? lanes.lanes : [coreLane(core), ...lanes.lanes] }} onOpen={open} />
            ) : (
              <p className="m-0 p-6 text-center text-ink-3">Nenhum item com “{s.query.trim()}”. Tente o nome em inglês.</p>
            )}
          </div>
        )}

        {tab === 'run' && <RunMobile key={sid} build={build} all={all} />}
      </main>
      <SiteFooter />

      {sheet && selected && (
        <div className="fixed inset-0 z-30">
          <button type="button" aria-label="Fechar detalhes" tabIndex={-1} onClick={() => setSheet(false)} className="absolute inset-0 cursor-default bg-black/60" />
          <section
            role="dialog"
            aria-modal="true"
            aria-label={selected.pt}
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[18px] border-t border-line bg-ground pt-2.5 pb-[calc(20px+env(safe-area-inset-bottom))]"
          >
            <span aria-hidden="true" className="mx-auto mb-1 block h-1 w-10 rounded-full bg-line-strong" />
            <div className="flex justify-end px-3">
              <button ref={closeRef} type="button" aria-label="Fechar" onClick={() => setSheet(false)} className="grid size-11 cursor-pointer place-items-center rounded-full bg-line-soft text-ink">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div className="px-3">
              <ItemDetail it={selected} build={build} />
            </div>
          </section>
        </div>
      )}

      <nav aria-label="Seções" className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-line-soft bg-ground pb-[env(safe-area-inset-bottom)]">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => {
              setTab(id);
              setSheet(false);
              window.scrollTo(0, 0);
            }}
            className={cx('flex h-[72px] cursor-pointer flex-col items-center justify-center gap-1.5 text-meta font-medium', tab === id ? 'text-ink' : 'text-ink-3')}
          >
            <span aria-hidden="true" className={cx('h-[3px] w-7 rounded-full', tab === id ? 'bg-accent' : 'bg-transparent')} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

/** On mobile the Items tab has no core block above it, so the core opens the priority list as its own lane. */
function coreLane(core: FlatItem[]) {
  return { id: 'core', label: 'Núcleo', hint: '', color: 'var(--color-accent)', prio: 1 as const, items: core };
}

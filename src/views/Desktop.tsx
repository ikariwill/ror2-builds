import { useState, type CSSProperties } from 'react';
import { BUILDS, GROUPS, ORDER, TIER, groupOf, shortQty, splitTitle } from '../data/roster.ts';
import type { BuildState } from '../useBuildState.ts';
import { Heading, ItemIcon, Label, QtyBadge, SearchField, Segmented, cx } from '../components/ui.tsx';
import {
  AvoidNote, Fallbacks, ItemDetail, ItemLanesGrid, Notes, Rotation, SiteFooter, Skills, Sources, Summary, Synergy, SurvivorSelect, itemAria,
} from '../components/build-parts.tsx';
import { RunDesktop } from '../components/run-mode.tsx';
import { CommandPalette, usePaletteShortcuts } from '../components/palette.tsx';

const SECTIONS: [string, string][] = [
  ['core', 'Núcleo'],
  ['items', 'Itens'],
  ['skills', 'Habilidades'],
  ['rotation', 'Rotação'],
  ['synergy', 'Sinergia'],
  ['fallbacks', 'Substitutos'],
];

const SEARCH_ID = 'search';

function PaletteButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Buscar sobrevivente ou item (Ctrl+K)"
      className="flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-card border border-line bg-sunken px-2.5 text-left text-meta text-ink-3 hover:text-ink"
    >
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      <span className="flex-1">Buscar</span>
      <kbd className="rounded-tag border border-line-strong px-1.5 font-mono text-label whitespace-nowrap text-ink-2">Ctrl K</kbd>
    </button>
  );
}

function RunLinks({ runHref }: { runHref: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <a href={runHref} className="inline-flex min-h-11 items-center gap-2 rounded-card bg-accent px-4.5 font-semibold text-on-accent no-underline hover:text-on-accent">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
        Modo partida
      </a>
      <a href={runHref} target="_blank" rel="noopener" className="text-meta text-ink-3 hover:text-ink">
        abrir em outra janela
      </a>
    </div>
  );
}

/** Survivor rail from 1180px up; below that the selector sits at the top of the content. */
export function Desktop(s: BuildState) {
  const { build, all, core, lanes, selected, select, sid } = s;
  const [palette, setPalette] = useState(false);
  usePaletteShortcuts(setPalette, SEARCH_ID);

  if (s.run) {
    return (
      <>
        <RunDesktop key={sid} build={build} all={all} buildHref={s.buildHref} />
        <CommandPalette open={palette} onClose={() => setPalette(false)} go={s.go} />
      </>
    );
  }

  const isSel = (key: string) => selected?.key === key;
  const { name, build: buildName } = splitTitle(build.title);
  // Core on one row when it fits; otherwise two balanced rows (never 6 + 1).
  const coreCols = { '--n': core.length, '--half': Math.ceil(core.length / 2) } as CSSProperties;

  return (
    <div className="min-h-dvh bg-surface">
      <div className="mx-auto grid max-w-[1680px] grid-cols-[minmax(0,1fr)_340px] min-[1180px]:grid-cols-[232px_minmax(0,1fr)_360px]">
        <nav
          aria-label="Sobreviventes"
          className="hidden flex-col gap-4 border-r border-line-soft pt-5 pr-3 pb-8 pl-4 min-[1180px]:sticky min-[1180px]:top-0 min-[1180px]:flex min-[1180px]:h-dvh min-[1180px]:overflow-y-auto"
        >
          <a href={`#/${sid}`} className="flex flex-col gap-0.5 px-3 text-ink no-underline hover:text-ink">
            <span className="heading text-lg tracking-[0.04em]">Logbook de builds</span>
            <span className="font-mono text-label tracking-[0.06em] text-ink-4">RISK OF RAIN 2 · {ORDER.length} BUILDS</span>
          </a>
          <PaletteButton onOpen={() => setPalette(true)} />
          {GROUPS.map((g) => (
            <div key={g.label} className="flex flex-col gap-0.5">
              <Label className="px-3 pb-1">{g.label}</Label>
              {g.ids.map((id) => {
                const b = BUILDS[id];
                const on = id === sid;
                return (
                  <a
                    key={id}
                    href={`#/${id}`}
                    aria-current={on ? 'page' : undefined}
                    className={cx(
                      'flex min-h-9 items-center justify-between gap-2 rounded-control px-3 py-1.5 text-sm font-medium no-underline',
                      on ? 'bg-raised text-ink shadow-[inset_3px_0_0_var(--color-accent)]' : 'text-ink-2 hover:bg-panel hover:text-ink'
                    )}
                  >
                    <span>{b.name_pt}</span>
                    {b.name_pt !== b.name_en && <span className="truncate font-mono text-label text-ink-4">{b.name_en}</span>}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <main className="flex min-w-0 flex-col">
          <header className="flex flex-wrap items-center gap-3 border-b border-line-soft px-8 pt-5 pb-4 min-[1180px]:hidden">
            <a href={`#/${sid}`} className="mr-auto flex items-baseline gap-3 text-ink no-underline hover:text-ink">
              <span className="heading text-[22px] tracking-[0.04em]">Logbook de builds</span>
              <span className="font-mono text-label tracking-[0.06em] text-ink-4">RISK OF RAIN 2</span>
            </a>
            <div className="w-64">
              <PaletteButton onOpen={() => setPalette(true)} />
            </div>
            <SurvivorSelect id="d-sv" sid={sid} go={s.go} className="w-64" />
          </header>

          <section className="flex flex-col gap-3.5 px-8 pt-8 pb-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-2">
                <Label className="text-accent">
                  {build.name_en} · {groupOf(sid)}
                </Label>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <Heading as="h1" size="xl">{name}</Heading>
                  {buildName && <p className="heading m-0 text-h-lg font-semibold tracking-normal text-ink-2 normal-case">{buildName}</p>}
                </div>
                <p className="m-0 max-w-[68ch] text-lede text-ink-2">{build.lede}</p>
              </div>
              <RunLinks runHref={s.runHref} />
            </div>
            <dl className="m-0 flex flex-wrap gap-2">
              {build.loadout.map((l, i) => (
                <div key={i} className="flex min-w-0 items-baseline gap-2 rounded-control border border-line bg-panel px-3 py-2">
                  <dt className="label">{l.slot}</dt>
                  <dd className="m-0 text-sm font-semibold">{l.skill.replace(/\s*\([^)]*\)$/, '')}</dd>
                </div>
              ))}
            </dl>
          </section>

          <nav aria-label="Seções da build" className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-y border-line-soft bg-surface px-6 py-1.5">
            {SECTIONS.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView(); }} className="flex min-h-9 flex-none items-center rounded-control px-2.5 text-meta font-medium text-ink-2 no-underline hover:bg-panel hover:text-ink">
                {label}
              </a>
            ))}
            <div className="ml-auto max-w-72 min-w-44 flex-1">
              <SearchField id={SEARCH_ID} compact hint="/" value={s.query} onChange={(v) => { s.setQuery(v); if (v) document.getElementById('items')?.scrollIntoView(); }} />
            </div>
          </nav>

          <div className="flex flex-col gap-11 px-8 pt-6 pb-14">
            <section id="core" aria-labelledby="core-h" className="@container flex scroll-mt-16 flex-col gap-3.5 rounded-panel border border-line bg-panel p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <Heading id="core-h">Núcleo da build</Heading>
                <span className="text-sm text-ink-3">Pegue estes sempre. O selo mostra quantos.</span>
              </div>
              <div style={coreCols} className="grid grid-cols-[repeat(var(--half),minmax(0,160px))] gap-1.5 @[680px]:grid-cols-[repeat(var(--n),minmax(0,160px))]">
                {core.map((it) => (
                  <button
                    key={it.key}
                    type="button"
                    aria-pressed={isSel(it.key)}
                    aria-label={itemAria(it)}
                    onClick={() => select(it)}
                    className={cx(
                      'flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-card bg-sunken px-1.5 pt-3.5 pb-2.5 text-center transition-colors hover:bg-raised',
                      isSel(it.key) && 'bg-raised ring-2 ring-accent ring-inset'
                    )}
                  >
                    <span className="relative">
                      <ItemIcon slug={it.icon} color={TIER[it.tier].color} size={60} />
                      <QtyBadge>{shortQty(it.qty)}</QtyBadge>
                    </span>
                    <span className="text-meta leading-tight font-medium text-ink">{it.pt}</span>
                  </button>
                ))}
              </div>
              <AvoidNote all={all} onShow={select} />
            </section>

            <section id="items" aria-labelledby="items-h" className="flex scroll-mt-16 flex-col gap-3.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <Heading id="items-h">{lanes.title}</Heading>
                  {lanes.sub && <span className="text-meta text-ink-3">{lanes.sub}</span>}
                </div>
                {!lanes.searching && (
                  <Segmented
                    label="Agrupar itens"
                    value={s.view}
                    options={[['prio', 'Por prioridade'], ['tier', 'Por raridade']]}
                    onChange={s.setView}
                  />
                )}
              </div>
              {lanes.lanes.length ? (
                <ItemLanesGrid data={lanes} selectedKey={selected?.key} onSelect={select} />
              ) : (
                <p className="m-0 rounded-panel border border-dashed border-line p-7 text-center text-ink-3">
                  Nenhum item com “{s.query.trim()}”. Tente o nome em inglês ou limpe a busca.
                </p>
              )}
            </section>

            <section id="skills" aria-labelledby="skills-h" className="flex scroll-mt-16 flex-col gap-3.5">
              <Heading id="skills-h">Habilidades</Heading>
              <Skills build={build} />
            </section>

            <section id="rotation" aria-labelledby="rotation-h" className="flex scroll-mt-16 flex-col gap-3.5">
              <Heading id="rotation-h">Rotação</Heading>
              <Rotation build={build} variant="cards" />
            </section>

            <section id="synergy" aria-labelledby="synergy-h" className="flex scroll-mt-16 flex-col gap-3.5">
              <Heading id="synergy-h">Como as peças se encaixam</Heading>
              <Synergy build={build} />
            </section>

            <section id="fallbacks" aria-labelledby="fallbacks-h" className="flex scroll-mt-16 flex-col gap-3.5">
              <Heading id="fallbacks-h">Quando faltar um essencial</Heading>
              <Fallbacks build={build} all={all} />
            </section>

            <Summary build={build} />
            <Notes build={build} />
            <Sources build={build} />
          </div>
          <SiteFooter />
        </main>

        <aside aria-label="Detalhes do item" className="sticky top-0 flex h-dvh flex-col gap-5 overflow-y-auto border-l border-line-soft bg-ground/40 px-5 pt-6 pb-10">
          <div aria-live="polite">
            <ItemDetail it={selected} build={build} />
          </div>
        </aside>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} go={s.go} />
    </div>
  );
}

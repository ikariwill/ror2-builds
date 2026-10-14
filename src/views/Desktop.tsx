import type { CSSProperties } from 'react';
import { BUILDS, GROUPS, ORDER, TIER, groupOf, shortQty, splitTitle } from '../data/roster.ts';
import type { BuildState } from '../useBuildState.ts';
import { Heading, ItemIcon, Label, PrioTag, QtyBadge, SearchField, cx, icon } from '../components/ui.tsx';
import {
  Checklist, Fallbacks, ItemDetail, Notes, PrioChips, Rotation, SiteFooter, Skills, Sources, Summary, Synergy, SurvivorSelect, TierTabs,
} from '../components/build-parts.tsx';
import { CommandSection } from '../components/command-order.tsx';

const tileBase = 'flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-card px-1.5 pt-3 pb-2.5 text-center transition-colors hover:bg-raised';
const tileSel = 'bg-raised ring-2 ring-accent';

const SECTIONS: [string, string][] = [
  ['core', 'Núcleo'],
  ['order', 'Ordem de compra'],
  ['items', 'Itens'],
  ['skills', 'Habilidades'],
  ['synergy', 'Sinergia'],
  ['fallbacks', 'Substitutos'],
];

/** Trilho de personagens a partir de 1180px; abaixo disso o seletor fica no topo do conteúdo. */
export function Desktop(s: BuildState) {
  const { build, all, core, list, selected, select, sid } = s;
  const isSel = (key: string) => selected?.key === key;
  const { name, build: buildName } = splitTitle(build.title);
  // Núcleo em uma linha quando cabe; senão em duas linhas equilibradas (nunca 6 + 1).
  const coreCols = { '--n': core.length, '--half': Math.ceil(core.length / 2) } as CSSProperties;

  return (
    <div className="min-h-dvh bg-surface">
      <div className={'mx-auto grid max-w-[1680px] grid-cols-[minmax(0,1fr)_340px] min-[1180px]:grid-cols-[232px_minmax(0,1fr)_360px]'}>
        <nav
          aria-label="Sobreviventes"
          className={'hidden flex-col gap-4 border-r border-line-soft pt-5 pr-3 pb-8 pl-4 min-[1180px]:sticky min-[1180px]:top-0 min-[1180px]:flex min-[1180px]:h-dvh min-[1180px]:overflow-y-auto'}
        >
          <a href={`#/${sid}`} className="flex flex-col gap-0.5 px-3 pb-2 text-ink no-underline hover:text-ink">
            <span className="heading text-lg tracking-[0.04em]">Logbook de builds</span>
            <span className="font-mono text-label tracking-[0.06em] text-ink-4">RISK OF RAIN 2 · {ORDER.length} BUILDS</span>
          </a>
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
          <header className={'flex flex-wrap items-center gap-3 border-b border-line-soft px-8 pt-5 pb-4 min-[1180px]:hidden'}>
            <a href={`#/${sid}`} className="mr-auto flex items-baseline gap-3 text-ink no-underline hover:text-ink">
              <span className="heading text-[22px] tracking-[0.04em]">Logbook de builds</span>
              <span className="font-mono text-label tracking-[0.06em] text-ink-4">RISK OF RAIN 2</span>
            </a>
            <SurvivorSelect id="d-sv" sid={sid} go={s.go} className="w-64" />
          </header>

          <section className="flex flex-col gap-3 px-8 pt-8 pb-6">
            <Label className="text-accent">
              {build.name_en} · {groupOf(sid)}
            </Label>
            <div className="flex flex-col gap-1">
              <Heading as="h1" size="xl">{name}</Heading>
              {buildName && <p className="heading m-0 text-h-md text-ink-2 normal-case tracking-normal font-semibold">{buildName}</p>}
            </div>
            <p className="m-0 max-w-[68ch] text-lede text-ink-2">{build.lede}</p>
            <dl className="m-0 mt-2 grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2">
              {build.loadout.map((l, i) => (
                <div key={i} className="flex min-w-0 flex-col gap-1 rounded-card border border-line bg-panel px-3.5 py-3">
                  <dt className="label">{l.slot}</dt>
                  <dd className="m-0 text-sm leading-snug font-semibold">{l.skill}</dd>
                </div>
              ))}
            </dl>
          </section>

          <nav aria-label="Seções da build" className="sticky top-0 z-10 flex items-center gap-1 overflow-x-auto border-y border-line-soft bg-surface/95 px-6 py-1.5">
            {SECTIONS.filter(([id]) => id !== 'order' || build.command).map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView(); }} className="flex min-h-9 flex-none items-center rounded-control px-2.5 text-meta font-medium text-ink-3 no-underline hover:bg-panel hover:text-ink">
                {label}
              </a>
            ))}
            <div className="ml-auto max-w-72 min-w-44 flex-1 py-0.5">
              <SearchField id="search" value={s.query} onChange={(v) => { s.setQuery(v); if (v) document.getElementById('items')?.scrollIntoView(); }} />
            </div>
          </nav>

          <div className="flex flex-col gap-10 px-8 pt-6 pb-12">
            <Notes build={build} />

            <section id="core" aria-labelledby="core-h" className="flex scroll-mt-16 flex-col gap-3.5 rounded-panel border border-line bg-panel px-5 py-5 @container">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <Heading id="core-h">Núcleo da build</Heading>
                <span className="text-sm text-ink-3">Pegue estes primeiro. Clique para ver o motivo.</span>
              </div>
              <div
                style={coreCols}
                className="grid grid-cols-[repeat(var(--half),minmax(0,1fr))] gap-1.5 @[680px]:grid-cols-[repeat(var(--n),minmax(0,1fr))]"
              >
                {core.map((it) => (
                  <button key={it.key} type="button" aria-pressed={isSel(it.key)} onClick={() => select(it)} className={cx(tileBase, isSel(it.key) && tileSel)}>
                    <span className="relative block">
                      <img src={icon(it.icon)} alt="" width={64} height={64} className="block size-16 object-contain" />
                      <QtyBadge>{shortQty(it.qty)}</QtyBadge>
                    </span>
                    <span className="text-meta leading-tight font-medium text-ink">{it.pt}</span>
                  </button>
                ))}
              </div>
            </section>

            <CommandSection build={build} idPrefix="d" />

            <section id="items" aria-labelledby="items-h" className="flex scroll-mt-16 flex-col gap-4">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <Heading id="items-h">Todos os itens</Heading>
                <span className="font-mono text-meta text-ink-3">
                  {list.length} de {all.length} itens
                </span>
              </div>
              <div className="flex flex-col gap-3">
                <TierTabs all={all} tier={s.tier} setTier={s.setTier} />
                <PrioChips prio={s.prio} setPrio={s.setPrio} />
              </div>
              {list.length ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-1.5">
                  {list.map((it) => (
                    <button key={it.key} type="button" aria-pressed={isSel(it.key)} onClick={() => select(it)} className={cx(tileBase, isSel(it.key) && tileSel)}>
                      <ItemIcon slug={it.icon} color={TIER[it.tier].color} size={60} />
                      <span className="text-meta leading-tight font-medium text-ink">{it.pt}</span>
                      <span className="mt-auto flex flex-wrap items-center justify-center gap-1.5">
                        <PrioTag p={it.prio} />
                        <span className="font-mono text-label text-ink-3">×{shortQty(it.qty)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="m-0 rounded-card border border-dashed border-line p-7 text-center text-ink-3">
                  Nenhum item com esse filtro. Limpe a busca ou escolha outra raridade.
                </p>
              )}
            </section>

            <section id="skills" aria-labelledby="skills-h" className="flex scroll-mt-16 flex-col gap-3.5">
              <Heading id="skills-h">Habilidades</Heading>
              <Skills build={build} />
            </section>

            <section id="synergy" aria-labelledby="synergy-h" className="flex scroll-mt-16 flex-col gap-3.5">
              <Heading id="synergy-h">Como as peças se encaixam</Heading>
              <Synergy build={build} />
            </section>

            <section id="fallbacks" aria-labelledby="fallbacks-h" className="flex scroll-mt-16 flex-col gap-3.5">
              <Heading id="fallbacks-h">Quando faltar um essencial</Heading>
              <Fallbacks build={build} />
            </section>

            <Summary build={build} />
            <Sources build={build} />
          </div>
          <SiteFooter />
        </main>

        <aside
          aria-label="Detalhes do item e modo partida"
          className="sticky top-0 flex h-dvh flex-col gap-5 overflow-y-auto border-l border-line-soft bg-ground/40 px-5 pt-6 pb-10"
        >
          <div aria-live="polite">
            <ItemDetail it={selected} build={build} />
          </div>
          <Checklist build={build} done={s.done} toggle={s.toggle} resetChecks={s.resetChecks} idPrefix="d" />
          <Rotation build={build} idPrefix="d" />
        </aside>
      </div>
    </div>
  );
}

import { BUILDS, GROUPS, ORDER, TIER, shortQty } from '../data/roster.ts';
import type { BuildState } from '../useBuildState.ts';
import { Heading, ItemIcon, Label, PrioTag, QtyBadge, SearchField, cx, icon } from '../components/ui.tsx';
import {
  Checklist, Fallbacks, ItemDetail, Notes, PrioChips, Rotation, SiteFooter, Skills, Sources, Summary, Synergy, TierTabs,
} from '../components/build-parts.tsx';

const tileBase = 'flex min-w-0 cursor-pointer flex-col items-center gap-2 rounded-card px-2 pt-3 pb-2.5 text-center transition-colors hover:bg-raised';
const tileSel = 'bg-raised ring-2 ring-accent';

export function Desktop(s: BuildState) {
  const { build, all, core, list, selected, select, sid } = s;
  const isSel = (key: string) => selected?.key === key;

  return (
    <div className="min-h-dvh bg-surface">
      <header className="flex flex-wrap items-center gap-x-7 gap-y-4 border-b border-line-soft bg-ground px-8 py-4">
        <a href={`#/${sid}`} className="flex items-baseline gap-3 text-ink no-underline hover:text-ink">
          <span className="heading text-[26px] tracking-[0.04em]">Logbook de builds</span>
          <span className="font-mono text-meta tracking-[0.06em] text-ink-3">RISK OF RAIN 2 · {ORDER.length} SOBREVIVENTES</span>
        </a>
        <div className="max-w-[520px] flex-[1_1_320px]">
          <SearchField id="busca" value={s.query} onChange={s.setQuery} />
        </div>
      </header>

      <div className="flex flex-wrap items-start">
        <nav aria-label="Sobreviventes" className="flex max-w-[260px] flex-[1_1_220px] flex-col gap-4.5 border-r border-line-soft py-5 pr-3 pl-5">
          {GROUPS.map((g) => (
            <div key={g.label} className="flex flex-col gap-0.5">
              <Label className="px-3 pb-1.5">{g.label}</Label>
              {g.ids.map((id) => {
                const b = BUILDS[id];
                const on = id === sid;
                return (
                  <a
                    key={id}
                    href={`#/${id}`}
                    aria-current={on ? 'page' : undefined}
                    className={cx(
                      'flex min-h-10 items-center justify-between gap-2 rounded-control px-3 py-2 text-sm font-medium no-underline',
                      on ? 'bg-raised text-ink shadow-[inset_3px_0_0_var(--color-accent)]' : 'text-ink-2 hover:bg-panel hover:text-ink'
                    )}
                  >
                    <span>{b.name_pt}</span>
                    {b.name_pt !== b.name_en && <span className="font-mono text-label text-ink-4">{b.name_en}</span>}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>

        <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-8 px-8 pt-7 pb-12">
          <section className="flex flex-col gap-3.5">
            <Label className="text-accent">{build.name_en} · build recomendada</Label>
            <Heading as="h1" size="xl">{build.title}</Heading>
            <p className="m-0 max-w-[72ch] text-lede text-ink-2">{build.lede}</p>
            <div className="mt-1.5 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2.5">
              {build.loadout.map((l, i) => (
                <div key={i} className="flex min-w-0 flex-col gap-1 rounded-card border border-line bg-panel px-3.5 py-3">
                  <Label>{l.slot}</Label>
                  <span className="text-body leading-snug font-semibold">{l.skill}</span>
                </div>
              ))}
            </div>
          </section>

          <Notes build={build} />

          <section aria-labelledby="nucleo" className="flex flex-col gap-3.5 rounded-panel border border-line bg-panel px-5.5 py-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <Heading id="nucleo">Núcleo da build</Heading>
              <span className="text-sm text-ink-3">Se pegar só estes, a build já funciona. Clique para ver o motivo.</span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-2">
              {core.map((it) => (
                <button key={it.key} type="button" aria-pressed={isSel(it.key)} onClick={() => select(it)} className={cx(tileBase, isSel(it.key) && tileSel)}>
                  <span className="relative block size-[72px]">
                    <img src={icon(it.icon)} alt="" width={72} height={72} className="block size-[72px] object-contain" />
                    <QtyBadge>{shortQty(it.qty)}</QtyBadge>
                  </span>
                  <span className="text-meta leading-tight font-medium text-ink">{it.pt}</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="itens" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <Heading id="itens">Todos os itens</Heading>
              <span className="font-mono text-meta text-ink-3">
                {list.length} de {all.length} itens
              </span>
            </div>
            <TierTabs all={all} tier={s.tier} setTier={s.setTier} />
            <PrioChips prio={s.prio} setPrio={s.setPrio} />
            {list.length ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(128px,1fr))] gap-2">
                {list.map((it) => (
                  <button key={it.key} type="button" aria-pressed={isSel(it.key)} onClick={() => select(it)} className={cx(tileBase, isSel(it.key) && tileSel)}>
                    <ItemIcon slug={it.icon} color={TIER[it.tier].color} />
                    <span className="text-meta leading-tight font-medium text-ink">{it.pt}</span>
                    <span className="flex flex-wrap items-center justify-center gap-1.5">
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

          <section aria-labelledby="habilidades" className="flex flex-col gap-3.5">
            <Heading id="habilidades">Habilidades</Heading>
            <Skills build={build} />
          </section>

          <section aria-labelledby="sinergia" className="flex flex-col gap-3.5">
            <Heading id="sinergia">Como as peças se encaixam</Heading>
            <Synergy build={build} />
          </section>

          <section aria-labelledby="subs" className="flex flex-col gap-3.5">
            <Heading id="subs">Quando faltar um essencial</Heading>
            <Fallbacks build={build} />
          </section>

          <Summary build={build} />
          <Sources build={build} />
        </main>

        <aside aria-label="Detalhes do item e modo partida" className="flex max-w-[400px] flex-[1_1_340px] flex-col gap-5 pt-7 pr-7 pb-12 pl-2">
          <div aria-live="polite">
            <ItemDetail it={selected} build={build} />
          </div>
          <Checklist build={build} done={s.done} toggle={s.toggle} resetChecks={s.resetChecks} idPrefix="d" />
          <Rotation build={build} idPrefix="d" />
        </aside>
      </div>
      <SiteFooter />
    </div>
  );
}

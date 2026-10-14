// Content blocks of a build, used by the desktop and mobile views.
import { BUILDS, GROUPS, PRIO_LABEL, TIER, firstSentence, shortQty, type ItemLanes } from '../data/roster.ts';
import type { Build, FlatItem, Skill, Source, SourceKind } from '../types.ts';
import { Heading, ItemIcon, Label, PrioTag, cx, icon } from './ui.tsx';

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

/** Quantity as shown on tiles and rows; Avoid items say so instead of "0". */
export const qtyText = (it: FlatItem) => (it.prio === 0 ? 'não pegue' : shortQty(it.qty));

/** Accessible name of an item button: the visible name plus rarity, priority and quantity. */
export const itemAria = (it: FlatItem) =>
  `${it.pt}, ${TIER[it.tier].name}, ${PRIO_LABEL[it.prio]}${it.prio === 0 ? '' : `, ${it.qty}`}`;

function LaneHead({ label, hint, color, tint }: { label: string; hint: string; color: string; tint: string }) {
  return (
    <>
      <span className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2 rounded-[2px]" style={{ background: color }} />
        <span className={cx('font-mono text-label tracking-[0.08em] uppercase', tint)}>{label}</span>
      </span>
      <span className="text-xs text-ink-3">{hint}</span>
    </>
  );
}

const laneTint = (prio: number | undefined) => (prio === 1 ? 'text-accent' : prio === 0 ? 'text-prio-avoid-ink' : 'text-ink-2');

/** Desktop: one row per lane, item tiles in a grid. Clicking a tile selects it for the detail panel. */
export function ItemLanesGrid({ data, selectedKey, onSelect }: { data: ItemLanes; selectedKey?: string; onSelect: (it: FlatItem) => void }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-panel border border-line-soft">
      {data.lanes.map((lane, i) => (
        <div key={lane.id} className={cx('flex flex-wrap gap-x-3 gap-y-2 px-3.5 py-3', i > 0 && 'border-t border-line-soft')}>
          <div className="flex flex-[0_0_120px] flex-col gap-0.5 pt-2">
            <LaneHead label={lane.label} hint={lane.hint} color={lane.color} tint={laneTint(lane.prio)} />
          </div>
          <div className="grid min-w-0 flex-[1_1_400px] grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-1">
            {lane.items.map((it) => {
              const on = selectedKey === it.key;
              return (
                <button
                  key={it.key}
                  type="button"
                  aria-pressed={on}
                  aria-label={itemAria(it)}
                  onClick={() => onSelect(it)}
                  className={cx(
                    'flex min-w-0 cursor-pointer flex-col items-center gap-1.5 rounded-card px-1.5 pt-2.5 pb-2 text-center transition-colors hover:bg-raised',
                    on && 'bg-raised ring-2 ring-accent ring-inset'
                  )}
                >
                  <ItemIcon slug={it.icon} color={TIER[it.tier].color} />
                  <span className="text-xs leading-tight font-medium text-ink">{it.pt}</span>
                  <span className="mt-auto flex flex-wrap items-center justify-center gap-1.5">
                    {lane.prio === undefined && <PrioTag p={it.prio} />}
                    <span className={cx('font-mono text-label', it.prio === 0 ? 'text-prio-avoid-ink' : 'text-ink-3')}>{qtyText(it)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Mobile: one list per lane; each row names the rarity in text so color is never the only cue. */
export function ItemLanesList({ data, onOpen }: { data: ItemLanes; onOpen: (it: FlatItem) => void }) {
  return (
    <div className="flex flex-col gap-4">
      {data.lanes.map((lane) => (
        <section key={lane.id} aria-label={lane.label} className="flex flex-col gap-0.5">
          <h3 className="m-0 mb-1 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2 rounded-[2px]" style={{ background: lane.color }} />
              <span className={cx('font-mono text-label tracking-[0.08em] uppercase', laneTint(lane.prio))}>{lane.label}</span>
            </span>
            <span className="font-mono text-label text-ink-4">{lane.items.length}</span>
          </h3>
          {lane.items.map((it) => (
            <button
              key={it.key}
              type="button"
              onClick={() => onOpen(it)}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-card px-2.5 py-1.5 text-left"
              style={{ boxShadow: `inset 3px 0 0 ${TIER[it.tier].color}` }}
            >
              <img src={icon(it.icon)} alt="" width={40} height={40} className="size-10 flex-none object-contain" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm leading-tight font-medium">{it.pt}</span>
                <span className="text-xs text-ink-3">
                  {TIER[it.tier].name}
                  {lane.prio === undefined && ` · ${PRIO_LABEL[it.prio]}`}
                </span>
              </span>
              <span className={cx('flex-none font-mono text-xs', it.prio === 0 ? 'text-prio-avoid-ink' : 'text-ink-2')}>{qtyText(it)}</span>
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}

/** "Evite" callout for the build's Avoid items, shown under the core so it is read before a Void cradle. */
export function AvoidNote({ all, onShow }: { all: FlatItem[]; onShow?: (it: FlatItem) => void }) {
  const avoid = all.filter((i) => i.prio === 0);
  if (!avoid.length) return null;
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {avoid.map((it) => (
        <li key={it.key} className="flex flex-wrap items-start gap-x-2.5 gap-y-1.5 rounded-card border border-line-soft bg-sunken px-3 py-2.5">
          <span className="mt-0.5 flex-none rounded-tag bg-prio-avoid px-1.5 font-mono text-[10.5px] tracking-[0.04em] text-prio-avoid-ink uppercase">Evite</span>
          <span className="min-w-0 flex-[1_1_240px] text-sm text-ink-2">
            <strong className="font-semibold text-ink">{it.pt}.</strong> {firstSentence(it.why)}
          </span>
          {onShow && (
            <button type="button" onClick={() => onShow(it)} className="min-h-9 flex-none cursor-pointer rounded-control border border-line-strong px-3 text-meta text-ink-2 hover:text-ink">
              Ver detalhe
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/** Fallback text for a core item, matched by its English name. */
export const fallbackFor = (build: Build, it: FlatItem | undefined) => (it ? build.fallbacks.find((f) => f.en === it.en)?.text : undefined);

export function ItemDetail({ it, build }: { it: FlatItem | undefined; build: Build }) {
  if (!it) return null;
  const t = TIER[it.tier];
  const prioColor = it.prio === 1 ? 'text-accent' : it.prio === 0 ? 'text-prio-avoid-ink' : 'text-ink';
  const fb = fallbackFor(build, it);
  return (
    <div className="flex flex-col gap-3.5">
      <div className="overflow-hidden rounded-panel border border-line bg-panel">
        <div className="h-1.5" style={{ background: t.color }} />
        <div className="flex flex-col gap-3.5 p-5">
          <div className="flex items-start gap-4">
            <img src={icon(it.icon)} alt={`Ícone de ${it.pt}`} width={80} height={80} className="size-20 flex-none object-contain" />
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
            <Label className="text-accent">Por que nesta build</Label>
            <p className="m-0 text-sm text-ink-2">{it.why}</p>
          </div>
          <div className="flex flex-col gap-1 border-t border-line-soft pt-3">
            <Label>Efeito no jogo</Label>
            <p className="m-0 text-meta text-ink-3">{it.effect}</p>
          </div>
        </div>
      </div>
      {fb && (
        <div className="flex flex-col gap-1 rounded-panel border border-line-soft bg-sunken px-4 py-3.5">
          <Label>Se não aparecer</Label>
          <p className="m-0 text-sm text-ink-2">{fb}</p>
        </div>
      )}
    </div>
  );
}

/** The build's checklist as run reminders: short rules to keep in sight, not tasks to tick. */
export function Reminders({ build, className }: { build: Build; className?: string }) {
  return (
    <ul className={cx('m-0 flex list-none flex-col gap-2 p-0', className)}>
      {build.checklist.map((c, i) => (
        <li key={i} className="text-sm text-ink-2">
          <strong className="font-semibold text-ink">{c.title}.</strong> {c.text}
        </li>
      ))}
    </ul>
  );
}

export function Rotation({ build, variant = 'list' }: { build: Build; variant?: 'list' | 'cards' }) {
  if (variant === 'cards') {
    return (
      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-2 p-0">
        {build.rotation.map((r, i) => (
          <li key={i} className="flex flex-col gap-1.5 rounded-card border border-line-soft bg-sunken p-3.5">
            <span className="grid size-6.5 place-items-center rounded-full bg-line-soft font-mono text-label text-accent">{i + 1}</span>
            <strong className="text-sm font-semibold">{r.step}</strong>
            <span className="text-meta text-ink-2">{r.text}</span>
          </li>
        ))}
      </ol>
    );
  }
  return (
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

interface SkillSlot {
  slot: string;
  use: Skill;
  alts: Skill[];
}

/** Groups "Primária" and "Primária (alt.)" into one slot: the pick to use plus its alternatives. */
function skillSlots(skills: Skill[]): SkillSlot[] {
  const order: string[] = [];
  const by: Record<string, Skill[]> = {};
  for (const s of skills) {
    const base = s.slot.replace(/\s*\(alt\.?[^)]*\)\s*$/, '');
    if (!by[base]) {
      by[base] = [];
      order.push(base);
    }
    by[base].push(s);
  }
  return order.map((slot) => {
    const list = by[slot];
    const use = list.find((s) => s.pick !== 'Variante') ?? list[0];
    return { slot, use, alts: list.filter((s) => s !== use) };
  });
}

const skillName = (s: Skill) => (s.pt !== s.en ? `${s.pt} (${s.en})` : s.pt);

/** One row per slot: what to use (with its numbers) and the alternatives. Stacks on narrow screens. */
export function Skills({ build }: { build: Build }) {
  return (
    <div className="overflow-hidden rounded-panel border border-line-soft">
      <div aria-hidden="true" className="hidden grid-cols-[110px_minmax(0,1fr)_220px] gap-4 bg-sunken px-4 py-2.5 md:grid">
        <span className="label">Slot</span>
        <span className="label text-accent">Use</span>
        <span className="label">Alternativa</span>
      </div>
      <ul className="m-0 list-none p-0">
        {skillSlots(build.skills).map((s) => (
          <li key={s.slot} className="grid gap-x-4 gap-y-1.5 border-t border-line-soft px-4 py-3 first:border-t-0 md:grid-cols-[110px_minmax(0,1fr)_220px] md:first:border-t">
            <span className="text-meta text-ink-3">{s.slot}</span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold text-ink">
                {skillName(s.use)}
                {s.use.pick !== 'Recomendada' && (
                  <span className="ml-2 rounded-tag px-1.5 py-0.5 align-middle font-mono text-[10.5px] text-ink-3 uppercase ring-1 ring-line ring-inset">{s.use.pick}</span>
                )}
              </span>
              <span className="max-w-[66ch] text-sm text-ink-2">{s.use.spec}</span>
            </div>
            <div className="text-meta text-ink-2">
              {s.alts.length ? (
                <>
                  <span className="mr-1 text-ink-3 md:hidden">Alternativa:</span>
                  {s.alts.map(skillName).join(' · ')}
                </>
              ) : (
                <span className="text-ink-4">Nenhuma</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Synergy({ build }: { build: Build }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-2.5">
      {build.synergy.map((s, i) => (
        <article key={i} className="flex min-w-0 flex-col gap-1.5 rounded-card border border-line-soft bg-sunken px-4 py-4">
          <h3 className="m-0 text-base font-semibold">{s.title}</h3>
          <p className="m-0 text-sm text-ink-2">{s.text}</p>
        </article>
      ))}
    </div>
  );
}

export function Fallbacks({ build, all }: { build: Build; all: FlatItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-2">
      {build.fallbacks.map((f, i) => {
        const it = all.find((x) => x.en === f.en);
        return (
          <div key={i} className="flex gap-3 rounded-card border border-line-soft px-4 py-3">
            {it && <img src={icon(it.icon)} alt="" width={36} height={36} className="size-9 flex-none object-contain opacity-60" />}
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold">Sem {f.pt}</span>
              <p className="m-0 text-sm text-ink-2">{f.text}</p>
            </div>
          </div>
        );
      })}
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

const KIND_LABEL: Record<SourceKind, string> = { wiki: 'Wiki', patch: 'Notas de patch', guide: 'Guia', video: 'Vídeo', forum: 'Fórum' };

/** "2025-06-08" → "06/2025", "2025-06" → "06/2025", "2021" → "2021". */
const monthYear = (d?: string) => (!d ? '' : d.length === 4 ? d : `${d.slice(5, 7)}/${d.slice(0, 4)}`);

function SourceList({ items }: { items: Source[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {items.map((s, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-x-2">
          <span className="w-24 flex-none font-mono text-label text-ink-4 uppercase">
            {KIND_LABEL[s.kind]}
            {s.date && ` · ${monthYear(s.date)}`}
          </span>
          <a href={s.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 text-ink-2 hover:text-ink">
            {s.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Player sources (what to pick) apart from wiki and patch notes (mechanics and numbers). */
export function Sources({ build }: { build: Build }) {
  const community = build.sources.filter((s) => s.kind === 'guide' || s.kind === 'video' || s.kind === 'forum');
  const reference = build.sources.filter((s) => s.kind === 'wiki' || s.kind === 'patch');
  return (
    <footer className="flex flex-col gap-4 text-sm text-ink-3">
      <div className="flex flex-col gap-1">
        <Heading as="h2" size="md">Fontes desta build</Heading>
        {build.reviewed && (
          <p className="m-0">
            Escolhas conferidas com guias e partidas de jogadores experientes em {build.reviewed.split('-').reverse().join('/')}. Números e mecânicas vêm da wiki.
          </p>
        )}
      </div>
      {community.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>O que os jogadores usam</Label>
          <SourceList items={community} />
        </div>
      )}
      {reference.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Mecânicas e números</Label>
          <SourceList items={reference} />
        </div>
      )}
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


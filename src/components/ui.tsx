// Logbook design system primitives. See docs/design-system.md › Components.
import type { ButtonHTMLAttributes, ElementType, HTMLAttributes, ReactNode } from 'react';
import { PRIO_LABEL } from '../data/roster.ts';
import type { Prio } from '../types.ts';

export const icon = (slug: string) => `/icons/${slug}.webp`;

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

const PRIO_STYLE: Record<Prio, string> = {
  1: 'bg-accent text-on-accent',
  2: 'bg-ink-2 text-surface',
  3: 'bg-line-strong text-ink',
  4: 'bg-raised text-ink-2 ring-1 ring-inset ring-line',
  0: 'bg-prio-avoid text-prio-avoid-ink',
};

export function PrioTag({ p, className }: { p: Prio; className?: string }) {
  return (
    <span className={cx('rounded-tag px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.04em]', PRIO_STYLE[p], className)}>
      {PRIO_LABEL[p]}
    </span>
  );
}

type LabelProps = HTMLAttributes<HTMLElement> & { as?: ElementType };
export function Label({ as: As = 'span', className, children, ...rest }: LabelProps) {
  return (
    <As className={cx('label', className)} {...rest}>
      {children}
    </As>
  );
}

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3'; size?: 'md' | 'lg' | 'xl' };
export function Heading({ as: As = 'h2', size = 'lg', className, children, ...rest }: HeadingProps) {
  const s = { md: 'text-h-md', lg: 'text-h-lg', xl: 'text-h-xl' }[size];
  return (
    <As className={cx('heading', s, className)} {...rest}>
      {children}
    </As>
  );
}

/** Filter/tab pill. `tab`: selected in light ink. `filter`: selected in the accent. */
type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean; variant?: 'tab' | 'filter' };
export function Chip({ on, variant = 'tab', className, children, ...rest }: ChipProps) {
  const base = 'inline-flex min-h-9 flex-none cursor-pointer items-center gap-2 rounded-full px-3.5 text-meta font-medium transition-colors';
  const look =
    variant === 'filter'
      ? on
        ? 'bg-accent text-on-accent'
        : 'text-ink-2 ring-1 ring-inset ring-line hover:bg-panel'
      : on
        ? 'bg-ink text-surface'
        : 'bg-panel text-ink-2 ring-1 ring-inset ring-line hover:bg-raised';
  return (
    <button type="button" className={cx(base, look, className)} {...rest}>
      {children}
    </button>
  );
}

/** Item icon with the rarity strip underneath: the visual signature of the system. */
export function ItemIcon({ slug, color, size = 64, className }: { slug: string; color: string; size?: number; className?: string }) {
  return (
    <span className={cx('block rounded-card p-1', className)} style={{ boxShadow: `inset 0 -3px 0 ${color}` }}>
      <img src={icon(slug)} alt="" width={size} height={size} className="block object-contain" style={{ width: size, height: size }} />
    </span>
  );
}

export function QtyBadge({ children, small }: { children: ReactNode; small?: boolean }) {
  return (
    <span
      className={cx(
        'absolute whitespace-nowrap rounded-tag bg-accent font-mono text-on-accent',
        small ? 'right-0.5 bottom-0.5 px-1 text-[10px]' : '-right-1.5 -bottom-1 px-1.5 py-0.5 text-label'
      )}
    >
      {children}
    </span>
  );
}

export function SearchField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        Buscar item nesta build
      </label>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="pointer-events-none absolute top-3.5 left-3.5 text-ink-3">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <input
        id={id}
        type="search"
        placeholder="Buscar item (PT ou EN)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-card border border-line bg-sunken pr-3.5 pl-10 text-body text-ink placeholder:text-ink-4 focus:border-transparent"
      />
    </div>
  );
}

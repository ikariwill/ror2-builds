// Logbook design system primitives. See docs/design-system.md › Components.
import { extendTailwindMerge } from 'tailwind-merge';
import type { ButtonHTMLAttributes, ElementType, HTMLAttributes, ReactNode } from 'react';
import { PRIO_LABEL } from '../data/roster.ts';
import type { Prio } from '../types.ts';

export const icon = (slug: string) => `/icons/${slug}.webp`;

/**
 * tailwind-merge taught the Logbook tokens (src/styles.css). Without this, it reads `text-h-md` as a color and
 * drops it when a `text-ink` comes later, and it cannot tell `rounded-card` from `rounded-panel`.
 * Add a token here whenever one is added to @theme.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['label', 'meta', 'body', 'lede', 'h-md', 'h-lg', 'h-xl'],
      radius: ['tag', 'control', 'card', 'panel'],
      color: [
        'ground', 'surface', 'sunken', 'panel', 'raised', 'line', 'line-soft', 'line-strong',
        'ink', 'ink-2', 'ink-3', 'ink-4', 'ink-off', 'accent', 'accent-hi', 'on-accent', 'prio-avoid', 'prio-avoid-ink',
        'tier-common', 'tier-uncommon', 'tier-legendary', 'tier-boss', 'tier-equipment', 'tier-lunar', 'tier-void',
        'white', 'black', 'transparent',
      ],
    },
  },
});

/** Joins class names; when two classes set the same property, the later one wins. */
export const cx = (...c: (string | false | null | undefined)[]) => twMerge(c.filter(Boolean).join(' '));

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

/** Tab pill, optionally with a rarity color dot. Selected: raised with the accent ring. `lg` is the 44px touch size. */
type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean; dot?: string; size?: 'md' | 'lg' };
export function Chip({ on, dot, size = 'md', className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      className={cx(
        'inline-flex flex-none cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-meta font-medium transition-colors',
        size === 'lg' ? 'min-h-11' : 'min-h-9',
        on ? 'bg-raised text-ink ring-1 ring-accent ring-inset' : 'text-ink-2 ring-1 ring-line ring-inset hover:bg-panel',
        className
      )}
      {...rest}
    >
      {dot && <span aria-hidden="true" className="size-2 rounded-[2px]" style={{ background: dot }} />}
      {children}
    </button>
  );
}

/** Item icon with the rarity strip underneath: the visual signature of the system. */
export function ItemIcon({ slug, color, size = 48, alt = '', className }: { slug: string; color: string; size?: number; alt?: string; className?: string }) {
  return (
    <span className={cx('inline-flex flex-col items-center gap-1', className)}>
      <img src={icon(slug)} alt={alt} width={size} height={size} className="block object-contain" style={{ width: size, height: size }} />
      <span aria-hidden="true" className="h-[3px] rounded-full" style={{ width: size, background: color }} />
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

export function SearchField({
  id, value, onChange, label = 'Buscar item nesta build', placeholder = 'Buscar item (PT ou EN)', compact, hint,
}: { id: string; value: string; onChange: (v: string) => void; label?: string; placeholder?: string; compact?: boolean; hint?: string }) {
  return (
    <div className="relative w-full">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={cx('pointer-events-none absolute left-3 text-ink-3', compact ? 'top-2.5' : 'top-3.5')}>
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          'w-full rounded-card border border-line bg-sunken pl-9 text-ink placeholder:text-ink-4 focus:border-transparent',
          compact ? 'h-9 text-meta' : 'h-11 text-body',
          hint ? 'pr-9' : 'pr-3.5'
        )}
      />
      {hint && (
        <kbd aria-hidden="true" className={cx('pointer-events-none absolute right-2.5 rounded-tag border border-line-strong px-1.5 font-mono text-label text-ink-2', compact ? 'top-2' : 'top-3')}>
          {hint}
        </kbd>
      )}
    </div>
  );
}

/** Two or more mutually exclusive options in one control (e.g. group by priority or by rarity). */
export function Segmented<T extends string>({
  label, value, options, onChange, className,
}: { label: string; value: T; options: [T, string][]; onChange: (v: T) => void; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cx('inline-flex gap-0.5 rounded-card border border-line bg-sunken p-[3px]', className)}>
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={cx(
            'min-h-9 flex-1 cursor-pointer rounded-control px-3 text-meta font-medium whitespace-nowrap transition-colors',
            value === v ? 'bg-raised text-ink' : 'text-ink-3 hover:text-ink'
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}

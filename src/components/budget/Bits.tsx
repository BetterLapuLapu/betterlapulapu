import { AlertTriangle, ExternalLink } from 'lucide-react';
import type { ReactNode } from 'react';
import NotificationBanner from '../ui/NotificationBanner';
import { useBudgetPortal, type Async } from '../../lib/budget/context';
import { GROUP_DOT } from '../../lib/budget/groups';
import type { Reason } from '../../lib/budget/scope';
import type { BridgeGroup, Disclaimer } from '../../lib/budget/types';
import { cn } from '../../lib/utils';

export function StatusDot({ group }: { group: BridgeGroup }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block h-2.5 w-2.5 shrink-0 rounded-full',
        GROUP_DOT[group]
      )}
    />
  );
}

export function Tag({
  children,
  tone = 'default',
  title,
}: {
  children: ReactNode;
  tone?: 'default' | 'blue' | 'warn';
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        'inline-block px-2 pt-0.5 pb-[3px] whitespace-nowrap',
        tone === 'blue' && 'bg-tag text-tag-text',
        tone === 'warn' && 'bg-warning-100 text-accent-800',
        tone === 'default' && 'bg-surface text-ink-secondary'
      )}
    >
      {children}
    </span>
  );
}

/** The plain status, as the API words it, with the group's colour. */
export function StatusChip({
  group,
  label,
  held,
}: {
  group: BridgeGroup;
  label: string;
  held?: boolean;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="inline-flex items-center gap-2">
        <StatusDot group={group} />
        {label}
      </span>
      {held && (
        <Tag
          tone="warn"
          title="Unconfirmed match: the pairing is fuzzy or ambiguous."
        >
          unconfirmed match
        </Tag>
      )}
    </span>
  );
}

export function ReasonTags({ reasons }: { reasons: Reason[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {reasons.map(r => (
        <Tag
          key={r.kind + r.label}
          tone={r.kind === 'office' ? 'blue' : 'default'}
          title={
            r.kind === 'office'
              ? `Listed under ${r.label}`
              : `The title names ${r.label}`
          }
        >
          {r.kind === 'office' ? 'DPWH office' : `names ${r.label}`}
        </Tag>
      ))}
    </span>
  );
}

/**
 * The API's disclaimers, verbatim: printed from the response, so the wording
 * cannot drift from budget.bettergov.ph. Keep them on every page with figures.
 */
export function Disclaimers({
  items,
  notice,
}: {
  items: Disclaimer[];
  notice?: string;
}) {
  if (!items.length && !notice) return null;
  return (
    <aside
      aria-label="Disclaimers"
      className="flex gap-3 rounded-md border-l-4 border-accent-500 bg-accent-50 p-4 text-sm text-gray-700"
    >
      <AlertTriangle
        className="mt-0.5 h-4 w-4 shrink-0 text-accent-600"
        aria-hidden
      />
      {/* The API's notice ends in a long URL: let it wrap on a phone. */}
      <div className="min-w-0 space-y-1.5 [overflow-wrap:anywhere]">
        <p className="font-semibold text-gray-900">Data disclaimer</p>
        {items.map(d => (
          <p key={d.id}>
            <strong>{d.title}</strong> {d.body}{' '}
            <External href={d.restrictions_url ?? d.url}>Read more</External>
          </p>
        ))}
        {notice && <p>{notice}</p>}
      </div>
    </aside>
  );
}

/** Render `ready`, or a spinner, or the error with a retry. */
export function Await<T>({
  state,
  children,
  what,
  onRetry,
}: {
  state: Async<T>;
  children: (value: T) => ReactNode;
  what: string;
  /** Defaults to reloading the section's shared data. */
  onRetry?: () => void;
}) {
  const { retry } = useBudgetPortal();
  if (state.status === 'ready') return <>{children(state.value)}</>;
  if (state.status === 'loading') {
    return (
      <div
        role="status"
        className="type-body flex min-h-64 flex-col items-center justify-center gap-4 text-ink-secondary"
      >
        <span
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"
        />
        Loading {what} from the BetterGov.ph Budget API…
      </div>
    );
  }
  return (
    <NotificationBanner title="There is a problem" tone="error">
      <p className="mb-[15px]">
        {what.charAt(0).toUpperCase() + what.slice(1)} could not be loaded (
        {state.error.message}).
      </p>
      <button type="button" className="button" onClick={onRetry ?? retry}>
        Try again
      </button>
    </NotificationBanner>
  );
}

export function External({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn('link', className)}
    >
      {children}
      <ExternalLink
        className="ml-1 inline h-[0.8em] w-[0.8em] align-baseline"
        aria-label="(opens in a new tab)"
      />
    </a>
  );
}

import { cn } from '../../lib/utils';

// Colour of the bar across the top of the card
const tones = {
  primary: 'border-t-primary-600',
  income: 'border-t-go',
  expense: 'border-t-alert',
  accent: 'border-t-accent-500',
  neutral: 'border-t-ink-secondary',
};

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  tone?: keyof typeof tones;
  title?: string;
}

// A headline figure: label, big number and the period it covers. The card
// spans three rows of its parent grid (label, number, note) and shares them
// with the cards beside it, so numbers line up even when a label wraps.
export default function StatCard({
  label,
  value,
  subtext,
  tone = 'primary',
  title,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'row-span-3 grid grid-rows-subgrid gap-y-[5px] border-t-[5px] bg-surface px-[15px] pt-2.5 pb-[15px] tablet:px-5 tablet:pb-5',
        tones[tone]
      )}
      title={title}
    >
      <p className="type-body">{label}</p>
      <p className="type-xl tabular-nums">{value}</p>
      {subtext && <p className="type-small text-ink-secondary">{subtext}</p>}
    </div>
  );
}

import type { ReactNode } from 'react';

// Summary list: bold keys beside their values, one row per line.
export default function SummaryList({
  rows,
}: {
  rows: { key: string; value: ReactNode }[];
}) {
  return (
    <dl className="type-body mb-[20px] tablet:mb-[30px]">
      {rows.map(row => (
        <div
          key={row.key}
          className="flex flex-col border-b border-rule py-2.5 tablet:flex-row tablet:gap-5"
        >
          <dt className="mb-[5px] font-bold tablet:mb-0 tablet:w-[30%] tablet:shrink-0">
            {row.key}
          </dt>
          <dd className="min-w-0 tablet:flex-1">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

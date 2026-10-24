import { Newspaper } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { downloadCsv } from '../../lib/csv';
import { formatPeso, isNumber } from '../../lib/format';
import type {
  ProposalItem,
  ProposalSource,
  ProposedBudget,
} from '../../types/fdp';
import NotificationBanner from '../ui/NotificationBanner';
import { AboutThisData } from './AboutThisData';
import ChartCard from './ChartCard';
import DataTable from './DataTable';
import StatCard from './StatCard';
import { axisPeso, axisProps, COLORS, SERIES, tooltipPeso } from './chartTheme';

type Row = ProposalItem & { group: string };

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-PH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/** The printed change when the source gives one, otherwise the difference. */
const changeOf = (item: ProposalItem) =>
  item.change ?? (isNumber(item.previous) ? item.amount - item.previous : null);

function formatChange(value: number | null, compact = false) {
  if (!isNumber(value)) return '—';
  if (value === 0) return 'No change';
  return `${value > 0 ? '+' : '−'}${formatPeso(Math.abs(value), { compact })}`;
}

/** "Source: <publisher>, <date>" links to the news reports. */
function NewsSources({ sources }: { sources: ProposalSource[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
      <span className="font-medium">Source:</span>
      {sources.map(s => (
        <a
          key={s.key}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 hover:underline"
        >
          <Newspaper className="h-3 w-3" aria-hidden />
          {s.publisher}, {formatDate(s.date)}
        </a>
      ))}
    </div>
  );
}

/**
 * A budget the executive has submitted to the City Council, shown from news
 * reports until the City posts the enacted Annual Budget Report.
 */
export default function ProposedBudgetView({
  proposal,
}: {
  proposal: ProposedBudget;
}) {
  const { year, previousYear, total, funds, sectors, lineItems } = proposal;
  const sourcesFor = (items: ProposalItem[]) =>
    proposal.sources.filter(s => items.some(i => i.source === s.key));
  const rows: Row[] = [
    ...funds.map(i => ({ ...i, group: 'Fund' })),
    ...sectors.map(i => ({ ...i, group: 'General Fund sector' })),
    ...lineItems.map(i => ({ ...i, group: 'Line item' })),
  ];
  const sectorChart = sectors.map(s => ({
    name: s.label,
    previous: s.previous ?? 0,
    proposed: s.amount,
  }));
  const fundTones = ['accent', 'income', 'neutral'] as const;

  return (
    <div className="space-y-6">
      <NotificationBanner title={`Proposed ${year} budget, not yet approved`}>
        <p className="mb-[15px]">
          The executive budget was submitted to the City Council on{' '}
          {formatDate(proposal.submittedOn)}. The Council can still change it
          before it is enacted.
        </p>
        <p>
          The City has not posted a {year} budget document yet, so these figures
          come from news reports and most are rounded. They will be replaced by
          the official Annual Budget Report when it is published.
        </p>
      </NotificationBanner>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={total.label}
          value={formatPeso(total.amount, { compact: true })}
          subtext={`${formatChange(changeOf(total), true)} on ${previousYear}`}
          title={formatPeso(total.amount)}
        />
        {funds.map((f, i) => (
          <StatCard
            key={f.key}
            label={f.label}
            value={formatPeso(f.amount, { compact: true })}
            subtext={
              isNumber(f.previous)
                ? `${formatPeso(f.previous, { compact: true })} in ${previousYear}`
                : 'Proposed'
            }
            tone={fundTones[i % fundTones.length]}
            title={formatPeso(f.amount)}
          />
        ))}
      </div>

      <ChartCard
        title={`General Fund by sector, ${previousYear} and proposed ${year}`}
        description="The sectors the news report breaks down. Debt service and other General Fund items are not reported, so the bars do not add up to the General Fund."
      >
        <div className="h-80">
          <ResponsiveContainer>
            <BarChart data={sectorChart} margin={{ left: 8, right: 16 }}>
              <CartesianGrid stroke={COLORS.grid} vertical={false} />
              <XAxis dataKey="name" {...axisProps} />
              <YAxis tickFormatter={axisPeso} width={72} {...axisProps} />
              <Tooltip formatter={tooltipPeso} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="previous"
                name={String(previousYear)}
                fill={COLORS.primaryLight}
              />
              <Bar
                dataKey="proposed"
                name={`${year} proposed`}
                fill={SERIES[0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <footer className="mt-4 border-t border-gray-100 pt-3">
          <NewsSources sources={sourcesFor(sectors)} />
        </footer>
      </ChartCard>

      <ChartCard
        title={`Proposed ${year} budget compared with ${previousYear}`}
        description="Line items are part of the funds and sectors, so the rows do not add up."
        onDownload={() =>
          downloadCsv(
            `lapu-lapu-proposed-budget-${year}`,
            [
              { header: 'Item', value: r => r.label },
              { header: 'Group', value: r => r.group },
              { header: `${previousYear} (PHP)`, value: r => r.previous },
              { header: `${year} proposed (PHP)`, value: r => r.amount },
              { header: 'Change (PHP)', value: r => changeOf(r) },
              {
                header: 'Source',
                value: r =>
                  proposal.sources.find(s => s.key === r.source)?.url ?? '',
              },
            ],
            rows
          )
        }
      >
        <DataTable
          columns={[
            {
              key: 'label',
              header: 'Item',
              value: r => r.label,
              className: 'min-w-56',
            },
            { key: 'group', header: 'Group', value: r => r.group },
            {
              key: 'previous',
              header: String(previousYear),
              value: r => r.previous,
              render: r => formatPeso(r.previous),
              align: 'right',
            },
            {
              key: 'amount',
              header: `${year} proposed`,
              value: r => r.amount,
              render: r => formatPeso(r.amount),
              align: 'right',
            },
            {
              key: 'change',
              header: 'Change',
              value: r => changeOf(r),
              render: r => formatChange(changeOf(r)),
              align: 'right',
            },
          ]}
          rows={rows}
          rowKey={r => `${r.group}-${r.key ?? r.label}`}
          searchable={false}
        />
        <footer className="mt-4 border-t border-gray-100 pt-3">
          <NewsSources sources={proposal.sources} />
        </footer>
      </ChartCard>

      <AboutThisData>
        <ul className="list-disc space-y-1 pl-5">
          {proposal.notes.map(n => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </AboutThisData>
    </div>
  );
}

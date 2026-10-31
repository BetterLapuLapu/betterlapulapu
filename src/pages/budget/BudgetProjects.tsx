import { Download, Search } from 'lucide-react';
import { useEffect, useMemo, type ReactNode } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Heading } from '../../components/ui/Heading';
import { Text } from '../../components/ui/Text';
import DataTable, { type Column } from '../../components/reports/DataTable';
import StatCard from '../../components/reports/StatCard';
import {
  Await,
  Disclaimers,
  ReasonTags,
  StatusChip,
  StatusDot,
} from '../../components/budget/Bits';
import BudgetShell from '../../components/budget/BudgetShell';
import OfficesSection from '../../components/budget/OfficesSection';
import {
  BUDGET_DESCRIPTION,
  BUDGET_PATH,
  BUDGET_TITLE,
  projectPath,
  type DatasetKey,
} from '../../lib/budget/config';
import { useBudgetPortal } from '../../lib/budget/context';
import {
  count,
  php,
  phpDelta,
  plural,
  shortOffice,
} from '../../lib/budget/format';
import {
  summarise,
  type ScopedProject,
  type ScopeResult,
  type Summary,
} from '../../lib/budget/scope';
import {
  BRIDGE_GROUPS,
  type BridgeGroup,
  type DatasetInfo,
  type Disclaimer,
  type GroupInfo,
} from '../../lib/budget/types';
import { GROUP_BAR } from '../../lib/budget/groups';
import { downloadCsv, type CsvColumn } from '../../lib/csv';
import { cn } from '../../lib/utils';

export default function BudgetProjects() {
  const { scope, overview } = useBudgetPortal();
  const datasets =
    overview.status === 'ready' ? overview.value.data.datasets : [];
  return (
    <>
      <SEO
        title={BUDGET_TITLE}
        description={BUDGET_DESCRIPTION}
        keywords="FY 2027 budget, national expenditure program, NEP, House Bill 10858, DPWH, projects, transparency, Lapu-Lapu City"
      />
      {scope.status === 'ready' ? (
        <Projects scope={scope.value} datasets={datasets} />
      ) : (
        <BudgetShell title={BUDGET_TITLE} lede={BUDGET_DESCRIPTION}>
          <Await state={scope} what="the projects">
            {() => null}
          </Await>
        </BudgetShell>
      )}
    </>
  );
}

/** Group wording from the API (label, sub, help), else the row's own label. */
type GroupWords = Pick<GroupInfo, 'label' | 'sub' | 'help'>;

function groupInfo(
  datasets: DatasetInfo[],
  rows: ScopedProject[]
): Record<BridgeGroup, GroupWords> {
  const fromApi = datasets[0]?.bridge.groups;
  const out = {} as Record<BridgeGroup, GroupWords>;
  for (const g of BRIDGE_GROUPS) {
    out[g] = fromApi?.[g] ?? {
      label: rows.find(r => r.bridge_group === g)?.group_label ?? g,
      sub: '',
      help: '',
    };
  }
  return out;
}

const FILTERS = ['q', 'program', 'status', 'office', 'why'] as const;

function Projects({
  scope,
  datasets,
}: {
  scope: ScopeResult;
  datasets: DatasetInfo[];
}) {
  const { config, districts } = useBudgetPortal();
  const { hash } = useLocation();

  // #offices and #projects links land on their section once it has rendered.
  useEffect(() => {
    if (!hash) return;
    document
      .getElementById(decodeURIComponent(hash.slice(1)))
      ?.scrollIntoView({ block: 'start' });
  }, [hash, districts.status]);

  // The disclaimers of every response on this page.
  const disclaimers = useMemo(() => {
    const byId = new Map<string, Disclaimer>(
      scope.disclaimers.map(d => [d.id, d])
    );
    if (districts.status === 'ready')
      for (const env of districts.value)
        for (const d of env.disclaimers) if (!byId.has(d.id)) byId.set(d.id, d);
    return [...byId.values()];
  }, [scope.disclaimers, districts]);

  const all = scope.projects;
  const summary = useMemo(() => summarise(all), [all]);
  const groups = useMemo(() => groupInfo(datasets, all), [datasets, all]);
  const shownGroups = BRIDGE_GROUPS.filter(g => summary.groups[g].rows);
  const emptyGroups = BRIDGE_GROUPS.filter(g => !summary.groups[g].rows);
  const programName = (k: DatasetKey) =>
    datasets.find(d => d.key === k)?.short ?? k.toUpperCase();

  // Filters live in the URL, so a filtered list can be shared.
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const program = (params.get('program') ?? '') as DatasetKey | '';
  const status = (params.get('status') ?? '') as BridgeGroup | '';
  const office = params.get('office') ?? '';
  const why = params.get('why') ?? '';
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true, preventScrollReset: true });
  };
  const clearFilters = () => {
    const next = new URLSearchParams(params);
    FILTERS.forEach(k => next.delete(k));
    setParams(next, { replace: true, preventScrollReset: true });
  };

  // DPWH offices among the rows, largest first, for the office filter.
  const offices = useMemo(() => {
    const n = new Map<string, number>();
    for (const p of all)
      if (p.office) n.set(p.office, (n.get(p.office) ?? 0) + 1);
    return [...n.entries()].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'en', { numeric: true })
    );
  }, [all]);

  const reasons = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of all)
      for (const r of p.reasons)
        seen.set(
          `${r.kind}:${r.label}`,
          r.kind === 'office'
            ? `Office: ${shortOffice(r.label)}`
            : `Title names ${r.label}`
        );
    return [...seen.entries()];
  }, [all]);

  const filtered = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return all.filter(p => {
      if (program && p.dataset !== program) return false;
      if (status && p.bridge_group !== status) return false;
      if (why && !p.reasons.some(r => `${r.kind}:${r.label}` === why))
        return false;
      if (office && p.office !== office) return false;
      if (words.length) {
        const hay = [p.title, p.program, p.pap, p.office, p.region]
          .join(' ')
          .toLowerCase();
        if (!words.every(w => hay.includes(w))) return false;
      }
      return true;
    });
  }, [all, q, program, status, why, office]);
  const filteredSummary = useMemo(() => summarise(filtered), [filtered]);
  const narrowed = filtered.length !== all.length;

  const columns: Column<ScopedProject>[] = [
    {
      key: 'title',
      header: 'Project',
      value: p => p.title,
      className: 'min-w-[16rem]',
      render: p => (
        <span className="block space-y-1 text-left">
          <Link to={projectPath(p.dataset, p.id)} className="link font-bold">
            {p.title}
          </Link>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary">
            <span className="font-bold">{programName(p.dataset)}</span>
            {p.office && <span>{shortOffice(p.office)}</span>}
            <ReasonTags reasons={p.reasons} />
          </span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      value: p => p.status_label,
      render: p => (
        <StatusChip
          group={p.bridge_group}
          label={p.status_label}
          held={p.held}
        />
      ),
    },
    {
      key: 'nep',
      header: 'NEP',
      align: 'right',
      value: p => p.nep_php,
      render: p => php(p.nep_php),
    },
    {
      key: 'house',
      header: 'House bill',
      align: 'right',
      value: p => p.house_php,
      render: p => <strong>{php(p.house_php)}</strong>,
    },
    {
      key: 'change',
      header: 'Change',
      align: 'right',
      value: p => p.delta_php,
      render: p => (
        <span
          className={cn(
            (p.delta_php ?? 0) > 0 && 'text-go',
            (p.delta_php ?? 0) < 0 && 'text-alert'
          )}
        >
          {phpDelta(p.delta_php)}
        </span>
      ),
    },
  ];

  const selectClass =
    'rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-8 text-sm';
  const select = (
    label: string,
    key: string,
    value: string,
    options: [string, string][]
  ) => (
    <label className="text-sm">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={e => setParam(key, e.target.value)}
        className={selectClass}
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <BudgetShell
      eyebrow="FY 2027 · NEP and House Bill 10858"
      title={`${plural(summary.rows, 'project')} for ${config.shortName} in the 2027 national budget`}
      lede={<Lede summary={summary} />}
    >
      <Stats summary={summary} programName={programName} />

      <OfficesSection />

      <section aria-labelledby="groups-h">
        <Heading level={2} size="l" id="groups-h">
          What the House bill did to them
        </Heading>
        <Text className="max-w-[640px]">
          Each project in the NEP was matched with the House bill. Choose a
          status to show only those projects in the list.
        </Text>
        <div
          role="group"
          aria-label="Show projects by status"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {shownGroups.map(g => {
            const cell = summary.groups[g];
            const info = groups[g];
            const active = status === g;
            return (
              <button
                key={g}
                type="button"
                aria-pressed={active}
                title={info.help}
                onClick={() => {
                  setParam('status', active ? '' : g);
                  if (!active)
                    document
                      .getElementById('projects')
                      ?.scrollIntoView({ block: 'start' });
                }}
                className={cn(
                  'group row-span-4 grid cursor-pointer grid-rows-subgrid gap-y-[5px] border-t-[5px] px-[15px] pt-2.5 pb-[15px] text-left tablet:px-5 tablet:pb-5',
                  GROUP_BAR[g],
                  active
                    ? 'bg-primary-50 shadow-[inset_0_0_0_3px_var(--color-primary-600)]'
                    : 'bg-surface hover:bg-[#e8e7e6]'
                )}
              >
                <span className="type-body inline-flex items-baseline gap-2">
                  <StatusDot group={g} />
                  {info.label}
                </span>
                <span className="type-xl tabular-nums">{count(cell.rows)}</span>
                <span className="type-small text-ink-secondary">
                  {info.sub && <>{info.sub} · </>}
                  <span className="whitespace-nowrap tabular-nums">
                    {groupAmount(g, cell)}
                  </span>
                </span>
                <span className="type-small text-link underline underline-offset-[0.1578em] group-hover:decoration-[3px]">
                  {active
                    ? 'Showing in the list · show all'
                    : 'Show in the list'}
                </span>
              </button>
            );
          })}
        </div>
        {emptyGroups.length > 0 && (
          <Text size="sm" className="mt-[20px] text-ink-secondary">
            No project is{' '}
            {emptyGroups.map(g => `“${groups[g].label}”`).join(' or ')}.
          </Text>
        )}
      </section>

      <section id="projects" aria-labelledby="list-h" className="scroll-mt-28">
        <div className="flex flex-wrap items-baseline justify-between gap-x-5">
          <Heading level={2} size="l" id="list-h">
            {narrowed
              ? `${count(filtered.length)} of ${plural(all.length, 'project')}`
              : `Every project (${count(all.length)})`}
          </Heading>
          <button
            type="button"
            className="button button-secondary"
            onClick={() =>
              downloadCsv(
                `${config.id}-fy2027-budget-projects.csv`,
                CSV_COLUMNS,
                filtered
              )
            }
          >
            <Download className="h-4 w-4" aria-hidden />
            Download CSV{narrowed ? ` (${count(filtered.length)})` : ''}
          </button>
        </div>

        {narrowed && (
          <p className="type-small mb-[15px]">
            These {count(filtered.length)}: NEP {php(filteredSummary.nep.php)}{' '}
            on {count(filteredSummary.nep.rows)} · House bill{' '}
            {php(filteredSummary.house.php)} on{' '}
            {count(filteredSummary.house.rows)} ·{' '}
            <button
              type="button"
              onClick={clearFilters}
              className="link cursor-pointer"
            >
              Clear filters
            </button>
          </p>
        )}

        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={p => p.key}
          searchable={false}
          initialSort={{ key: 'house', dir: 'desc' }}
          emptyMessage="No project matches. Try fewer words or clear the filters."
          toolbar={
            <>
              <label className="relative min-w-0 flex-1 sm:max-w-xs">
                <span className="sr-only">Search projects</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400"
                  aria-hidden
                />
                <input
                  type="search"
                  value={q}
                  placeholder="Barangay, road, school…"
                  onChange={e => setParam('q', e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-1.5 pr-3 pl-8 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </label>
              {select('Program', 'program', program, [
                ['', 'All programs'],
                ...(Object.keys(summary.byDataset) as DatasetKey[]).map(
                  (k): [string, string] => [
                    k,
                    `${programName(k)} (${count(summary.byDataset[k]!.rows)})`,
                  ]
                ),
              ])}
              {select('Status', 'status', status, [
                ['', 'Any status'],
                ...BRIDGE_GROUPS.filter(g => summary.groups[g].rows).map(
                  (g): [string, string] => [
                    g,
                    `${groups[g].label} (${count(summary.groups[g].rows)})`,
                  ]
                ),
              ])}
              {offices.length > 1 &&
                select('DPWH office', 'office', office, [
                  ['', 'Any office'],
                  ...offices.map(([o, n]): [string, string] => [
                    o,
                    `${shortOffice(o)} (${count(n)})`,
                  ]),
                ])}
              {reasons.length > 1 &&
                select('Listed because', 'why', why, [
                  ['', 'Any reason'],
                  ...reasons,
                ])}
            </>
          }
        />

        <Text size="sm" className="mt-[20px] max-w-[760px] text-ink-secondary">
          Amounts are in pesos, as each document publishes them. A dash means
          that document has no such line. The NEP and the House bill are two
          versions of one budget: their totals are compared, never added.
          Projects are listed because their title names the City; a project
          whose title does not is not here.{' '}
          <Link to={`${BUDGET_PATH}/about-the-data`} className="link">
            How this list is made
          </Link>
          .
        </Text>
      </section>

      <Disclaimers items={disclaimers} notice={scope.meta.notice} />
    </BudgetShell>
  );
}

function groupAmount(
  g: BridgeGroup,
  c: { nep_php: number; house_php: number; rows: number }
): string {
  if (!c.rows) return '—';
  switch (g) {
    case 'nep_only':
      return php(c.nep_php);
    case 'increased':
    case 'decreased':
    case 'scope_review':
      return phpDelta(c.house_php - c.nep_php);
    default:
      return php(c.house_php);
  }
}

function Lede({ summary }: { summary: Summary }): ReactNode {
  const added = summary.groups.house_only.rows;
  const dropped = summary.groups.nep_only.rows;
  return (
    <>
      The NEP lists {count(summary.nep.rows)} of them, for{' '}
      {php(summary.nep.php)}; the House bill lists {count(summary.house.rows)},
      for {php(summary.house.php)}.{' '}
      {added || dropped ? (
        <>
          {plural(added, 'project is', 'projects are')} in the House bill only
          and {count(dropped)} in the NEP only: candidates to check, not
          confirmed changes.
        </>
      ) : (
        <>Every project is in both.</>
      )}
    </>
  );
}

function Stats({
  summary,
  programName,
}: {
  summary: Summary;
  programName: (k: DatasetKey) => string;
}) {
  const programs = (
    Object.entries(summary.byDataset) as [DatasetKey, { rows: number }][]
  )
    .sort((a, b) => b[1].rows - a[1].rows)
    .map(([k, c]) => `${programName(k)} ${count(c.rows)}`)
    .join(' · ');
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Projects"
        value={count(summary.rows)}
        subtext={programs || 'none'}
        tone="neutral"
      />
      <StatCard
        label="NEP"
        value={php(summary.nep.php)}
        subtext={`${plural(summary.nep.rows, 'project')} · the budget the President submits`}
        tone="neutral"
      />
      <StatCard
        label="House bill"
        value={php(summary.house.php)}
        subtext={`${plural(summary.house.rows, 'project')} · compared with the NEP, not added`}
        tone="primary"
      />
      <StatCard
        label="In the House bill only"
        value={count(summary.groups.house_only.rows)}
        subtext={`${php(summary.groups.house_only.house_php)} · insertion candidates`}
        tone="accent"
      />
    </div>
  );
}

/** Every listed project, with exact pesos and source page links. */
const CSV_COLUMNS: CsvColumn<ScopedProject>[] = [
  { header: 'program', value: p => p.dataset },
  { header: 'id', value: p => p.id },
  { header: 'title', value: p => p.title },
  { header: 'program_line', value: p => p.program },
  { header: 'sub_line', value: p => p.pap },
  { header: 'dpwh_office', value: p => p.office },
  { header: 'region', value: p => p.region },
  { header: 'status', value: p => p.status_label },
  { header: 'group', value: p => p.bridge_group },
  { header: 'unconfirmed_match', value: p => (p.held ? 'yes' : 'no') },
  { header: 'nep (PHP)', value: p => p.nep_php },
  { header: 'house_bill (PHP)', value: p => p.house_php },
  { header: 'change (PHP)', value: p => p.delta_php },
  { header: 'nep_pdf', value: p => p.pdf_url.nep ?? null },
  {
    header: 'house_bill_pdf',
    value: p => p.pdf_url.hgab3 ?? p.pdf_url.hgab2 ?? null,
  },
  {
    header: 'why_listed_here',
    value: p =>
      p.reasons
        .map(r =>
          r.kind === 'office' ? `office: ${r.label}` : `title names: ${r.label}`
        )
        .join('; '),
  },
  { header: 'url', value: p => p.url },
];

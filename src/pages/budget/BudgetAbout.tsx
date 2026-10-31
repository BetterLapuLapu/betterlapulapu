import SEO from '../../components/SEO';
import { Heading } from '../../components/ui/Heading';
import SummaryList from '../../components/ui/SummaryList';
import { Text } from '../../components/ui/Text';
import DataTable, { type Column } from '../../components/reports/DataTable';
import { Await, Disclaimers, External } from '../../components/budget/Bits';
import BudgetShell from '../../components/budget/BudgetShell';
import { BUDGET_TITLE, SOURCE_CODE_URL } from '../../lib/budget/config';
import { useBudgetPortal } from '../../lib/budget/context';
import { count, date, plural } from '../../lib/budget/format';
import type { QueryReport, ScopeResult } from '../../lib/budget/scope';
import type { Disclaimer, Overview } from '../../lib/budget/types';

const TITLE = 'About the data';
const DESCRIPTION =
  'Where the FY 2027 budget projects listed for Lapu-Lapu City come from: the questions asked of the BetterGov.ph Budget API, lines removed by hand, how to read the figures and the source documents.';

/** The API's `rules`, in words for readers rather than developers. */
const READING_RULES = [
  'These are amounts in the budget documents, not money spent.',
  'Amounts are pesos, as each document publishes them. A dash means that document has no such line; it does not mean zero.',
  'The NEP and the House bill are two versions of one budget. Compare them; never add them together.',
  '“In the House bill only” and “In the NEP only” are candidates: leads to check, not confirmed insertions or deletions. Some are lines that were renamed or re-scoped.',
  '“Unconfirmed match” marks a pairing made on a similar name rather than an exact one.',
  'A DPWH office that serves several districts (Tier B) is shown whole; its money is never split between them. Money under the DPWH Central Office or a regional office is on no district card.',
];

export default function BudgetAbout() {
  const { scope, overview } = useBudgetPortal();
  return (
    <>
      <SEO title={`${TITLE} · ${BUDGET_TITLE}`} description={DESCRIPTION} />
      {scope.status === 'ready' && overview.status === 'ready' ? (
        <AboutView scope={scope.value} overview={overview.value.data} />
      ) : (
        <BudgetShell eyebrow={BUDGET_TITLE} title={TITLE} lede={DESCRIPTION}>
          <Await state={scope} what="the section’s queries">
            {() => (
              <Await state={overview} what="the data notes">
                {() => null}
              </Await>
            )}
          </Await>
        </BudgetShell>
      )}
    </>
  );
}

function AboutView({
  scope,
  overview,
}: {
  scope: ScopeResult;
  overview: Overview;
}) {
  const { districts } = useBudgetPortal();
  const label = (k: string) =>
    overview.datasets.find(d => d.key === k)?.short ?? k.toUpperCase();
  const disclaimers = new Map<string, Disclaimer>();
  for (const d of scope.disclaimers) disclaimers.set(d.id, d);
  if (districts.status === 'ready')
    for (const env of districts.value)
      for (const d of env.disclaimers) disclaimers.set(d.id, d);
  const meta = scope.meta;

  const columns: Column<QueryReport>[] = [
    {
      key: 'what',
      header: 'Lines that…',
      sortable: false,
      value: q => q.label,
      className: 'text-left',
      render: q => (
        <span className="text-left">
          {q.kind === 'office' ? (
            <>
              are listed under <strong>{q.label}</strong>
            </>
          ) : (
            <>
              have a title naming <strong>{String(q.params.q)}</strong>
            </>
          )}
          {q.region && (
            <span className="text-ink-secondary">
              {' '}
              · kept to region {q.region}, or giving no region
            </span>
          )}
        </span>
      ),
    },
    {
      key: 'program',
      header: 'Program',
      sortable: false,
      value: q => label(q.dataset),
    },
    {
      key: 'found',
      header: 'Found',
      align: 'right',
      sortable: false,
      value: q => q.total,
      render: q => count(q.total),
    },
    {
      key: 'kept',
      header: 'Kept',
      align: 'right',
      sortable: false,
      value: q => q.kept,
      render: q => count(q.kept),
    },
    {
      key: 'api',
      header: 'Check it',
      align: 'right',
      sortable: false,
      value: q => q.api,
      render: q => <External href={q.api}>API</External>,
    },
  ];

  return (
    <BudgetShell
      eyebrow={BUDGET_TITLE}
      title={`Where these ${plural(scope.projects.length, 'project')} come from`}
      lede="Every figure comes from the BetterGov.ph Budget API, which sets the House bill against the NEP project by project. This page lists the questions asked of the API; every line it returns is shown, except those removed by hand below."
    >
      <section aria-labelledby="q-h">
        <Heading level={2} size="l" id="q-h">
          The questions asked
        </Heading>
        <DataTable
          columns={columns}
          rows={scope.queries}
          rowKey={(q, i) => `${q.kind}:${q.dataset}:${q.label}:${i}`}
          searchable={false}
          pageSize={50}
        />
        <Text size="sm" className="mt-[20px] max-w-[760px] text-ink-secondary">
          A line found by more than one question is shown once, with every
          reason. Searching by name finds titles that spell the City out; a
          project whose title does not name it is not listed. The City’s DPWH
          office, the Cebu 6th District Engineering Office, also serves Mandaue
          City and Cebu’s 6th district, so its whole ledger is not listed here;
          its card links to all of its lines.
        </Text>
      </section>

      <section aria-labelledby="x-h">
        <Heading level={2} size="l" id="x-h">
          Removed by hand: {count(scope.excluded.length)}
        </Heading>
        {scope.excluded.length === 0 ? (
          <Text>None. Every line the questions return is shown.</Text>
        ) : (
          <ul className="type-body max-w-[760px] list-disc space-y-2.5 pl-5">
            {scope.excluded.map(({ exclusion, project }) => (
              <li key={exclusion.key}>
                {project ? (
                  <External href={project.url}>{project.title}</External>
                ) : (
                  <code>{exclusion.key}</code>
                )}
                <span className="text-ink-secondary">
                  {' '}
                  — {exclusion.reason}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-1 gap-[40px] lg:grid-cols-2">
        <section aria-labelledby="r-h">
          <Heading level={2} size="l" id="r-h">
            How to read the figures
          </Heading>
          <ul className="type-body list-disc space-y-2.5 pl-5">
            {READING_RULES.map(r => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="t-h">
          <Heading level={2} size="l" id="t-h">
            Words used here
          </Heading>
          <SummaryList
            rows={Object.values(overview.terms).map(t => ({
              key: t.term,
              value: t.meaning,
            }))}
          />
        </section>
      </div>

      <section aria-labelledby="d-h">
        <Heading level={2} size="l" id="d-h">
          The documents
        </Heading>
        <ul className="type-body space-y-2.5">
          {overview.documents.map(d => (
            <li key={d.key}>
              <External href={d.pdf_url}>{d.title}</External>
              {d.source_url && (
                <span className="type-small text-ink-secondary">
                  {' '}
                  ·{' '}
                  <a
                    href={d.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link"
                  >
                    where it was published
                  </a>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="n-h">
        <Heading level={2} size="l" id="n-h">
          Notices
        </Heading>
        <Disclaimers items={[...disclaimers.values()]} notice={meta.notice} />
        <Text size="sm" className="mt-[20px] text-ink-secondary">
          Data version: comparison{' '}
          <a
            href={`${meta.source_repo}/tree/${meta.source_commit}`}
            target="_blank"
            rel="noopener noreferrer"
            className="link"
          >
            {meta.source_commit.slice(0, 7)}
          </a>
          , built {date(meta.built_at)}. Every project nationwide:{' '}
          <External href={overview.url}>budget.bettergov.ph</External>.
        </Text>
      </section>

      <section aria-labelledby="b-h">
        <Heading level={2} size="l" id="b-h">
          Built on the BetterGov.ph Transparency Portal
        </Heading>
        <Text className="max-w-[760px]">
          This section is adapted from the open-source Transparency Portal by
          BetterGov.ph, which any LGU or DPWH district engineering office can
          run for its own projects.{' '}
          <External href={SOURCE_CODE_URL}>Source code</External>
        </Text>
      </section>
    </BudgetShell>
  );
}

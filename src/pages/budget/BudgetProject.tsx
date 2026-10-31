import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import { Heading } from '../../components/ui/Heading';
import SummaryList from '../../components/ui/SummaryList';
import { Text } from '../../components/ui/Text';
import {
  Await,
  Disclaimers,
  External,
  ReasonTags,
  StatusChip,
} from '../../components/budget/Bits';
import BudgetShell from '../../components/budget/BudgetShell';
import {
  BUDGET_PATH,
  BUDGET_TITLE,
  DATASET_KEYS,
  type DatasetKey,
} from '../../lib/budget/config';
import { ApiError } from '../../lib/budget/client';
import { useBudgetPortal, type Async } from '../../lib/budget/context';
import { phpDelta, phpFull } from '../../lib/budget/format';
import { projectKey } from '../../lib/budget/scope';
import type { Envelope, ProjectDetail, Version } from '../../lib/budget/types';

const VERSIONS: Version[] = ['nep', 'hgab2', 'hgab3', 'api'];
const FALLBACK_VERSION_LABELS: Record<Version, string> = {
  nep: 'NEP',
  hgab2: 'House bill, second reading',
  hgab3: 'House bill, third reading',
  api: 'DPWH transparency website listing',
};

export default function BudgetProject() {
  const { dataset = '', id = '' } = useParams();
  const { client } = useBudgetPortal();
  const valid = (DATASET_KEYS as readonly string[]).includes(dataset);
  const [state, setState] = useState<{
    key: string;
    value: Async<Envelope<ProjectDetail>>;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const key = `${dataset}/${id}/${attempt}`;

  useEffect(() => {
    if (!valid) return;
    let live = true;
    client.project(dataset as DatasetKey, id).then(
      value => live && setState({ key, value: { status: 'ready', value } }),
      error =>
        live &&
        setState({
          key,
          value: {
            status: 'error',
            error: error instanceof Error ? error : new Error(String(error)),
          },
        })
    );
    return () => {
      live = false;
    };
  }, [client, dataset, id, key, valid]);

  if (!valid) {
    return (
      <BudgetShell title="Project not found">
        <Text>
          There is no program called “{dataset}”.{' '}
          <Link to={BUDGET_PATH} className="link">
            See every project
          </Link>
        </Text>
      </BudgetShell>
    );
  }
  const current: Async<Envelope<ProjectDetail>> =
    state?.key === key ? state.value : { status: 'loading' };
  if (current.status !== 'ready') {
    return (
      <BudgetShell title={BUDGET_TITLE}>
        <AwaitWithRetry state={current} retry={() => setAttempt(n => n + 1)} />
      </BudgetShell>
    );
  }
  return <ProjectView env={current.value} />;
}

/** Loading, or the error with a retry that refetches this project. */
function AwaitWithRetry({
  state,
  retry,
}: {
  state: Async<Envelope<ProjectDetail>>;
  retry: () => void;
}) {
  if (
    state.status === 'error' &&
    state.error instanceof ApiError &&
    state.error.status === 404
  ) {
    return (
      <Text>
        This project is not in the FY 2027 data.{' '}
        <Link to={BUDGET_PATH} className="link">
          See every project
        </Link>
      </Text>
    );
  }
  return (
    <Await state={state} what="the project" onRetry={retry}>
      {() => null}
    </Await>
  );
}

function ProjectView({ env }: { env: Envelope<ProjectDetail> }) {
  const { overview, scope, client } = useBudgetPortal();
  const p = env.data;

  const ov = overview.status === 'ready' ? overview.value.data : null;
  const program = ov?.datasets.find(d => d.key === p.dataset);
  const versionLabel = (v: Version) =>
    ov?.record_versions.find(r => r.key === v)?.label ??
    FALLBACK_VERSION_LABELS[v];
  const inScope =
    scope.status === 'ready'
      ? scope.value.projects.find(x => x.key === projectKey(p.dataset, p.id))
      : undefined;
  const versions = VERSIONS.filter(v => v !== 'api' || p.dataset === 'dpwh');

  const details: [string, string | null][] = [
    ['Program', program?.label ?? p.dataset.toUpperCase()],
    ['Program line', p.program],
    ['Sub-line', p.pap],
    ['DPWH office', p.office],
    ['Region', p.region],
    ['How the two versions were matched', p.labels.match?.label ?? null],
    ['Between the House readings', p.labels.reading?.label ?? null],
    ['DPWH transparency website', p.labels.dpwh_site?.label ?? null],
    [
      'Length',
      p.length_m != null
        ? `${Math.round(p.length_m).toLocaleString('en-PH')} m`
        : null,
    ],
  ];
  const rows = details
    .filter((row): row is [string, string] => Boolean(row[1]))
    .map(([key, value]) => ({ key, value: value as ReactNode }));
  if (p.lat != null && p.lon != null) {
    rows.push({
      key: 'Coordinates in the document',
      value: (
        <External
          href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=15/${p.lat}/${p.lon}`}
        >
          {p.lat.toFixed(5)}, {p.lon.toFixed(5)} on the map
        </External>
      ),
    });
  }
  rows.push({
    key: 'Why it is listed here',
    value: inScope ? (
      <ReasonTags reasons={inScope.reasons} />
    ) : (
      <span className="text-ink-secondary">
        It is not among this section’s projects; it is shown because you
        followed a link to it.
      </span>
    ),
  });

  return (
    <>
      <SEO
        title={p.title}
        description={`${p.status_label}. FY 2027 ${program?.short ?? p.dataset.toUpperCase()} project in the NEP and the House bill, with the source page of each figure.`}
        type="article"
      />
      <BudgetShell
        eyebrow={
          <>
            {program?.short ?? p.dataset.toUpperCase()} · FY 2027
            {p.office && <> · {p.office}</>}
          </>
        }
        title={p.title}
        lede={
          <span className="flex flex-col gap-2.5">
            <StatusChip
              group={p.bridge_group}
              label={p.status_label}
              held={p.held}
            />
            {p.labels.status.help && (
              <span className="type-body text-ink-secondary">
                {p.labels.status.help}
              </span>
            )}
          </span>
        }
      >
        <div className="grid grid-cols-1 gap-[40px] lg:grid-cols-3">
          <section aria-labelledby="amounts-h" className="lg:col-span-2">
            <Heading level={2} size="l" id="amounts-h">
              Amount in each version, with the page it is on
            </Heading>
            <table className="type-body mb-[20px] w-full">
              <tbody>
                {versions.map(v => {
                  const amount = p[`${v}_php` as const];
                  const pdf = p.pdf_url[v];
                  const page = v === 'api' ? null : p[`${v}_page` as const];
                  return (
                    <tr key={v} className="border-b border-rule">
                      <th
                        scope="row"
                        className="py-2.5 pr-5 text-left font-bold"
                      >
                        {versionLabel(v)}
                      </th>
                      <td className="py-2.5 pr-5 text-right tabular-nums">
                        {amount == null ? (
                          <span className="text-ink-secondary">not listed</span>
                        ) : (
                          phpFull(amount)
                        )}
                      </td>
                      <td className="py-2.5 text-right">
                        {pdf ? (
                          <External href={pdf}>
                            {page ? `Page ${page}` : 'Open the document'}
                          </External>
                        ) : (
                          <span className="text-ink-secondary">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-b-2 border-ink">
                  <th scope="row" className="py-2.5 pr-5 text-left font-bold">
                    Change, House bill against the NEP
                  </th>
                  <td className="py-2.5 pr-5 text-right font-bold tabular-nums">
                    {phpDelta(p.delta_php)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
            <Text size="sm" className="text-ink-secondary">
              The NEP and the House bill are two versions of one budget, so the
              amounts are compared, never added. Open the page to check the
              figure against the document itself.
            </Text>

            {p.labels.flags.length > 0 && (
              <>
                <Heading level={3} size="m" className="mt-[30px]">
                  Notes on this line
                </Heading>
                <ul className="type-body list-disc space-y-2 pl-5">
                  {p.labels.flags.map(f => (
                    <li key={f.code}>
                      {f.label}
                      {f.help && (
                        <span className="text-ink-secondary"> {f.help}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <aside aria-label="About this project">
            <div className="border-t-[5px] border-t-primary-600 bg-surface px-[15px] pt-2.5 pb-[15px] tablet:px-5">
              <Heading level={2} size="s">
                Seen this project on the ground?
              </Heading>
              <Text size="sm" className="mb-0">
                Citizen reports will go to one place for every portal,
                budget.bettergov.ph. Reporting is not open yet.
              </Text>
            </div>
            <ul className="type-small mt-[20px] space-y-2">
              <li>
                <External href={p.url}>
                  This project on budget.bettergov.ph
                </External>
              </li>
              <li>
                <External href={client.href(p.api_url)}>
                  The API record (JSON)
                </External>
              </li>
            </ul>
          </aside>
        </div>

        <section aria-labelledby="details-h">
          <Heading level={2} size="l" id="details-h">
            Details
          </Heading>
          <SummaryList rows={rows} />
        </section>

        <Disclaimers items={env.disclaimers} notice={env.meta.notice} />
      </BudgetShell>
    </>
  );
}

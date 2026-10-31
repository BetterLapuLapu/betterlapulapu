/**
 * DPWH offices first, legislative districts under them: the hierarchy the
 * budget documents use. DPWH lists its money by district engineering office
 * (DEO); each office serves one or more legislative districts.
 *
 * Each office's figures are shown once, whole. A shared (Tier B) office's
 * districts are listed under it and its money is never split between them.
 * Ported from github.com/bettergovph/transparency-portal.
 */
import { UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../reports/StatCard';
import { Heading } from '../ui/Heading';
import SummaryList from '../ui/SummaryList';
import { Text } from '../ui/Text';
import { BUDGET_PATH } from '../../lib/budget/config';
import { useBudgetPortal } from '../../lib/budget/context';
import { count, php, phpDelta, phpFull, plural } from '../../lib/budget/format';
import type { QueryReport, ScopedProject } from '../../lib/budget/scope';
import {
  BRIDGE_GROUPS,
  type DistrictCard,
  type DistrictOffice,
  type Envelope,
} from '../../lib/budget/types';
import { cn } from '../../lib/utils';
import { Await, External, StatusDot, Tag } from './Bits';

interface DistrictRow {
  id: string;
  label: string;
  card: DistrictCard | null;
  /** Other offices that also build in this district. */
  alsoServedBy: string[];
}

interface OfficeView {
  office: DistrictOffice;
  /** The office as the documents publish it. */
  printed: string;
  /** The portal's query for this office, when all of its lines are listed. */
  query: QueryReport | null;
  /** How many of the listed projects the documents put under this office. */
  lines: number;
  districts: DistrictRow[];
}

export default function OfficesSection() {
  const { districts, scope } = useBudgetPortal();
  const queries =
    scope.status === 'ready'
      ? scope.value.queries.filter(q => q.kind === 'office')
      : [];
  const projects = scope.status === 'ready' ? scope.value.projects : [];
  return (
    <section id="offices" aria-labelledby="offices-h" className="scroll-mt-28">
      <Await state={districts} what="DPWH offices and districts">
        {list => <Offices list={list} queries={queries} projects={projects} />}
      </Await>
    </section>
  );
}

function buildOffices(
  cards: DistrictCard[],
  queries: QueryReport[],
  projects: ScopedProject[]
): { offices: OfficeView[]; noOffice: DistrictCard[] } {
  const linesByOffice = new Map<string, number>();
  for (const p of projects)
    if (p.office)
      linesByOffice.set(p.office, (linesByOffice.get(p.office) ?? 0) + 1);
  const cardById = new Map(cards.map(c => [c.id, c]));
  const queryByOffice = new Map<string, QueryReport>();
  for (const q of queries)
    for (const o of q.officeLens?.offices ?? []) queryByOffice.set(o.id, q);

  const officeById = new Map<string, DistrictOffice>();
  for (const c of cards)
    for (const o of c.offices)
      if (!officeById.has(o.id)) officeById.set(o.id, o);

  const offices = [...officeById.values()].map((office): OfficeView => {
    const query = queryByOffice.get(office.id) ?? null;
    const printed =
      query?.label ??
      office.years?.find(
        y => y.fy === 2027 && y.stage === 'hgab3' && y.matched_label
      )?.matched_label ??
      office.name;
    const labels = new Map(
      office.co_served_districts.map(d => [d.id, d.label])
    );
    const districts = office.district_ids.map((id): DistrictRow => {
      const card = cardById.get(id) ?? null;
      return {
        id,
        label: card?.label ?? labels.get(id) ?? id,
        card,
        alsoServedBy: card
          ? card.offices.filter(o => o.id !== office.id).map(o => o.name)
          : [],
      };
    });
    return {
      office,
      printed,
      query,
      lines: linesByOffice.get(printed) ?? 0,
      districts,
    };
  });

  // The portal's own offices first, then any that only serve a named district.
  offices.sort(
    (a, b) =>
      Number(!a.query) - Number(!b.query) ||
      a.printed.localeCompare(b.printed, 'en', { numeric: true })
  );
  return { offices, noOffice: cards.filter(c => !c.offices.length) };
}

function Offices({
  list,
  queries,
  projects,
}: {
  list: Envelope<DistrictCard>[];
  queries: QueryReport[];
  projects: ScopedProject[];
}) {
  const { overview } = useBudgetPortal();
  const cards = list.map(e => e.data);
  const { offices, noOffice } = buildOffices(cards, queries, projects);
  const districtCount = new Set(
    offices
      .flatMap(o => o.districts.map(d => d.id))
      .concat(noOffice.map(c => c.id))
  ).size;
  const note = list[0]?.meta.representatives_note as string | undefined;
  const residualTerm =
    overview.status === 'ready'
      ? overview.value.data.terms.residual
      : undefined;
  const credits = [
    ...new Set(
      cards.flatMap(c =>
        c.representative?.portrait
          ? [
              `${c.representative.portrait.attribution} · ${c.representative.portrait.license}`,
            ]
          : []
      )
    ),
  ];

  return (
    <>
      <Heading level={2} size="l" id="offices-h">
        {plural(offices.length, 'DPWH district engineering office')}, serving{' '}
        {plural(districtCount, 'legislative district')}
      </Heading>
      <Text className="max-w-[640px]">
        DPWH lists its money by the district engineering office that does the
        work. Each office serves one or more legislative districts, and a shared
        office’s money is never split between them. Representatives shown hold
        the seat in the 20th Congress.{note && <> {note}</>}
      </Text>

      <div className="space-y-[40px] tablet:space-y-[60px]">
        {offices.map(o => (
          <Office key={o.office.id} view={o} />
        ))}
      </div>

      {noOffice.length > 0 && (
        <Text size="sm" className="mt-[15px] text-ink-secondary">
          No DPWH district office is listed for{' '}
          {noOffice.map(c => c.label).join('; ')}.
        </Text>
      )}
      <Text size="sm" className="mt-[15px] max-w-[760px] text-ink-secondary">
        Office figures are its named projects in the 2027 NEP and the House
        bill, compared, never added.
        {residualTerm && (
          <>
            {' '}
            {residualTerm.term}:{' '}
            {residualTerm.meaning.charAt(0).toLowerCase() +
              residualTerm.meaning.slice(1)}
          </>
        )}
        {credits.length > 0 && <> Portraits: {credits.join('; ')}.</>}
      </Text>
    </>
  );
}

function Office({ view }: { view: OfficeView }) {
  const { config } = useBudgetPortal();
  const { office, printed, query, lines, districts } = view;
  const f = office.fy2027;
  const wholeNep =
    office.years?.find(y => y.fy === 2027 && y.stage === 'nep')?.php ?? null;
  const change =
    f && f.nep_php != null && f.hgab3_php != null
      ? f.hgab3_php - f.nep_php
      : null;
  // The project list, narrowed to this office's lines (and a status).
  const filter = (status?: string) =>
    `${BUDGET_PATH}?office=${encodeURIComponent(printed)}${status ? `&status=${status}` : ''}#projects`;
  const groups = f
    ? BRIDGE_GROUPS.map(g => f.bridge.groups[g]).filter(c => c && c.rows > 0)
    : [];
  const unconfirmed = f?.annotations?.unconfirmed_rows ?? 0;
  const held = f?.office_change?.rows ?? 0;
  const own = new Set(config.scope.districts ?? []);
  const headingId = `office-${office.id.replace(/[^a-z0-9-]/gi, '-')}`;
  const shared = office.tier === 'B';

  return (
    <article
      aria-labelledby={headingId}
      className="border-t border-rule pt-[15px]"
    >
      <p className="type-m mb-[5px] font-normal text-ink-secondary">
        DPWH {office.kind_label.replace(/ \(DEO\)$/, '').toLowerCase()}
        {office.region && <> · {office.region}</>}
      </p>
      <h3 id={headingId} className="type-l mb-[20px] tablet:mb-[30px]">
        {printed}
      </h3>

      <div className="type-body mb-[20px] max-w-[760px] border-l-[10px] border-rule p-[15px] tablet:mb-[30px]">
        <p className="mb-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <Tag tone="blue">Tier {office.tier}</Tag>
          <span>
            {shared
              ? `Serves ${plural(districts.length, 'legislative district')}. Its figures are for the whole office and are not split between them.`
              : 'Serves one legislative district, so its figures can be read as that district’s.'}
          </span>
        </p>
        {!query && (
          <p>
            Only the {plural(lines, 'project')} whose title names{' '}
            {config.shortName} {lines === 1 ? 'is' : 'are'} listed on this page.{' '}
            {office.projects_url && (
              <External href={office.projects_url}>
                See all of the office’s projects
              </External>
            )}
          </p>
        )}
      </div>

      <div className="mb-[30px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 tablet:mb-[40px]">
        <Link
          to={filter()}
          className="link-plain row-span-3 grid grid-rows-subgrid gap-y-[5px] border-t-[5px] border-t-primary-600 bg-surface px-[15px] pt-2.5 pb-[15px] text-ink tablet:px-5 tablet:pb-5"
        >
          <span className="type-body">Listed on this page</span>
          <span className="type-xl tabular-nums">{count(lines)}</span>
          <span className="type-small text-link underline">
            See {lines === 1 ? 'it' : 'them'} in the list
          </span>
        </Link>
        <StatCard
          label="NEP"
          value={php(f?.nep_php)}
          subtext={f ? plural(f.nep_records, 'named project') : undefined}
          tone="neutral"
          title={phpFull(f?.nep_php)}
        />
        <StatCard
          label="House bill"
          value={php(f?.hgab3_php)}
          subtext={f ? plural(f.hgab3_records, 'named project') : undefined}
          tone="primary"
          title={phpFull(f?.hgab3_php)}
        />
        <StatCard
          label="Change"
          value={phpDelta(change)}
          subtext="House bill against the NEP"
          tone={change != null && change < 0 ? 'expense' : 'income'}
          title={change != null ? phpFull(change) : undefined}
        />
      </div>

      {groups.length > 0 && (
        <>
          <h4 className="type-m mb-[15px] tablet:mb-[20px]">
            What the House bill did to the office’s projects
          </h4>
          <div className="max-w-[760px]">
            <SummaryList
              rows={groups.map(c => ({
                key: c.label,
                label: (
                  <span className="inline-flex items-center gap-2.5">
                    <StatusDot group={c.group} />
                    {c.label}
                  </span>
                ),
                // These counts are the whole office's: link them only when all
                // of its lines are listed here.
                value: query ? (
                  <Link to={filter(c.group)} className="link">
                    {plural(c.rows, 'project')}
                  </Link>
                ) : (
                  plural(c.rows, 'project')
                ),
              }))}
            />
          </div>
          <Text size="sm" className="max-w-[760px] text-ink-secondary">
            Counts are for the whole office, not only the projects listed here.
            {wholeNep != null && (
              <> The whole office in the NEP: {php(wholeNep)}.</>
            )}
            {unconfirmed > 0 && (
              <>
                {' '}
                Includes{' '}
                {plural(
                  unconfirmed,
                  'unconfirmed match',
                  'unconfirmed matches'
                )}{' '}
                ({php(f?.annotations?.unconfirmed_php)}).
              </>
            )}
            {held > 0 && (
              <>
                {' '}
                {plural(held, 'project')} whose two versions name different
                offices {held === 1 ? 'is' : 'are'} not in these figures.
              </>
            )}
          </Text>
        </>
      )}

      <h4 className="type-m mt-[30px] mb-[15px] tablet:mt-[40px] tablet:mb-[20px]">
        {districts.length === 1
          ? 'The legislative district it serves'
          : `The ${districts.length} legislative districts it serves`}
      </h4>
      <ul className="grid grid-cols-1 gap-[20px] tablet:grid-cols-2 lg:grid-cols-3">
        {[...districts]
          .sort((a, b) => Number(own.has(b.id)) - Number(own.has(a.id)))
          .map(d => (
            <District key={d.id} row={d} own={own.has(d.id)} />
          ))}
      </ul>
    </article>
  );
}

function District({ row, own }: { row: DistrictRow; own: boolean }) {
  const rep = row.card?.representative ?? null;
  const portrait = rep?.portrait ?? null;
  return (
    <li
      className={cn(
        'flex gap-[15px] border-l-[3px] pl-2.5',
        own ? 'border-primary-600' : 'border-rule'
      )}
    >
      {portrait ? (
        <img
          className="h-[75px] w-[60px] shrink-0 bg-surface object-cover"
          src={portrait.url}
          alt={`Portrait of ${rep?.name ?? row.label}`}
          title={`${portrait.attribution} · ${portrait.license} · ${portrait.source_url}`}
          width="60"
          height="75"
          loading="lazy"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex h-[75px] w-[60px] shrink-0 items-end justify-center overflow-hidden bg-surface text-rule"
        >
          <UserRound
            className="h-[60px] w-[60px] translate-y-2"
            strokeWidth={1.5}
          />
        </span>
      )}
      <div className="type-body min-w-0 space-y-[5px]">
        <p className="font-bold">{row.label}</p>
        {own && (
          <p>
            <Tag tone="blue">{'This city’s district'}</Tag>
          </p>
        )}
        <p>
          {rep ? (
            rep.name
          ) : (
            <span className="text-ink-secondary">No representative listed</span>
          )}
        </p>
        {(rep?.bills_url || row.card) && (
          <p className="type-small flex flex-wrap gap-x-[15px]">
            {rep?.bills_url && <External href={rep.bills_url}>Bills</External>}
            {row.card && <External href={row.card.url}>District page</External>}
          </p>
        )}
        {row.alsoServedBy.length > 0 && (
          <p className="type-small text-ink-secondary">
            Also served by {row.alsoServedBy.join(', ')}
          </p>
        )}
      </div>
    </li>
  );
}

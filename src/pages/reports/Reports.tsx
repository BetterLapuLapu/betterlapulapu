import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { Heading } from '../../components/ui/Heading';
import Section from '../../components/ui/Section';
import { Text } from '../../components/ui/Text';
import LinkList from '../../components/ui/LinkList';
import NotificationBanner from '../../components/ui/NotificationBanner';
import { DataDisclaimer } from '../../components/reports/AboutThisData';
import ChartCard from '../../components/reports/ChartCard';
import CoverageMatrix from '../../components/reports/CoverageMatrix';
import StatCard from '../../components/reports/StatCard';
import YearSelector from '../../components/reports/YearSelector';
import {
  REPORTS_PATH,
  REPORT_SECTIONS,
  sectionBySlug,
} from '../../components/reports/sections';
import BudgetSection from '../../components/reports/sections/BudgetSection';
import DebtSection from '../../components/reports/sections/DebtSection';
import DocumentsSection from '../../components/reports/sections/DocumentsSection';
import FinancesSection from '../../components/reports/sections/FinancesSection';
import FundsSection from '../../components/reports/sections/FundsSection';
import ProcurementSection from '../../components/reports/sections/ProcurementSection';
import WorkforceSection from '../../components/reports/sections/WorkforceSection';
import { headcountOf } from '../../components/reports/workforce';
import {
  latestForYear,
  partialLabel,
  sreTotal,
  sum,
} from '../../components/reports/selectors';
import { useFdpData, type FdpDatasets } from '../../hooks/useFdpData';
import {
  formatNumber,
  formatPercent,
  formatPeriod,
  formatPeso,
  isNumber,
} from '../../lib/format';
import { cn } from '../../lib/utils';

const governmentName = import.meta.env.VITE_GOVERNMENT_NAME || 'the City';

function availableYears(data: FdpDatasets) {
  const years = new Set<number>([
    ...data.finances.map(e => e.year),
    ...data.funds.developmentFund.map(e => e.year),
    ...data.funds.ldrrmf.map(e => e.year),
    ...data.funds.sef.map(e => e.year),
    ...data.procurement.map(e => e.year),
    ...data.workforce.map(e => e.year),
    ...data.debt.map(e => e.year),
    ...data.budget.map(e => e.year),
    ...data.proposals.map(p => p.year),
  ]);
  if (!years.size) data.catalog.documents.forEach(d => years.add(d.year));
  return [...years].sort((a, b) => b - a);
}

function Overview({ data, year }: { data: FdpDatasets; year: number }) {
  const sre = latestForYear(data.finances, year);
  const income = sreTotal(sre, 'totalCurrentOperatingIncome');
  const expenditure = sreTotal(sre, 'totalCurrentOperatingExpenditures');
  const nta = sreTotal(sre, 'nta');
  const hr = latestForYear(data.workforce, year);
  const headcount = hr ? headcountOf(hr) : null;
  const bids = data.procurement.filter(r => r.year === year);
  const debt = latestForYear(data.debt, year);
  const proposal = data.proposals.find(p => p.year === year);
  const periodNote = (e?: { year: number; quarter: number | null }) =>
    e
      ? partialLabel(e) || `As of ${formatPeriod(e.year, e.quarter)}`
      : 'No report for this year';

  return (
    <div className="space-y-8">
      {proposal && !sre && (
        <NotificationBanner title={`${year} is not under way yet`}>
          <p>
            The only {year} figures so far are from the proposed budget of{' '}
            {formatPeso(proposal.total.amount, { compact: true })}, which the
            City Council has not yet approved.{' '}
            <Link to={`${REPORTS_PATH}/budget?year=${year}`} className="link">
              See the proposed {year} budget
            </Link>
            .
          </p>
        </NotificationBanner>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Current operating income"
          value={formatPeso(income, { compact: true })}
          subtext={periodNote(sre)}
          tone="income"
          title={formatPeso(income)}
        />
        <StatCard
          label="Current operating expenditures"
          value={formatPeso(expenditure, { compact: true })}
          subtext={periodNote(sre)}
          tone="expense"
          title={formatPeso(expenditure)}
        />
        <StatCard
          label="Reliance on national allotment"
          value={
            isNumber(nta) && nta > 0 && isNumber(income) && income
              ? formatPercent((nta / income) * 100)
              : '—'
          }
          subtext="NTA as a share of operating income"
          tone="neutral"
        />
        <StatCard
          label="Contracts awarded"
          value={
            bids.length
              ? formatPeso(sum(bids.map(b => b.bidAmount)), { compact: true })
              : '—'
          }
          subtext={
            bids.length
              ? `${bids.length} contracts in transcribed bid results`
              : 'No bid results for this year'
          }
        />
        <StatCard
          label="City personnel"
          value={isNumber(headcount) ? formatNumber(headcount) : '—'}
          subtext={periodNote(hr)}
          tone="accent"
        />
        <StatCard
          label="Outstanding debt"
          value={formatPeso(debt?.totalOutstanding, { compact: true })}
          subtext={periodNote(debt)}
          tone="neutral"
          title={formatPeso(debt?.totalOutstanding)}
        />
      </div>

      <div>
        <Heading level={2} size="m">
          Explore the reports
        </Heading>
        <LinkList
          layout="grid"
          items={REPORT_SECTIONS.map(s => ({
            key: s.slug,
            title: s.title,
            href: `${REPORTS_PATH}/${s.slug}${s.slug === 'documents' ? '' : `?year=${year}`}`,
            description: s.description,
          }))}
        />
      </div>

      <ChartCard
        title="What has been published"
        description="Full Disclosure Policy reports posted by the City, by report type and period. Gaps are reports that were not posted online."
      >
        <CoverageMatrix catalog={data.catalog} />
      </ChartCard>
    </div>
  );
}

export default function Reports() {
  const { section: slug } = useParams();
  const section = sectionBySlug(slug);
  const { data, loading, error } = useFdpData();
  const [yearParam, setYear] = useQueryState('year', parseAsInteger);

  const years = useMemo(() => (data ? availableYears(data) : []), [data]);
  const defaultYear =
    (data && [...data.finances].sort((a, b) => b.year - a.year)[0]?.year) ??
    years[0] ??
    new Date().getFullYear();
  const year = yearParam && years.includes(yearParam) ? yearParam : defaultYear;

  const title = section ? section.title : 'Reports and Statistics';
  const description = section
    ? section.description
    : `Budgets, income, spending, procurement and personnel of ${governmentName}, from the reports posted under the Full Disclosure Policy.`;
  const showYear = section?.slug !== 'documents';

  if (slug && !section) {
    return (
      <Section>
        <Breadcrumbs />
        <Heading>Report not found</Heading>
        <Link to={REPORTS_PATH} className="link type-body">
          Back to Reports and Statistics
        </Link>
      </Section>
    );
  }

  return (
    <>
      <SEO
        title={title}
        description={description}
        keywords="full disclosure policy, budget, receipts and expenditures, procurement, bid results, transparency, Lapu-Lapu City"
      />
      <div>
        <div className="width-container">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Government', href: '/government' },
              {
                label: 'Reports and Statistics',
                href: section ? REPORTS_PATH : undefined,
              },
              ...(section ? [{ label: section.title }] : []),
            ]}
          />
          <Heading className="tablet:mb-[30px]">{title}</Heading>
          <Text size="lg" className="max-w-[640px]">
            {description}
          </Text>
        </div>

        <div className="z-20 border-b border-rule bg-white lg:sticky lg:top-0">
          <div className="width-container">
            <nav
              aria-label="Report sections"
              className="flex gap-x-[25px] overflow-x-auto"
            >
              {[{ slug: '', short: 'Overview' }, ...REPORT_SECTIONS].map(s => {
                const active = (section?.slug ?? '') === s.slug;
                return (
                  <Link
                    key={s.slug || 'overview'}
                    to={`${REPORTS_PATH}${s.slug ? `/${s.slug}` : ''}${s.slug === 'documents' ? '' : `?year=${year}`}`}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'type-small shrink-0 border-b-[5px] pt-[15px] pb-2.5',
                      active
                        ? 'border-primary-600 font-bold text-ink'
                        : 'link-plain border-transparent text-link'
                    )}
                  >
                    {s.short}
                  </Link>
                );
              })}
            </nav>
            {showYear && years.length > 0 && (
              <div className="border-t border-rule py-2.5">
                <YearSelector
                  years={years}
                  value={year}
                  onChange={y => setYear(y)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="width-container space-y-8 pt-[30px] pb-[30px] tablet:pb-[60px]">
          {loading && (
            <div className="flex min-h-64 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600" />
            </div>
          )}
          {error && (
            <NotificationBanner title="There is a problem" tone="error">
              <p>
                The report data could not be loaded ({error}). Please try again
                later.
              </p>
            </NotificationBanner>
          )}
          {data && (
            <>
              {!section && <Overview data={data} year={year} />}
              {section?.slug === 'finances' && (
                <FinancesSection entries={data.finances} year={year} />
              )}
              {section?.slug === 'funds' && (
                <FundsSection funds={data.funds} year={year} />
              )}
              {section?.slug === 'procurement' && (
                <ProcurementSection rows={data.procurement} year={year} />
              )}
              {section?.slug === 'budget' && (
                <BudgetSection
                  entries={data.budget}
                  proposals={data.proposals}
                  catalog={data.catalog}
                  year={year}
                />
              )}
              {section?.slug === 'workforce' && (
                <WorkforceSection entries={data.workforce} year={year} />
              )}
              {section?.slug === 'debt' && (
                <DebtSection entries={data.debt} year={year} />
              )}
              {section?.slug === 'documents' && (
                <DocumentsSection catalog={data.catalog} />
              )}
              <DataDisclaimer />
            </>
          )}
        </div>
      </div>
    </>
  );
}

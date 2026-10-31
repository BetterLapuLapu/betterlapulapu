import { Suspense, type ReactNode } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Breadcrumbs from '../ui/Breadcrumbs';
import { Heading } from '../ui/Heading';
import { Text } from '../ui/Text';
import { BUDGET_PATH, BUDGET_TITLE } from '../../lib/budget/config';
import { cn } from '../../lib/utils';
import BudgetPortalProvider from './BudgetPortalProvider';

const TABS = [
  { to: BUDGET_PATH, hash: '', label: 'Projects' },
  { to: BUDGET_PATH, hash: '#offices', label: 'Offices and districts' },
  { to: `${BUDGET_PATH}/about-the-data`, hash: '', label: 'About the data' },
];

/** Route element: loads the data once for every page in the section. */
export function BudgetLayout() {
  return (
    <BudgetPortalProvider>
      <Suspense fallback={<div className="min-h-screen" />}>
        <Outlet />
      </Suspense>
    </BudgetPortalProvider>
  );
}

/**
 * The section's page frame, as on Reports and Statistics: breadcrumbs, the
 * page heading and lede, a sticky section nav, then the page itself.
 */
export default function BudgetShell({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  const { pathname, hash } = useLocation();
  const inSection = pathname !== BUDGET_PATH;
  return (
    <div>
      <div className="width-container">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Government', href: '/government' },
            ...(inSection ? [{ label: BUDGET_TITLE, href: BUDGET_PATH }] : []),
          ]}
        />
        {eyebrow && (
          <p className="type-body mb-2.5 text-ink-secondary">{eyebrow}</p>
        )}
        <Heading className="max-w-[960px] tablet:mb-[30px]">{title}</Heading>
        {lede && (
          <Text size="lg" className="max-w-[760px]">
            {lede}
          </Text>
        )}
      </div>

      <div className="z-20 border-b border-rule bg-white lg:sticky lg:top-0">
        <div className="width-container">
          <nav
            aria-label="Budget project sections"
            className="flex gap-x-[25px] overflow-x-auto"
          >
            {TABS.map(tab => {
              const active =
                tab.to === BUDGET_PATH
                  ? !pathname.startsWith(`${BUDGET_PATH}/about`) &&
                    (tab.hash ? hash === tab.hash : hash !== '#offices')
                  : pathname === tab.to;
              return (
                <Link
                  key={tab.label}
                  to={{ pathname: tab.to, hash: tab.hash }}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => {
                    // Clicking a tab for the page already open goes to the top.
                    if (!tab.hash && pathname === tab.to) window.scrollTo(0, 0);
                  }}
                  className={cn(
                    'type-small shrink-0 border-b-[5px] pt-[15px] pb-2.5',
                    active
                      ? 'border-primary-600 font-bold text-ink'
                      : 'link-plain border-transparent text-link'
                  )}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="width-container space-y-[40px] pt-[30px] pb-[30px] tablet:space-y-[60px] tablet:pb-[60px]">
        {children}
      </div>
    </div>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedCategories } from '../../hooks/useLocalizedCategories';
import { cn } from '../../lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { serviceCategories, governmentCategories } = useLocalizedCategories();

  // Translated names for path segments that have one; anything else is
  // title-cased from the slug.
  const segmentLabels: Record<string, string> = {
    services: t('nav.services'),
    government: t('nav.government'),
    search: t('common.search'),
    sitemap: t('common.sitemap'),
    accessibility: t('common.accessibility'),
  };
  for (const category of [
    ...serviceCategories.categories,
    ...governmentCategories.categories,
  ]) {
    segmentLabels[category.slug] = category.category;
  }

  // Generate breadcrumbs from current path if no items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: t('common.home'), href: '/' },
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // Convert segment to readable label
      const label =
        segmentLabels[segment] ??
        segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  return (
    <nav
      className={cn(
        'type-small mt-[15px] mb-[30px] tablet:mb-[40px]',
        className
      )}
      aria-label={t('common.breadcrumb')}
    >
      <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {breadcrumbItems.map((item, index) => {
          const label =
            item.label.charAt(0).toUpperCase() + item.label.slice(1);
          return (
            <li key={index} className="flex items-center gap-2.5">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-ink-secondary"
                  aria-hidden="true"
                />
              )}
              {item.href ? (
                <Link to={item.href} className="link-text">
                  {label}
                </Link>
              ) : (
                <span aria-current="page">{label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;

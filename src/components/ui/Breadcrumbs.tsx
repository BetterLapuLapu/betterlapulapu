import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedCategories } from '../../hooks/useLocalizedCategories';

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
      className={`flex items-center space-x-1 text-sm text-gray-600 ${className}`}
      aria-label={t('common.breadcrumb')}
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index === 0 && <Home className="h-4 w-4" />}
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-primary-600 transition-colors duration-200"
            >
              {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium" aria-current="page">
              {item.label.charAt(0).toUpperCase() + item.label.slice(1)}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;

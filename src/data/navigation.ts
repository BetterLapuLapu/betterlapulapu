import type { TFunction } from 'i18next';
import type { NavigationItem } from '../types';
import type { CategoryData } from './yamlLoader';

// Labels are built per render so they follow the active language. Pass the
// localized categories from useLocalizedCategories().

export function getMainNavigation(
  t: TFunction,
  services: CategoryData,
  government: CategoryData
): NavigationItem[] {
  return [
    {
      label: t('nav.services'),
      href: '/services',
      children: services.categories.map(category => ({
        label: category.category,
        href: `/services/${category.slug}`,
      })),
    },
    {
      label: t('nav.government'),
      href: '/government/departments',
      children: government.categories.map(category => ({
        label: category.category,
        href: `/government/${category.slug}`,
      })),
    },
  ];
}

export function getFooterNavigation(t: TFunction, services: CategoryData) {
  return {
    mainSections: [
      {
        title: t('footer.sections.about'),
        links: [
          { label: t('footer.links.aboutPortal'), href: '/about' },
          // { label: 'Privacy Policy', href: '/privacy' },
          // { label: 'Terms of Use', href: '/terms' },
          { label: t('common.accessibility'), href: '/accessibility' },
          { label: t('footer.links.contactUs'), href: '/about' },
          {
            label: t('footer.links.discord'),
            href: 'https://discord.gg/bettergov',
          },
        ],
      },
      {
        title: t('footer.sections.services'),
        links: [
          { label: t('footer.links.allServices'), href: '/services' },
          ...services.categories.slice(0, 6).map(category => ({
            label: category.category,
            href: `/services/${category.slug}`,
          })),
          { label: t('nav.hotlines'), href: '/philippines/hotlines' },
          { label: t('footer.links.holidays'), href: '/philippines/holidays' },
        ],
      },
      {
        title: t('footer.sections.government'),
        links: [
          {
            label: t('footer.links.reports'),
            href: '/government/reports-and-statistics',
          },
          { label: t('footer.links.openData'), href: 'https://data.gov.ph' },
          {
            label: t('footer.links.foi'),
            href: 'https://www.foi.gov.ph',
          },
          {
            label: t('footer.links.contactCenter'),
            href: 'https://contactcenterngbayan.gov.ph',
          },
          {
            label: t('footer.links.officialGazette'),
            href: 'https://www.officialgazette.gov.ph',
          },
        ],
      },
    ],
  };
}

export const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/govph' },
  { label: 'Twitter', href: 'https://twitter.com/govph' },
  { label: 'Instagram', href: 'https://instagram.com/govph' },
  { label: 'YouTube', href: 'https://youtube.com/govph' },
];

import type { TFunction } from 'i18next';
import type { NavigationItem } from '../types';
import type { CategoryData } from './yamlLoader';

// Labels are built per render so they follow the active language. Pass the
// localized categories from useLocalizedCategories().

export const REPORTS_HREF = '/government/reports-and-statistics';
export const REPO_URL = 'https://github.com/BetterLapuLapu/betterlapulapu';
export const ISSUES_URL = `${REPO_URL}/issues`;

// Service navigation: a flat list of the site's main sections.
export function getMainNavigation(t: TFunction): NavigationItem[] {
  return [
    { label: t('common.home'), href: '/' },
    { label: t('nav.services'), href: '/services' },
    { label: t('nav.government'), href: '/government' },
    { label: t('nav.reports'), href: REPORTS_HREF },
    { label: t('common.search'), href: '/search' },
  ];
}

// Links in the footer's bottom row, after the section columns.
export function getSupportLinks(t: TFunction): NavigationItem[] {
  return [
    { label: t('common.sitemap'), href: '/sitemap' },
    { label: t('common.accessibility'), href: '/accessibility' },
    {
      label: t('nav.hotlines'),
      href: 'https://bettergov.ph/philippines/hotlines',
    },
    { label: t('nav.joinUs'), href: 'https://bettergov.ph/join-us' },
    { label: t('nav.aboutBetterGov'), href: 'https://bettergov.ph/about' },
    { label: t('nav.officialGovPh'), href: 'https://www.gov.ph' },
    { label: t('footer.contribute'), href: REPO_URL },
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
          { label: t('footer.links.reports'), href: REPORTS_HREF },
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

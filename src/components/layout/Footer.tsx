import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import {
  getFooterNavigation,
  getSupportLinks,
  socialLinks,
} from '../../data/navigation';
import { useLocalizedCategories } from '../../hooks/useLocalizedCategories';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';

// Social icons are hidden for now; set to true to show them again.
const SHOW_SOCIAL_LINKS = false;

const isExternal = (href: string) => /^https?:\/\//.test(href);

// What building the site has cost so far, in pesos. Leave VITE_BUILD_COST
// unset to hide the line.
const buildCost = Number(import.meta.env.VITE_BUILD_COST || NaN);
const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

function FooterLink({ href, label }: { href: string; label: string }) {
  return isExternal(href) ? (
    <a href={href} className="link-text" target="_blank" rel="noreferrer">
      {label}
    </a>
  ) : (
    <Link to={href} className="link-text">
      {label}
    </Link>
  );
}

const Footer: React.FC = () => {
  const { t } = useTranslation('common');
  const { serviceCategories } = useLocalizedCategories();
  const footerNavigation = getFooterNavigation(t, serviceCategories);

  const getSocialIcon = (label: string) => {
    switch (label) {
      case 'Facebook':
        return <Facebook className="h-5 w-5" />;
      case 'Twitter':
        return <Twitter className="h-5 w-5" />;
      case 'Instagram':
        return <Instagram className="h-5 w-5" />;
      case 'YouTube':
        return <Youtube className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <footer className="type-small border-t-[10px] border-primary-600 bg-surface pt-[25px] pb-[15px] tablet:pt-10 tablet:pb-[25px]">
      <div className="width-container">
        <div className="grid grid-cols-1 gap-x-[30px] gap-y-[30px] tablet:grid-cols-3">
          {footerNavigation.mainSections.map(section => (
            <div key={section.title}>
              <h2 className="type-m mb-[25px] border-b border-rule pb-5">
                {section.title}
              </h2>
              <ul className="space-y-[15px]">
                {section.links.map(link => (
                  <li key={link.href + link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <hr className="my-[30px] border-rule tablet:my-10" />

        <h2 className="sr-only">{t('footer.supportLinks')}</h2>
        <ul className="flex flex-wrap gap-x-5 gap-y-2.5">
          {getSupportLinks(t).map(link => (
            <li key={link.href}>
              <FooterLink href={link.href} label={link.label} />
            </li>
          ))}
        </ul>
        {SHOW_SOCIAL_LINKS && (
          <ul className="mt-[25px] flex gap-[15px]">
            {socialLinks.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  aria-label={link.label}
                  className="link-text"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(link.label)}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-[30px] flex flex-wrap items-center justify-between gap-[30px] border-t border-rule pt-[30px] tablet:mt-10 tablet:pt-10">
          <div className="flex max-w-[640px] min-w-0 items-center gap-[15px] tablet:gap-5">
            <img
              src="/logo.svg"
              alt={t('common.logoAlt')}
              className="h-[60px] w-auto shrink-0 tablet:h-[70px]"
            />
            <div>
              <p className="mb-2.5">{t('footer.tagline')}</p>
              <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
            </div>
          </div>
          {Number.isFinite(buildCost) && (
            <div className="space-y-[5px] rounded-2xl border border-rule bg-white px-5 py-[15px]">
              <p>
                <Trans
                  i18nKey="footer.buildCost"
                  values={{ cost: peso.format(buildCost) }}
                  components={{
                    cost: <span className="font-bold text-alert" />,
                  }}
                />
              </p>
              <p>
                <Trans
                  i18nKey="footer.costToPeople"
                  values={{ free: peso.format(0) }}
                  components={{
                    free: <span className="font-bold text-go" />,
                  }}
                />
              </p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

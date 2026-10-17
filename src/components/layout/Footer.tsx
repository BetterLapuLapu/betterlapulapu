import React from 'react';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { getFooterNavigation, socialLinks } from '../../data/navigation';
import { useLocalizedCategories } from '../../hooks/useLocalizedCategories';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Social icons are hidden for now; set to true to show them again.
const SHOW_SOCIAL_LINKS = false;

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
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <img
                src="/logo-white.svg"
                alt={t('common.logoAlt')}
                className="h-12 w-auto mr-3"
              />

              <div>
                <div className="font-bold">{t('site_name')}</div>
                <div className="text-xs text-gray-400">
                  {t('footer.portalLabel')}
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">{t('footer.tagline')}</p>
            {SHOW_SOCIAL_LINKS && (
              <div className="flex space-x-4">
                {socialLinks.map(link => (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {getSocialIcon(link.label)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {footerNavigation.mainSections.map(section => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.href + link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {t('footer.copyright', { year: new Date().getFullYear() })}
            </p>
            <div className="flex space-x-6">
              {/* <a
                href="/privacy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Terms of Use
              </a> */}
              <Link
                to="https://github.com/BetterLapuLapu/betterlapulapu"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t('footer.contribute')}
              </Link>
              <Link
                to="/sitemap"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t('common.sitemap')}
              </Link>
              <a
                href="/accessibility"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t('common.accessibility')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getMainNavigation, REPORTS_HREF } from '../../data/navigation';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';
import { cn } from '../../lib/utils';

// Site header (blue bar with the logo) followed by the service navigation.
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');
  const { pathname } = useLocation();
  const mainNavigation = getMainNavigation(t);

  // Reports lives under /government but has its own menu item.
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/government' && pathname.startsWith(REPORTS_HREF)) {
      return false;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header>
      <div className="bg-primary-600 text-white">
        <div className="width-container flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-2.5">
          <Link
            to="/"
            className="link-plain inline-flex items-center gap-2.5 text-white"
          >
            <img src="/logo-white.svg" alt="" className="h-11 w-auto" />
            <span className="text-[1.375rem] leading-none font-bold tablet:text-[1.75rem]">
              {t('site_title')}
            </span>
          </Link>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="border-b border-primary-200 bg-primary-50">
        <nav aria-label={t('nav.menu')} className="width-container">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="service-navigation"
            onClick={() => setIsOpen(!isOpen)}
            className="type-body my-2 inline-flex cursor-pointer items-center gap-1.5 py-1.5 font-bold text-link tablet:hidden"
          >
            {t('nav.menu')}
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', {
                'rotate-180': isOpen,
              })}
              aria-hidden="true"
            />
          </button>
          <ul
            id="service-navigation"
            className={cn(
              'type-body pb-2.5 tablet:flex tablet:flex-wrap tablet:gap-x-[30px] tablet:pb-0',
              isOpen ? 'block' : 'hidden'
            )}
          >
            {mainNavigation.map(item => {
              const active = isActive(item.href);
              return (
                <li
                  key={item.href}
                  className={cn(
                    'py-2 tablet:border-b-[5px] tablet:pt-[15px] tablet:pb-2.5',
                    active
                      ? 'border-l-[5px] border-primary-600 pl-2.5 tablet:border-l-0 tablet:pl-0'
                      : 'tablet:border-transparent'
                  )}
                >
                  <Link
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn('link-plain text-link', {
                      'font-bold': active,
                    })}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;

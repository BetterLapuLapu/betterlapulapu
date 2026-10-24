import { useTranslation } from 'react-i18next';
import type { LanguageType } from '../types';
import { LANGUAGES, SWITCHER_LANGUAGES } from '../i18n/languages';

interface LanguageSwitcherProps {
  className?: string;
}

// Sits in the blue header: the current language in bold, the others as
// underlined white text.
export default function LanguageSwitcher({
  className = '',
}: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation();
  // The detector can report region variants like `en-US`.
  const current = (i18n.resolvedLanguage || i18n.language || '').split('-')[0];

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={`type-small flex items-center divide-x divide-white ${className}`}
    >
      {SWITCHER_LANGUAGES.map((code: LanguageType) => {
        const isActive = current === code;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            title={LANGUAGES[code].nativeName}
            aria-label={LANGUAGES[code].nativeName}
            aria-pressed={isActive}
            onClick={() => i18n.changeLanguage(code)}
            className={`cursor-pointer px-2.5 leading-none text-white uppercase first:pl-0 last:pr-0 ${
              isActive
                ? 'font-bold'
                : 'underline underline-offset-[0.1578em] hover:decoration-[3px]'
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

import { useTranslation } from 'react-i18next';
import type { LanguageType } from '../types';
import { LANGUAGES, SWITCHER_LANGUAGES } from '../i18n/languages';

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({
  className = '',
}: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  // The detector can report region variants like `en-US`.
  const current = (i18n.resolvedLanguage || i18n.language || '').split('-')[0];

  return (
    <div
      role="group"
      aria-label="Language"
      className={`flex items-center divide-x divide-gray-300 ${className}`}
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
            className={`px-2 text-xs uppercase leading-none transition-colors first:pl-0 last:pr-0 focus:outline-none focus-visible:underline ${
              isActive
                ? 'font-semibold text-primary-600'
                : 'text-gray-800 hover:text-primary-600'
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}

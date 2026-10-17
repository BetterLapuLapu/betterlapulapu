import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { DEFAULT_LANGUAGE, SWITCHER_LANGUAGES } from './i18n/languages';

// Keep <html lang> in sync so screen readers and browsers use the right
// language for the page.
i18n.on('languageChanged', lng => {
  document.documentElement.lang = lng;
});

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SWITCHER_LANGUAGES,
    // Map region variants such as `en-US` to `en`.
    load: 'languageOnly',
    debug: import.meta.env.DEV,
    defaultNS: 'common',
    ns: ['common'],

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    interpolation: {
      escapeValue: false,
    },

    // Only an explicit choice overrides the Cebuano default; most browsers
    // here report English, so the navigator language is not used. The key was
    // renamed so earlier auto-detected `en` values are ignored.
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
  });

export default i18n;

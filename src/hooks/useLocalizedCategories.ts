import { useTranslation } from 'react-i18next';
import { DEFAULT_LANGUAGE } from '../i18n/languages';
import { getCategories } from '../data/yamlLoader';

/** The active UI language, for loading translated content. */
export function useContentLanguage(): string {
  const { i18n } = useTranslation();
  return i18n.resolvedLanguage ?? DEFAULT_LANGUAGE;
}

/** Service and government categories in the active language. */
export function useLocalizedCategories() {
  const lang = useContentLanguage();
  return {
    lang,
    serviceCategories: getCategories('services', lang),
    governmentCategories: getCategories('government', lang),
  };
}

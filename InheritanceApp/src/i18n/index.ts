import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import ar from './locales/ar.json';
import en from './locales/en.json';

const detectLocale = (): string => {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const lang = locales[0].languageCode;
      if (lang === 'ar') return 'ar';
    }
  } catch {}
  return 'ar';
};

void i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: detectLocale(),
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
} as any);

export default i18n;

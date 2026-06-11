import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import kk from './locales/kk.js';
import ru from './locales/ru.js';
import en from './locales/en.js';

const stored = localStorage.getItem('lang') || 'kk';

i18n.use(initReactI18next).init({
  resources: { kk: { translation: kk }, ru: { translation: ru }, en: { translation: en } },
  lng: stored,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false }
});

export default i18n;

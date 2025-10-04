module.exports = {
  i18n: {
    defaultLocale: 'ar',
    locales: ['ar', 'en'],
    localeDetection: false,
  },
  fallbackLng: {
    default: ['ar'],
    ar: ['ar'],
    en: ['en']
  },
  debug: true,
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  keySeparator: '.',
  nsSeparator: ':',
  returnObjects: true,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
};

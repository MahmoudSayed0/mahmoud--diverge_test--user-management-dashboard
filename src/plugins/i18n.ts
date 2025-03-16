import { createI18n } from 'vue-i18n';
import messages from '@/locales';

// Get the browser language or use English as fallback
const getBrowserLanguage = (): string => {
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'ar'].includes(browserLang) ? browserLang : 'en';
};

// Get the stored language from localStorage or use browser language
const getStoredLanguage = (): string => {
  const storedLang = localStorage.getItem('language');
  return storedLang && ['en', 'ar'].includes(storedLang) 
    ? storedLang 
    : getBrowserLanguage();
};

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: getStoredLanguage(),
  fallbackLocale: 'en',
  messages,
  // Handle RTL for Arabic
  warnHtmlMessage: false,
});

// Export a function to change the language
export const setLanguage = (lang: string): void => {
  if (['en', 'ar'].includes(lang)) {
    i18n.global.locale.value = lang;
    localStorage.setItem('language', lang);
    
    // Set the HTML dir attribute for RTL support
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    
    // Add a class to the body for additional RTL styling
    if (lang === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }
};

// Initialize RTL setting based on current language
setLanguage(i18n.global.locale.value);

export default i18n; 
import { createContext, useContext, useState } from 'react';
import { translations, rtlLanguages } from '../i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'fr');

  function changeLang(l) {
    setLang(l);
    localStorage.setItem('lang', l);
    document.dir = rtlLanguages.includes(l) ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }

  const t = (key) => translations[lang]?.[key] || translations['fr']?.[key] || key;
  const isRTL = rtlLanguages.includes(lang);

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
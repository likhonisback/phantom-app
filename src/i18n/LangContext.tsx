import React, { createContext, useContext, useState, useEffect } from 'react';
import { en, Translations } from './en';
import { th } from './th';
import { ar } from './ar';

export type LanguageCode = 'en' | 'th' | 'ar';

export interface LanguageOption {
  id: LanguageCode;
  label: string;
  short: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGES: LanguageOption[] = [
  { id: 'en', label: 'English', short: 'EN', dir: 'ltr' },
  { id: 'th', label: 'ไทย', short: 'ไทย', dir: 'ltr' },
  { id: 'ar', label: 'العربية', short: 'عربي', dir: 'rtl' },
];

const translations: Record<LanguageCode, Translations> = {
  en,
  th,
  ar,
};

interface LangContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: Translations;
  dir: 'ltr' | 'rtl';
}

const LangContext = createContext<LangContextType>({
  lang: 'en',
  setLang: () => {},
  t: en,
  dir: 'ltr',
});

export const LangProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<LanguageCode>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ph_lang') as LanguageCode;
      if (saved && translations[saved]) {
        setLangState(saved);
        return;
      }
    } catch {}

    const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase();
    if (browserLang === 'ar') setLangState('ar');
    else if (browserLang === 'th') setLangState('th');
    else setLangState('en');
  }, []);

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    try {
      localStorage.setItem('ph_lang', newLang);
    } catch {}
  };

  const currentDir = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = currentDir;
  }, [lang, currentDir]);

  return (
    <LangContext.Provider
      value={{
        lang,
        setLang,
        t: translations[lang] || en,
        dir: currentDir,
      }}
    >
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);

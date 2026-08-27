'use client';

import { createContext, useContext, ReactNode } from 'react';
import { dictionaries, Language, Dictionary } from '@/lib/i18n/dictionaries';

interface LanguageContextType {
  language: Language;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ 
  children, 
  initialLanguage 
}: { 
  children: ReactNode;
  initialLanguage: Language;
}) {
  // Use the locale from the URL (initialLanguage)
  const language = initialLanguage;
  const t = dictionaries[language] || dictionaries.uz;

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

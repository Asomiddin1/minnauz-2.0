'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import uzDict from '@/lib/i18n/locales/uz.json'
import ruDict from '@/lib/i18n/locales/ru.json'
import enDict from '@/lib/i18n/locales/en.json'
import jaDict from '@/lib/i18n/locales/ja.json'

export type Lang = 'uz' | 'ru' | 'en' | 'ja' | 'jp'

export type Dict = typeof uzDict

export const dictionaries: Record<string, Dict> = {
  uz: uzDict,
  ru: ruDict,
  en: enDict,
  ja: jaDict,
  jp: jaDict,
}

export const languages: { code: Lang; label: string; full: string; flag: string }[] = [
  { code: 'uz', label: 'UZ', full: "O'zbekcha", flag: '🇺🇿' },
  { code: 'ru', label: 'RU', full: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'EN', full: 'English', flag: '🇬🇧' },
  { code: 'ja', label: 'JA', full: '日本語', flag: '🇯🇵' },
]

const STORAGE_KEY = 'minna-lang'

export const normalizeLang = (code?: string | null): 'uz' | 'ru' | 'en' | 'ja' => {
  if (!code) return 'uz'
  const lower = code.toLowerCase()
  if (lower === 'jp' || lower === 'ja') return 'ja'
  if (lower === 'ru') return 'ru'
  if (lower === 'en') return 'en'
  return 'uz'
}

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: 'uz',
  setLang: () => {},
  t: uzDict,
})

export function LangProvider({
  children,
  initialLang,
}: {
  children: ReactNode
  initialLang?: Lang
}) {
  const safeInitial = normalizeLang(initialLang)
  const [lang, setLang] = useState<Lang>(safeInitial)

  useEffect(() => {
    if (initialLang) {
      const target = normalizeLang(initialLang)
      if (target !== lang) {
        setLang(target)
      }
    }
  }, [initialLang])

  useEffect(() => {
    if (!initialLang) {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const target = normalizeLang(stored)
        if (target !== lang) {
          setLang(target)
        }
      }
    }
  }, [initialLang])

  useEffect(() => {
    const normalized = normalizeLang(lang)
    window.localStorage.setItem(STORAGE_KEY, normalized)
    document.documentElement.lang = normalized
  }, [lang])

  const activeDict = dictionaries[normalizeLang(lang)] || uzDict

  return (
    <LangContext.Provider value={{ lang, setLang, t: activeDict }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)

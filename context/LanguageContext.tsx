'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, LangKey, Translations } from '@/data/translations'

interface LangContextType {
  lang: LangKey
  setLang: (lang: LangKey) => void
  t: (key: keyof Translations) => string
}

const LangContext = createContext<LangContextType>({
  lang: 'tr',
  setLang: () => {},
  t: (key) => key as string,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangKey>('tr')

  useEffect(() => {
    const saved = localStorage.getItem('payitaht-lang') as LangKey | null
    if (saved === 'tr' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (l: LangKey) => {
    setLangState(l)
    localStorage.setItem('payitaht-lang', l)
  }

  const t = (key: keyof Translations): string =>
    (translations[lang][key] as string) || (key as string)

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLanguage = () => useContext(LangContext)

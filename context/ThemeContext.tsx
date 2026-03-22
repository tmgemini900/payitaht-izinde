'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  isDark: true,
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('payitaht-theme') as Theme | null
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('payitaht-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

// Theme-aware color helper
export function tc(isDark: boolean) {
  return {
    bg1:        isDark ? '#0f0f1e'                    : '#F4ECD8',
    bg2:        isDark ? '#0a0a18'                    : '#EDE0C4',
    bg3:        isDark ? '#050510'                    : '#E8D8B4',
    card:       isDark ? 'rgba(10,10,25,0.95)'        : 'rgba(255,252,242,0.98)',
    cardBorder: isDark ? 'rgba(212,175,55,0.25)'      : 'rgba(139,100,20,0.25)',
    text1:      isDark ? '#F5F0E8'                    : '#1a0a00',
    text2:      isDark ? '#EDE0C4'                    : '#4a3520',
    muted:      isDark ? 'rgba(237,224,196,0.45)'     : 'rgba(74,53,32,0.5)',
    gold:       isDark ? '#D4AF37'                    : '#A07010',
    goldLight:  isDark ? '#F0D060'                    : '#C09020',
    border:     isDark ? 'rgba(212,175,55,0.2)'       : 'rgba(139,100,20,0.25)',
    borderHi:   isDark ? 'rgba(212,175,55,0.45)'      : 'rgba(139,100,20,0.5)',
    inputBg:    isDark ? 'rgba(26,26,46,0.8)'         : 'rgba(255,252,242,0.9)',
    navBg:      isDark ? 'rgba(15,15,30,0.96)'        : 'rgba(244,236,216,0.97)',
    sectionBg:  isDark ? 'rgba(26,26,46,0.4)'         : 'rgba(244,236,216,0.7)',
    overlay:    isDark ? 'rgba(0,0,0,0.5)'            : 'rgba(0,0,0,0.3)',
  }
}

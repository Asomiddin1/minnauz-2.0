'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { useTheme, type Theme } from './hooks'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'light',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useTheme()
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useThemeCtx = () => useContext(ThemeContext)

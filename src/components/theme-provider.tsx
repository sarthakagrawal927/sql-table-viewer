import * as React from 'react'
import { ThemeProviderContext, type Theme } from './theme-context'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey: _storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const storageKey = _storageKey
  const [theme, setTheme] = React.useState<Theme>(() => {
    try {
      const stored = window.localStorage.getItem(storageKey)
      return (stored as Theme) || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  React.useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  React.useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, theme)
    } catch {
      // ignore storage errors
    }
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

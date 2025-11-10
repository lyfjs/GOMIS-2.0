import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'default' | 'scaled' | 'mono' | 'dark'

type ThemeProviderContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  // Load theme from localStorage on mount
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gomis_theme')
      if (saved && ['default', 'dark', 'scaled', 'mono'].includes(saved)) {
        return saved as Theme
      }
      // Also check electron-store if in Electron
      if ((window as any).electronAPI) {
        try {
          // Try to get from electron-store via IPC (we'll add this handler)
          // For now, use localStorage
        } catch {}
      }
    }
    return 'default'
  })

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gomis_theme', theme)
      // Also save to electron-store if available
      if ((window as any).electronAPI && (window as any).electronAPI.saveTheme) {
        (window as any).electronAPI.saveTheme(theme).catch(() => {})
      }
    }
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes
    root.classList.remove('dark', 'scaled', 'mono')
    
    // Apply new theme
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'scaled') {
      root.classList.add('scaled')
      root.style.setProperty('--font-size', '18px')
    } else if (theme === 'mono') {
      root.classList.add('mono')
      root.style.fontFamily = 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
    } else {
      // default theme
      root.style.setProperty('--font-size', '16px')
      root.style.fontFamily = ''
    }
  }, [theme])

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}
import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'default' | 'scaled' | 'mono' | 'dark'

type ThemeProviderContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined)

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  const [theme, setTheme] = useState<Theme>('default')

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
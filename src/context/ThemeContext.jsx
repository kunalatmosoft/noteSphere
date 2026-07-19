import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Initialize theme from localStorage, default to 'dark'
  const [theme, setTheme] = useState(() => localStorage.getItem('global-theme') || 'dark')

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove any old theme classes
    root.classList.remove('light', 'dark', 'sepia', 'chatgpt')
    
    // Add the current active theme class
    root.classList.add(theme)
    
    // Save to localStorage so it remembers the user's choice
    localStorage.setItem('global-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
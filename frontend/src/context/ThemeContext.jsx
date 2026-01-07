
import { createContext, useState, useEffect } from "react"

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("quicktrip_theme")
    if (savedTheme) {
      setDarkMode(savedTheme === "dark")
    } else {
     
      const prefersDark = window.matchMedia("(prefers-color-scheme: light)").matches
      setDarkMode(prefersDark)
    }
  }, [])

  // Apply theme to document when it changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode")
    } else {
      document.documentElement.classList.remove("dark-mode")
    }
    localStorage.setItem("quicktrip_theme", darkMode ? "dark" : "light")
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>{children}</ThemeContext.Provider>
}


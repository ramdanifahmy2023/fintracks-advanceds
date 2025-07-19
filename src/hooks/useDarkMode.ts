import React from "react"

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  React.useEffect(() => {
    // Check initial theme from localStorage or system preference
    const stored = localStorage.getItem('darkMode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initialDark = stored ? JSON.parse(stored) : prefersDark
    
    setIsDarkMode(initialDark)
    if (initialDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    // Update DOM and localStorage
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode))
  }

  return { isDarkMode, toggleDarkMode }
}
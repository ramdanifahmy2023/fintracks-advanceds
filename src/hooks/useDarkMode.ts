import React from "react"

export const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Simple toggle without complex theme management
    if (!isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return { isDarkMode, toggleDarkMode }
}
import { useEffect, useState } from "react"

type Theme = "light" | "dark" | "system"

export function useThemeSync() {
  const [theme, setTheme] = useState<Theme>("system")

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || "system"
    setTheme(savedTheme)
    applyTheme(savedTheme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      if (theme === "system") {
        applyTheme("system")
      }
    }
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === "system") {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", newTheme === "dark")
    }
  }

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  return { theme, setTheme: updateTheme }
}



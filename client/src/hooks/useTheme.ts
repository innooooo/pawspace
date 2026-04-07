import { useEffect, useState } from 'react'

const THEME_KEY = 'pawspace_theme'

export function useTheme() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) return saved === 'dark'
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
  }, [dark])

  const toggle = () => setDark((d) => !d)

  return { dark, toggle }
}
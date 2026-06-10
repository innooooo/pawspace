import { useEffect, useState } from 'react'

const THEME_KEY = 'pawspace_theme'

// Safe SSR / pre-hydration guard
function getInitialTheme(): boolean {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark') return true
    if (saved === 'light') return false
    // Respect system preference as fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    // localStorage blocked (Firefox strict mode, Safari ITP, etc.)
    return false
  }
}

export function useTheme() {
  const [dark, setDark] = useState<boolean>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement

    // Apply CSS custom properties instead of relying purely on Tailwind dark:
    // variants — this means any component using var(--color-*) responds
    // immediately without needing exhaustive dark: class duplication.
    if (dark) {
      root.classList.add('dark')
      // Deep space base — keeps the premium feel in dark mode
      root.style.setProperty('--bg-base', '#060b1f')
      root.style.setProperty('--bg-surface', 'rgba(255,255,255,0.06)')
      root.style.setProperty('--bg-surface-hover', 'rgba(255,255,255,0.10)')
      root.style.setProperty('--text-primary', '#ffffff')
      root.style.setProperty('--text-secondary', 'rgba(255,255,255,0.72)')
      root.style.setProperty('--border-subtle', 'rgba(255,255,255,0.10)')
      root.style.setProperty('--glass-bg', 'rgba(6,11,31,0.72)')
      root.style.setProperty('--glass-border', 'rgba(255,255,255,0.10)')
    } else {
      root.classList.remove('dark')
      // Warm off-white — not pure #fff, avoids clinical feel
      root.style.setProperty('--bg-base', '#f5f3ef')
      root.style.setProperty('--bg-surface', 'rgba(0,0,0,0.04)')
      root.style.setProperty('--bg-surface-hover', 'rgba(0,0,0,0.08)')
      root.style.setProperty('--text-primary', '#0f1221')
      root.style.setProperty('--text-secondary', 'rgba(15,18,33,0.68)')
      root.style.setProperty('--border-subtle', 'rgba(15,18,33,0.12)')
      root.style.setProperty('--glass-bg', 'rgba(245,243,239,0.80)')
      root.style.setProperty('--glass-border', 'rgba(15,18,33,0.10)')
    }

    try {
      localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
    } catch {
      // Silently ignore — write failures shouldn't crash the toggle
    }
  }, [dark])

  // Listen for OS-level theme changes (e.g. user switches macOS to dark mid-session)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const saved = (() => {
        try { return localStorage.getItem(THEME_KEY) } catch { return null }
      })()
      // Only follow system if the user hasn't made an explicit choice
      if (!saved) setDark(e.matches)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = () => setDark((d) => !d)

  return { dark, toggle }
}
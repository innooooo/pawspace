import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import api, { TOKEN_KEY, unwrap } from '../api'
import type { User } from '../types'

type AuthState = {
  user: User | null
  token: string | null
  loading: boolean
}

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<void>
  register: (args: {
    name: string
    email: string
    password: string
    phone?: string
    nairobi_area: string
  }) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function boot() {
      const t = localStorage.getItem(TOKEN_KEY)
      if (!t) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const res = await api.get('/api/auth/me')
        const data = unwrap(res) as { user: User }
        if (!cancelled) {
          setUser(data.user)
          setToken(t)
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        if (!cancelled) {
          setUser(null)
          setToken(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password })
    const data = unwrap(res) as { user: User; token: string }
    localStorage.setItem(TOKEN_KEY, data.token)
    setToken(data.token)
    setUser(data.user)
  }, [])

  const register = useCallback(
    async (args: {
      name: string
      email: string
      password: string
      phone?: string
      nairobi_area: string
    }) => {
      const body: Record<string, string> = {
        name: args.name,
        email: args.email,
        password: args.password,
        nairobi_area: args.nairobi_area,
      }
      if (args.phone?.trim()) {
        body.phone = args.phone.trim()
      }
      const res = await api.post('/api/auth/register', body)
      const data = unwrap(res) as { user: User; token: string }
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}

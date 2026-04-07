import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../api'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/feed'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (e) {
      setErr(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto text-left space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-200">Welcome back</h1>
        <p className="text-stone-600 dark:text-stone-100 text-sm mt-1">Sign in to post pets and show interest.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base dark:text-gray-800"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base dark:text-gray-800"
          />
        </div>

        {err && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
            {err}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[48px] rounded-xl bg-amber-600 text-white font-semibold text-base active:bg-amber-700 disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-stone-600 dark:text-stone-100 text-center">
        No account?{' '}
        <Link to="/register" className="font-semibold text-amber-800 underline">
          Register
        </Link>
      </p>
    </div>
  )
}

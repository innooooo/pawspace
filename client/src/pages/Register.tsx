import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getErrorMessage } from '../api'
import { NAIROBI_AREAS } from '../constants/nairobi'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [nairobi_area, setNairobiArea] = useState('Kilimani')
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setSubmitting(true)
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        nairobi_area,
      })
      navigate('/feed', { replace: true })
    } catch (e) {
      setErr(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto text-left space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Create an account</h1>
        <p className="text-stone-600 text-sm mt-1">Join PawSpace to list or adopt pets in Nairobi.</p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
            Name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
            Password (min 8 characters)
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base"
            placeholder="+254…"
          />
        </div>
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-stone-700 mb-1">
            Nairobi area
          </label>
          <select
            id="area"
            required
            value={nairobi_area}
            onChange={(e) => setNairobiArea(e.target.value)}
            className="w-full min-h-[48px] rounded-xl border border-stone-300 px-4 text-base bg-white"
          >
            {NAIROBI_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
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
          {submitting ? 'Creating account…' : 'Register'}
        </button>
      </form>

      <p className="text-sm text-stone-600 text-center">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-amber-800 underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

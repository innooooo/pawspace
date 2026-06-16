import { Camera, LogOut, Mail, MapPin, Phone, Bell, ChevronRight, PawPrint } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Avatar } from '../components/Avatar'
import api, { unwrap, type ApiEnvelope } from '../api'

type Section = 'account' | 'notifications'

export interface NotificationPrefs {
  email_new_interest: boolean
  email_interest_accepted: boolean
  email_new_message: boolean
  email_pet_likes_digest: boolean
}

const NAIROBI_AREAS = [
  'Westlands', 'Kilimani', 'Karen', 'Lavington', 'Parklands',
  'Kasarani', 'Embakasi', 'Langata', 'South B', 'South C',
  'Kibera', 'Ruaka', 'Kileleshwa', 'Other',
]

const PREF_LABELS: { key: keyof NotificationPrefs; label: string; sub: string }[] = [
  { key: 'email_new_interest',    label: 'New adoption interest',  sub: 'When someone wants to adopt your pet' },
  { key: 'email_interest_accepted', label: 'Interest accepted',    sub: 'When your adoption request is approved' },
  { key: 'email_new_message',     label: 'New message',            sub: 'Unread messages after 5 minutes' },
  { key: 'email_pet_likes_digest', label: 'Daily likes digest',    sub: 'Summary of who liked your pets (off by default)' },
]

const PREF_DEFAULTS: NotificationPrefs = {
  email_new_interest: true,
  email_interest_accepted: true,
  email_new_message: true,
  email_pet_likes_digest: false,
}

export function UserProfile() {
  const { user, logout, setUser } = useAuth()
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('account')

  // Account
  const [accountFields, setAccountFields] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    nairobi_area: user?.nairobi_area ?? '',
  })
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountSaving, setAccountSaving] = useState(false)
  const [accountSaved, setAccountSaved] = useState(false)

  function validateAccount(): string | null {
    if (!accountFields.name.trim()) return 'Display name is required.'
    if (accountFields.phone && !/^\+?[0-9\s\-().]{7,20}$/.test(accountFields.phone)) {
      return 'Enter a valid phone number.'
    }
    if (accountFields.nairobi_area && !NAIROBI_AREAS.includes(accountFields.nairobi_area)) {
      return 'Select a valid Nairobi area.'
    }
    return null
  }

  async function saveAccount() {
    setAccountError(null)
    const err = validateAccount()
    if (err) { setAccountError(err); return }

    setAccountSaving(true)
    try {
      const res = await api.patch<ApiEnvelope<{ user: NonNullable<typeof user> }>>(
        '/api/users/me',
        accountFields
      )
      const updated = unwrap(res).user
      setUser(updated)
      setAccountFields({
        name: updated.name ?? '',
        phone: updated.phone ?? '',
        nairobi_area: updated.nairobi_area ?? '',
      })
      setAccountSaved(true)
      setTimeout(() => setAccountSaved(false), 3000)
    } catch (e: any) {
      setAccountError(e?.response?.data?.message ?? 'Failed to save. Try again.')
    } finally {
      setAccountSaving(false)
    }
  }

  // Notifications
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null)
  const [prefSaving, setPrefSaving] = useState(false)
  const [prefSaved, setPrefSaved] = useState(false)

  useEffect(() => {
    api.get<ApiEnvelope<{ preferences: NotificationPrefs }>>(
      '/api/notification-preferences/me'
    )
      .then(res => setPrefs(unwrap(res).preferences))
      .catch(() => setPrefs(PREF_DEFAULTS))
  }, [])

  function togglePref(key: keyof NotificationPrefs) {
    setPrefs(p => p ? { ...p, [key]: !p[key] } : p)
    setPrefSaved(false)
  }

  async function savePrefs() {
    if (!prefs) return
    setPrefSaving(true)
    try {
      const res = await api.patch<ApiEnvelope<{ preferences: NotificationPrefs }>>(
        '/api/notification-preferences/me',
        prefs
      )
      setPrefs(unwrap(res).preferences)
      setPrefSaved(true)
    } catch {
      // handle error
    } finally {
      setPrefSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Header */}
      <div
        className="mb-6 flex items-center gap-4 rounded-3xl p-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
      >
        <div className="relative">
          <Avatar name={user.name} avatarUrl={user.avatar_url} size={64} />
          <button
            type="button"
            aria-label="Change avatar"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-paw-ink shadow"
          >
            <Camera size={13} />
          </button>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-black" style={{ color: 'var(--text-primary)' }}>
            {user.name}
          </h1>
          <div className="mt-1 flex flex-wrap gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {user.email && (
              <span className="flex items-center gap-1"><Mail size={13} />{user.email}</span>
            )}
            {user.nairobi_area && (
              <span className="flex items-center gap-1"><MapPin size={13} />{user.nairobi_area}</span>
            )}
            {user.phone && (
              <span className="flex items-center gap-1"><Phone size={13} />{user.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link
          to="/my-pets"
          className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors hover:bg-[var(--bg-surface-hover)]"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            <PawPrint size={16} className="text-amber-400" />
            My pets
          </div>
          <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
        </Link>
        <Link
          to="/favorites"
          className="flex items-center justify-between rounded-2xl px-4 py-3 transition-colors hover:bg-[var(--bg-surface-hover)]"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            <Bell size={16} className="text-amber-400" />
            Favorites
          </div>
          <ChevronRight size={15} style={{ color: 'var(--text-muted)' }} />
        </Link>
      </div>

      {/* Section tabs */}
      <div
        className="mb-6 flex gap-1 rounded-2xl p-1"
        style={{ background: 'var(--bg-surface)' }}
      >
        {(['account', 'notifications'] as Section[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSection(s)}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition-all"
            style={
              section === s
                ? { background: 'var(--bg-base)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Account section */}
      {section === 'account' && (
        <div className="flex flex-col gap-3">
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Display name
            </label>
            <input
              value={accountFields.name}
              onChange={(e) => setAccountFields(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-transparent text-sm font-semibold outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Phone / WhatsApp
            </label>
            <input
              value={accountFields.phone}
              onChange={(e) => setAccountFields(p => ({ ...p, phone: e.target.value }))}
              inputMode="tel"
              className="w-full bg-transparent text-sm font-semibold outline-none"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>

          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
          >
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Area in Nairobi
            </label>
            <select
              value={accountFields.nairobi_area}
              onChange={(e) => setAccountFields(p => ({ ...p, nairobi_area: e.target.value }))}
              className="w-full bg-transparent text-sm font-semibold outline-none"
              style={{ color: accountFields.nairobi_area ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <option value="" disabled>Select your area</option>
              {NAIROBI_AREAS.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          {accountError && (
            <p className="text-xs font-semibold text-red-500">{accountError}</p>
          )}

          <button
            type="button"
            onClick={saveAccount}
            disabled={accountSaving}
            className="mt-2 rounded-2xl bg-amber-400 py-3 text-sm font-black text-paw-ink hover:bg-amber-300 disabled:opacity-60"
          >
            {accountSaving ? 'Saving…' : accountSaved ? 'Saved' : 'Save changes'}
          </button>

          <button
            type="button"
            onClick={() => { logout(); navigate('/feed') }}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-colors hover:bg-red-500/10"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <LogOut size={15} />
            Log out
          </button>
        </div>
      )}

      {/* Notifications section */}
      {section === 'notifications' && (
        <div className="flex flex-col gap-3">
          {!prefs ? (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading…</p>
          ) : (
            <>
              <p className="mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Email notifications — in-app notifications are always on.
              </p>
              {PREF_LABELS.map(({ key, label, sub }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-2xl px-4 py-4"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={prefs[key]}
                    onClick={() => togglePref(key)}
                    className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
                    style={{ background: prefs[key] ? '#f59e0b' : 'var(--border-subtle)' }}
                  >
                    <span
                      className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
                      style={{ left: prefs[key] ? '22px' : '2px' }}
                    />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={savePrefs}
                disabled={prefSaving}
                className="mt-2 rounded-2xl bg-amber-400 py-3 text-sm font-black text-paw-ink hover:bg-amber-300 disabled:opacity-60"
              >
                {prefSaving ? 'Saving…' : prefSaved ? 'Saved' : 'Save preferences'}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
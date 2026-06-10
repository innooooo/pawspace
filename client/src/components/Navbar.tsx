import {
  Bell,
  Heart,
  LogOut,
  Menu,
  Moon,
  PawPrint,
  Plus,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useNotifications } from '../hooks/useNotifications'
import { Avatar } from './Avatar'

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export function Navbar() {
  const { user, token, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const { notifications, unread, markRead, markAllRead } = useNotifications()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)

  const drawerRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)

  // Close both panels on route change
  useEffect(() => {
    setMobileOpen(false)
    setBellOpen(false)
  }, [location.pathname])

  // Outside click — drawer
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileOpen])

  // Outside click — bell
  useEffect(() => {
    if (!bellOpen) return
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [bellOpen])

  // Escape closes whichever panel is open
  useEffect(() => {
    if (!mobileOpen && !bellOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setBellOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen, bellOpen])

  const goPost = () => {
    if (!token) {
      navigate('/login', { state: { from: '/post' } })
      return
    }
    navigate('/post')
  }

  const scrollToExplore = (e: React.MouseEvent) => {
    e.preventDefault()
    setMobileOpen(false)
    if (location.pathname === '/feed') {
      document.getElementById('explore-pets')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      navigate('/feed#explore-pets')
    }
  }

  const navLinks = (
    <>
      <button
        type="button"
        onClick={scrollToExplore}
        className="flex min-h-[42px] items-center gap-2 rounded-xl px-4 font-semibold transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Search size={16} />
        Explore Pets
      </button>
      <button
        type="button"
        onClick={() => { setMobileOpen(false); goPost() }}
        className="flex min-h-[42px] items-center gap-2 rounded-xl px-4 font-semibold transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Plus size={16} />
        Post a Pet
      </button>
      <Link
        to={token ? '/favorites' : '/login'}
        onClick={() => setMobileOpen(false)}
        className="flex min-h-[42px] items-center gap-2 rounded-xl px-4 font-semibold transition-colors hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <Heart size={16} />
        Favorites
      </Link>
    </>
  )

  return (
    <>
      <header className="sticky top-0 z-50 px-3 py-3">
        <nav
          className="glass-panel mx-auto flex min-h-[64px] w-full max-w-7xl items-center justify-between gap-3 rounded-[28px] px-3 sm:px-5"
          style={{ color: 'var(--text-primary)' }}
        >
          {/* Logo */}
          <Link
            to="/feed"
            className="group flex min-h-[48px] items-center gap-3 rounded-2xl pr-2"
            aria-label="PawSpace home"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-[#060b1f] shadow-lg shadow-amber-500/30 transition-transform group-hover:scale-105">
              <PawPrint size={22} strokeWidth={2.5} />
            </span>
            <span className="hidden text-lg font-black tracking-tight sm:inline">PawSpace</span>
          </Link>

          {/* Desktop nav links */}
          <div
            className="hidden items-center gap-1 rounded-2xl p-1 text-sm lg:flex"
            style={{ background: 'var(--bg-surface)' }}
          >
            {navLinks}
          </div>

          {/* Right cluster */}
          <div className="flex items-center justify-end gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle color mode"
              className="flex h-11 w-11 items-center justify-center rounded-2xl transition-colors"
              style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
              }}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {token && user ? (
              <>
                {/* Bell with dropdown */}
                <div ref={bellRef} className="relative">
                  <button
                    type="button"
                    aria-label="Notifications"
                    onClick={() => setBellOpen((o) => !o)}
                    className="relative flex h-11 w-11 items-center justify-center rounded-2xl transition-colors"
                    style={{
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Bell size={18} />
                    {unread > 0 && (
                      <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-[#060b1f]">
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>

                  {bellOpen && (
                    <div
                      className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl shadow-xl"
                      style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                      }}
                    >
                      {/* Bell header */}
                      <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                      >
                        <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                          Notifications
                        </span>
                        {unread > 0 && (
                          <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification list */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                            Nothing here yet
                          </div>
                        ) : (
                          notifications.slice(0, 15).map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => { void markRead(n.id); setBellOpen(false) }}
                              className="w-full px-4 py-3 text-left transition-colors hover:bg-[var(--bg-surface-hover)]"
                              style={{ borderBottom: '1px solid var(--border-subtle)' }}
                            >
                              <div className="flex items-start gap-3">
                                {!n.read_at && (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                                )}
                                <div className={!n.read_at ? '' : 'pl-5'}>
                                  <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                                    {n.title}
                                  </p>
                                  {n.body && (
                                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                      {n.body}
                                    </p>
                                  )}
                                  <p className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                                    {timeAgo(n.created_at)}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/my-pets"
                  className="hidden min-h-[44px] items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition-colors sm:flex"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Sparkles size={16} />
                  My Pets
                </Link>

                <Link
                  to="/my-profile"
                  className="hidden items-center gap-2 rounded-2xl p-1.5 pr-3 text-sm font-semibold transition-colors md:flex"
                  style={{
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <Avatar name={user.name} avatarUrl={user.avatar_url} size={32} />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => { logout(); navigate('/feed') }}
                  aria-label="Log out"
                  className="flex h-11 w-11 items-center justify-center rounded-2xl transition-colors"
                  style={{
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden min-h-[44px] items-center rounded-2xl px-4 text-sm font-semibold transition-colors sm:flex"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="soft-glow flex min-h-[44px] items-center rounded-2xl bg-amber-400 px-4 text-sm font-black text-[#060b1f] hover:bg-amber-300"
                >
                  Register
                </Link>
              </>
            )}

            {/* Hamburger */}
            <button
              type="button"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl transition-colors lg:hidden"
              style={{
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
              }}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.3)' }}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        ref={drawerRef}
        className={`fixed left-3 right-3 top-[88px] z-50 overflow-hidden rounded-[24px] transition-all duration-200 lg:hidden ${
          mobileOpen ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
        style={{
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col gap-1 p-3 text-sm">
          {navLinks}
          {token && user && (
            <>
              <Link
                to="/my-pets"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[42px] items-center gap-2 rounded-xl px-4 font-semibold transition-colors hover:bg-[var(--bg-surface-hover)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Sparkles size={16} />
                My Pets
              </Link>
              <Link
                to="/my-profile"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[42px] items-center gap-2 rounded-xl px-4 font-semibold transition-colors hover:bg-[var(--bg-surface-hover)]"
                style={{ color: 'var(--text-secondary)' }}
              >
                <Avatar name={user.name} avatarUrl={user.avatar_url} size={28} />
                <span className="truncate">{user.name}</span>
              </Link>
            </>
          )}
          {!token && (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[48px] items-center gap-2 rounded-xl px-4 text-2xl font-extrabold transition-colors hover:bg-[var(--bg-surface-hover)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
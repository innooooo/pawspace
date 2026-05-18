import { Heart, LogOut, Menu, Moon, PawPrint, Plus, Search, Sparkles, Sun } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { Avatar } from './Avatar'

export function Navbar() {
  const { user, token, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const goPost = () => {
    if (!token) {
      navigate('/login', { state: { from: '/post' } })
      return
    }
    navigate('/post')
  }

  return (
    <header className="sticky top-0 z-50 px-3 py-3">
      <nav className="glass-panel mx-auto flex min-h-[64px] w-full max-w-7xl items-center justify-between gap-3 rounded-[28px] px-3 text-white sm:px-5">
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

        <div className="hidden items-center gap-1 rounded-2xl bg-white/[0.06] p-1 text-sm text-white/72 lg:flex">
          <Link to="/feed" className="flex min-h-[42px] items-center gap-2 rounded-xl px-4 font-semibold hover:bg-white/10 hover:text-white">
            <Search size={16} />
            Explore Pets
          </Link>
          <button type="button" onClick={goPost} className="flex min-h-[42px] items-center gap-2 rounded-xl px-4 font-semibold hover:bg-white/10 hover:text-white">
            <Plus size={16} />
            Post a Pet
          </button>
          <Link to="/feed" className="flex min-h-[42px] items-center gap-2 rounded-xl px-4 font-semibold hover:bg-white/10 hover:text-white">
            <Heart size={16} />
            Favorites
          </Link>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle color mode"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/12 hover:text-white"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {token && user ? (
            <>
              <Link
                to="/my-pets"
                className="hidden min-h-[44px] items-center gap-2 rounded-2xl border border-white/10 px-4 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white sm:flex"
              >
                <Sparkles size={16} />
                My Pets
              </Link>
              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-2xl bg-white/[0.06] p-1.5 pr-3 text-sm font-semibold text-white/80 hover:bg-white/10 md:flex"
              >
                <Avatar name={user.name} avatarUrl={user.avatar_url} size={32} />
                <span className="max-w-[120px] truncate">{user.name}</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/feed')
                }}
                aria-label="Log out"
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/12 hover:text-white"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden min-h-[44px] items-center rounded-2xl px-4 text-sm font-semibold text-white/78 hover:bg-white/10 hover:text-white sm:flex"
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

          <button
            type="button"
            aria-label="Open navigation"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/12 lg:hidden"
          >
            <Menu size={18} />
          </button>
        </div>
      </nav>
    </header>
  )
}

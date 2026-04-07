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
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-gray-900/95 dark:border-gray-700">
      <div className="max-w-lg mx-auto px-4 flex items-center justify-between gap-2 min-h-[56px]">
        {/* Logo */}
        <Link
          to="/feed"
          className="text-lg font-bold text-amber-800 dark:text-amber-400 tracking-tight min-h-[48px] flex items-center shrink-0"
        >
          🐾 PawSpace
        </Link>

        <div className="flex items-center gap-1 justify-end">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="min-h-[48px] min-w-[48px] flex items-center justify-center rounded-xl text-lg hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {/* Post button */}
          <button
            type="button"
            onClick={goPost}
            className="min-h-[48px] min-w-[48px] px-3 rounded-xl bg-amber-500 text-white font-semibold text-sm active:bg-amber-600 dark:bg-amber-600 dark:active:bg-amber-700 shrink-0"
          >
            + Post
          </button>

          {token && user ? (
            <>
              {/* Avatar + name — clicking goes to profile */}
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 min-h-[48px] px-2 rounded-xl hover:bg-stone-100 dark:hover:bg-gray-800 transition-colors"
                title={user.name}
              >
                <Avatar name={user.name} avatarUrl={user.avatar_url} size={28} />
                <span className="text-sm text-stone-600 dark:text-gray-100 max-w-[120px] truncate">
                  {user.name}
                </span>
              </Link>

              <Link
                to="/my-pets"
                className="min-h-[48px] px-3 flex items-center text-sm font-medium text-stone-600 dark:text-gray-100 rounded-xl hover:bg-stone-100 dark:hover:bg-gray-800"
              >
                My pets
              </Link>

              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/feed')
                }}
                className="min-h-[48px] px-3 text-sm font-medium text-stone-600 dark:text-stone-100 rounded-xl hover:bg-stone-100 dark:hover:bg-gray-800"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="min-h-[48px] px-3 flex items-center text-sm font-medium text-stone-800 dark:text-gray-200 rounded-xl hover:bg-stone-100 dark:hover:bg-gray-800"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="min-h-[48px] px-3 flex items-center text-sm font-semibold text-amber-800 dark:text-amber-400 rounded-xl hover:bg-amber-50 dark:hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
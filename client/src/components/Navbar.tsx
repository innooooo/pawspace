import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Navbar() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()

  const goPost = () => {
    if (!token) {
      navigate('/login', { state: { from: '/post' } })
      return
    }
    navigate('/post')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-lg mx-auto px-4 flex items-center justify-between gap-2 min-h-[56px]">
        <Link
          to="/feed"
          className="text-lg font-bold text-amber-800 tracking-tight min-h-[48px] flex items-center"
        >
          PawSpace
        </Link>

        <div className="flex items-center gap-1 flex-wrap justify-end">
          <button
            type="button"
            onClick={goPost}
            className="min-h-[48px] min-w-[48px] px-3 rounded-xl bg-amber-500 text-white font-semibold text-sm active:bg-amber-600"
          >
            + Post
          </button>

          {token && user ? (
            <>
              <span className="hidden sm:inline text-sm text-stone-600 max-w-[120px] truncate">
                Hi, {user.name}
              </span>
              <Link
                to="/my-pets"
                className="min-h-[48px] px-3 flex items-center text-sm font-medium text-stone-700 rounded-xl hover:bg-stone-100"
              >
                My pets
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/feed')
                }}
                className="min-h-[48px] px-3 text-sm font-medium text-stone-600 rounded-xl hover:bg-stone-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="min-h-[48px] px-3 flex items-center text-sm font-medium text-stone-800 rounded-xl hover:bg-stone-100"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="min-h-[48px] px-3 flex items-center text-sm font-semibold text-amber-800 rounded-xl hover:bg-amber-50"
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

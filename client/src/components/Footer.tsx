import { Heart, Mail, MapPin, PawPrint, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const links = [
  { label: 'Explore Pets', to: '/feed' },
  { label: 'Post a Pet', to: '/post' },
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#050918]/80 px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
      <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link to="/feed" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-[#060b1f] shadow-lg shadow-amber-500/25">
              <PawPrint size={22} strokeWidth={2.5} />
            </span>
            <span className="text-xl font-black tracking-tight">PawSpace</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/56">
            A warm, modern adoption marketplace helping Nairobi pets find loving homes with trust, speed, and care.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Verified listings', 'Local shelters', 'Fast matching'].map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold text-white/66">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-amber-200/70">Navigate</h2>
          <div className="mt-4 grid gap-3">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="text-sm font-semibold text-white/62 hover:text-amber-200">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-amber-200/70">Trust</h2>
          <div className="mt-4 space-y-3 text-sm font-semibold text-white/62">
            <p className="flex items-center gap-2">
              <MapPin size={16} className="text-emerald-200" />
              Nairobi, Kenya
            </p>
            <p className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-cyan-200" />
              Safer adoption flows
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} className="text-violet-200" />
              Community support
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-7xl flex-col gap-3 border-t border-white/10 pt-6 text-xs font-semibold text-white/42 sm:flex-row sm:items-center sm:justify-between">
        <p>Built for Nairobi's pet community.</p>
        <p className="flex items-center gap-2">
          <Sparkles size={14} className="text-amber-200" />
          Adopt with care
          <Heart size={14} className="text-rose-300" />
        </p>
      </div>
    </footer>
  )
}

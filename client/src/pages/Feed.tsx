import { motion } from 'framer-motion'
import {
  ArrowRight,
  Baby,
  CheckCircle2,
  ChevronDown,
  Heart,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  WandSparkles,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { NAIROBI_AREAS, SPECIES } from '../constants/nairobi'
import { PetCard } from '../components/PetCard'
import { FeedSkeletonGrid } from '../components/SkeletonCard'
import { usePets } from '../hooks/usePets'

const STATUSES = [
  { value: '', label: 'Any status' },
  { value: 'available', label: 'Available' },
  { value: 'pending', label: 'Pending' },
  { value: 'adopted', label: 'Adopted' },
]

const petOrbits = [
  { name: 'Luna', label: 'Calm cat', top: '16%', left: '7%', delay: 0 },
  { name: 'Milo', label: 'Playful pup', top: '36%', right: '5%', delay: 0.15 },
  { name: 'Kiwi', label: 'Tiny friend', bottom: '12%', left: '16%', delay: 0.3 },
]

const successStories = [
  { pet: 'Simba', story: 'Found a loving family in Kilimani after 3 days.' },
  { pet: 'Shadow', story: 'Matched with a calm apartment home near Westlands.' },
  { pet: 'Kiwi', story: 'Adopted by a first-time pet parent in Karen.' },
]

const testimonials = [
  {
    quote: 'The profiles felt personal, not transactional. We knew Simba was right before we even met.',
    name: 'Amina',
  },
  {
    quote: 'Fast, clear, and warm. PawSpace made adoption feel safe from the first message.',
    name: 'Brian',
  },
]

function SelectShell({
  icon,
  label,
  value,
  onChange,
  children,
}: {
  icon: React.ReactNode
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="group block">
      <span className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/46">
        {icon}
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[56px] w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.08] px-4 pr-11 text-sm font-bold text-white outline-none backdrop-blur-xl transition group-hover:border-amber-300/30 focus:border-amber-300/70 focus:ring-4 focus:ring-amber-300/10"
        >
          {children}
        </select>
        <ChevronDown size={17} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/48" />
      </span>
    </label>
  )
}

export default function Feed() {
  const [species, setSpecies] = useState('')
  const [adoption_status, setAdoptionStatus] = useState('')
  const [nairobi_area, setNairobiArea] = useState('')
  const [distance, setDistance] = useState(12)

  const sp = useMemo(() => species || undefined, [species])
  const st = useMemo(() => adoption_status || undefined, [adoption_status])
  const ar = useMemo(() => nairobi_area || undefined, [nairobi_area])

  const { pets, loading, loadingMore, error, loadMore, meta } = usePets(sp, st, ar, false)

  return (
    <main className="relative isolate overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12rem] top-10 h-[28rem] w-[28rem] rounded-full bg-amber-500/16 blur-3xl" />
        <div className="absolute right-[-10rem] top-20 h-[30rem] w-[30rem] rounded-full bg-violet-500/16 blur-3xl" />
        <div className="absolute bottom-40 left-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-[length:44px_44px] opacity-30" />
      </div>

      <section className="mx-auto grid min-h-[calc(100dvh-88px)] w-full max-w-7xl items-center gap-10 px-4 pb-10 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-6">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-100 shadow-lg shadow-amber-500/10 backdrop-blur-xl"
          >
            <Sparkles size={16} />
            Nairobi's warmest adoption marketplace
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-balance max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl lg:text-8xl"
          >
            Find Your Perfect Companion
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="mt-6 max-w-2xl text-lg leading-8 text-white/66 sm:text-xl"
          >
            Adopt loving pets near you with a fast, beautiful experience.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="glass-panel mt-8 rounded-[32px] p-3"
          >
            <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr_1fr_auto]">
              <SelectShell icon={<PawPrint size={14} />} label="Species" value={species} onChange={setSpecies}>
                <option value="">Any species</option>
                {SPECIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectShell>

              <SelectShell icon={<MapPin size={14} />} label="Location" value={nairobi_area} onChange={setNairobiArea}>
                <option value="">Anywhere in Nairobi</option>
                {NAIROBI_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </SelectShell>

              <SelectShell icon={<ShieldCheck size={14} />} label="Status" value={adoption_status} onChange={setAdoptionStatus}>
                {STATUSES.map((o) => (
                  <option key={o.value || 'any'} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectShell>

              <button
                type="button"
                className="soft-glow flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-amber-400 px-7 text-sm font-black text-[#060b1f] transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </motion.div>

          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {[
              ['2.4k+', 'pets helped'],
              ['98%', 'verified homes'],
              ['24h', 'avg. first match'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/42">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[560px]">
          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-x-4 top-8 overflow-hidden rounded-[44px] border border-white/12 bg-white/[0.07] p-3 shadow-2xl shadow-black/40 backdrop-blur-2xl lg:inset-x-12"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[34px] bg-[#101832]">
              <img
                src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=85"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060b1f] via-[#060b1f]/15 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <div className="mb-3 inline-flex rounded-full bg-emerald-300/18 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-100">
                  Perfect match
                </div>
                <h2 className="text-4xl font-black text-white">Meet your next best friend</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/66">
                  Warm profiles, clear signals, and adoption flows designed for trust.
                </p>
              </div>
            </div>
          </motion.div>

          {petOrbits.map((card) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
              transition={{ opacity: { delay: card.delay }, scale: { delay: card.delay }, y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: card.delay } }}
              className="absolute hidden rounded-3xl border border-white/12 bg-white/[0.10] p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:block"
              style={card}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/20 text-amber-100">
                  <PawPrint size={22} />
                </div>
                <div>
                  <p className="font-black text-white">{card.name}</p>
                  <p className="text-xs font-semibold text-white/52">{card.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 lg:grid-cols-[320px_1fr] lg:px-6">
        <aside className="glass-panel h-fit rounded-[32px] p-5 lg:sticky lg:top-24">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-200/70">Smart filters</p>
              <h2 className="mt-1 text-2xl font-black text-white">Refine search</h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.08] text-white/70">
              <SlidersHorizontal size={19} />
            </span>
          </div>

          <div className="space-y-4">
            <SelectShell icon={<PawPrint size={14} />} label="Species" value={species} onChange={setSpecies}>
              <option value="">Any species</option>
              {SPECIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </SelectShell>
            <SelectShell icon={<ShieldCheck size={14} />} label="Availability" value={adoption_status} onChange={setAdoptionStatus}>
              {STATUSES.map((o) => (
                <option key={o.value || 'any'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </SelectShell>
            <SelectShell icon={<MapPin size={14} />} label="Area" value={nairobi_area} onChange={setNairobiArea}>
              <option value="">Any area</option>
              {NAIROBI_AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </SelectShell>

            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <div className="flex items-center justify-between text-sm font-bold text-white/72">
                <span>Distance</span>
                <span>{distance} km</span>
              </div>
              <input
                type="range"
                min="2"
                max="40"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="mt-4 w-full accent-amber-300"
              />
            </div>

            {[
              ['Age', 'Any age', Baby],
              ['Gender', 'Any gender', Users],
              ['Size', 'Small to large', Sparkles],
              ['Vaccinated', 'Health checked', ShieldCheck],
              ['Good with kids', 'Family-ready', Heart],
            ].map(([label, value, Icon]) => (
              <button
                key={label as string}
                type="button"
                className="flex min-h-[54px] w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-left transition hover:border-amber-300/30 hover:bg-white/[0.08]"
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} className="text-amber-200" />
                  <span>
                    <span className="block text-sm font-black text-white">{label as string}</span>
                    <span className="text-xs font-semibold text-white/42">{value as string}</span>
                  </span>
                </span>
                <CheckCircle2 size={17} className="text-white/28" />
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200/70">Explore pets</p>
              <h2 className="mt-2 text-4xl font-black tracking-tight text-white">Pets ready to meet you</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/52">
              Premium profiles with fast filters, verified details, and emotional context at a glance.
            </p>
          </div>

          {error && (
            <p className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <FeedSkeletonGrid />
          ) : pets.length === 0 ? (
            <div className="glass-panel rounded-[32px] px-6 py-16 text-center">
              <PawPrint size={42} className="mx-auto text-amber-200" />
              <p className="mt-4 text-xl font-black text-white">No pets match these filters</p>
              <p className="mt-2 text-sm text-white/54">Try another species, area, or adoption status.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {pets.map((p) => (
                  <PetCard key={p.id} pet={p} />
                ))}
              </div>
              {meta?.hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="soft-glow flex min-h-[54px] items-center gap-2 rounded-2xl bg-amber-400 px-8 text-sm font-black text-[#060b1f] disabled:opacity-50"
                  >
                    {loadingMore ? 'Loading...' : 'Load more'}
                    <ArrowRight size={17} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="mx-auto mt-20 grid w-full max-w-7xl gap-5 px-4 lg:grid-cols-3 lg:px-6">
        <div className="glass-panel rounded-[32px] p-6 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200/70">Recently adopted</p>
              <h2 className="mt-2 text-3xl font-black text-white">Happy endings, updated live</h2>
            </div>
            <Heart className="text-rose-300" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {successStories.map((story) => (
              <div key={story.pet} className="rounded-3xl border border-white/10 bg-white/[0.06] p-4">
                <div className="mb-4 h-24 rounded-2xl bg-gradient-to-br from-amber-300/30 via-violet-300/20 to-cyan-300/20" />
                <p className="text-lg font-black text-white">{story.pet}</p>
                <p className="mt-2 text-sm leading-6 text-white/56">{story.story}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[32px] p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-300/18 text-violet-100">
            <WandSparkles />
          </div>
          <h2 className="mt-5 text-3xl font-black text-white">AI-powered pet matching</h2>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Match by lifestyle, space, schedule, and temperament so every adoption starts with confidence.
          </p>
          <button className="mt-6 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-black text-[#060b1f] hover:bg-amber-300">
            Start matching
            <ArrowRight size={17} />
          </button>
        </div>
      </section>

      <section className="mx-auto mt-5 grid w-full max-w-7xl gap-5 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
        <div className="glass-panel rounded-[32px] p-6">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200/70">Shelter spotlight</p>
          <h2 className="mt-2 text-3xl font-black text-white">Nairobi Care Collective</h2>
          <p className="mt-3 text-sm leading-6 text-white/58">
            Verified local partners, transparent adoption flows, and compassionate support from listing to handoff.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {['42 pets', '18 areas', '4.9 rating'].map((item) => (
              <div key={item} className="rounded-2xl bg-white/[0.06] px-3 py-4 text-center text-sm font-black text-white">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {testimonials.map((item) => (
            <div key={item.name} className="glass-panel rounded-[32px] p-6">
              <div className="mb-5 flex gap-1 text-amber-200">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-lg font-bold leading-8 text-white">"{item.quote}"</p>
              <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-white/44">{item.name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

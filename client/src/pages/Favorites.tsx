import { Heart, MessageCircle, PawPrint, MapPin, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { unwrap, type ApiEnvelope } from '../api'

type Tab = 'saved' | 'interests' | 'commented'

interface Pet {
  id: string
  name: string
  species: string
  nairobi_area: string
  adoption_status: string
  images?: string[]
}

interface Interest {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  pet: Pet
}

interface SavedPet {
  id: string
  saved_at: string
  pet: Pet
}

interface CommentedPet {
  id: string
  last_commented_at: string
  pet: Pet
}

const STATUS_STYLES: Record<string, string> = {
  pending:          'bg-amber-400/20 text-amber-400',
  accepted:         'bg-emerald-400/20 text-emerald-400',
  rejected:         'bg-red-400/20 text-red-400',
  available:        'bg-emerald-400/20 text-emerald-400',
  pending_adoption: 'bg-amber-400/20 text-amber-400',
  adopted:          'bg-[var(--bg-surface)] text-[var(--text-muted)]',
}

function PetCard({ pet, meta }: { pet: Pet; meta: React.ReactNode }) {
  return (
    <Link
      to={`/pet/${pet.id}`}
      className="group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:bg-[var(--bg-surface-hover)]"
      style={{ border: '1px solid var(--border-subtle)' }}
    >
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--bg-surface)]">
        {pet.images?.[0] ? (
          <img src={pet.images[0]} alt={pet.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawPrint size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-black" style={{ color: 'var(--text-primary)' }}>{pet.name}</p>
        <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>{pet.species}</p>
        <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={11} />
          {pet.nairobi_area}
        </div>
        <div className="mt-2">{meta}</div>
      </div>
      <ChevronRight
        size={16}
        style={{ color: 'var(--text-muted)' }}
        className="shrink-0 transition-transform group-hover:translate-x-1"
      />
    </Link>
  )
}

function EmptyState({ tab }: { tab: Tab }) {
  const copy = {
    saved:     { title: 'No saved pets yet',                         sub: 'Heart a pet on the feed to save it here.',          cta: 'Browse pets', to: '/feed' },
    interests: { title: "You haven't expressed interest in any pet", sub: 'Find a pet you love and send an adoption request.', cta: 'Browse pets', to: '/feed' },
    commented: { title: 'No commented pets yet',                     sub: 'Leave a comment on a pet listing to see it here.',  cta: 'Browse pets', to: '/feed' },
  }[tab]

  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10">
        <PawPrint size={28} className="text-amber-400" />
      </span>
      <p className="font-black text-lg" style={{ color: 'var(--text-primary)' }}>{copy.title}</p>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{copy.sub}</p>
      <Link
        to={copy.to}
        className="mt-6 rounded-2xl bg-amber-400 px-6 py-2.5 text-sm font-black text-paw-ink hover:bg-amber-300"
      >
        {copy.cta}
      </Link>
    </div>
  )
}

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
    </div>
  )
}

export function Favorites() {
  const [tab, setTab]             = useState<Tab>('saved')
  const [loading, setLoading]     = useState(false)
  const [saved, setSaved]         = useState<SavedPet[] | null>(null)
  const [interests, setInterests] = useState<Interest[] | null>(null)
  const [commented, setCommented] = useState<CommentedPet[] | null>(null)

  useEffect(() => {
    if (tab === 'saved'     && saved     !== null) return
    if (tab === 'interests' && interests !== null) return
    if (tab === 'commented' && commented !== null) return

    setLoading(true)

    const fetchers: Record<Tab, () => Promise<void>> = {
      saved: async () => {
        const res = await api.get<ApiEnvelope<{ pets: SavedPet[] }>>('/api/favorites/saved')
        setSaved(unwrap(res).pets)
      },
      interests: async () => {
        const res = await api.get<ApiEnvelope<{ interests: Interest[] }>>('/api/favorites/interests')
        setInterests(unwrap(res).interests)
      },
      commented: async () => {
        const res = await api.get<ApiEnvelope<{ pets: CommentedPet[] }>>('/api/favorites/commented')
        setCommented(unwrap(res).pets)
      },
    }

    fetchers[tab]()
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tab])

  const counts = {
    saved:     saved?.length     ?? 0,
    interests: interests?.length ?? 0,
    commented: commented?.length ?? 0,
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'saved',     label: 'Saved',     icon: <Heart size={15} /> },
    { key: 'interests', label: 'Interests', icon: <PawPrint size={15} /> },
    { key: 'commented', label: 'Commented', icon: <MessageCircle size={15} /> },
  ]

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Your pets</h1>
      <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Pets you've saved, applied for, or commented on.
      </p>

      <div className="mb-6 flex gap-1 rounded-2xl p-1" style={{ background: 'var(--bg-surface)' }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
            style={
              tab === t.key
                ? { background: 'var(--bg-base)', color: 'var(--text-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }
                : { color: 'var(--text-secondary)' }
            }
          >
            {t.icon}
            {t.label}
            {counts[t.key] > 0 && (
              <span className="rounded-full bg-amber-400/20 px-1.5 py-0.5 text-[11px] font-black text-amber-400">
                {counts[t.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <div className="flex flex-col gap-3">
          {tab === 'saved' && (
            !saved || saved.length === 0
              ? <EmptyState tab="saved" />
              : saved.map((s) => (
                  <PetCard
                    key={s.id}
                    pet={s.pet}
                    meta={
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Saved {new Date(s.saved_at).toLocaleDateString()}
                      </span>
                    }
                  />
                ))
          )}

          {tab === 'interests' && (
            !interests || interests.length === 0
              ? <EmptyState tab="interests" />
              : interests.map((i) => (
                  <PetCard
                    key={i.id}
                    pet={i.pet}
                    meta={
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-black ${STATUS_STYLES[i.status]}`}>
                        {i.status.charAt(0).toUpperCase() + i.status.slice(1)}
                      </span>
                    }
                  />
                ))
          )}

          {tab === 'commented' && (
            !commented || commented.length === 0
              ? <EmptyState tab="commented" />
              : commented.map((c) => (
                  <PetCard
                    key={c.id}
                    pet={c.pet}
                    meta={
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Commented {new Date(c.last_commented_at).toLocaleDateString()}
                      </span>
                    }
                  />
                ))
          )}
        </div>
      )}
    </div>
  )
}
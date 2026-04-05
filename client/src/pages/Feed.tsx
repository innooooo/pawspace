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

export default function Feed() {
  const [species, setSpecies] = useState('')
  const [adoption_status, setAdoptionStatus] = useState('')
  const [nairobi_area, setNairobiArea] = useState('')

  const sp = useMemo(() => species || undefined, [species])
  const st = useMemo(() => adoption_status || undefined, [adoption_status])
  const ar = useMemo(() => nairobi_area || undefined, [nairobi_area])

  const { pets, loading, loadingMore, error, loadMore, meta } = usePets(sp, st, ar, false)

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Find a pet</h1>
        <p className="text-stone-600 text-sm mt-1">Browse listings across Nairobi. Filters work on slow networks too.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm font-medium text-stone-700">
          Species
          <select
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-3 text-base bg-white"
          >
            <option value="">Any species</option>
            {SPECIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Status
          <select
            value={adoption_status}
            onChange={(e) => setAdoptionStatus(e.target.value)}
            className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-3 text-base bg-white"
          >
            {STATUSES.map((o) => (
              <option key={o.value || 'any'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Area
          <select
            value={nairobi_area}
            onChange={(e) => setNairobiArea(e.target.value)}
            className="mt-1 w-full min-h-[48px] rounded-xl border border-stone-300 px-3 text-base bg-white"
          >
            <option value="">Any area</option>
            {NAIROBI_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <FeedSkeletonGrid />
      ) : pets.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-stone-200 rounded-2xl bg-stone-50">
          <p className="text-4xl mb-2" aria-hidden>
            🐾
          </p>
          <p className="font-medium text-stone-800">No pets match these filters</p>
          <p className="text-sm text-stone-600 mt-1">Try clearing a filter or check back soon.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {pets.map((p) => (
              <PetCard key={p.id} pet={p} />
            ))}
          </div>
          {meta?.hasMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-h-[48px] px-8 rounded-xl border-2 border-amber-600 text-amber-800 font-semibold active:bg-amber-50 disabled:opacity-50"
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

import { PetCard } from '../components/PetCard'
import { FeedSkeletonGrid } from '../components/SkeletonCard'
import { usePets } from '../hooks/usePets'

export default function MyPets() {
  const { pets, loading, loadingMore, error, loadMore, meta } = usePets(
    undefined,
    undefined,
    undefined,
    true
  )

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-200">My pets</h1>
        <p className="text-stone-600 dark:text-stone-100 text-sm mt-1">Listings you’ve posted on PawSpace.</p>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <FeedSkeletonGrid />
      ) : pets.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-stone-200 rounded-2xl bg-stone-50 dark:bg-gray-900">
          <p className="text-4xl mb-2" aria-hidden>
            📋
          </p>
          <p className="font-medium text-stone-800 dark:text-gray-200">You haven’t posted a pet yet</p>
          <p className="text-sm text-stone-600 dark:text-stone-100 mt-1">Use “+ Post” to create your first listing.</p>
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

export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl border border-stone-200 bg-white overflow-hidden animate-pulse"
      aria-hidden
    >
      <div className="aspect-[4/3] bg-stone-200" />
      <div className="p-4 space-y-3 text-left">
        <div className="h-5 bg-stone-200 rounded w-2/3" />
        <div className="h-4 bg-stone-100 rounded w-1/2" />
        <div className="h-4 bg-stone-100 rounded w-1/3" />
      </div>
    </div>
  )
}

export function FeedSkeletonGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

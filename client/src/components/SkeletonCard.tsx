export function SkeletonCard() {
  return (
    <div className="glass-panel overflow-hidden rounded-[28px] p-2" aria-hidden>
      <div className="aspect-[4/3] animate-pulse rounded-[22px] bg-white/10" />
      <div className="space-y-3 p-4 text-left">
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-white/12" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/10" />
      </div>
    </div>
  )
}

export function FeedSkeletonGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

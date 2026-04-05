import { useCallback, useRef, useState } from 'react'
import type { PetPhoto } from '../types'

type Props = {
  photos: PetPhoto[]
  alt: string
  speciesEmoji?: string
}

export function PhotoGallery({ photos, alt, speciesEmoji = '🐾' }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  const scrollTo = useCallback((index: number) => {
    const el = scrollerRef.current
    if (!el) return
    const w = el.clientWidth
    el.scrollTo({ left: index * w, behavior: 'smooth' })
    setActive(index)
  }, [])

  const onScroll = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const w = el.clientWidth
    const i = Math.round(el.scrollLeft / Math.max(w, 1))
    setActive(i)
  }, [])

  if (!photos.length) {
    return (
      <div className="aspect-[4/3] rounded-2xl bg-stone-100 flex items-center justify-center text-6xl border border-stone-200">
        <span role="img" aria-label="No photo">
          {speciesEmoji}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl border border-stone-200 bg-stone-100 touch-pan-x [-webkit-overflow-scrolling:touch]"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className="min-w-full snap-center shrink-0 relative block p-0 border-0 bg-transparent cursor-zoom-in md:cursor-default"
            onClick={() => {
              if (window.matchMedia('(min-width: 768px)').matches) {
                scrollTo((i + 1) % photos.length)
              }
            }}
            aria-label={`Photo ${i + 1} of ${photos.length}`}
          >
            <img
              src={p.url}
              alt={`${alt} — photo ${i + 1}`}
              className="w-full aspect-[4/3] object-cover bg-stone-200"
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </button>
        ))}
      </div>
      {photos.length > 1 && (
        <div className="flex justify-center gap-2">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => scrollTo(i)}
              className={`min-w-[12px] min-h-[12px] rounded-full transition-colors ${
                i === active ? 'bg-amber-600' : 'bg-stone-300'
              }`}
              aria-label={`Go to photo ${i + 1}`}
              aria-current={i === active}
            />
          ))}
        </div>
      )}
    </div>
  )
}

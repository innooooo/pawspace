import { Link } from 'react-router-dom'
import type { Pet } from '../types'
import { StatusBadge } from './StatusBadge'

function speciesEmoji(species: string) {
  switch (species) {
    case 'dog':
      return '🐕'
    case 'cat':
      return '🐈'
    case 'rabbit':
      return '🐰'
    case 'bird':
      return '🐦'
    default:
      return '🐾'
  }
}

type Props = {
  pet: Pet
}

export function PetCard({ pet }: Props) {
  const likes = pet.like_count ?? 0
  const img = pet.primary_photo_url

  return (
    <Link
      to={`/pet/${pet.id}`}
      className="block rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm active:scale-[0.99] transition-transform text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
    >
      <div className="aspect-[4/3] bg-stone-100 relative">
        {img ? (
          <img
            src={img}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {speciesEmoji(pet.species)}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <StatusBadge status={pet.adoption_status} />
        </div>
      </div>
      <div className="p-4 space-y-1">
        <h2 className="text-lg font-semibold text-stone-900 leading-tight">{pet.name}</h2>
        <p className="text-sm text-stone-600">
          {pet.breed || pet.species} · {pet.nairobi_area}
        </p>
        <p className="text-sm text-stone-500">
          ♥ {likes} {likes === 1 ? 'like' : 'likes'}
        </p>
      </div>
    </Link>
  )
}

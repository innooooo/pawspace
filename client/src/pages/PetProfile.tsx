import { useNavigate, useParams, Link, Navigate } from 'react-router-dom'
import { useState } from 'react'
import api, { getErrorMessage } from '../api'
import { InterestButton } from '../components/InterestButton'
import { InterestManager } from '../components/InterestManager'
import { PhotoGallery } from '../components/PhotoGallery'
import { StatusBadge } from '../components/StatusBadge'
import { useAuth } from '../hooks/useAuth'
import { usePet } from '../hooks/usePet'

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

export default function PetProfile() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const { pet, owner, photos, likeCount, likedByMe, loading, error, refreshLikes } = usePet(id)
  const [likeErr, setLikeErr] = useState<string | null>(null)

  if (!id) {
    return <Navigate to="/feed" replace />
  }

  const isOwner = !!(user && pet && user.id === pet.owner_id)

  const toggleLike = async () => {
    setLikeErr(null)
    if (!token) {
      navigate('/login', { state: { from: `/pet/${id}` } })
      return
    }
    try {
      await api.post(`/api/pets/${id}/like`)
      await refreshLikes()
    } catch (e) {
      setLikeErr(getErrorMessage(e))
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse text-left">
        <div className="aspect-[4/3] bg-stone-200 rounded-2xl" />
        <div className="h-8 bg-stone-200 rounded w-2/3" />
        <div className="h-4 bg-stone-100 rounded w-full" />
        <div className="h-4 bg-stone-100 rounded w-5/6" />
      </div>
    )
  }

  if (error || !pet || !owner) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-red-700">{error ?? 'Pet not found.'}</p>
        <Link to="/feed" className="text-amber-800 font-semibold underline">
          Back to feed
        </Link>
      </div>
    )
  }

  const ageParts = []
  if (pet.age_years != null) ageParts.push(`${pet.age_years} yr`)
  if (pet.age_months != null) ageParts.push(`${pet.age_months} mo`)

  return (
    <article className="space-y-6 text-left pb-8">
      <PhotoGallery
        photos={photos}
        alt={pet.name}
        speciesEmoji={speciesEmoji(pet.species)}
      />

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{pet.name}</h1>
          <p className="text-stone-600 text-sm mt-1">
            {pet.breed || pet.species}
            {ageParts.length ? ` · ${ageParts.join(', ')}` : ''} · {pet.sex} · {pet.size}
          </p>
          <p className="text-stone-600 text-sm">{pet.nairobi_area}</p>
        </div>
        <StatusBadge status={pet.adoption_status} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          className="min-h-[48px] min-w-[48px] px-4 rounded-xl border border-stone-300 bg-white font-semibold text-stone-800 flex items-center gap-2 active:bg-stone-50"
          aria-pressed={likedByMe}
        >
          <span className="text-xl" aria-hidden>
            {likedByMe ? '♥' : '♡'}
          </span>
          <span>{likeCount}</span>
        </button>
        {!token && (
          <p className="text-sm text-stone-600">
            <Link to="/login" state={{ from: `/pet/${id}` }} className="font-semibold text-amber-800 underline">
              Log in
            </Link>{' '}
            to like or show interest.
          </p>
        )}
        {likeErr && (
          <p className="text-sm text-red-700 w-full" role="alert">
            {likeErr}
          </p>
        )}
      </div>

      <section className="border border-stone-200 rounded-2xl p-4 bg-stone-50">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2">Owner</h2>
        <div className="flex items-center gap-3">
          {owner.avatar_url ? (
            <img
              src={owner.avatar_url}
              alt=""
              className="w-14 h-14 rounded-full object-cover bg-stone-200"
              loading="lazy"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-2xl" aria-hidden>
              👤
            </div>
          )}
          <div>
            <p className="font-semibold text-stone-900">{owner.name}</p>
            <p className="text-sm text-stone-600">{owner.nairobi_area}</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900 mb-2">About</h2>
        <p className="text-stone-700 whitespace-pre-wrap leading-relaxed">{pet.description}</p>
        <ul className="mt-3 text-sm text-stone-600 space-y-1">
          <li>Vaccinated: {pet.is_vaccinated ? 'Yes' : 'No'}</li>
          <li>Neutered/spayed: {pet.is_neutered ? 'Yes' : 'No'}</li>
        </ul>
      </section>

      {!isOwner && token && (
        <section className="border-t border-stone-200 pt-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-3">Interested in adopting?</h2>
          <InterestButton petId={pet.id} />
        </section>
      )}

      {isOwner && (
        <section className="border-t border-stone-200 pt-6">
          <InterestManager petId={pet.id} />
        </section>
      )}
    </article>
  )
}

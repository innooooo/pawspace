import { motion } from 'framer-motion'
import { ArrowRight, Heart, MapPin, ShieldCheck, Sparkles, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Pet } from '../types'
import { StatusBadge } from './StatusBadge'

function fallbackImage(species: string) {
  const text = encodeURIComponent(species === 'dog' ? 'Loyal companion' : species === 'cat' ? 'Gentle friend' : 'Adopt me')
  return `https://placehold.co/900x680/111827/f8fafc?text=${text}`
}

function ageLabel(pet: Pet) {
  if (pet.age_years && pet.age_years > 0) return `${pet.age_years} yr${pet.age_years === 1 ? '' : 's'}`
  if (pet.age_months && pet.age_months > 0) return `${pet.age_months} mo`
  return 'Young'
}

type Props = {
  pet: Pet
}

export function PetCard({ pet }: Props) {
  const likes = pet.like_count ?? 0
  const img = pet.primary_photo_url || fallbackImage(pet.species)
  const urgency = pet.adoption_status === 'available' ? 'Ready for visits' : pet.adoption_status === 'pending' ? 'Almost home' : 'Happy ending'
  const tags = [
    'Friendly',
    pet.is_vaccinated ? 'Vaccinated' : 'Gentle',
    pet.size === 'small' ? 'Apartment ready' : pet.size === 'large' ? 'Active home' : 'Playful',
  ]

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <Link
        to={`/pet/${pet.id}`}
        className="group glass-panel block overflow-hidden rounded-[32px] p-2 text-left transition duration-300 hover:border-amber-300/35 hover:bg-white/[0.10] hover:shadow-amber-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] bg-white/10">
          <img
            src={img}
            alt=""
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060b1f]/92 via-[#060b1f]/12 to-transparent" />
          <div className="absolute left-4 top-4">
            <StatusBadge status={pet.adoption_status} />
          </div>
          <span className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-black/25 text-white shadow-xl backdrop-blur-xl transition group-hover:scale-110 group-hover:bg-rose-400 group-hover:text-white">
            <Heart size={19} fill="currentColor" />
          </span>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/12 bg-white/12 px-3 py-1 text-[11px] font-bold text-white/86 backdrop-blur-xl">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white">{pet.name}</h2>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/74">
                {pet.breed || pet.species} / {ageLabel(pet)}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/58">
                <MapPin size={15} />
                {pet.nairobi_area}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-right">
              <p className="text-xs font-bold text-amber-100">{likes} saved</p>
              <p className="text-[11px] text-white/48">this week</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <span className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/72">
              <Timer size={14} className="text-amber-300" />
              {urgency}
            </span>
            <span className="flex items-center gap-2 rounded-2xl bg-white/[0.06] px-3 py-2 text-xs font-semibold text-white/72">
              <ShieldCheck size={14} className="text-emerald-300" />
              Verified listing
            </span>
          </div>

          <div className="flex min-h-[48px] items-center justify-between rounded-2xl bg-white text-[#060b1f] px-4 text-sm font-black transition group-hover:bg-amber-300">
            <span className="flex items-center gap-2">
              <Sparkles size={16} />
              View Details
            </span>
            <ArrowRight size={17} />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

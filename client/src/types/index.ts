export type User = {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  avatar_url: string | null
  bio: string | null
  nairobi_area: string
  created_at: string
  updated_at: string
}

export type Pet = {
  id: string
  owner_id: string
  name: string
  species: string
  breed: string | null
  age_years: number | null
  age_months: number | null
  sex: string
  size: string
  description: string
  adoption_status: string
  nairobi_area: string
  is_vaccinated: boolean
  is_neutered: boolean
  created_at: string
  updated_at: string
  primary_photo_url?: string | null
  like_count?: number
}

export type PetPhoto = {
  id: string
  pet_id: string
  url: string
  storage_key: string
  display_order: number
  is_primary: boolean
  created_at: string
}

export type AdoptionInterest = {
  id: string
  pet_id: string
  adopter_id: string
  message: string | null
  status: string
  created_at: string
  updated_at: string
  adopter?: {
    id: string
    name: string
    email: string
    phone: string | null
    nairobi_area: string
  }
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  hasMore: boolean
}

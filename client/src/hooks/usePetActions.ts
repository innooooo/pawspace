import { useCallback, useState } from 'react'
import api, { getErrorMessage } from '../api'
import type { Pet } from '../types'

export interface AdoptPayload {
  success_note?: string
  success_photo_url?: string
}

export interface UpdatePayload {
  name?: string
  species?: string
  breed?: string
  age_years?: number | null
  age_months?: number | null
  sex?: string
  size?: string
  description?: string
  nairobi_area?: string
  is_vaccinated?: boolean
  is_neutered?: boolean
}

export function usePetActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generic PATCH handler
  const patchPet = useCallback(async (petId: string, body: Record<string, unknown>) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.patch(`/api/pets/${petId}`, body)
      const data = res.data as { pet: Pet; message?: string; }
      return { success: true as const, pet: data.pet, message: data.message }
    } catch (e) {
      const msg = getErrorMessage(e)
      setError(msg)
      return { success: false as const, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  // Edit fields (no action)
  //const updatePet = useCallback(
  //  async (petId: string, fields: UpdatePayload) => {
  //    return patchPet(petId, fields)
  //  },
  //  [patchPet]
  //)

  // Archive / Re-activate (toggle)
  const archivePet = useCallback(
    async (petId: string) => {
      return patchPet(petId, { action: 'archive' })
    },
    [patchPet]
  )

  // Adopt with optional note + photo
  const adoptPet = useCallback(
    async (petId: string, payload?: AdoptPayload) => {
      const body: Record<string, unknown> = { action: 'adopt' }
      if (payload?.success_note) body.success_note = payload.success_note
      if (payload?.success_photo_url) body.success_photo_url = payload.success_photo_url
      return patchPet(petId, body)
    },
    [patchPet]
  )

  // Delete with confirmation
  const deletePet = useCallback(
    async (petId: string) => {
      return patchPet(petId, { action: 'delete', confirm: true })
    },
    [patchPet]
  )

  return {
    //updatePet,
    archivePet,
    adoptPet,
    deletePet,
    loading,
    error,
    clearError: () => setError(null),
  }
}
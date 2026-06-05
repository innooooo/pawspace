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

type ActionKey = 'archive' | 'adopt' | 'delete' | 'update'

type PatchResult =
  | { success: true; pet: Pet; message?: string }
  | { success: false; error: string }

export function usePetActions() {
  const [loadingMap, setLoadingMap] = useState<Partial<Record<ActionKey, boolean>>>({})
  const [error, setError] = useState<string | null>(null)

  const setActionLoading = (action: ActionKey, val: boolean) =>
    setLoadingMap(prev => ({ ...prev, [action]: val }))

  const patchPet = useCallback(async (
    action: ActionKey,
    petId: string,
    body: Record<string, unknown>
  ): Promise<PatchResult> => {
    setActionLoading(action, true)
    setError(null)
    try {
      const res = await api.patch(`/api/pets/${petId}`, body)
      const data = res.data as { pet: Pet; message?: string }
      return { success: true, pet: data.pet, message: data.message }
    } catch (e) {
      const msg = getErrorMessage(e)
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setActionLoading(action, false)
    }
  }, [])

  const updatePet = useCallback(
    (petId: string, fields: UpdatePayload) =>
      patchPet('update', petId, fields as Record<string, unknown>),
    [patchPet]
  )

  const archivePet = useCallback(
    (petId: string, currentStatus: string) =>
      patchPet('archive', petId, {
        action: currentStatus === 'archived' ? 'reactivate' : 'archive',
      }),
    [patchPet]
  )

  const adoptPet = useCallback(
    (petId: string, payload?: AdoptPayload) => {
      const body: Record<string, unknown> = { action: 'adopt' }
      if (payload?.success_note) body.success_note = payload.success_note
      if (payload?.success_photo_url) body.success_photo_url = payload.success_photo_url
      return patchPet('adopt', petId, body)
    },
    [patchPet]
  )

  const deletePet = useCallback(
    async (petId: string): Promise<PatchResult> => {
      setActionLoading('delete', true)
      setError(null)
      try {
        const res = await api.delete(`/api/pets/${petId}`)
        return { success: true, pet: res.data?.pet, message: res.data?.message }
      } catch (e) {
        const msg = getErrorMessage(e)
        setError(msg)
        return { success: false, error: msg }
      } finally {
        setActionLoading('delete', false)
      }
    },
    []
  )

  return {
    updatePet,
    archivePet,
    adoptPet,
    deletePet,
    loadingMap,
    error,
    clearError: () => setError(null),
  }
}
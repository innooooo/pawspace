import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage, unwrap } from '../api'
import type { Pet, PetPhoto, User } from '../types'

export type PetDetailState = {
  pet: Pet | null
  owner: User | null
  photos: PetPhoto[]
  likeCount: number
  likedByMe: boolean
}

export function usePet(id: string | undefined) {
  const [state, setState] = useState<PetDetailState>({
    pet: null,
    owner: null,
    photos: [],
    likeCount: 0,
    likedByMe: false,
  })
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const [detailRes, likesRes] = await Promise.all([
        api.get(`/api/pets/${id}`),
        api.get(`/api/pets/${id}/likes`),
      ])
      const detail = unwrap(detailRes) as {
        pet: Pet
        owner: User
        photos: PetPhoto[]
      }
      const likes = unwrap(likesRes) as { likeCount: number; likedByMe: boolean }
      setState({
        pet: detail.pet,
        owner: detail.owner,
        photos: detail.photos,
        likeCount: likes.likeCount,
        likedByMe: likes.likedByMe,
      })
    } catch (e) {
      setError(getErrorMessage(e))
      setState({
        pet: null,
        owner: null,
        photos: [],
        likeCount: 0,
        likedByMe: false,
      })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  const refreshLikes = useCallback(async () => {
    if (!id) return
    try {
      const likesRes = await api.get(`/api/pets/${id}/likes`)
      const likes = unwrap(likesRes) as { likeCount: number; likedByMe: boolean }
      setState((s) => ({
        ...s,
        likeCount: likes.likeCount,
        likedByMe: likes.likedByMe,
      }))
    } catch {
      /* ignore */
    }
  }, [id])

  return { ...state, loading, error, refetch: load, refreshLikes }
}

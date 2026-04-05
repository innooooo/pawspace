import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage, unwrap } from '../api'
import type { PaginationMeta, Pet } from '../types'

export function usePets(
  species?: string,
  adoption_status?: string,
  nairobi_area?: string,
  mine = false
) {
  const [pets, setPets] = useState<Pet[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const path = mine ? '/api/pets/mine' : '/api/pets'

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      const params: Record<string, string | number> = { page }
      if (species) params.species = species
      if (adoption_status) params.adoption_status = adoption_status
      if (nairobi_area) params.nairobi_area = nairobi_area

      const res = await api.get(path, { params })
      const data = unwrap(res) as { pets: Pet[] }
      const m = res.data.meta as PaginationMeta | null
      setMeta(m)
      setPets((prev) => (append ? [...prev, ...data.pets] : data.pets))
    },
    [path, species, adoption_status, nairobi_area]
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchPage(1, false)
      .catch((e) => {
        if (!cancelled) setError(getErrorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [fetchPage])

  const loadMore = useCallback(async () => {
    if (!meta?.hasMore || loadingMore) return
    const next = meta.page + 1
    setLoadingMore(true)
    setError(null)
    try {
      await fetchPage(next, true)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoadingMore(false)
    }
  }, [meta, loadingMore, fetchPage])

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await fetchPage(1, false)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [fetchPage])

  return { pets, meta, loading, loadingMore, error, loadMore, refetch }
}

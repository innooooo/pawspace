import { useCallback, useEffect, useState } from 'react'
import api, { getErrorMessage, unwrap } from '../api'
import type { AdoptionInterest } from '../types'

type Props = {
  petId: string
}

export function InterestManager({ petId }: Props) {
  const [interests, setInterests] = useState<AdoptionInterest[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [actionErr, setActionErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await api.get(`/api/pets/${petId}/interests`)
      const data = unwrap(res) as { interests: AdoptionInterest[] }
      setInterests(data.interests)
    } catch (e) {
      setErr(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [petId])

  useEffect(() => {
    load()
  }, [load])

  const updateStatus = async (interestId: string, status: 'accepted' | 'rejected') => {
    setActionErr(null)
    try {
      await api.patch(`/api/interests/${interestId}`, { status })
      await load()
    } catch (e) {
      setActionErr(getErrorMessage(e))
    }
  }

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        <div className="h-16 bg-stone-100 rounded-xl" />
        <div className="h-16 bg-stone-100 rounded-xl" />
      </div>
    )
  }

  if (err) {
    return (
      <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
        {err}
      </p>
    )
  }

  if (!interests.length) {
    return (
      <p className="text-sm text-stone-600 dark:text-stone-100 text-center py-4 border border-dashed border-stone-200 rounded-xl">
        No interest requests yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-stone-900 dark:text-stone-200">Interest requests</h3>
      {actionErr && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {actionErr}
        </p>
      )}
      <ul className="space-y-3">
        {interests.map((it) => (
          <li
            key={it.id}
            className="border border-stone-200 rounded-xl p-4 bg-stone-50 dark:bg-gray-900 text-left space-y-2"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-semibold text-stone-900 dark:text-stone-200">{it.adopter?.name ?? 'Adopter'}</p>
              <span className="text-xs uppercase tracking-wide text-stone-500">{it.status}</span>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-100">{it.adopter?.nairobi_area}</p>
            {it.message && <p className="text-sm text-stone-700 dark:text-stone-200">&ldquo;{it.message}&rdquo;</p>}
            {it.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => updateStatus(it.id, 'accepted')}
                  className="min-h-[48px] flex-1 rounded-xl bg-emerald-600 text-white font-semibold text-sm"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => updateStatus(it.id, 'rejected')}
                  className="min-h-[48px] flex-1 rounded-xl border border-stone-300 bg-white text-stone-800 dark:text-gray-200 font-semibold text-sm"
                >
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

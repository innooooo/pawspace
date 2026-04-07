import { useState } from 'react'
import api, { getErrorMessage, unwrap } from '../api'

type Props = {
  petId: string
  onSuccess?: () => void
}

export function InterestButton({ petId, onSuccess }: Props) {
  const [message, setMessage] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    setErr(null)
    try {
      const res = await api.post(`/api/pets/${petId}/interests`, {
        message: message.trim() || null,
      })
      unwrap(res)
      setDone(true)
      onSuccess?.()
    } catch (e) {
      setErr(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <p className="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
        We’ve shared your interest with the owner. They may reach out soon.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-stone-700 dark:text-stone-200" htmlFor="interest-msg">
        Message (optional)
      </label>
      <textarea
        id="interest-msg"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="w-full rounded-xl border border-stone-300 px-4 py-3 text-base dark:text-gray-800 min-h-[48px]"
        placeholder="Introduce yourself and how you can care for this pet…"
      />
      {err && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {err}
        </p>
      )}
      <button
        type="button"
        onClick={submit}
        disabled={submitting}
        className="w-full min-h-[48px] rounded-xl bg-amber-600 text-white font-semibold text-base active:bg-amber-700 disabled:opacity-60"
      >
        {submitting ? 'Sending…' : "I'm interested"}
      </button>
    </div>
  )
}

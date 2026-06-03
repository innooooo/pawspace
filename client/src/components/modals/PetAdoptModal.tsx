import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import { useState } from 'react'
import type { Pet } from '../../types'

type Props = {
  pet: Pet
  isOpen: boolean
  onClose: () => void
  onConfirm: (payload?: { success_note?: string; success_photo_url?: string }) => Promise<{ success: boolean }>
  loading: boolean
}


export function PetAdoptModal({ pet, isOpen, onClose, onConfirm, loading }: Props) {
  const [successNote, setSuccessNote] = useState('')
  const [successPhotoUrl, setSuccessPhotoUrl] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    setError('')
    const payload: { success_note?: string; success_photo_url?: string } = {}
    
    if (successNote.trim()) {
      payload.success_note = successNote.trim()
    }
    if (successPhotoUrl.trim()) {
      payload.success_photo_url = successPhotoUrl.trim()
    }

    const result = await onConfirm(payload)
    if (!result.success) {
      setError('Failed to mark pet as adopted. Please try again.')
    } else {
      setSuccessNote('')
      setSuccessPhotoUrl('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#060b1f]/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="glass-panel w-full max-w-md overflow-hidden rounded-[32px] bg-[#0f172a]/95 p-6 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/20 text-green-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Mark as Adopted?
                    </h3>
                    <p className="text-sm text-white/58 mt-0.5">
                      Celebrate the happy ending
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white/58 transition hover:bg-white/[0.10] hover:text-white/80"
                  disabled={loading}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-white/72 leading-relaxed mb-6">
                This will show a success state on <strong className="text-white font-semibold">{pet.name}</strong>'s profile for anyone who liked or expressed interest.
              </p>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* Success Note */}
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wide text-white/58 mb-2">
                  Success Note <span className="text-white/30">(optional)</span>
                </label>
                <textarea
                  value={successNote}
                  onChange={(e) => setSuccessNote(e.target.value)}
                  maxLength={300}
                  placeholder="Share your adoption story... (e.g., 'Found a forever home with a loving family!')"
                  className="w-full rounded-2xl border-2 border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  rows={3}
                  disabled={loading}
                />
                <div className="flex justify-end mt-1.5">
                  <span className={`text-xs ${successNote.length > 280 ? 'text-red-400' : 'text-white/30'}`}>
                    {successNote.length}/300
                  </span>
                </div>
              </div>

              {/* Success Photo URL */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wide text-white/58 mb-2">
                  Success Photo URL <span className="text-white/30">(optional)</span>
                </label>
                <input
                  type="url"
                  value={successPhotoUrl}
                  onChange={(e) => setSuccessPhotoUrl(e.target.value)}
                  placeholder="https://example.com/adoption-photo.jpg"
                  className="w-full rounded-2xl border-2 border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 transition focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  disabled={loading}
                />
                <p className="text-xs text-white/30 mt-1.5">
                  Add a photo from the new home
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 rounded-2xl border-2 border-white/15 bg-white/[0.06] px-4 py-3 text-sm font-black text-white/74 transition hover:bg-white/[0.10] hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-black text-[#060b1f] transition hover:bg-green-400 disabled:opacity-50"
                >
                  {loading ? (
                    <>Processing…</>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Mark Adopted
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
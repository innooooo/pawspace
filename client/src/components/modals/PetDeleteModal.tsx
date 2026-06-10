import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { Pet } from '../../types'

type Props = {
  pet: Pet
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}


export function PetDeleteModal({ pet, isOpen, onClose, onConfirm, loading }: Props) {
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    if (confirm.trim().toLowerCase() !== pet.name.trim().toLowerCase()) {
      setError(`Please type "${pet.name}" exactly to confirm`)
      return
    }
    setError('')
    await onConfirm()
    setConfirm('')
  }

  const isConfirmed = confirm.trim().toLowerCase() === pet.name.trim().toLowerCase()
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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-red-400">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-red-400">
                      Delete Permanently?
                    </h3>
                    <p className="text-sm text-white/58 mt-0.5">
                      This cannot be undone
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

              {/* Warning */}
              <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 p-4">
                <p className="text-sm text-red-200 leading-relaxed">
                  <strong className="text-red-100">This action is irreversible.</strong> Your pet listing for <strong className="text-red-100">{pet.name}</strong> will be permanently removed and cannot be recovered.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-wide text-white/58 mb-2">
                  Type "<strong className="text-white">{pet.name}</strong>" to confirm:
                </label>
                <input
                  type="text"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value)
                    setError('')
                  }}
                  placeholder={`Type ${pet.name}`}
                  className="w-full rounded-2xl border-2 border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder-white/30 transition focus:border-red-500/50 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  disabled={loading}
                />
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
                  disabled={!isConfirmed || loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:opacity-50 disabled:bg-red-500/40"
                >
                  {loading ? (
                    <>Deleting…</>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete Permanently
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
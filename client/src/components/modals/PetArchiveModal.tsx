import { motion, AnimatePresence } from 'framer-motion'
import { Archive, X } from 'lucide-react'
import type { Pet } from '../../types'

type Props = {
  pet: Pet
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
}


export function PetArchiveModal({ pet, isOpen, onClose, onConfirm, loading }: Props) {
  const isArchived = pet.adoption_status === 'archived'

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
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                    <Archive size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">
                      {isArchived ? 'Re-activate Listing?' : 'Archive Listing?'}
                    </h3>
                    <p className="text-sm text-white/58 mt-0.5">
                      {isArchived ? 'Make it visible again' : 'Hide from browse'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-white/58 transition hover:bg-white/[0.10] hover:text-white/80"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-white/72 leading-relaxed mb-6">
                {isArchived ? (
                  <>
                    This will make <strong className="text-white font-semibold">{pet.name}</strong> visible in browse and search again. Anyone looking for pets will be able to find this listing.
                  </>
                ) : (
                  <>
                    This will hide <strong className="text-white font-semibold">{pet.name}</strong> from browse and search. You can still view it in "My Listings" and re-activate it anytime.
                  </>
                )}
              </p>

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
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-black text-[#060b1f] transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {loading ? (
                    <>Processing…</>
                  ) : isArchived ? (
                    <>
                      <Archive size={16} />
                      Re-activate
                    </>
                  ) : (
                    <>
                      <Archive size={16} />
                      Archive
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
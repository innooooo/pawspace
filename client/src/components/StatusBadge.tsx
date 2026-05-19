const styles: Record<string, string> = {
  available: 'border-emerald-300/30 bg-emerald-300/15 text-emerald-100 shadow-emerald-400/10',
  pending: 'border-amber-300/35 bg-amber-300/18 text-amber-100 shadow-amber-400/10',
  adopted: 'border-violet-300/30 bg-violet-300/15 text-violet-100 shadow-violet-400/10',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? 'border-white/15 bg-white/10 text-white/80'
  const label =
    status === 'available'
      ? 'Available now'
      : status === 'pending'
        ? 'Meeting pending'
        : status === 'adopted'
          ? 'Recently adopted'
          : status

  return (
    <span
      className={`inline-flex min-h-[30px] items-center rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.16em] shadow-lg backdrop-blur-xl ${cls}`}
    >
      {label}
    </span>
  )
}

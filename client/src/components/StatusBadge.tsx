const styles: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  pending: 'bg-amber-100 text-amber-900 border-amber-200',
  adopted: 'bg-stone-200 text-stone-700 border-stone-300',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = styles[status] ?? 'bg-stone-100 text-stone-700 dark:text-stone-200 border-stone-200'
  const label =
    status === 'available'
      ? 'Available'
      : status === 'pending'
        ? 'Pending'
        : status === 'adopted'
          ? 'Adopted'
          : status

  return (
    <span
      className={`inline-flex items-center min-h-[28px] px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {label}
    </span>
  )
}

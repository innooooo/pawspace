interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: number
}

// Generate a consistent color from a name
function nameToColor(name: string): string {
  const colors = [
    'bg-amber-500', 'bg-orange-500', 'bg-rose-500', 'bg-pink-500',
    'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-teal-500',
    'bg-green-500', 'bg-lime-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ name, avatarUrl, size = 36 }: AvatarProps) {
  const initial = name ? name.charAt(0).toUpperCase() : '?'
  const colorClass = nameToColor(name || '')
  const style = { width: size, height: size, minWidth: size, fontSize: size * 0.45 }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={style}
        className="rounded-full object-cover shrink-0"
      />
    )
  }

  return (
    <span
      style={style}
      className={`${colorClass} rounded-full flex items-center justify-center text-white font-bold shrink-0`}
    >
      {initial}
    </span>
  )
}
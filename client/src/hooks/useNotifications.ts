import { useCallback, useEffect, useRef, useState } from 'react'
import api, { unwrap, type ApiEnvelope } from '../api'
import { useAuth } from './useAuth'

export interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  entity_type: string | null
  entity_id: string | null
  read_at: string | null
  created_at: string
}

interface NotificationsResponse {
  notifications: Notification[]
  unread: number
  total: number
  page: number
  pageSize: number
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unread: number
  loading: boolean
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  refresh: () => void
}

const POLL_INTERVAL = 30_000

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { token } = useAuth()

  // api instance already attaches the Bearer token via interceptor — no manual headers needed
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get<ApiEnvelope<NotificationsResponse>>('/api/notifications', {
        params: { page: 1 },
      })
      const data = unwrap(res)
      setNotifications(data.notifications)
      setUnread(data.unread)
    } catch (err) {
      console.error('[useNotifications] fetch failed:', err)
    }
  }, [])
  const refresh = useCallback(() => {
    void fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (!token) {
      setNotifications([])
      setUnread(0)
      return
    }
    setLoading(true)
    fetchNotifications().finally(() => setLoading(false))

    intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null;
    }
  }, [token, fetchNotifications])

  const markRead = useCallback(async (id: string) => {
    try {
      await api.patch<ApiEnvelope<{ success: boolean }>>(`/api/notifications/${id}/read`)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      )
      setUnread((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('[useNotifications] markRead failed:', err)
    }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      await api.patch<ApiEnvelope<{ success: boolean }>>('/api/notifications/read-all')
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      )
      setUnread(0)
    } catch (err) {
      console.error('[useNotifications] markAllRead failed:', err)
    }
  }, [])

  
  return { notifications, unread, loading, markRead, markAllRead, refresh }
}
import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

export const TOKEN_KEY = 'pawspace_token'

export type ApiEnvelope<T> = {
  data: T | null
  error: string | null
  meta: Record<string, unknown> | null
}

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const url = String(error.config?.url ?? '')
    if (status === 401) {
      const isAuthBootstrap =
        url.includes('/api/auth/me') ||
        url.includes('/api/auth/login') ||
        url.includes('/api/auth/register')
      if (!isAuthBootstrap) {
        localStorage.removeItem(TOKEN_KEY)
        const path = window.location.pathname
        if (path !== '/login' && path !== '/register') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

/** Unwrap `{ data, error, meta }` and throw on error string */
export function unwrap<T>(res: AxiosResponse<ApiEnvelope<T>>): T {
  const body = res.data
  if (body.error) {
    throw new Error(body.error)
  }
  if (body.data === undefined || body.data === null) {
    throw new Error('Empty response')
  }
  return body.data
}

export function unwrapNullable<T>(res: AxiosResponse<ApiEnvelope<T>>): T | null {
  const body = res.data
  if (body.error) {
    throw new Error(body.error)
  }
  return body.data
}

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined
    if (data?.error && typeof data.error === 'string') return data.error
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

export default api

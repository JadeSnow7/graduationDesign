type ApiErrorPayload = { error?: string }

function getBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
  return raw.replace(/\/+$/, '')
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith('/') ? '' : '/'}${path}`
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`)

  const resp = await fetch(url, { ...options, headers })
  if (resp.ok) return (await resp.json()) as T

  let message = resp.statusText
  try {
    const payload = (await resp.json()) as ApiErrorPayload
    if (payload?.error) message = payload.error
  } catch {
    // ignore
  }
  throw new ApiError(resp.status, message)
}


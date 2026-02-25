import axios from 'axios'

// Lazy import to avoid circular dependency at module load time
let getToken: () => string | null = () => null
let doLogout: () => void = () => { }

export function initClientAuth(
  tokenGetter: () => string | null,
  logoutFn: () => void
) {
  getToken = tokenGetter
  doLogout = logoutFn
}

const client = axios.create({
  baseURL: (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      doLogout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client

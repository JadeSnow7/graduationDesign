import axios from 'axios'
import { clearAccessToken, getAccessToken } from '../auth/tokenStorage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? 'http://localhost:8080',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT ?? 10000),
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAccessToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api

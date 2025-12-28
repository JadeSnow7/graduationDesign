import { isAxiosError } from 'axios'
import api from '../../shared/api/client'
import type { ApiResponse } from '../../shared/api/types'

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponseData {
  access_token: string
  token_type: string
  expires_in: number
  user_id: string
  username: string
  role: string
}

export interface CurrentUser {
  id: string
  username: string
  name: string
  email: string
  role: string
  permissions: string[]
  created_at: string
  last_login: string
}

export const login = async (payload: LoginRequest) => {
  try {
    const { data } = await api.post<ApiResponse<LoginResponseData>>(
      '/api/v1/auth/login',
      payload,
    )

    if (!data.success || !data.data) {
      throw new Error(data.error?.message || 'Login failed')
    }

    return data.data
  } catch (error) {
    if (isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message
      throw new Error(message)
    }
    throw error
  }
}

export const getCurrentUser = async () => {
  const { data } = await api.get<ApiResponse<CurrentUser>>('/api/v1/auth/me')

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Unable to load profile')
  }

  return data.data
}

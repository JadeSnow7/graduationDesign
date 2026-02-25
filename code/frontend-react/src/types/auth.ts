export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: 'student' | 'teacher' | 'admin'
  avatar_url?: string
  created_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface AIConfigProfile {
  api_key?: string
  default_mode: 'local' | 'server' | 'auto'
  server_url?: string
  provider?: string
  custom_base_url?: string
}

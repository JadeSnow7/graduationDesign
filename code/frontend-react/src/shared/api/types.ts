export interface ApiError {
  code: string
  message: string
  details?: string
  required_permission?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
}

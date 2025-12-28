import api from '../../shared/api/client'
import type { ApiResponse } from '../../shared/api/types'

export interface LaplaceRequest {
  nx: number
  ny: number
  v_top: number
  v_bottom: number
  v_left: number
  v_right: number
  max_iterations: number
  tolerance: number
  visualization: {
    show_contour: boolean
    show_field: boolean
    colormap: string
  }
}

export interface LaplaceResponse {
  png_base64: string
  metadata: {
    iterations: number
    convergence_error: number
    computation_time: number
    grid_size: [number, number]
  }
}

export const runLaplace2d = async (payload: LaplaceRequest) => {
  const { data } = await api.post<ApiResponse<LaplaceResponse>>(
    '/api/v1/sim/laplace2d',
    payload,
  )

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'Simulation failed')
  }

  return data.data
}

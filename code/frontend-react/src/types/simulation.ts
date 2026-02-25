export interface SimulationParams {
  type: 'laplace2d' | 'fdtd' | 'waveguide'
  frequency_mhz?: number
  grid_resolution: 'coarse' | 'medium' | 'fine'
  boundary_condition: 'pml' | 'pec' | 'periodic'
  duration_ns?: number
  [key: string]: unknown
}

export interface SimResult {
  id: string
  png_base64: string
  metadata: {
    computation_time: number
    iterations?: number
    grid_size?: number[]
    peak_field_value?: number
  }
  created_at: string
}

export interface SimTask {
  id: string
  name: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  cpu_usage?: number
  gpu_usage?: number
  memory_used?: string
  estimated_seconds?: number
  result?: SimResult
  error?: string
  created_at: string
  completed_at?: string
}

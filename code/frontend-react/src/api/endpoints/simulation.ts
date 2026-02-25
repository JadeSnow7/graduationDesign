import client from '../client'
import type { SimulationParams, SimResult, SimTask } from '../../types/simulation'

export const simulationApi = {
  submit: (params: SimulationParams) =>
    client.post<SimTask>('/sim/submit', params).then((r) => r.data),

  getTask: (id: string) =>
    client.get<SimTask>(`/sim/tasks/${id}`).then((r) => r.data),

  getHistory: () =>
    client.get<SimTask[]>('/sim/history').then((r) => r.data),

  getResult: (taskId: string) =>
    client.get<SimResult>(`/sim/tasks/${taskId}/result`).then((r) => r.data),

  // Convenience: run Laplace 2D simulation
  laplace2d: (params: Omit<SimulationParams, 'type'>) =>
    client
      .post<SimResult>('/sim/laplace2d', { ...params, type: 'laplace2d' })
      .then((r) => r.data),
}

import client from '../client'
import type { LoginRequest, LoginResponse, User, AIConfigProfile } from '../../types/auth'

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<LoginResponse>('/auth/login', data).then((r) => r.data),

  me: () =>
    client.get<User>('/users/me').then((r) => r.data),

  getAIConfig: () =>
    client.get<AIConfigProfile>('/users/me/ai-config').then((r) => r.data),

  patchAIConfig: (config: Partial<AIConfigProfile>) =>
    client.patch<AIConfigProfile>('/users/me/ai-config', config).then((r) => r.data),
}

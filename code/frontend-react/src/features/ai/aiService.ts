import api from '../../shared/api/client'
import type { ApiResponse } from '../../shared/api/types'

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatReference {
  source: string
  section?: string
  confidence?: number
}

export interface ChatReply {
  reply: string
  mode: string
  references?: ChatReference[]
}

export interface ChatRequest {
  mode: string
  messages: ChatMessage[]
  context?: {
    course_id?: string
    chapter?: string
    assignment_id?: string
  }
  stream?: boolean
}

export const chatWithAi = async (payload: ChatRequest) => {
  const { data } = await api.post<ApiResponse<ChatReply>>('/api/v1/ai/chat', payload)

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || 'AI request failed')
  }

  return data.data
}

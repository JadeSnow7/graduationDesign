export type ChatMode = 'tutor' | 'tutor_rag' | 'grader' | 'polish'
export type AISource = 'local' | 'server' | 'auto'

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  source?: 'local' | 'server'
  model_name?: string
  timestamp?: string
}

export interface ChatRequest {
  mode: ChatMode
  messages: Message[]
  stream?: boolean
  course_id?: number
}

export interface ChatResponse {
  message: Message
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface SSEChunk {
  type: 'delta' | 'done' | 'error'
  content?: string
  error?: string
}

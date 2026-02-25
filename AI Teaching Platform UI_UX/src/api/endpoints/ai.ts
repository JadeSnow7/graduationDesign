import type { ChatRequest, SSEChunk } from '../../types/ai'

const BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('auth-store')
    if (!stored) return null
    const parsed = JSON.parse(stored)
    return parsed?.state?.token ?? null
  } catch {
    return null
  }
}

async function* readSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>
): AsyncGenerator<SSEChunk> {
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const raw = line.slice(6).trim()
      if (raw === '[DONE]') {
        yield { type: 'done' }
        return
      }
      try {
        const parsed = JSON.parse(raw)
        const delta = parsed?.choices?.[0]?.delta?.content
        if (delta) yield { type: 'delta', content: delta }
      } catch {
        // skip malformed SSE lines
      }
    }
  }
}

export async function* streamChat(req: ChatRequest): AsyncGenerator<string> {
  const token = getToken()
  const resp = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ...req, stream: true }),
  })

  if (!resp.ok) {
    throw new Error(`AI chat error: ${resp.status}`)
  }

  const reader = resp.body!.getReader()
  for await (const chunk of readSSE(reader)) {
    if (chunk.type === 'done') return
    if (chunk.type === 'delta' && chunk.content) {
      yield chunk.content
    }
  }
}

export async function* streamLocalChat(
  req: ChatRequest,
  localPort = 8888
): AsyncGenerator<string> {
  const resp = await fetch(`http://localhost:${localPort}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen2.5-1.5b',
      messages: req.messages,
      stream: true,
    }),
  })

  if (!resp.ok) {
    throw new Error(`Local AI error: ${resp.status}`)
  }

  const reader = resp.body!.getReader()
  for await (const chunk of readSSE(reader)) {
    if (chunk.type === 'done') return
    if (chunk.type === 'delta' && chunk.content) {
      yield chunk.content
    }
  }
}

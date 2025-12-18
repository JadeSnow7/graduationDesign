<script setup lang="ts">
import { computed, ref } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type ChatResp = { reply: string; model?: string }

const auth = useAuthStore()

const mode = ref<'tutor' | 'grader'>('tutor')
const useRag = ref(false)
const input = ref('')
const messages = ref<ChatMessage[]>([])
const loading = ref(false)
const error = ref('')

const canSend = computed(() => input.value.trim().length > 0 && !loading.value)

async function send() {
  if (!canSend.value) return
  error.value = ''
  loading.value = true
  const content = input.value.trim()
  input.value = ''
  messages.value.push({ role: 'user', content })

  try {
    const resp = await apiFetch<ChatResp>('/ai/chat', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({ mode: useRag.value ? `${mode.value}_rag` : mode.value, messages: messages.value }),
    })
    messages.value.push({ role: 'assistant', content: resp.reply })
  } catch (e: any) {
    error.value = e?.message || '请求失败'
  } finally {
    loading.value = false
  }
}

function clearChat() {
  messages.value = []
  error.value = ''
}
</script>

<template>
  <div class="card">
    <div class="row" style="align-items: center; justify-content: space-between">
      <div>
        <div style="font-weight: 700; font-size: 16px">AI 答疑</div>
        <div class="muted" style="font-size: 13px">通过后端统一鉴权与调度，可切换“讲解/批改”模式。</div>
      </div>
      <div class="row" style="align-items: center">
        <select v-model="mode" style="width: 160px">
          <option value="tutor">讲解（tutor）</option>
          <option value="grader">批改（grader）</option>
        </select>
        <label class="muted" style="display: inline-flex; align-items: center; gap: 6px; margin-left: 8px">
          <input v-model="useRag" type="checkbox" />
          知识库（GraphRAG）
        </label>
        <button class="secondary" @click="clearChat()">清空</button>
      </div>
    </div>

    <div v-if="error" class="muted" style="color: var(--danger); margin-top: 10px">{{ error }}</div>

    <div class="chat" style="margin-top: 12px">
      <div v-if="messages.length === 0" class="muted">输入一个问题开始对话，例如：什么是边界条件？为什么需要引入位势？</div>
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
        <div class="meta">{{ m.role }}</div>
        <pre>{{ m.content }}</pre>
      </div>
    </div>

    <div style="margin-top: 14px" class="row">
      <textarea v-model="input" rows="3" placeholder="输入问题…" style="flex: 1; min-width: 260px" />
      <button :disabled="!canSend" @click="send()">{{ loading ? '发送中…' : '发送' }}</button>
    </div>
  </div>
</template>

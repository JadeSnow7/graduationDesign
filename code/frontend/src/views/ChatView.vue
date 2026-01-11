<script setup lang="ts">
import { computed, ref } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
type ChatResp = { reply: string; model?: string }
type GuidedChatResp = {
  reply: string
  session_id: string
  current_step: number
  total_steps: number
  progress_percentage: number
  learning_path: Array<{ step: number; title: string; description: string; completed: boolean }>
  citations: Array<{ index: number; source: string; section?: string; text: string }>
  tool_results: Array<{ name: string; success: boolean; result?: unknown }>
}

const auth = useAuthStore()

const mode = ref<'tutor' | 'grader' | 'guided'>('tutor')
const useRag = ref(false)
const input = ref('')
const messages = ref<ChatMessage[]>([])
const loading = ref(false)
const error = ref('')

// Guided mode state
const guidedSession = ref<{
  sessionId: string | null
  currentStep: number
  totalSteps: number
  progress: number
  learningPath: Array<{ step: number; title: string; completed: boolean }>
  citations: Array<{ index: number; source: string; text: string }>
} | null>(null)

const canSend = computed(() => input.value.trim().length > 0 && !loading.value)

async function send() {
  if (!canSend.value) return
  error.value = ''
  loading.value = true
  const content = input.value.trim()
  input.value = ''
  messages.value.push({ role: 'user', content })

  try {
    if (mode.value === 'guided') {
      // Use guided learning endpoint
      const resp = await apiFetch<GuidedChatResp>('/ai/chat', {
        method: 'POST',
        token: auth.token,
        body: JSON.stringify({
          mode: 'guided',
          session_id: guidedSession.value?.sessionId || null,
          topic: messages.value.length === 1 ? content : undefined,
          messages: messages.value,
        }),
      })
      messages.value.push({ role: 'assistant', content: resp.reply })
      
      // Update guided session state
      guidedSession.value = {
        sessionId: resp.session_id,
        currentStep: resp.current_step,
        totalSteps: resp.total_steps,
        progress: resp.progress_percentage,
        learningPath: resp.learning_path?.map(s => ({
          step: s.step,
          title: s.title,
          completed: s.completed,
        })) || [],
        citations: resp.citations?.map(c => ({
          index: c.index,
          source: c.source,
          text: c.text,
        })) || [],
      }
    } else {
      // Use standard chat endpoint
      const resp = await apiFetch<ChatResp>('/ai/chat', {
        method: 'POST',
        token: auth.token,
        body: JSON.stringify({ mode: useRag.value ? `${mode.value}_rag` : mode.value, messages: messages.value }),
      })
      messages.value.push({ role: 'assistant', content: resp.reply })
    }
  } catch (e: any) {
    error.value = e?.message || '请求失败'
  } finally {
    loading.value = false
  }
}

function clearChat() {
  messages.value = []
  error.value = ''
  guidedSession.value = null
}

function onModeChange() {
  // Reset guided session when switching modes
  if (mode.value !== 'guided') {
    guidedSession.value = null
  }
}
</script>

<template>
  <div class="card">
    <div class="row" style="align-items: center; justify-content: space-between">
      <div>
        <div style="font-weight: 700; font-size: 16px">AI 答疑</div>
        <div class="muted" style="font-size: 13px">通过后端统一鉴权与调度，可切换"讲解/批改/引导学习"模式。</div>
      </div>
      <div class="row" style="align-items: center">
        <select v-model="mode" style="width: 180px" @change="onModeChange">
          <option value="tutor">讲解（tutor）</option>
          <option value="grader">批改（grader）</option>
          <option value="guided">引导学习（guided）</option>
        </select>
        <label v-if="mode !== 'guided'" class="muted" style="display: inline-flex; align-items: center; gap: 6px; margin-left: 8px">
          <input v-model="useRag" type="checkbox" />
          知识库（GraphRAG）
        </label>
        <button class="secondary" @click="clearChat()">清空</button>
      </div>
    </div>

    <!-- Guided mode progress bar -->
    <div v-if="guidedSession && mode === 'guided'" class="guided-progress" style="margin-top: 12px">
      <div class="progress-header" style="display: flex; justify-content: space-between; margin-bottom: 6px">
        <span style="font-weight: 600">学习进度</span>
        <span class="muted">步骤 {{ guidedSession.currentStep + 1 }}/{{ guidedSession.totalSteps }}</span>
      </div>
      <div class="progress-bar" style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden">
        <div 
          class="progress-fill" 
          :style="{ width: guidedSession.progress + '%', height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }"
        ></div>
      </div>
      <!-- Learning path steps -->
      <div class="learning-path" style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px">
        <span 
          v-for="step in guidedSession.learningPath" 
          :key="step.step"
          class="step-badge"
          :style="{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            background: step.completed ? 'var(--success-light, #e6f7e6)' : 'var(--bg-secondary, #f5f5f5)',
            color: step.completed ? 'var(--success, #28a745)' : 'var(--text-muted)',
            border: '1px solid ' + (step.completed ? 'var(--success, #28a745)' : 'var(--border)'),
          }"
        >
          {{ step.completed ? '✓' : step.step }}. {{ step.title }}
        </span>
      </div>
    </div>

    <div v-if="error" class="muted" style="color: var(--danger); margin-top: 10px">{{ error }}</div>

    <div class="chat" style="margin-top: 12px">
      <div v-if="messages.length === 0" class="muted">
        <template v-if="mode === 'guided'">
          输入一个学习主题开始引导式学习，例如：帮我理解电磁波在导体表面的反射
        </template>
        <template v-else>
          输入一个问题开始对话，例如：什么是边界条件？为什么需要引入位势？
        </template>
      </div>
      <div v-for="(m, i) in messages" :key="i" class="msg" :class="m.role">
        <div class="meta">{{ m.role }}</div>
        <pre>{{ m.content }}</pre>
      </div>
    </div>

    <!-- Citations panel for guided mode -->
    <div v-if="guidedSession?.citations?.length" class="citations-panel" style="margin-top: 12px; padding: 10px; background: var(--bg-secondary, #f9f9f9); border-radius: 6px">
      <details>
        <summary style="cursor: pointer; font-weight: 600; color: var(--text-secondary)">📚 引用来源 ({{ guidedSession.citations.length }})</summary>
        <div style="margin-top: 8px">
          <div v-for="c in guidedSession.citations" :key="c.index" style="margin-bottom: 8px; padding: 8px; background: white; border-radius: 4px; border-left: 3px solid var(--primary)">
            <div style="font-weight: 500">[{{ c.index }}] {{ c.source }}</div>
            <div class="muted" style="font-size: 13px; margin-top: 4px">{{ c.text }}</div>
          </div>
        </div>
      </details>
    </div>

    <div style="margin-top: 14px" class="row">
      <textarea v-model="input" rows="3" :placeholder="mode === 'guided' ? '输入你的回答或问题…' : '输入问题…'" style="flex: 1; min-width: 260px" />
      <button :disabled="!canSend" @click="send()">{{ loading ? '发送中…' : '发送' }}</button>
    </div>
  </div>
</template>

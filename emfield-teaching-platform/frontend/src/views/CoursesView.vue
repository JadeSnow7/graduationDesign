<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

type Course = {
  id: number
  name: string
  code?: string
  semester?: string
  teacher_id: number
}

const auth = useAuthStore()
const courses = ref<Course[]>([])
const loading = ref(false)
const error = ref('')

const name = ref('')
const code = ref('')
const semester = ref('')

async function loadCourses() {
  loading.value = true
  error.value = ''
  try {
    courses.value = await apiFetch<Course[]>('/courses', { token: auth.token })
  } catch (e: any) {
    error.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

async function createCourse() {
  if (!name.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    await apiFetch<Course>('/courses', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({ name: name.value, code: code.value, semester: semester.value }),
    })
    name.value = ''
    code.value = ''
    semester.value = ''
    await loadCourses()
  } catch (e: any) {
    error.value = e?.message || '创建失败'
  } finally {
    loading.value = false
  }
}

onMounted(loadCourses)
</script>

<template>
  <div class="row">
    <div class="card" style="flex: 1; min-width: 300px">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px">课程列表</div>
      <div v-if="loading" class="muted">加载中…</div>
      <div v-if="error" class="muted" style="color: var(--danger)">{{ error }}</div>
      <div v-if="!loading && courses.length === 0" class="muted">暂无课程</div>
      <div v-for="c in courses" :key="c.id" class="msg assistant" style="margin-top: 10px">
        <div class="meta">#{{ c.id }} · teacher_id={{ c.teacher_id }}</div>
        <div style="font-weight: 700">{{ c.name }}</div>
        <div class="muted" style="font-size: 13px">{{ c.code || '-' }} · {{ c.semester || '-' }}</div>
      </div>
    </div>

    <div class="card" style="flex: 1; min-width: 300px">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px">创建课程</div>
      <div class="muted" style="font-size: 13px; margin-bottom: 10px">
        仅教师/管理员具备创建权限。
      </div>

      <div class="row">
        <div style="flex: 1; min-width: 220px">
          <label class="muted" style="font-size: 12px">课程名</label>
          <input v-model="name" placeholder="电磁场" />
        </div>
        <div style="flex: 1; min-width: 220px">
          <label class="muted" style="font-size: 12px">课程号</label>
          <input v-model="code" placeholder="EMF101" />
        </div>
      </div>

      <div style="margin-top: 10px">
        <label class="muted" style="font-size: 12px">学期</label>
        <input v-model="semester" placeholder="2025-2026-1" />
      </div>

      <div style="margin-top: 12px" class="row">
        <button :disabled="loading" @click="createCourse()">创建</button>
        <button class="secondary" :disabled="loading" @click="loadCourses()">刷新</button>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { RouterView } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="container">
    <header class="row" style="align-items: center; justify-content: space-between; margin-bottom: 10px">
      <div>
        <div style="font-weight: 700; font-size: 18px">电磁场智能教学平台</div>
        <div class="muted" style="font-size: 12px">企业微信 H5 · Gin · Qwen · 仿真</div>
      </div>
      <div v-if="auth.me" class="row" style="align-items: center">
        <span class="pill">{{ auth.me.name || auth.me.username }} · {{ auth.me.role }}</span>
        <button class="secondary" @click="auth.logout()">退出</button>
      </div>
    </header>

    <nav v-if="auth.token" class="nav">
      <RouterLink to="/">概览</RouterLink>
      <RouterLink to="/courses">课程</RouterLink>
      <RouterLink to="/chat">AI 答疑</RouterLink>
      <RouterLink to="/sim">仿真</RouterLink>
    </nav>

    <main style="margin-top: 12px">
      <RouterView />
    </main>
  </div>
</template>

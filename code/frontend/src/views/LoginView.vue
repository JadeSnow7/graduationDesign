<script setup lang="ts">
import { ref } from 'vue'

import { redirectToWecomAuth } from '@/api/wecom'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const username = ref('admin')
const password = ref('admin123')

const wecomLoading = ref(false)

async function loginWecom() {
  wecomLoading.value = true
  auth.error = ''
  try {
    await redirectToWecomAuth()
  } catch (e: any) {
    auth.error = e?.message || '企业微信授权失败'
  } finally {
    wecomLoading.value = false
  }
}
</script>

<template>
  <div class="card">
    <div style="font-weight: 700; font-size: 16px; margin-bottom: 6px">登录</div>
    <div class="muted" style="font-size: 13px; margin-bottom: 14px">
      原型默认已在数据库初始化三类演示账号，可直接登录体验。
    </div>

    <div v-if="auth.isWecom" style="margin-bottom: 14px">
      <div class="muted" style="font-size: 13px; margin-bottom: 8px">检测到企业微信环境，可使用 OAuth 授权登录。</div>
      <button class="secondary" :disabled="auth.loading || wecomLoading" @click="loginWecom()">
        {{ wecomLoading ? '跳转中…' : '企业微信授权登录' }}
      </button>
      <div class="muted" style="font-size: 12px; margin-top: 8px">
        若提示未配置，请在 `deploy/.env` 配置 `WECOM_*` 并重启后端。
      </div>
      <div class="muted" style="font-size: 12px; margin-top: 6px">也可继续使用账号密码登录。</div>
    </div>

    <div class="row">
      <div style="flex: 1; min-width: 220px">
        <label class="muted" style="font-size: 12px">用户名</label>
        <input v-model="username" placeholder="admin / teacher / student" />
      </div>
      <div style="flex: 1; min-width: 220px">
        <label class="muted" style="font-size: 12px">密码</label>
        <input v-model="password" type="password" placeholder="admin123 / teacher123 / student123" />
      </div>
    </div>

    <div style="margin-top: 12px" class="row">
      <button :disabled="auth.loading" @click="auth.login(username, password)">登录</button>
      <span v-if="auth.error" class="muted" style="color: var(--danger)">{{ auth.error }}</span>
    </div>
  </div>
</template>

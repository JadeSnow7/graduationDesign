<script setup lang="ts">
import { onMounted } from 'vue'

import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

onMounted(async () => {
  if (auth.token && !auth.me) await auth.loadMe()
})
</script>

<template>
  <div class="row">
    <div class="card" style="flex: 1; min-width: 280px">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px">当前用户</div>
      <div v-if="auth.me">
        <div class="pill" style="margin-bottom: 10px">
          {{ auth.me.name || auth.me.username }} · {{ auth.me.role }}
        </div>
        <div class="muted" style="font-size: 13px">可切换账号体验不同权限：教师可创建课程。</div>
      </div>
    </div>

    <div class="card" style="flex: 1; min-width: 280px">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px">演示建议</div>
      <ul class="muted" style="margin: 0; padding-left: 18px; font-size: 13px">
        <li>进入“AI 答疑”提问：边界条件、位势与场强、麦克斯韦方程等。</li>
        <li>进入“仿真”运行 Laplace 例子，观察边界电位对场分布的影响。</li>
        <li>若 AI 返回“未配置上游模型”，在 `deploy/.env` 配置 `LLM_*` 后重启。</li>
      </ul>
    </div>
  </div>
</template>


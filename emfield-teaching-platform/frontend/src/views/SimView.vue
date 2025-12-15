<script setup lang="ts">
import { ref } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

type SimResp = {
  png_base64: string
  min_v: number
  max_v: number
  iter: number
}

const auth = useAuthStore()

const nx = ref(60)
const ny = ref(40)
const vTop = ref(1)
const vBottom = ref(0)
const vLeft = ref(0)
const vRight = ref(0)

const img = ref<string>('')
const meta = ref<string>('')
const loading = ref(false)
const error = ref('')

async function run() {
  loading.value = true
  error.value = ''
  img.value = ''
  meta.value = ''
  try {
    const resp = await apiFetch<SimResp>('/sim/laplace2d', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        nx: nx.value,
        ny: ny.value,
        v_top: vTop.value,
        v_bottom: vBottom.value,
        v_left: vLeft.value,
        v_right: vRight.value,
      }),
    })
    img.value = `data:image/png;base64,${resp.png_base64}`
    meta.value = `iter=${resp.iter} · minV=${resp.min_v.toFixed(4)} · maxV=${resp.max_v.toFixed(4)}`
  } catch (e: any) {
    error.value = e?.message || '运行失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row">
    <div class="card" style="flex: 1; min-width: 300px">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px">Laplace 2D（演示）</div>
      <div class="muted" style="font-size: 13px; margin-bottom: 10px">
        该例子用于演示“参数化仿真 → 可视化 → AI 解读”的闭环。
      </div>

      <div class="row">
        <div style="flex: 1; min-width: 140px">
          <label class="muted" style="font-size: 12px">nx</label>
          <input v-model.number="nx" type="number" min="10" max="200" />
        </div>
        <div style="flex: 1; min-width: 140px">
          <label class="muted" style="font-size: 12px">ny</label>
          <input v-model.number="ny" type="number" min="10" max="200" />
        </div>
      </div>

      <div class="row" style="margin-top: 10px">
        <div style="flex: 1; min-width: 140px">
          <label class="muted" style="font-size: 12px">V_top</label>
          <input v-model.number="vTop" type="number" step="0.1" />
        </div>
        <div style="flex: 1; min-width: 140px">
          <label class="muted" style="font-size: 12px">V_bottom</label>
          <input v-model.number="vBottom" type="number" step="0.1" />
        </div>
      </div>

      <div class="row" style="margin-top: 10px">
        <div style="flex: 1; min-width: 140px">
          <label class="muted" style="font-size: 12px">V_left</label>
          <input v-model.number="vLeft" type="number" step="0.1" />
        </div>
        <div style="flex: 1; min-width: 140px">
          <label class="muted" style="font-size: 12px">V_right</label>
          <input v-model.number="vRight" type="number" step="0.1" />
        </div>
      </div>

      <div style="margin-top: 12px" class="row">
        <button :disabled="loading" @click="run()">{{ loading ? '运行中…' : '运行仿真' }}</button>
      </div>

      <div v-if="error" class="muted" style="color: var(--danger); margin-top: 10px">{{ error }}</div>
      <div v-if="meta" class="muted" style="margin-top: 10px">{{ meta }}</div>
    </div>

    <div class="card" style="flex: 1; min-width: 300px">
      <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px">结果</div>
      <div v-if="!img" class="muted">暂无结果，点击“运行仿真”。</div>
      <img v-if="img" :src="img" alt="sim result" style="width: 100%; border-radius: 12px" />
    </div>
  </div>
</template>


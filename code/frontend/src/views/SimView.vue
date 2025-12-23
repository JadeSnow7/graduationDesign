
<script setup lang="ts">
import { ref } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

// Import simulation components
import ElectrostaticsSim from '@/components/sim/ElectrostaticsSim.vue'
import MagnetostaticsSim from '@/components/sim/MagnetostaticsSim.vue'
import WaveSim from '@/components/sim/WaveSim.vue'
import NumericalCalc from '@/components/sim/NumericalCalc.vue'

type SimResp = {
  png_base64: string
  min_v: number
  max_v: number
  iter: number
}

const auth = useAuthStore()

// Main tab state
const activeMainTab = ref<'electrostatics' | 'magnetics' | 'wave' | 'numerical' | 'laplace'>('electrostatics')

// Legacy Laplace state
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

async function runLaplace() {
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

const tabs = [
  { id: 'electrostatics', label: '⚡ 静电场', icon: '⚡' },
  { id: 'magnetics', label: '🧲 静磁场', icon: '🧲' },
  { id: 'wave', label: '🌊 电磁波', icon: '🌊' },
  { id: 'numerical', label: '🔢 数值计算', icon: '🔢' },
  { id: 'laplace', label: '📐 Laplace', icon: '📐' },
] as const
</script>

<template>
  <div class="sim-container">
    <!-- Main Tab Navigation -->
    <div class="main-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['main-tab', { active: activeMainTab === tab.id }]"
        @click="activeMainTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label.split(' ')[1] }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <div v-if="activeMainTab === 'electrostatics'" class="card">
        <ElectrostaticsSim />
      </div>

      <div v-else-if="activeMainTab === 'magnetics'" class="card">
        <MagnetostaticsSim />
      </div>

      <div v-else-if="activeMainTab === 'wave'" class="card">
        <WaveSim />
      </div>

      <div v-else-if="activeMainTab === 'numerical'" class="card">
        <NumericalCalc />
      </div>

      <div v-else-if="activeMainTab === 'laplace'" class="row">
        <div class="card" style="flex: 1; min-width: 300px">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px">Laplace 2D（边值问题）</div>
          <div class="muted" style="font-size: 13px; margin-bottom: 10px">
            求解矩形区域上的 Laplace 方程 ∇²V = 0，使用 Jacobi 迭代法。
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
            <button :disabled="loading" @click="runLaplace()">{{ loading ? '运行中…' : '运行仿真' }}</button>
          </div>

          <div v-if="error" class="muted" style="color: var(--danger); margin-top: 10px">{{ error }}</div>
          <div v-if="meta" class="muted" style="margin-top: 10px">{{ meta }}</div>
        </div>

        <div class="card" style="flex: 1; min-width: 300px">
          <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px">结果</div>
          <div v-if="!img" class="muted">暂无结果，点击"运行仿真"。</div>
          <img v-if="img" :src="img" alt="sim result" style="width: 100%; border-radius: 12px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow-x: auto;
}

.main-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-size: 14px;
}

.main-tab:hover {
  background: rgba(255, 255, 255, 0.05);
}

.main-tab.active {
  background: rgba(79, 140, 255, 0.15);
  border-color: rgba(79, 140, 255, 0.3);
  color: var(--text);
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-weight: 500;
}

.tab-content {
  min-height: 400px;
}

@media (max-width: 600px) {
  .main-tab {
    padding: 8px 12px;
    font-size: 13px;
  }

  .tab-label {
    display: none;
  }

  .tab-icon {
    font-size: 20px;
  }
}
</style>

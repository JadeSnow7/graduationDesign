<script setup lang="ts">
import { ref, computed } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

// Types
interface Charge {
  x: number
  y: number
  q: number
}

interface PointChargesResp {
  png_base64: string
  v_min: number
  v_max: number
  e_max: number
}

interface GaussFluxResp {
  calculated_flux: number
  enclosed_charge: number
  theoretical_flux: number
  relative_error: number
  gauss_law_verified: boolean
}

const auth = useAuthStore()

// State
const charges = ref<Charge[]>([
  { x: 0.3, y: 0, q: 1e-9 },
  { x: -0.3, y: 0, q: -1e-9 },
])
const gridSize = ref(50)
const showPotential = ref(true)
const showFieldLines = ref(true)

const gaussCenterX = ref(0)
const gaussCenterY = ref(0)
const gaussRadius = ref(0.5)

const img = ref('')
const meta = ref('')
const gaussResult = ref<GaussFluxResp | null>(null)
const loading = ref(false)
const error = ref('')
const activeTab = ref<'field' | 'gauss'>('field')

// Computed
const chargesSummary = computed(() => {
  return charges.value.map((c, i) => 
    `Q${i + 1}: (${c.x}, ${c.y}), ${(c.q * 1e9).toFixed(2)} nC`
  ).join(' | ')
})

// Methods
function addCharge() {
  charges.value.push({ x: 0, y: 0, q: 1e-9 })
}

function removeCharge(index: number) {
  if (charges.value.length > 1) {
    charges.value.splice(index, 1)
  }
}

async function runFieldSimulation() {
  loading.value = true
  error.value = ''
  img.value = ''
  meta.value = ''
  try {
    const resp = await apiFetch<PointChargesResp>('/sim/point_charges', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        charges: charges.value,
        grid_size: gridSize.value,
        show_potential: showPotential.value,
        show_field_lines: showFieldLines.value,
      }),
    })
    img.value = `data:image/png;base64,${resp.png_base64}`
    meta.value = `V: [${resp.v_min.toExponential(2)}, ${resp.v_max.toExponential(2)}] | E_max: ${resp.e_max.toExponential(2)} V/m`
  } catch (e: any) {
    error.value = e?.message || '运行失败'
  } finally {
    loading.value = false
  }
}

async function runGaussVerification() {
  loading.value = true
  error.value = ''
  gaussResult.value = null
  try {
    const resp = await apiFetch<GaussFluxResp>('/sim/gauss_flux', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        charges: charges.value,
        center_x: gaussCenterX.value,
        center_y: gaussCenterY.value,
        radius: gaussRadius.value,
      }),
    })
    gaussResult.value = resp
  } catch (e: any) {
    error.value = e?.message || '验证失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="sim-panel">
    <div class="sim-header">
      <h3>⚡ 静电场仿真</h3>
      <div class="tab-bar">
        <button 
          :class="{ active: activeTab === 'field' }" 
          @click="activeTab = 'field'"
        >
          电场分布
        </button>
        <button 
          :class="{ active: activeTab === 'gauss' }" 
          @click="activeTab = 'gauss'"
        >
          高斯定理
        </button>
      </div>
    </div>

    <!-- Charges Editor -->
    <div class="section">
      <div class="section-title">点电荷配置</div>
      <div class="charges-list">
        <div v-for="(charge, index) in charges" :key="index" class="charge-item">
          <div class="charge-inputs">
            <div class="input-group">
              <label>x (m)</label>
              <input v-model.number="charge.x" type="number" step="0.1" />
            </div>
            <div class="input-group">
              <label>y (m)</label>
              <input v-model.number="charge.y" type="number" step="0.1" />
            </div>
            <div class="input-group">
              <label>q (nC)</label>
              <input 
                :value="charge.q * 1e9" 
                @input="charge.q = parseFloat(($event.target as HTMLInputElement).value) * 1e-9"
                type="number" 
                step="0.1" 
              />
            </div>
            <button 
              class="btn-icon danger" 
              @click="removeCharge(index)"
              :disabled="charges.length <= 1"
            >
              ✕
            </button>
          </div>
        </div>
        <button class="btn-add" @click="addCharge">+ 添加电荷</button>
      </div>
    </div>

    <!-- Field Tab -->
    <div v-if="activeTab === 'field'" class="section">
      <div class="section-title">显示选项</div>
      <div class="row">
        <div class="input-group">
          <label>网格大小</label>
          <input v-model.number="gridSize" type="number" min="20" max="100" />
        </div>
        <label class="checkbox">
          <input type="checkbox" v-model="showPotential" />
          显示电势
        </label>
        <label class="checkbox">
          <input type="checkbox" v-model="showFieldLines" />
          显示场线
        </label>
      </div>
      <button :disabled="loading" @click="runFieldSimulation" class="btn-primary">
        {{ loading ? '计算中…' : '运行仿真' }}
      </button>
    </div>

    <!-- Gauss Tab -->
    <div v-if="activeTab === 'gauss'" class="section">
      <div class="section-title">高斯面设置</div>
      <div class="row">
        <div class="input-group">
          <label>圆心 x</label>
          <input v-model.number="gaussCenterX" type="number" step="0.1" />
        </div>
        <div class="input-group">
          <label>圆心 y</label>
          <input v-model.number="gaussCenterY" type="number" step="0.1" />
        </div>
        <div class="input-group">
          <label>半径 (m)</label>
          <input v-model.number="gaussRadius" type="number" step="0.1" min="0.1" />
        </div>
      </div>
      <button :disabled="loading" @click="runGaussVerification" class="btn-primary">
        {{ loading ? '验证中…' : '验证高斯定理' }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- Results -->
    <div class="results-section">
      <div v-if="activeTab === 'field' && img" class="result-card">
        <div class="result-title">电场分布图</div>
        <img :src="img" alt="电场分布" class="result-img" />
        <div class="result-meta">{{ meta }}</div>
      </div>

      <div v-if="activeTab === 'gauss' && gaussResult" class="result-card">
        <div class="result-title">高斯定理验证结果</div>
        <div class="gauss-results">
          <div class="gauss-item">
            <span class="label">计算通量</span>
            <span class="value">{{ gaussResult.calculated_flux.toExponential(4) }} V·m</span>
          </div>
          <div class="gauss-item">
            <span class="label">理论通量 (Q/ε₀)</span>
            <span class="value">{{ gaussResult.theoretical_flux.toExponential(4) }} V·m</span>
          </div>
          <div class="gauss-item">
            <span class="label">包围电荷</span>
            <span class="value">{{ (gaussResult.enclosed_charge * 1e9).toFixed(4) }} nC</span>
          </div>
          <div class="gauss-item">
            <span class="label">相对误差</span>
            <span class="value">{{ (gaussResult.relative_error * 100).toExponential(2) }}%</span>
          </div>
          <div class="gauss-item verification">
            <span class="label">验证结果</span>
            <span :class="['badge', gaussResult.gauss_law_verified ? 'success' : 'fail']">
              {{ gaussResult.gauss_law_verified ? '✓ 通过' : '✗ 未通过' }}
            </span>
          </div>
        </div>
        <div class="formula-note">
          高斯定理: ∮ <b>E</b>·d<b>A</b> = Q<sub>enc</sub> / ε₀
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sim-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sim-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.sim-header h3 {
  margin: 0;
  font-size: 18px;
}

.tab-bar {
  display: flex;
  gap: 8px;
}

.tab-bar button {
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
}

.tab-bar button.active {
  background: rgba(79, 140, 255, 0.2);
  border-color: rgba(79, 140, 255, 0.4);
  color: var(--text);
}

.section {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  padding: 14px;
}

.section-title {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 10px;
  font-weight: 500;
}

.charges-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.charge-item {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px;
}

.charge-inputs {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 80px;
}

.input-group label {
  font-size: 11px;
  color: var(--muted);
}

.input-group input {
  padding: 8px 10px;
  font-size: 14px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 14px;
}

.btn-icon.danger {
  background: rgba(255, 91, 110, 0.2);
  color: var(--danger);
}

.btn-add {
  padding: 8px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: var(--muted);
  cursor: pointer;
  border-radius: 8px;
}

.row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-bottom: 12px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
}

.checkbox input {
  width: auto;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: 500;
}

.error-msg {
  color: var(--danger);
  font-size: 13px;
  padding: 10px;
  background: rgba(255, 91, 110, 0.1);
  border-radius: 8px;
}

.results-section {
  margin-top: 8px;
}

.result-card {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 12px;
  padding: 16px;
}

.result-title {
  font-weight: 600;
  margin-bottom: 12px;
}

.result-img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 10px;
}

.result-meta {
  font-size: 12px;
  color: var(--muted);
}

.gauss-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gauss-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
}

.gauss-item .label {
  color: var(--muted);
  font-size: 13px;
}

.gauss-item .value {
  font-family: monospace;
  font-size: 13px;
}

.gauss-item.verification {
  margin-top: 6px;
  background: transparent;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge.success {
  background: rgba(76, 175, 80, 0.2);
  color: #81c784;
}

.badge.fail {
  background: rgba(255, 91, 110, 0.2);
  color: var(--danger);
}

.formula-note {
  margin-top: 14px;
  padding: 10px;
  background: rgba(79, 140, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  text-align: center;
  color: var(--muted);
}
</style>

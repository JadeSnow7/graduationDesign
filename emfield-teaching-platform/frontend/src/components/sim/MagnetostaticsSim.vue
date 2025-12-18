<script setup lang="ts">
import { ref } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

// Types
interface Wire {
  x: number
  y: number
  current: number
}

interface WireFieldResp {
  png_base64: string
  b_max: number
}

interface SolenoidResp {
  n_turns: number
  length: number
  radius: number
  current: number
  turns_per_meter: number
  B_inside: number
  B_outside: number
  B_inside_mT: number
  formula: string
}

interface AmpereLoopResp {
  line_integral: number
  enclosed_current: number
  theoretical_value: number
  relative_error: number
  ampere_law_verified: boolean
}

const auth = useAuthStore()

// State
const wires = ref<Wire[]>([
  { x: 0.02, y: 0, current: 1.0 },
  { x: -0.02, y: 0, current: -1.0 },
])
const gridSize = ref(50)
const viewRange = ref(0.1)

// Solenoid params
const solenoidTurns = ref(100)
const solenoidLength = ref(0.1)
const solenoidRadius = ref(0.02)
const solenoidCurrent = ref(1.0)

const img = ref('')
const meta = ref('')
const solenoidResult = ref<SolenoidResp | null>(null)
const ampereResult = ref<AmpereLoopResp | null>(null)
const loading = ref(false)
const error = ref('')
const activeTab = ref<'wire' | 'solenoid'>('wire')

// Methods
function addWire() {
  wires.value.push({ x: 0, y: 0, current: 1.0 })
}

function removeWire(index: number) {
  if (wires.value.length > 1) {
    wires.value.splice(index, 1)
  }
}

async function runWireSimulation() {
  loading.value = true
  error.value = ''
  img.value = ''
  meta.value = ''
  ampereResult.value = null
  try {
    const range = viewRange.value
    const resp = await apiFetch<WireFieldResp>('/sim/wire_field', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        wires: wires.value,
        x_min: -range,
        x_max: range,
        y_min: -range,
        y_max: range,
        grid_size: gridSize.value,
      }),
    })
    img.value = `data:image/png;base64,${resp.png_base64}`
    meta.value = `B_max = ${resp.b_max.toExponential(3)} T`

    // Also verify Ampere's law
    const ampereResp = await apiFetch<AmpereLoopResp>('/sim/ampere_loop', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        wires: wires.value,
        center_x: 0,
        center_y: 0,
        radius: range * 0.8,
      }),
    })
    ampereResult.value = ampereResp
  } catch (e: any) {
    error.value = e?.message || '运行失败'
  } finally {
    loading.value = false
  }
}

async function runSolenoidCalculation() {
  loading.value = true
  error.value = ''
  solenoidResult.value = null
  try {
    const resp = await apiFetch<SolenoidResp>('/sim/solenoid', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        n_turns: solenoidTurns.value,
        length: solenoidLength.value,
        radius: solenoidRadius.value,
        current: solenoidCurrent.value,
      }),
    })
    solenoidResult.value = resp
  } catch (e: any) {
    error.value = e?.message || '计算失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="sim-panel">
    <div class="sim-header">
      <h3>🧲 静磁场仿真</h3>
      <div class="tab-bar">
        <button 
          :class="{ active: activeTab === 'wire' }" 
          @click="activeTab = 'wire'"
        >
          载流导线
        </button>
        <button 
          :class="{ active: activeTab === 'solenoid' }" 
          @click="activeTab = 'solenoid'"
        >
          螺线管
        </button>
      </div>
    </div>

    <!-- Wire Tab -->
    <div v-if="activeTab === 'wire'">
      <div class="section">
        <div class="section-title">导线配置 (⊙ 出页面, ⊗ 入页面)</div>
        <div class="wires-list">
          <div v-for="(wire, index) in wires" :key="index" class="wire-item">
            <div class="wire-inputs">
              <div class="input-group">
                <label>x (m)</label>
                <input v-model.number="wire.x" type="number" step="0.01" />
              </div>
              <div class="input-group">
                <label>y (m)</label>
                <input v-model.number="wire.y" type="number" step="0.01" />
              </div>
              <div class="input-group">
                <label>I (A)</label>
                <input v-model.number="wire.current" type="number" step="0.1" />
              </div>
              <button 
                class="btn-icon danger" 
                @click="removeWire(index)"
                :disabled="wires.length <= 1"
              >
                ✕
              </button>
            </div>
          </div>
          <button class="btn-add" @click="addWire">+ 添加导线</button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">显示选项</div>
        <div class="row">
          <div class="input-group">
            <label>视野范围 (m)</label>
            <input v-model.number="viewRange" type="number" step="0.01" min="0.01" />
          </div>
          <div class="input-group">
            <label>网格大小</label>
            <input v-model.number="gridSize" type="number" min="20" max="100" />
          </div>
        </div>
        <button :disabled="loading" @click="runWireSimulation" class="btn-primary">
          {{ loading ? '计算中…' : '运行仿真' }}
        </button>
      </div>
    </div>

    <!-- Solenoid Tab -->
    <div v-if="activeTab === 'solenoid'" class="section">
      <div class="section-title">螺线管参数</div>
      <div class="row">
        <div class="input-group">
          <label>匝数 N</label>
          <input v-model.number="solenoidTurns" type="number" min="10" />
        </div>
        <div class="input-group">
          <label>长度 (m)</label>
          <input v-model.number="solenoidLength" type="number" step="0.01" min="0.01" />
        </div>
      </div>
      <div class="row">
        <div class="input-group">
          <label>半径 (m)</label>
          <input v-model.number="solenoidRadius" type="number" step="0.01" min="0.001" />
        </div>
        <div class="input-group">
          <label>电流 (A)</label>
          <input v-model.number="solenoidCurrent" type="number" step="0.1" />
        </div>
      </div>
      <button :disabled="loading" @click="runSolenoidCalculation" class="btn-primary">
        {{ loading ? '计算中…' : '计算磁场' }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- Results -->
    <div class="results-section">
      <!-- Wire field result -->
      <div v-if="activeTab === 'wire' && img" class="result-card">
        <div class="result-title">磁场分布 (Biot-Savart)</div>
        <img :src="img" alt="磁场分布" class="result-img" />
        <div class="result-meta">{{ meta }}</div>
        
        <div v-if="ampereResult" class="ampere-results">
          <div class="result-subtitle">安培环路定律验证</div>
          <div class="result-row">
            <span>∮B·dl = {{ ampereResult.line_integral.toExponential(4) }} T·m</span>
            <span>μ₀I = {{ ampereResult.theoretical_value.toExponential(4) }} T·m</span>
          </div>
          <div class="result-row">
            <span class="muted">包围电流: {{ ampereResult.enclosed_current.toFixed(2) }} A</span>
            <span :class="['badge', ampereResult.ampere_law_verified ? 'success' : 'fail']">
              {{ ampereResult.ampere_law_verified ? '✓ 通过' : '✗ 未通过' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Solenoid result -->
      <div v-if="activeTab === 'solenoid' && solenoidResult" class="result-card">
        <div class="result-title">螺线管磁场计算结果</div>
        <div class="solenoid-results">
          <div class="result-item highlight">
            <span class="label">内部磁场 B</span>
            <span class="value large">{{ solenoidResult.B_inside_mT.toFixed(4) }} mT</span>
          </div>
          <div class="result-item">
            <span class="label">匝密度 n</span>
            <span class="value">{{ solenoidResult.turns_per_meter.toFixed(1) }} 匝/m</span>
          </div>
          <div class="result-item">
            <span class="label">外部磁场</span>
            <span class="value">≈ 0 (理想情况)</span>
          </div>
        </div>
        <div class="formula-note">
          {{ solenoidResult.formula }} = (4π×10⁻⁷) × {{ solenoidResult.turns_per_meter.toFixed(0) }} × {{ solenoidResult.current }} = {{ solenoidResult.B_inside.toExponential(4) }} T
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
  margin-bottom: 12px;
}

.section-title {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 10px;
  font-weight: 500;
}

.wires-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.wire-item {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  padding: 10px;
}

.wire-inputs {
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

.result-subtitle {
  font-size: 13px;
  color: var(--muted);
  margin-top: 14px;
  margin-bottom: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
}

.solenoid-results {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 6px;
}

.result-item.highlight {
  background: rgba(79, 140, 255, 0.15);
  border: 1px solid rgba(79, 140, 255, 0.3);
}

.result-item .label {
  color: var(--muted);
  font-size: 13px;
}

.result-item .value {
  font-family: monospace;
  font-size: 13px;
}

.result-item .value.large {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary);
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
  font-size: 12px;
  text-align: center;
  color: var(--muted);
  font-family: monospace;
}

.muted {
  color: var(--muted);
}

.ampere-results {
  margin-top: 12px;
}
</style>

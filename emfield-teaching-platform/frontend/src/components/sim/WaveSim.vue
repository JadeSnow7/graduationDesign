<script setup lang="ts">
import { ref } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

// Types
interface Wave1DResp {
  png_base64: string
  n_time_steps: number
  dx: number
  dt: number
}

interface FresnelResp {
  theta_i: number
  theta_t: number | null
  total_internal_reflection: boolean
  r: number
  t: number
  R: number
  T: number
  n1: number
  n2: number
  polarization: string
  conservation_check: number
  critical_angle: number | null
}

const auth = useAuthStore()

// Wave simulation state
const waveLength = ref(1.0)
const waveNx = ref(200)
const totalTime = ref(10e-9)
const sourceType = ref<'gaussian' | 'sinusoidal' | 'step'>('gaussian')
const sourcePosition = ref(0.2)
const sourceFrequency = ref(1e9)
const boundaryCondition = ref<'absorbing' | 'reflecting' | 'periodic'>('absorbing')
const outputType = ref<'spacetime' | 'snapshot'>('spacetime')

// Fresnel state
const n1 = ref(1.0)
const n2 = ref(1.5)
const thetaI = ref(30)
const polarization = ref<'s' | 'p'>('s')

const img = ref('')
const waveMeta = ref('')
const fresnelResult = ref<FresnelResp | null>(null)
const loading = ref(false)
const error = ref('')
const activeTab = ref<'wave' | 'fresnel'>('wave')

// Methods
async function runWaveSimulation() {
  loading.value = true
  error.value = ''
  img.value = ''
  waveMeta.value = ''
  try {
    const resp = await apiFetch<Wave1DResp>('/sim/wave_1d', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        length: waveLength.value,
        nx: waveNx.value,
        total_time: totalTime.value,
        source_type: sourceType.value,
        source_position: sourcePosition.value,
        source_frequency: sourceFrequency.value,
        boundary_condition: boundaryCondition.value,
        output_type: outputType.value,
      }),
    })
    img.value = `data:image/png;base64,${resp.png_base64}`
    waveMeta.value = `时间步数: ${resp.n_time_steps} | Δx=${(resp.dx * 100).toFixed(3)}cm | Δt=${(resp.dt * 1e12).toFixed(2)}ps`
  } catch (e: any) {
    error.value = e?.message || '仿真失败'
  } finally {
    loading.value = false
  }
}

async function runFresnelCalculation() {
  loading.value = true
  error.value = ''
  fresnelResult.value = null
  try {
    const resp = await apiFetch<FresnelResp>('/sim/fresnel', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        n1: n1.value,
        n2: n2.value,
        theta_i: thetaI.value,
        polarization: polarization.value,
      }),
    })
    fresnelResult.value = resp
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
      <h3>🌊 电磁波仿真</h3>
      <div class="tab-bar">
        <button 
          :class="{ active: activeTab === 'wave' }" 
          @click="activeTab = 'wave'"
        >
          波动方程
        </button>
        <button 
          :class="{ active: activeTab === 'fresnel' }" 
          @click="activeTab = 'fresnel'"
        >
          菲涅尔系数
        </button>
      </div>
    </div>

    <!-- Wave Tab -->
    <div v-if="activeTab === 'wave'">
      <div class="section">
        <div class="section-title">波源设置</div>
        <div class="row">
          <div class="input-group">
            <label>波源类型</label>
            <select v-model="sourceType">
              <option value="gaussian">高斯脉冲</option>
              <option value="sinusoidal">正弦波</option>
              <option value="step">阶跃</option>
            </select>
          </div>
          <div class="input-group">
            <label>位置 (0-1)</label>
            <input v-model.number="sourcePosition" type="number" step="0.1" min="0" max="1" />
          </div>
          <div class="input-group" v-if="sourceType === 'sinusoidal'">
            <label>频率 (GHz)</label>
            <input 
              :value="sourceFrequency / 1e9" 
              @input="sourceFrequency = parseFloat(($event.target as HTMLInputElement).value) * 1e9"
              type="number" 
              step="0.1" 
            />
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">仿真参数</div>
        <div class="row">
          <div class="input-group">
            <label>空间长度 (m)</label>
            <input v-model.number="waveLength" type="number" step="0.1" min="0.1" />
          </div>
          <div class="input-group">
            <label>网格点数</label>
            <input v-model.number="waveNx" type="number" min="50" max="500" />
          </div>
        </div>
        <div class="row">
          <div class="input-group">
            <label>仿真时间 (ns)</label>
            <input 
              :value="totalTime * 1e9" 
              @input="totalTime = parseFloat(($event.target as HTMLInputElement).value) * 1e-9"
              type="number" 
              step="1" 
              min="1" 
            />
          </div>
          <div class="input-group">
            <label>边界条件</label>
            <select v-model="boundaryCondition">
              <option value="absorbing">吸收边界</option>
              <option value="reflecting">反射边界</option>
              <option value="periodic">周期边界</option>
            </select>
          </div>
        </div>
        <div class="row">
          <div class="input-group">
            <label>输出类型</label>
            <select v-model="outputType">
              <option value="spacetime">时空图</option>
              <option value="snapshot">快照</option>
            </select>
          </div>
        </div>
        <button :disabled="loading" @click="runWaveSimulation" class="btn-primary">
          {{ loading ? '仿真中…' : '运行 FDTD 仿真' }}
        </button>
      </div>
    </div>

    <!-- Fresnel Tab -->
    <div v-if="activeTab === 'fresnel'" class="section">
      <div class="section-title">界面参数</div>
      <div class="row">
        <div class="input-group">
          <label>n₁ (入射介质)</label>
          <input v-model.number="n1" type="number" step="0.1" min="1" />
        </div>
        <div class="input-group">
          <label>n₂ (透射介质)</label>
          <input v-model.number="n2" type="number" step="0.1" min="1" />
        </div>
      </div>
      <div class="row">
        <div class="input-group">
          <label>入射角 θᵢ (°)</label>
          <input v-model.number="thetaI" type="number" min="0" max="90" />
        </div>
        <div class="input-group">
          <label>偏振</label>
          <select v-model="polarization">
            <option value="s">s偏振 (TE)</option>
            <option value="p">p偏振 (TM)</option>
          </select>
        </div>
      </div>
      <button :disabled="loading" @click="runFresnelCalculation" class="btn-primary">
        {{ loading ? '计算中…' : '计算菲涅尔系数' }}
      </button>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-msg">{{ error }}</div>

    <!-- Results -->
    <div class="results-section">
      <!-- Wave result -->
      <div v-if="activeTab === 'wave' && img" class="result-card">
        <div class="result-title">1D FDTD 仿真结果</div>
        <img :src="img" alt="波动仿真" class="result-img" />
        <div class="result-meta">{{ waveMeta }}</div>
        <div class="formula-note">
          波动方程: ∂²E/∂t² = c² · ∂²E/∂x²
        </div>
      </div>

      <!-- Fresnel result -->
      <div v-if="activeTab === 'fresnel' && fresnelResult" class="result-card">
        <div class="result-title">菲涅尔公式计算结果</div>
        
        <div v-if="fresnelResult.total_internal_reflection" class="tir-warning">
          ⚠️ 全内反射 (入射角 > 临界角 {{ fresnelResult.critical_angle?.toFixed(1) }}°)
        </div>

        <div class="fresnel-results">
          <div class="result-row-header">
            <span></span>
            <span>振幅系数</span>
            <span>功率系数</span>
          </div>
          <div class="result-row-data">
            <span class="label">反射</span>
            <span class="value">r = {{ fresnelResult.r.toFixed(4) }}</span>
            <span class="value highlight-r">R = {{ (fresnelResult.R * 100).toFixed(2) }}%</span>
          </div>
          <div class="result-row-data">
            <span class="label">透射</span>
            <span class="value">t = {{ fresnelResult.t.toFixed(4) }}</span>
            <span class="value highlight-t">T = {{ (fresnelResult.T * 100).toFixed(2) }}%</span>
          </div>
          <div class="result-row-data conservation">
            <span class="label">能量守恒</span>
            <span class="value" colspan="2">R + T = {{ (fresnelResult.conservation_check * 100).toFixed(4) }}%</span>
          </div>
        </div>

        <div class="angles-info">
          <div class="angle-item">
            <span class="label">入射角 θᵢ</span>
            <span class="value">{{ fresnelResult.theta_i.toFixed(1) }}°</span>
          </div>
          <div v-if="fresnelResult.theta_t !== null" class="angle-item">
            <span class="label">折射角 θₜ</span>
            <span class="value">{{ fresnelResult.theta_t.toFixed(1) }}°</span>
          </div>
        </div>

        <div class="formula-note">
          斯涅尔定律: n₁ sin θᵢ = n₂ sin θₜ
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

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 100px;
}

.input-group label {
  font-size: 11px;
  color: var(--muted);
}

.input-group input,
.input-group select {
  padding: 8px 10px;
  font-size: 14px;
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

.result-img {
  width: 100%;
  border-radius: 10px;
  margin-bottom: 10px;
}

.result-meta {
  font-size: 12px;
  color: var(--muted);
}

.tir-warning {
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #ffc107;
}

.fresnel-results {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  overflow: hidden;
}

.result-row-header {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  font-size: 12px;
  color: var(--muted);
}

.result-row-data {
  display: grid;
  grid-template-columns: 80px 1fr 1fr;
  padding: 10px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 13px;
}

.result-row-data .label {
  color: var(--muted);
}

.result-row-data .value {
  font-family: monospace;
}

.result-row-data .highlight-r {
  color: #ff9800;
}

.result-row-data .highlight-t {
  color: #4caf50;
}

.result-row-data.conservation {
  background: rgba(79, 140, 255, 0.1);
}

.angles-info {
  display: flex;
  gap: 20px;
  margin-top: 14px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
}

.angle-item {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.angle-item .label {
  color: var(--muted);
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

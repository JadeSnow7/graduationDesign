<script setup lang="ts">
import { ref } from 'vue'

import { apiFetch } from '@/api/client'
import { useAuthStore } from '@/stores/auth'

// Types
interface IntegrateResp {
  result: string
  is_symbolic: boolean
  method: string
  error_estimate: number | null
}

interface DifferentiateResp {
  result: string
  order: number
}

interface EvaluateResp {
  result: number
  formula: string
}

interface VectorOpResp {
  operation: string
  result: string | { x: string; y: string; z: string }
}

const auth = useAuthStore()

// Integration state
const intExpr = ref('x**2 + sin(x)')
const intVar = ref('x')
const intLower = ref(0)
const intUpper = ref(3.14159)
const intMethod = ref<'numerical' | 'symbolic'>('numerical')
const intResult = ref<IntegrateResp | null>(null)

// Differentiation state
const diffExpr = ref('x**3 + sin(x)')
const diffVar = ref('x')
const diffOrder = ref(1)
const diffResult = ref<DifferentiateResp | null>(null)

// Evaluate state
const evalFormula = ref('k*q/r**2')
const evalVars = ref('{"k": 9e9, "q": 1e-9, "r": 0.1}')
const evalResult = ref<EvaluateResp | null>(null)

// Vector operation state
const vecOp = ref<'divergence' | 'curl' | 'gradient' | 'laplacian'>('gradient')
const vecFx = ref('x**2')
const vecFy = ref('y**2')
const vecFz = ref('z**2')
const vecScalar = ref('x**2 + y**2 + z**2')
const vecResult = ref<VectorOpResp | null>(null)

const loading = ref(false)
const error = ref('')
const activeTab = ref<'integrate' | 'diff' | 'eval' | 'vector'>('integrate')

// Methods
async function runIntegrate() {
  loading.value = true
  error.value = ''
  intResult.value = null
  try {
    const resp = await apiFetch<IntegrateResp>('/calc/integrate', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        expression: intExpr.value,
        variable: intVar.value,
        lower: intLower.value,
        upper: intUpper.value,
        method: intMethod.value,
      }),
    })
    intResult.value = resp
  } catch (e: any) {
    error.value = e?.message || '计算失败'
  } finally {
    loading.value = false
  }
}

async function runDifferentiate() {
  loading.value = true
  error.value = ''
  diffResult.value = null
  try {
    const resp = await apiFetch<DifferentiateResp>('/calc/differentiate', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        expression: diffExpr.value,
        variable: diffVar.value,
        order: diffOrder.value,
      }),
    })
    diffResult.value = resp
  } catch (e: any) {
    error.value = e?.message || '计算失败'
  } finally {
    loading.value = false
  }
}

async function runEvaluate() {
  loading.value = true
  error.value = ''
  evalResult.value = null
  try {
    const variables = JSON.parse(evalVars.value)
    const resp = await apiFetch<EvaluateResp>('/calc/evaluate', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify({
        formula: evalFormula.value,
        variables: variables,
      }),
    })
    evalResult.value = resp
  } catch (e: any) {
    error.value = e?.message || '计算失败'
  } finally {
    loading.value = false
  }
}

async function runVectorOp() {
  loading.value = true
  error.value = ''
  vecResult.value = null
  try {
    const body: any = { operation: vecOp.value }
    if (vecOp.value === 'divergence' || vecOp.value === 'curl') {
      body.fx = vecFx.value
      body.fy = vecFy.value
      body.fz = vecFz.value
    } else {
      body.scalar = vecScalar.value
    }
    const resp = await apiFetch<VectorOpResp>('/calc/vector_op', {
      method: 'POST',
      token: auth.token,
      body: JSON.stringify(body),
    })
    vecResult.value = resp
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
      <h3>🔢 数值计算工具</h3>
      <div class="tab-bar">
        <button :class="{ active: activeTab === 'integrate' }" @click="activeTab = 'integrate'">积分</button>
        <button :class="{ active: activeTab === 'diff' }" @click="activeTab = 'diff'">微分</button>
        <button :class="{ active: activeTab === 'eval' }" @click="activeTab = 'eval'">求值</button>
        <button :class="{ active: activeTab === 'vector' }" @click="activeTab = 'vector'">矢量</button>
      </div>
    </div>

    <!-- Integration Tab -->
    <div v-if="activeTab === 'integrate'" class="section">
      <div class="section-title">积分计算</div>
      <div class="input-group full">
        <label>表达式 f(x)</label>
        <input v-model="intExpr" type="text" placeholder="x**2 + sin(x)" />
      </div>
      <div class="row">
        <div class="input-group">
          <label>变量</label>
          <input v-model="intVar" type="text" />
        </div>
        <div class="input-group">
          <label>下限</label>
          <input v-model.number="intLower" type="number" step="0.1" />
        </div>
        <div class="input-group">
          <label>上限</label>
          <input v-model.number="intUpper" type="number" step="0.1" />
        </div>
        <div class="input-group">
          <label>方法</label>
          <select v-model="intMethod">
            <option value="numerical">数值</option>
            <option value="symbolic">符号</option>
          </select>
        </div>
      </div>
      <button :disabled="loading" @click="runIntegrate" class="btn-primary">
        {{ loading ? '计算中…' : '计算积分' }}
      </button>
      <div v-if="intResult" class="result-box">
        <div class="result-label">∫ {{ intExpr }} d{{ intVar }} = </div>
        <div class="result-value">{{ intResult.result }}</div>
        <div class="result-meta">
          方法: {{ intResult.method }}
          <span v-if="intResult.error_estimate"> | 误差估计: {{ intResult.error_estimate.toExponential(2) }}</span>
        </div>
      </div>
    </div>

    <!-- Differentiation Tab -->
    <div v-if="activeTab === 'diff'" class="section">
      <div class="section-title">符号微分</div>
      <div class="input-group full">
        <label>表达式 f(x)</label>
        <input v-model="diffExpr" type="text" placeholder="x**3 + sin(x)" />
      </div>
      <div class="row">
        <div class="input-group">
          <label>变量</label>
          <input v-model="diffVar" type="text" />
        </div>
        <div class="input-group">
          <label>阶数</label>
          <input v-model.number="diffOrder" type="number" min="1" max="5" />
        </div>
      </div>
      <button :disabled="loading" @click="runDifferentiate" class="btn-primary">
        {{ loading ? '计算中…' : '计算导数' }}
      </button>
      <div v-if="diffResult" class="result-box">
        <div class="result-label">d{{ diffResult.order > 1 ? `^${diffResult.order}` : '' }}/d{{ diffVar }}{{ diffResult.order > 1 ? `^${diffResult.order}` : '' }}({{ diffExpr }}) = </div>
        <div class="result-value">{{ diffResult.result }}</div>
      </div>
    </div>

    <!-- Evaluate Tab -->
    <div v-if="activeTab === 'eval'" class="section">
      <div class="section-title">公式求值</div>
      <div class="input-group full">
        <label>公式</label>
        <input v-model="evalFormula" type="text" placeholder="k*q/r**2" />
      </div>
      <div class="input-group full">
        <label>变量值 (JSON)</label>
        <textarea v-model="evalVars" rows="2" placeholder='{"k": 9e9, "q": 1e-9, "r": 0.1}'></textarea>
      </div>
      <button :disabled="loading" @click="runEvaluate" class="btn-primary">
        {{ loading ? '计算中…' : '求值' }}
      </button>
      <div v-if="evalResult" class="result-box">
        <div class="result-label">{{ evalResult.formula }} = </div>
        <div class="result-value">{{ evalResult.result.toExponential(6) }}</div>
      </div>
    </div>

    <!-- Vector Operations Tab -->
    <div v-if="activeTab === 'vector'" class="section">
      <div class="section-title">矢量运算</div>
      <div class="row">
        <div class="input-group">
          <label>运算类型</label>
          <select v-model="vecOp">
            <option value="gradient">梯度 ∇f</option>
            <option value="laplacian">拉普拉斯 ∇²f</option>
            <option value="divergence">散度 ∇·F</option>
            <option value="curl">旋度 ∇×F</option>
          </select>
        </div>
      </div>
      
      <div v-if="vecOp === 'gradient' || vecOp === 'laplacian'" class="input-group full">
        <label>标量场 f(x,y,z)</label>
        <input v-model="vecScalar" type="text" placeholder="x**2 + y**2 + z**2" />
      </div>
      
      <div v-else class="row">
        <div class="input-group">
          <label>Fx</label>
          <input v-model="vecFx" type="text" />
        </div>
        <div class="input-group">
          <label>Fy</label>
          <input v-model="vecFy" type="text" />
        </div>
        <div class="input-group">
          <label>Fz</label>
          <input v-model="vecFz" type="text" />
        </div>
      </div>
      
      <button :disabled="loading" @click="runVectorOp" class="btn-primary">
        {{ loading ? '计算中…' : '计算' }}
      </button>
      
      <div v-if="vecResult" class="result-box">
        <div class="result-label">{{ vecResult.operation === 'gradient' ? '∇f' : vecResult.operation === 'laplacian' ? '∇²f' : vecResult.operation === 'divergence' ? '∇·F' : '∇×F' }} = </div>
        <div v-if="typeof vecResult.result === 'string'" class="result-value">
          {{ vecResult.result }}
        </div>
        <div v-else class="result-vector">
          <div>({{ vecResult.result.x }}) <b>î</b></div>
          <div>+ ({{ vecResult.result.y }}) <b>ĵ</b></div>
          <div>+ ({{ vecResult.result.z }}) <b>k̂</b></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="error-msg">{{ error }}</div>
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
  gap: 6px;
  flex-wrap: wrap;
}

.tab-bar button {
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
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

.input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 80px;
}

.input-group.full {
  width: 100%;
  margin-bottom: 12px;
}

.input-group label {
  font-size: 11px;
  color: var(--muted);
}

.input-group input,
.input-group select,
.input-group textarea {
  padding: 8px 10px;
  font-size: 14px;
  font-family: monospace;
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

.result-box {
  margin-top: 14px;
  padding: 14px;
  background: rgba(79, 140, 255, 0.1);
  border: 1px solid rgba(79, 140, 255, 0.2);
  border-radius: 10px;
}

.result-label {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 6px;
}

.result-value {
  font-size: 18px;
  font-family: monospace;
  color: var(--primary);
  word-break: break-all;
}

.result-meta {
  font-size: 11px;
  color: var(--muted);
  margin-top: 8px;
}

.result-vector {
  font-family: monospace;
  font-size: 14px;
  line-height: 1.8;
}

.result-vector b {
  color: var(--primary);
}
</style>

# Inference Engine V2 — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade React frontend for the inference-engine-v2 AI writing assistant, including campus email auth (HUST domain only) and real-time SSE-driven chat with literature and research gap sidebars.

**Architecture:** Backend gets two new endpoints (`/api/auth/register`, `/api/auth/login`) backed by Redis + bcrypt. Frontend is a new Vite + React 18 + TypeScript app in `inference-engine-v2/frontend/` using Zustand for state, Tailwind for styling, and `fetch + ReadableStream` for SSE (no native EventSource). Three-column layout: chat panel, sidebar (literature / research gaps), auth-protected routing.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Zustand 4, Tailwind CSS 3, react-markdown 9, remark-gfm 4, React Router v6, passlib[bcrypt] (backend)

---

## File Map

**Backend — modified/created**
- `backend/requirements.txt` — add `passlib[bcrypt]>=1.7.4`
- `backend/store/redis_store.py` — add `UserStore` class
- `backend/api/users.py` — new: `POST /api/auth/register` + `POST /api/auth/login`
- `backend/main.py` — include users router, init UserStore in lifespan
- `backend/tests/test_users.py` — new: auth endpoint unit tests

**Frontend — all new under `inference-engine-v2/frontend/`**
- `package.json`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`, `index.html`
- `src/main.tsx`, `src/App.tsx`
- `src/types/events.ts` — SSEEvent, PaperItem, GapItem, Message types
- `src/utils/token.ts` — localStorage helpers
- `src/utils/scene.ts` — scene keyword detector
- `src/api/client.ts` — apiFetch with JWT injection + 401 redirect
- `src/api/sse.ts` — connectSSE with fetch+ReadableStream, UTF-8 buffer
- `src/store/user.ts` — token, profile, persist
- `src/store/chat.ts` — messages, streaming state, immer
- `src/store/pipeline.ts` — stage history
- `src/store/sidebar.ts` — papers, gaps, activeTab
- `src/hooks/useSSE.ts` — AbortController singleton, wires all stores
- `src/hooks/useAutoScroll.ts` — near-bottom detection
- `src/hooks/useProfile.ts` — formatted profile getter
- `src/components/layout/ProtectedRoute.tsx`
- `src/components/layout/Shell.tsx` — 3-column 100vh layout
- `src/components/layout/Header.tsx` — logo, scene badge, user name
- `src/components/chat/EmptyState.tsx` — 3 quick-start buttons
- `src/components/chat/MessageBubble.tsx` — user/AI messages + copy button
- `src/components/chat/StreamingBubble.tsx` — real-time Markdown + cursor
- `src/components/chat/StageIndicator.tsx` — pipeline progress
- `src/components/chat/ChatPanel.tsx` — scrollable message list
- `src/components/chat/InputBar.tsx` — textarea + send + onboarding trigger
- `src/components/onboarding/SurveyStep.tsx` — single-step card selector
- `src/components/onboarding/OnboardingModal.tsx` — 3-step overlay modal
- `src/components/sidebar/LiteraturePanel.tsx` — paper cards with score bar
- `src/components/sidebar/GapsPanel.tsx` — gap cards with severity colors
- `src/components/sidebar/PanelTabs.tsx` — papers/gaps tab switcher
- `src/pages/LoginPage.tsx` — register/login dual-tab form
- `src/pages/ChatPage.tsx` — wraps Shell

---

## Task 1: Backend — UserStore + auth endpoints

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `backend/store/redis_store.py`
- Create: `backend/api/users.py`
- Modify: `backend/main.py`
- Create: `backend/tests/test_users.py`

- [ ] **Step 1: Add bcrypt dependency**

Append to `backend/requirements.txt`:
```
passlib[bcrypt]>=1.7.4
```

- [ ] **Step 2: Add UserStore to redis_store.py**

Append after the `RedisProfileStore` class:
```python
class UserStore:
    def __init__(self, client=None):
        self.client = client or redis.from_url(settings.REDIS_URL, decode_responses=True)

    @staticmethod
    def _key(email: str) -> str:
        return f"users:{email}"

    async def exists(self, email: str) -> bool:
        return bool(await self.client.exists(self._key(email)))

    async def create(self, email: str, password_hash: str) -> None:
        await self.client.hset(self._key(email), mapping={"password_hash": password_hash})

    async def get_hash(self, email: str) -> str | None:
        return await self.client.hget(self._key(email), "password_hash")
```

- [ ] **Step 3: Create backend/api/users.py**

```python
import re

from fastapi import APIRouter, HTTPException, Request
from passlib.context import CryptContext
from pydantic import BaseModel

from api.auth import create_access_token
from store.redis_store import UserStore

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALLOWED_DOMAINS = re.compile(r'^[a-zA-Z0-9._%+\-]+@(stu\.)?hust\.edu\.cn$')


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/auth/register")
async def register(req: RegisterRequest, request: Request):
    if not ALLOWED_DOMAINS.match(req.email):
        raise HTTPException(status_code=400, detail="仅限 HUST 校园邮箱注册（@hust.edu.cn 或 @stu.hust.edu.cn）")
    store: UserStore = request.app.state.user_store
    if await store.exists(req.email):
        raise HTTPException(status_code=409, detail="邮箱已注册")
    await store.create(req.email, pwd_context.hash(req.password))
    return {"ok": True}


@router.post("/auth/login")
async def login(req: LoginRequest, request: Request):
    store: UserStore = request.app.state.user_store
    hash_ = await store.get_hash(req.email)
    if not hash_ or not pwd_context.verify(req.password, hash_):
        raise HTTPException(status_code=401, detail="邮箱或密码错误")
    return {"token": create_access_token(req.email)}
```

- [ ] **Step 4: Wire into main.py**

In `backend/main.py`, add these imports at the top (after existing imports):
```python
from api.users import router as users_router
from store.redis_store import UserStore
```

Inside the `lifespan` function, after `app.state.profile_store = RedisProfileStore(redis_client)`, add:
```python
    app.state.user_store = UserStore(redis_client)
```

After `app.include_router(chat_router, prefix="/api")`, add:
```python
app.include_router(users_router, prefix="/api")
```

- [ ] **Step 5: Write auth tests**

Create `backend/tests/test_users.py`:
```python
import os
import unittest

os.environ.setdefault("DASHSCOPE_API_KEY", "test-key")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/1")

from api.users import ALLOWED_DOMAINS


class DomainValidationTest(unittest.TestCase):
    def test_hust_edu_cn_accepted(self):
        self.assertIsNotNone(ALLOWED_DOMAINS.match("alice@hust.edu.cn"))

    def test_stu_hust_edu_cn_accepted(self):
        self.assertIsNotNone(ALLOWED_DOMAINS.match("u202300001@stu.hust.edu.cn"))

    def test_gmail_rejected(self):
        self.assertIsNone(ALLOWED_DOMAINS.match("alice@gmail.com"))

    def test_bare_hust_rejected(self):
        self.assertIsNone(ALLOWED_DOMAINS.match("alice@hust.com"))

    def test_subdomain_spoofing_rejected(self):
        self.assertIsNone(ALLOWED_DOMAINS.match("alice@evil.hust.edu.cn"))
```

- [ ] **Step 6: Run tests**

```bash
cd inference-engine-v2/backend
python -m pytest tests/test_users.py -v
```

Expected:
```
PASSED tests/test_users.py::DomainValidationTest::test_hust_edu_cn_accepted
PASSED tests/test_users.py::DomainValidationTest::test_stu_hust_edu_cn_accepted
PASSED tests/test_users.py::DomainValidationTest::test_gmail_rejected
PASSED tests/test_users.py::DomainValidationTest::test_bare_hust_rejected
PASSED tests/test_users.py::DomainValidationTest::test_subdomain_spoofing_rejected
5 passed
```

- [ ] **Step 7: Commit**

```bash
git add inference-engine-v2/backend/requirements.txt \
        inference-engine-v2/backend/store/redis_store.py \
        inference-engine-v2/backend/api/users.py \
        inference-engine-v2/backend/main.py \
        inference-engine-v2/backend/tests/test_users.py
git commit -m "feat(backend): add campus email auth endpoints with bcrypt"
```

---

## Task 2: Frontend scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/postcss.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`

- [ ] **Step 1: Scaffold Vite project**

```bash
cd inference-engine-v2
npm create vite@latest frontend -- --template react-ts
cd frontend
```

- [ ] **Step 2: Install dependencies**

```bash
npm install zustand immer react-markdown remark-gfm react-router-dom
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/user-event jsdom @vitejs/plugin-react
npx tailwindcss init -p
```

- [ ] **Step 3: Configure vite.config.ts**

Replace the entire file:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
})
```

- [ ] **Step 4: Configure tailwind.config.ts**

Replace the generated file:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}

export default config
```

- [ ] **Step 5: Configure tsconfig.json**

Replace the generated file:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Update index.html**

Replace the generated file:
```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>学术写作助手</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Create src/test-setup.ts**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 9: Create src/main.tsx**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 10: Create src/App.tsx (placeholder — will be replaced in Task 7)**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<div className="p-8 text-gray-500">scaffold ok</div>} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 11: Verify dev server starts**

```bash
npm run dev
```

Expected: Vite dev server running at http://localhost:5173, no compile errors.

- [ ] **Step 12: Commit**

```bash
cd inference-engine-v2/frontend
git add .
git commit -m "feat(frontend): scaffold Vite + React 18 + Tailwind project"
```

---

## Task 3: Types and utilities

**Files:**
- Create: `frontend/src/types/events.ts`
- Create: `frontend/src/utils/token.ts`
- Create: `frontend/src/utils/scene.ts`

- [ ] **Step 1: Create src/types/events.ts**

```typescript
export type EventType = 'stage' | 'papers' | 'gaps' | 'token' | 'done' | 'error'

export interface SSEEvent {
  type: EventType
  content?: string
  stage?: string
  data?: PaperItem[] | GapItem[]
}

export interface PaperItem {
  id: string
  title: string
  year: number
  score: number
}

export interface GapItem {
  id: string
  description: string
  severity: 'high' | 'medium' | 'low'
  addressed_by: number
  score: number
}

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  isStreaming: boolean
  timestamp: number
  scene?: string
}
```

- [ ] **Step 2: Create src/utils/token.ts**

```typescript
const KEY = 'edu_token'

export function getToken(): string | null {
  return localStorage.getItem(KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(KEY)
}
```

- [ ] **Step 3: Create src/utils/scene.ts**

```typescript
export type Scene = 'proposal' | 'review' | 'paragraph' | 'format' | null

const SCENE_MAP: Array<[Scene, RegExp]> = [
  ['proposal', /开题|组会|中期|research\s*proposal/i],
  ['review', /综述|文献梳理|related\s*work/i],
  ['format', /引用格式|字数压缩|摘要翻译/i],
  ['paragraph', /段落|润色|改写|撰写|章节/i],
]

export function detectScene(text: string): Scene {
  for (const [scene, re] of SCENE_MAP) {
    if (re.test(text)) return scene
  }
  return null
}

export const SCENE_LABELS: Record<NonNullable<Scene>, string> = {
  proposal: '开题报告',
  review: '文献综述',
  paragraph: '段落写作',
  format: '格式化',
}

export const SCENE_COLORS: Record<NonNullable<Scene>, string> = {
  proposal: 'bg-blue-100 text-blue-700',
  review: 'bg-green-100 text-green-700',
  paragraph: 'bg-purple-100 text-purple-700',
  format: 'bg-gray-100 text-gray-600',
}
```

- [ ] **Step 4: Write unit tests for scene detection**

Create `frontend/src/utils/__tests__/scene.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { detectScene } from '../scene'

describe('detectScene', () => {
  it('detects proposal from 开题', () => {
    expect(detectScene('帮我生成开题报告大纲')).toBe('proposal')
  })
  it('detects review from 文献综述', () => {
    expect(detectScene('整理相关文献综述')).toBe('review')
  })
  it('detects format from 引用格式', () => {
    expect(detectScene('帮我规范引用格式')).toBe('format')
  })
  it('detects paragraph from 润色', () => {
    expect(detectScene('润色这段论文内容')).toBe('paragraph')
  })
  it('returns null for unrecognised input', () => {
    expect(detectScene('你好')).toBeNull()
  })
})
```

- [ ] **Step 5: Run tests**

```bash
cd inference-engine-v2/frontend
npx vitest run src/utils/__tests__/scene.test.ts
```

Expected: 5 passed.

- [ ] **Step 6: Commit**

```bash
git add src/types/events.ts src/utils/token.ts src/utils/scene.ts src/utils/__tests__/scene.test.ts
git commit -m "feat(frontend): add SSE types, token utils, scene detector"
```

---

## Task 4: API layer

**Files:**
- Create: `frontend/src/api/client.ts`
- Create: `frontend/src/api/sse.ts`

- [ ] **Step 1: Write SSE buffer parsing test first**

Create `frontend/src/api/__tests__/sse-buffer.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'

// Extract the pure parsing logic for testing
function parseSSEChunks(chunks: string[]): string[] {
  const results: string[] = []
  let buffer = ''
  for (const chunk of chunks) {
    buffer += chunk
    let boundary = buffer.indexOf('\n\n')
    while (boundary !== -1) {
      const raw = buffer.slice(0, boundary)
      buffer = buffer.slice(boundary + 2)
      if (raw.startsWith('data: ')) {
        results.push(raw.slice(6))
      }
      boundary = buffer.indexOf('\n\n')
    }
  }
  return results
}

describe('SSE buffer parsing', () => {
  it('parses a single complete frame', () => {
    const result = parseSSEChunks(['data: {"type":"token","content":"你"}\n\n'])
    expect(result).toEqual(['{"type":"token","content":"你"}'])
  })

  it('handles frame split across two chunks', () => {
    const result = parseSSEChunks([
      'data: {"type":"token",',
      '"content":"好"}\n\n',
    ])
    expect(result).toEqual(['{"type":"token","content":"好"}'])
  })

  it('handles multiple frames in one chunk', () => {
    const result = parseSSEChunks([
      'data: {"type":"stage","stage":"路由中"}\n\ndata: {"type":"token","content":"a"}\n\n',
    ])
    expect(result).toHaveLength(2)
  })

  it('ignores incomplete trailing frame', () => {
    const result = parseSSEChunks(['data: {"type":"token","content":"x"}\n\ndata: incomplete'])
    expect(result).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run to verify tests fail (no implementation yet)**

```bash
npx vitest run src/api/__tests__/sse-buffer.test.ts
```

Expected: 4 passed (these test pure logic, no import needed — that's fine).

- [ ] **Step 3: Create src/api/client.ts**

```typescript
const BASE_URL = import.meta.env.VITE_API_BASE ?? ''

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('edu_token')
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('edu_token')
    localStorage.removeItem('edu_user')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const text = await res.text().catch(() => `HTTP ${res.status}`)
    let detail = text
    try { detail = JSON.parse(text)?.detail ?? text } catch { /* ignore */ }
    throw new Error(detail)
  }

  return res.json() as Promise<T>
}
```

- [ ] **Step 4: Create src/api/sse.ts**

```typescript
import type { PaperItem, GapItem, SSEEvent } from '../types/events'

export interface SSEController {
  abort: () => void
}

export interface SSEHandlers {
  onStage: (stage: string) => void
  onPapers: (papers: PaperItem[]) => void
  onGaps: (gaps: GapItem[]) => void
  onToken: (token: string) => void
  onDone: () => void
  onError: (msg: string) => void
}

const BASE_URL = import.meta.env.VITE_API_BASE ?? ''

export function connectSSE(message: string, handlers: SSEHandlers): SSEController {
  const controller = new AbortController()
  const token = localStorage.getItem('edu_token')

  fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message }),
    signal: controller.signal,
  })
    .then(async (res) => {
      if (!res.body) return

      const reader = res.body.getReader()
      // Constraint A: stream-mode TextDecoder prevents multi-byte Chinese split
      const decoder = new TextDecoder('utf-8')
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        let boundary = buffer.indexOf('\n\n')
        while (boundary !== -1) {
          const raw = buffer.slice(0, boundary)
          buffer = buffer.slice(boundary + 2)

          if (raw.startsWith('data: ')) {
            try {
              const event = JSON.parse(raw.slice(6)) as SSEEvent
              handleEvent(event, handlers)
            } catch {
              // Constraint A: silently skip malformed frames
            }
          }

          boundary = buffer.indexOf('\n\n')
        }
      }
    })
    .catch((err: Error) => {
      if (err.name !== 'AbortError') {
        handlers.onError('连接中断，请重试')
      }
    })

  return { abort: () => controller.abort() }
}

function handleEvent(event: SSEEvent, h: SSEHandlers): void {
  switch (event.type) {
    case 'stage':
      h.onStage(event.stage ?? '')
      break
    case 'papers':
      h.onPapers((event.data as PaperItem[]) ?? [])
      break
    case 'gaps':
      h.onGaps((event.data as GapItem[]) ?? [])
      break
    case 'token':
      h.onToken(event.content ?? '')
      break
    case 'done':
      h.onDone()
      break
    case 'error':
      h.onError(event.content ?? '服务错误')
      break
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add src/api/client.ts src/api/sse.ts src/api/__tests__/sse-buffer.test.ts
git commit -m "feat(frontend): add apiFetch and connectSSE (fetch+ReadableStream)"
```

---

## Task 5: Zustand stores

**Files:**
- Create: `frontend/src/store/user.ts`
- Create: `frontend/src/store/chat.ts`
- Create: `frontend/src/store/pipeline.ts`
- Create: `frontend/src/store/sidebar.ts`

- [ ] **Step 1: Write store tests first**

Create `frontend/src/store/__tests__/stores.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useChatStore } from '../chat'
import { useSidebarStore } from '../sidebar'
import { usePipelineStore } from '../pipeline'

beforeEach(() => {
  useChatStore.setState({ messages: [], isStreaming: false, streamingId: null })
  useSidebarStore.setState({ papers: [], gaps: [], activeTab: 'papers' })
  usePipelineStore.setState({ currentStage: null, stageHistory: [] })
})

describe('useChatStore', () => {
  it('appendToken accumulates content', () => {
    const id = useChatStore.getState().startAssistantMessage()
    useChatStore.getState().appendToken(id, '你')
    useChatStore.getState().appendToken(id, '好')
    const msg = useChatStore.getState().messages.find(m => m.id === id)
    expect(msg?.content).toBe('你好')
  })

  it('finalizeMessage sets isStreaming false on the message', () => {
    const id = useChatStore.getState().startAssistantMessage()
    useChatStore.getState().finalizeMessage(id)
    const msg = useChatStore.getState().messages.find(m => m.id === id)
    expect(msg?.isStreaming).toBe(false)
  })

  it('resetStreaming clears isStreaming and streamingId', () => {
    useChatStore.setState({ isStreaming: true, streamingId: 'x' })
    useChatStore.getState().resetStreaming()
    expect(useChatStore.getState().isStreaming).toBe(false)
    expect(useChatStore.getState().streamingId).toBeNull()
  })
})

describe('useSidebarStore', () => {
  it('setPapers automatically switches activeTab to papers', () => {
    useSidebarStore.setState({ activeTab: 'gaps' })
    useSidebarStore.getState().setPapers([{ id: '1', title: 'T', year: 2023, score: 0.9 }])
    expect(useSidebarStore.getState().activeTab).toBe('papers')
  })

  it('setGaps does not auto-switch tab', () => {
    useSidebarStore.getState().setGaps([{ id: '1', description: 'D', severity: 'high', addressed_by: 0, score: 0.8 }])
    expect(useSidebarStore.getState().activeTab).toBe('papers')
  })
})

describe('usePipelineStore', () => {
  it('setStage appends to stageHistory', () => {
    usePipelineStore.getState().setStage('路由中')
    usePipelineStore.getState().setStage('意图解析')
    expect(usePipelineStore.getState().stageHistory).toEqual(['路由中', '意图解析'])
    expect(usePipelineStore.getState().currentStage).toBe('意图解析')
  })

  it('clearStages resets both fields', () => {
    usePipelineStore.getState().setStage('路由中')
    usePipelineStore.getState().clearStages()
    expect(usePipelineStore.getState().stageHistory).toEqual([])
    expect(usePipelineStore.getState().currentStage).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — expect failures (stores not yet created)**

```bash
npx vitest run src/store/__tests__/stores.test.ts
```

Expected: FAIL with module not found errors.

- [ ] **Step 3: Create src/store/chat.ts**

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Message } from '../types/events'

function genId(): string {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

interface ChatState {
  messages: Message[]
  isStreaming: boolean
  streamingId: string | null
  addUserMessage: (content: string) => string
  startAssistantMessage: () => string
  appendToken: (id: string, token: string) => void
  finalizeMessage: (id: string) => void
  setStreaming: (v: boolean) => void
  resetStreaming: () => void
  clearAll: () => void
}

export const useChatStore = create<ChatState>()(
  immer((set) => ({
    messages: [],
    isStreaming: false,
    streamingId: null,

    addUserMessage: (content) => {
      const id = genId()
      set((s) => {
        s.messages.push({ id, role: 'user', content, isStreaming: false, timestamp: Date.now() })
      })
      return id
    },

    startAssistantMessage: () => {
      const id = genId()
      set((s) => {
        s.messages.push({ id, role: 'assistant', content: '', isStreaming: true, timestamp: Date.now() })
        s.isStreaming = true
        s.streamingId = id
      })
      return id
    },

    appendToken: (id, token) => {
      set((s) => {
        const msg = s.messages.find((m) => m.id === id)
        if (msg) msg.content += token
      })
    },

    finalizeMessage: (id) => {
      set((s) => {
        const msg = s.messages.find((m) => m.id === id)
        if (msg) msg.isStreaming = false
        s.isStreaming = false
        s.streamingId = null
      })
    },

    setStreaming: (v) => set((s) => { s.isStreaming = v }),

    resetStreaming: () => set((s) => {
      s.isStreaming = false
      s.streamingId = null
    }),

    clearAll: () => set((s) => {
      s.messages = []
      s.isStreaming = false
      s.streamingId = null
    }),
  })),
)
```

- [ ] **Step 4: Create src/store/pipeline.ts**

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface PipelineState {
  currentStage: string | null
  stageHistory: string[]
  setStage: (stage: string) => void
  clearStages: () => void
}

export const usePipelineStore = create<PipelineState>()(
  immer((set) => ({
    currentStage: null,
    stageHistory: [],

    setStage: (stage) => set((s) => {
      s.currentStage = stage
      s.stageHistory.push(stage)
    }),

    clearStages: () => set((s) => {
      s.currentStage = null
      s.stageHistory = []
    }),
  })),
)
```

- [ ] **Step 5: Create src/store/sidebar.ts**

```typescript
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { PaperItem, GapItem } from '../types/events'

interface SidebarState {
  papers: PaperItem[]
  gaps: GapItem[]
  activeTab: 'papers' | 'gaps'
  setPapers: (papers: PaperItem[]) => void
  setGaps: (gaps: GapItem[]) => void
  setActiveTab: (tab: 'papers' | 'gaps') => void
  clear: () => void
}

export const useSidebarStore = create<SidebarState>()(
  immer((set) => ({
    papers: [],
    gaps: [],
    activeTab: 'papers',

    setPapers: (papers) => set((s) => {
      s.papers = papers
      s.activeTab = 'papers'  // auto-switch per spec
    }),

    setGaps: (gaps) => set((s) => { s.gaps = gaps }),

    setActiveTab: (tab) => set((s) => { s.activeTab = tab }),

    clear: () => set((s) => {
      s.papers = []
      s.gaps = []
    }),
  })),
)
```

- [ ] **Step 6: Create src/store/user.ts**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface Profile {
  teachingStyle: 'step_by_step' | 'directional' | 'rewrite_first' | null
  feedbackVerbosity: 'concise' | 'balanced' | 'detailed' | null
  writingStage: string | null
  hasCompletedOnboarding: boolean
}

interface UserState {
  token: string | null
  userId: string | null
  profile: Profile
  setToken: (token: string, userId?: string) => void
  setProfile: (profile: Partial<Profile>) => void
  logout: () => void
}

const defaultProfile: Profile = {
  teachingStyle: null,
  feedbackVerbosity: null,
  writingStage: null,
  hasCompletedOnboarding: false,
}

export const useUserStore = create<UserState>()(
  persist(
    immer((set) => ({
      token: null,
      userId: null,
      profile: { ...defaultProfile },

      setToken: (token, userId) => set((s) => {
        s.token = token
        s.userId = userId ?? null
        localStorage.setItem('edu_token', token)
      }),

      setProfile: (partial) => set((s) => {
        Object.assign(s.profile, partial)
      }),

      logout: () => set((s) => {
        s.token = null
        s.userId = null
        s.profile = { ...defaultProfile }
        localStorage.removeItem('edu_token')
      }),
    })),
    { name: 'edu_user' },
  ),
)
```

- [ ] **Step 7: Run tests — expect all pass**

```bash
npx vitest run src/store/__tests__/stores.test.ts
```

Expected: 7 passed.

- [ ] **Step 8: Commit**

```bash
git add src/store/
git commit -m "feat(frontend): add Zustand stores (user, chat, pipeline, sidebar)"
```

---

## Task 6: Hooks

**Files:**
- Create: `frontend/src/hooks/useSSE.ts`
- Create: `frontend/src/hooks/useAutoScroll.ts`
- Create: `frontend/src/hooks/useProfile.ts`

- [ ] **Step 1: Create src/hooks/useSSE.ts**

```typescript
import { useCallback, useEffect, useRef } from 'react'
import { connectSSE, type SSEController } from '../api/sse'
import { useChatStore } from '../store/chat'
import { usePipelineStore } from '../store/pipeline'
import { useSidebarStore } from '../store/sidebar'

export function useSSE() {
  const controllerRef = useRef<SSEController | null>(null)

  const send = useCallback((message: string) => {
    // Constraint B: abort previous request before starting new one
    controllerRef.current?.abort()

    // Constraint C: reset all state before new request
    useChatStore.getState().resetStreaming()
    usePipelineStore.getState().clearStages()
    useSidebarStore.getState().clear()

    useChatStore.getState().addUserMessage(message)
    const assistantId = useChatStore.getState().startAssistantMessage()

    controllerRef.current = connectSSE(message, {
      onStage: (stage) => usePipelineStore.getState().setStage(stage),
      onPapers: (papers) => useSidebarStore.getState().setPapers(papers),
      onGaps: (gaps) => useSidebarStore.getState().setGaps(gaps),
      onToken: (token) => useChatStore.getState().appendToken(assistantId, token),
      onDone: () => useChatStore.getState().finalizeMessage(assistantId),
      // Constraint H: error appended as blockquote, then finalized
      onError: (msg) => {
        useChatStore.getState().appendToken(assistantId, `\n\n> ⚠ ${msg}`)
        useChatStore.getState().finalizeMessage(assistantId)
      },
    })
  }, [])

  // Constraint I: abort on unmount
  useEffect(() => () => { controllerRef.current?.abort() }, [])

  return {
    send,
    isStreaming: useChatStore((s) => s.isStreaming),
  }
}
```

- [ ] **Step 2: Create src/hooks/useAutoScroll.ts**

```typescript
import { useEffect, useRef } from 'react'

export function useAutoScroll(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120
    if (isNearBottom) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }, [dep])

  return ref
}
```

- [ ] **Step 3: Create src/hooks/useProfile.ts**

```typescript
import { useUserStore } from '../store/user'

export function useProfile() {
  return useUserStore((s) => s.profile)
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/
git commit -m "feat(frontend): add useSSE, useAutoScroll, useProfile hooks"
```

---

## Task 7: Auth page + routing

**Files:**
- Create: `frontend/src/components/layout/ProtectedRoute.tsx`
- Create: `frontend/src/pages/LoginPage.tsx`
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Create src/components/layout/ProtectedRoute.tsx**

```typescript
import { Navigate } from 'react-router-dom'
import { useUserStore } from '../../store/user'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useUserStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

- [ ] **Step 2: Create src/pages/LoginPage.tsx**

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api/client'
import { useUserStore } from '../store/user'

// Constraint F: campus email regex
const CAMPUS_EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@(stu\.)?hust\.edu\.cn$/

type Tab = 'login' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const setToken = useUserStore((s) => s.setToken)
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const validate = (): string | null => {
    if (!CAMPUS_EMAIL_RE.test(email)) return '请使用 HUST 校园邮箱（@hust.edu.cn 或 @stu.hust.edu.cn）'
    if (password.length < 8) return '密码至少 8 位'
    if (tab === 'register' && password !== confirm) return '两次密码不一致'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    try {
      if (tab === 'register') {
        await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        setTab('login')
        setError('注册成功，请登录')
      } else {
        const data = await apiFetch<{ token: string }>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        setToken(data.token, email)
        navigate('/')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '请求失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-6 text-center">学术写作助手</h1>

        {/* Tabs */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError('') }}
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                tab === t ? 'bg-white shadow-sm font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">校园邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="xxx@hust.edu.cn"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 8 位"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {tab === 'register' && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">确认密码</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {error && (
            <p className={`text-sm ${error.startsWith('注册成功') ? 'text-green-600' : 'text-red-500'}`}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '处理中…' : tab === 'login' ? '登录' : '注册'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Replace src/App.tsx with full routing**

```typescript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 4: Create placeholder src/pages/ChatPage.tsx (will be filled in Task 12)**

```typescript
export default function ChatPage() {
  return <div className="p-8 text-gray-500">Chat page — coming soon</div>
}
```

- [ ] **Step 5: Verify login page renders**

```bash
npm run dev
```

Navigate to http://localhost:5173 — should redirect to `/login`. The login form should render with email/password inputs and login/register tabs.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ProtectedRoute.tsx src/pages/LoginPage.tsx src/pages/ChatPage.tsx src/App.tsx
git commit -m "feat(frontend): add login/register page with HUST email validation"
```

---

## Task 8: Layout — Shell and Header

**Files:**
- Create: `frontend/src/components/layout/Shell.tsx`
- Create: `frontend/src/components/layout/Header.tsx`

- [ ] **Step 1: Create src/components/layout/Header.tsx**

```typescript
import { useUserStore } from '../../store/user'
import { useChatStore } from '../../store/chat'
import { detectScene, SCENE_LABELS, SCENE_COLORS } from '../../utils/scene'

export function Header() {
  const userId = useUserStore((s) => s.userId)
  const logout = useUserStore((s) => s.logout)
  const messages = useChatStore((s) => s.messages)

  // Derive scene from the last user message
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
  const scene = lastUserMsg ? detectScene(lastUserMsg.content) : null

  return (
    <header className="h-12 shrink-0 flex items-center px-4 border-b bg-white gap-3">
      <span className="font-semibold text-gray-900 text-sm">学术写作助手</span>

      {scene && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SCENE_COLORS[scene]}`}>
          {SCENE_LABELS[scene]}
        </span>
      )}

      <div className="ml-auto flex items-center gap-3">
        {userId && (
          <span className="text-xs text-gray-500 truncate max-w-[160px]">{userId}</span>
        )}
        <button
          onClick={logout}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          退出
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Create src/components/layout/Shell.tsx**

```typescript
import { Header } from './Header'
import { ChatPanel } from '../chat/ChatPanel'
import { InputBar } from '../chat/InputBar'
import { PanelTabs } from '../sidebar/PanelTabs'

export function Shell() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Main chat area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <ChatPanel />
          <InputBar />
        </div>

        {/* Right sidebar — hidden on small screens */}
        <aside className="hidden lg:flex flex-col w-80 shrink-0 border-l overflow-y-auto bg-white">
          <PanelTabs />
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Shell.tsx src/components/layout/Header.tsx
git commit -m "feat(frontend): add Shell and Header layout components"
```

---

## Task 9: Chat components

**Files:**
- Create: `frontend/src/components/chat/EmptyState.tsx`
- Create: `frontend/src/components/chat/MessageBubble.tsx`
- Create: `frontend/src/components/chat/StreamingBubble.tsx`
- Create: `frontend/src/components/chat/StageIndicator.tsx`
- Create: `frontend/src/components/chat/ChatPanel.tsx`

- [ ] **Step 1: Create src/components/chat/EmptyState.tsx**

```typescript
import { useSSE } from '../../hooks/useSSE'

const QUICK_STARTS = [
  '帮我生成开题报告大纲',
  '整理相关文献综述',
  '润色这段论文内容',
]

export function EmptyState() {
  const { send } = useSSE()

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
      <div>
        <p className="text-gray-500 text-sm">发送消息开始学术写作辅助</p>
      </div>
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {QUICK_STARTS.map((text) => (
          <button
            key={text}
            onClick={() => send(text)}
            className="px-4 py-2.5 text-sm text-left border rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors text-gray-700"
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/chat/MessageBubble.tsx**

```typescript
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../../types/events'

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {/* ignore */})
}

export function MessageBubble({ message }: { message: Message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="max-w-[85%] bg-white border rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
      {/* Action bar — only when finalized */}
      <div className="flex gap-2 pl-2">
        <button
          onClick={() => copyToClipboard(message.content)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          复制
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/chat/StreamingBubble.tsx**

```typescript
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '../../types/events'

// Constraint J: React.memo prevents unnecessary re-renders during streaming
export const StreamingBubble = memo(function StreamingBubble({ message }: { message: Message }) {
  return (
    <div className="flex flex-col">
      <div className="max-w-[85%] bg-white border rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
        <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
        {/* Blinking cursor */}
        <span className="inline-block w-0.5 h-4 bg-gray-600 animate-pulse ml-0.5 align-middle" />
      </div>
    </div>
  )
})
```

- [ ] **Step 4: Create src/components/chat/StageIndicator.tsx**

```typescript
import { usePipelineStore } from '../../store/pipeline'
import { useChatStore } from '../../store/chat'

const PRESET_STAGES = ['路由中', '意图解析', '文献检索中', '研究空白分析', '大纲生成', '审核修订']

export function StageIndicator() {
  const isStreaming = useChatStore((s) => s.isStreaming)
  const stageHistory = usePipelineStore((s) => s.stageHistory)
  const currentStage = usePipelineStore((s) => s.currentStage)

  // Check if all stages are in preset list
  const allPreset = stageHistory.every((s) => PRESET_STAGES.includes(s))
  const stages = allPreset ? PRESET_STAGES : stageHistory

  return (
    // Constraint 6: opacity toggle — no layout shift
    <div
      className={`px-4 py-1.5 flex items-center gap-1 overflow-x-auto transition-opacity duration-200 ${
        isStreaming && stageHistory.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      style={{ minHeight: '28px' }}
    >
      {stages.map((stage, i) => {
        const isDone = allPreset
          ? PRESET_STAGES.indexOf(stage) < PRESET_STAGES.indexOf(currentStage ?? '')
          : i < stageHistory.length - 1
        const isCurrent = stage === currentStage

        return (
          <div key={stage} className="flex items-center gap-1 shrink-0">
            {i > 0 && <span className="text-gray-300 text-xs">—</span>}
            <span
              className={`text-xs ${
                isDone
                  ? 'text-gray-400'
                  : isCurrent
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-300'
              }`}
            >
              {isDone ? '✓ ' : isCurrent ? '● ' : '○ '}{stage}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 5: Create src/components/chat/ChatPanel.tsx**

```typescript
import { useChatStore } from '../../store/chat'
import { useAutoScroll } from '../../hooks/useAutoScroll'
import { MessageBubble } from './MessageBubble'
import { StreamingBubble } from './StreamingBubble'
import { EmptyState } from './EmptyState'

export function ChatPanel() {
  const messages = useChatStore((s) => s.messages)
  const scrollRef = useAutoScroll(messages)

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
    >
      {messages.length === 0 && <EmptyState />}
      {messages.map((msg) =>
        msg.isStreaming
          ? <StreamingBubble key={msg.id} message={msg} />
          : <MessageBubble key={msg.id} message={msg} />
      )}
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/chat/
git commit -m "feat(frontend): add chat components (bubbles, stage indicator, panel)"
```

---

## Task 10: InputBar and Onboarding

**Files:**
- Create: `frontend/src/components/onboarding/SurveyStep.tsx`
- Create: `frontend/src/components/onboarding/OnboardingModal.tsx`
- Create: `frontend/src/components/chat/InputBar.tsx`

- [ ] **Step 1: Create src/components/onboarding/SurveyStep.tsx**

```typescript
interface SurveyStepProps {
  question: string
  options: Array<{ label: string; description: string; value: string }>
  selected: string | null
  onSelect: (value: string) => void
}

export function SurveyStep({ question, options, selected, onSelect }: SurveyStepProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-800 mb-3">{question}</p>
      <div className="space-y-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
              selected === opt.value
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <span className="font-medium">{opt.label}</span>
            {opt.description && (
              <span className="text-gray-500"> — {opt.description}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/onboarding/OnboardingModal.tsx**

```typescript
import { useState } from 'react'
import { SurveyStep } from './SurveyStep'
import { apiFetch } from '../../api/client'
import { useUserStore } from '../../store/user'

interface Props {
  onComplete: () => void
}

const STEPS = [
  {
    question: '如果 AI 作为写作助教，你希望它怎么帮你？',
    key: 'q13',
    options: [
      { label: '严格拆步引导', description: '不直接代写，引导你一步步完成', value: '严格拆步推进，不直接代写' },
      { label: '指出问题方向', description: '告诉你哪里有问题，给 2-3 个修改方向', value: '指出问题并给 2-3 个修改方向' },
      { label: '先给示例改写', description: '先给可用的示例，再解释原因', value: '先给可用改写，再解释原因' },
    ],
  },
  {
    question: '你偏好的反馈详略程度是？',
    key: 'q14',
    options: [
      { label: '简洁', description: '直接点出问题，不展开', value: '简洁' },
      { label: '平衡', description: '重要问题展开，细节一句带过', value: '平衡' },
      { label: '详细', description: '逐条给出原因和修改建议', value: '详细' },
    ],
  },
  {
    question: '你目前的学术写作阶段是？',
    key: 'q9',
    options: [
      { label: '零基础', description: '从未写过学术论文', value: '零基础' },
      { label: '正在写第一篇', description: '有一定了解但不熟练', value: '正在写第一篇' },
      { label: '有投稿/发表经历', description: '', value: '有投稿/发表经历' },
    ],
  },
]

type Answers = Record<string, string>

export function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [loading, setLoading] = useState(false)
  const setProfile = useUserStore((s) => s.setProfile)

  const current = STEPS[step]
  const selected = answers[current.key] ?? null

  const handleNext = async () => {
    if (!selected) return
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
      return
    }
    // Final step — submit
    setLoading(true)
    try {
      await apiFetch('/api/profile/init', {
        method: 'POST',
        body: JSON.stringify({ q13: answers.q13, q14: answers.q14, q9: answers.q9 }),
      })
      setProfile({ hasCompletedOnboarding: true })
      onComplete()
    } catch {
      // Non-critical: mark onboarding complete even if profile save fails
      setProfile({ hasCompletedOnboarding: true })
      onComplete()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-xl">
        <h2 className="text-base font-semibold text-gray-900 mb-5">快速设置（{step + 1}/{STEPS.length}）</h2>

        <SurveyStep
          question={current.question}
          options={current.options}
          selected={selected}
          onSelect={(value) => setAnswers((a) => ({ ...a, [current.key]: value }))}
        />

        <div className="flex items-center justify-between mt-6">
          {/* Step dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-600' : i < step ? 'bg-blue-300' : 'bg-gray-200'}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selected || loading}
            className="px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40"
          >
            {loading ? '保存中…' : step < STEPS.length - 1 ? '下一步' : '开始使用'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/chat/InputBar.tsx**

```typescript
import { useState } from 'react'
import { useSSE } from '../../hooks/useSSE'
import { useUserStore } from '../../store/user'
import { OnboardingModal } from '../onboarding/OnboardingModal'
import { StageIndicator } from './StageIndicator'

export function InputBar() {
  const [value, setValue] = useState('')
  const { send, isStreaming } = useSSE()
  const hasCompletedOnboarding = useUserStore((s) => s.profile.hasCompletedOnboarding)
  const token = useUserStore((s) => s.token)
  const [showOnboarding, setShowOnboarding] = useState(!!token && !hasCompletedOnboarding)

  const handleSubmit = () => {
    if (!value.trim() || isStreaming) return
    send(value.trim())
    setValue('')
  }

  return (
    <>
      <StageIndicator />
      <div className="px-4 py-3 flex gap-2 items-end border-t bg-white">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="描述写作需求，例如：帮我生成关于芯片功耗预测的开题报告大纲"
          disabled={isStreaming}
          rows={2}
          className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSubmit}
          disabled={isStreaming || !value.trim()}
          className="shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isStreaming ? '生成中…' : '发送'}
        </button>
      </div>

      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/onboarding/ src/components/chat/InputBar.tsx
git commit -m "feat(frontend): add InputBar and 3-step onboarding modal"
```

---

## Task 11: Sidebar

**Files:**
- Create: `frontend/src/components/sidebar/LiteraturePanel.tsx`
- Create: `frontend/src/components/sidebar/GapsPanel.tsx`
- Create: `frontend/src/components/sidebar/PanelTabs.tsx`

- [ ] **Step 1: Create src/components/sidebar/LiteraturePanel.tsx**

```typescript
import { useSidebarStore } from '../../store/sidebar'

export function LiteraturePanel() {
  const papers = useSidebarStore((s) => s.papers)

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm px-4 text-center">
        发送消息后，相关文献将显示在此处
      </div>
    )
  }

  return (
    <div className="space-y-2 p-3">
      {papers.map((paper) => (
        <div key={paper.id} className="border rounded-lg p-3 text-sm">
          {/* Relevance score bar */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${Math.round(paper.score * 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 shrink-0">
              {Math.round(paper.score * 100)}%
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">
              {paper.year}
            </span>
            <p className="text-gray-700 line-clamp-2 leading-snug">{paper.title}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create src/components/sidebar/GapsPanel.tsx**

```typescript
import { useSidebarStore } from '../../store/sidebar'
import type { GapItem } from '../../types/events'

const SEVERITY_STYLES: Record<GapItem['severity'], string> = {
  high: 'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-yellow-400',
  low: 'border-l-4 border-l-gray-300',
}

const SEVERITY_ORANGE = 'border-l-4 border-l-orange-400'

export function GapsPanel() {
  const gaps = useSidebarStore((s) => s.gaps)

  if (gaps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm px-4 text-center">
        发送消息后，研究空白将显示在此处
      </div>
    )
  }

  return (
    <div className="space-y-2 p-3">
      {gaps.map((gap) => {
        const isUnfilled = gap.severity === 'high' && gap.addressed_by === 0
        const borderClass = gap.severity === 'high' && gap.addressed_by > 0
          ? SEVERITY_ORANGE
          : SEVERITY_STYLES[gap.severity]

        return (
          <div key={gap.id} className={`border rounded-lg p-3 text-sm ${borderClass}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium ${
                isUnfilled ? 'text-red-600' : gap.severity === 'high' ? 'text-orange-600' : 'text-gray-500'
              }`}>
                {gap.severity.toUpperCase()}
              </span>
              {isUnfilled && (
                <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded">未填补</span>
              )}
            </div>
            {isUnfilled && (
              <p className="text-xs text-blue-600 mb-1.5">
                此空白暂无文献填补，可作为你的研究切入点
              </p>
            )}
            <p className="text-gray-700 leading-snug">{gap.description}</p>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 3: Create src/components/sidebar/PanelTabs.tsx**

```typescript
import { useSidebarStore } from '../../store/sidebar'
import { LiteraturePanel } from './LiteraturePanel'
import { GapsPanel } from './GapsPanel'

export function PanelTabs() {
  const activeTab = useSidebarStore((s) => s.activeTab)
  const setActiveTab = useSidebarStore((s) => s.setActiveTab)
  const paperCount = useSidebarStore((s) => s.papers.length)
  const gapCount = useSidebarStore((s) => s.gaps.length)

  const tabs = [
    { key: 'papers' as const, label: '相关文献', count: paperCount },
    { key: 'gaps' as const, label: '研究空白', count: gapCount },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Tab header */}
      <div className="flex border-b shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}{tab.count > 0 ? `（${tab.count}）` : ''}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'papers' ? <LiteraturePanel /> : <GapsPanel />}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sidebar/
git commit -m "feat(frontend): add sidebar panels (literature, gaps, tabs)"
```

---

## Task 12: Final wiring — ChatPage and prose plugin

**Files:**
- Modify: `frontend/src/pages/ChatPage.tsx`
- Modify: `frontend/tailwind.config.ts` (add typography plugin)

- [ ] **Step 1: Install Tailwind typography plugin**

```bash
npm install -D @tailwindcss/typography
```

- [ ] **Step 2: Update tailwind.config.ts to include typography**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [require('@tailwindcss/typography')],
}

export default config
```

- [ ] **Step 3: Replace src/pages/ChatPage.tsx**

```typescript
import { Shell } from '../components/layout/Shell'

export default function ChatPage() {
  return <Shell />
}
```

- [ ] **Step 4: Start dev server and perform full smoke test**

```bash
npm run dev
```

Checklist (manual):
- [ ] Navigate to http://localhost:5173 → redirected to `/login`
- [ ] Attempt register with `test@gmail.com` → error: "请使用 HUST 校园邮箱"
- [ ] Register with `test@stu.hust.edu.cn` + password ≥8 chars → "注册成功，请登录"
- [ ] Login with same credentials → redirected to `/`
- [ ] OnboardingModal appears on first login
- [ ] Complete 3-step survey → modal closes
- [ ] Click quick-start "帮我生成开题报告大纲" → SSE stream starts
- [ ] StageIndicator shows steps as stream progresses
- [ ] Right sidebar shows literature and gaps
- [ ] AI response streams in real-time with Markdown rendering and cursor
- [ ] After stream completes, InputBar re-enables
- [ ] Refresh page → stays logged in, no onboarding modal
- [ ] Click 退出 → redirected to `/login`

- [ ] **Step 5: Commit**

```bash
git add src/pages/ChatPage.tsx tailwind.config.ts package.json package-lock.json
git commit -m "feat(frontend): wire ChatPage + typography plugin, complete implementation"
```

---

## Task 13: Run all tests

- [ ] **Step 1: Run frontend tests**

```bash
cd inference-engine-v2/frontend
npx vitest run
```

Expected output:
```
✓ src/utils/__tests__/scene.test.ts (5 tests)
✓ src/api/__tests__/sse-buffer.test.ts (4 tests)
✓ src/store/__tests__/stores.test.ts (7 tests)

Test Files  3 passed (3)
Tests       16 passed (16)
```

- [ ] **Step 2: Run backend tests**

```bash
cd inference-engine-v2/backend
python -m pytest tests/test_users.py tests/test_events.py -v
```

Expected: All pass.

- [ ] **Step 3: Final commit**

```bash
cd inference-engine-v2
git add .
git commit -m "chore: inference-engine-v2 frontend complete — auth + SSE chat UI"
```

# ScholarScript Frontend Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild ScholarScript as one unified AI academic research workspace, fixing the production frontend's route/state/API breaks while replacing the fragmented visual system with a single shell, token set, component layer, and page model.

**Architecture:** Keep `inference-engine-v2/frontend` as the only production React app and treat `academic-workbench-fe` as a demo/decommission target. Move every authenticated page into one `WorkspaceShell` with global top bar, sidebar, main content, and optional right panel. API-backed state becomes the source of truth for sessions, artifacts, profile, norms references, and writing analysis; localStorage remains draft cache only.

**Tech Stack:** React 19, TypeScript 6, Vite 8, React Router 7, Zustand 5, Tailwind CSS 3, Vitest, Testing Library, fetch + ReadableStream SSE, lucide-react, @xyflow/react.

---

## Product And Visual Target

Use the supplied design example as the north star: light academic workspace, restrained blue/purple AI accents, persistent left navigation, compact global bar, cards with consistent borders/shadows, and all pages reading as different views of the same research workspace.

Do not create a marketing landing page. The first authenticated screen is the usable research home.

---

## File Map

**Production frontend root**
- `inference-engine-v2/frontend/src/App.tsx` — route every authenticated page through one workspace shell.
- `inference-engine-v2/frontend/src/main.tsx` — remove production `innerHTML` stack rendering.
- `inference-engine-v2/frontend/vite.config.ts` — add `/v1` proxy.
- `inference-engine-v2/frontend/nginx.conf` — add `/v1/` proxy with SSE-safe settings.
- `inference-engine-v2/frontend/tailwind.config.js` — replace scattered scholar colors with semantic workspace tokens.
- `inference-engine-v2/frontend/src/index.css` — define app background, typography, focus ring, transitions.

**Design system**
- Create: `inference-engine-v2/frontend/src/components/ui/Button.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/IconButton.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/Input.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/SearchInput.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/Card.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/Panel.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/Tabs.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/Badge.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/Notice.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/StateBlock.tsx`
- Create: `inference-engine-v2/frontend/src/components/ui/index.ts`

**Unified shell**
- Create: `inference-engine-v2/frontend/src/components/workspace/WorkspaceShell.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/GlobalTopBar.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/GlobalSidebar.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/WorkspaceRightPanel.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/WorkspaceContextBar.tsx`
- Modify or retire: `inference-engine-v2/frontend/src/components/layout/WorkbenchLayout.tsx`
- Modify or retire: `inference-engine-v2/frontend/src/components/layout/Header.tsx`
- Modify or retire: `inference-engine-v2/frontend/src/components/layout/Shell.tsx`

**State and API**
- Modify: `inference-engine-v2/frontend/src/store/layout.ts` — make workbench context typed and persistent enough for route handoff.
- Modify: `inference-engine-v2/frontend/src/store/workspace.ts` — add restore workflow, references, writing analysis state, context binding, reset boundaries.
- Modify: `inference-engine-v2/frontend/src/store/user.ts` — profile load status and backend profile mapping.
- Modify: `inference-engine-v2/frontend/src/api/sessions.ts` — keep session/artifact/profile contracts and add artifact mappers if needed.
- Create: `inference-engine-v2/frontend/src/api/writing.ts` — `POST /v1/writing/analyze`.
- Modify: `inference-engine-v2/frontend/src/api/sse.ts` — add `mode`, `references`, and typed handler.
- Modify: `inference-engine-v2/frontend/src/types/events.ts` — include `references`.
- Modify: `inference-engine-v2/frontend/src/types/workspace.ts` — add context, reference, writing analysis DTOs.

**Pages**
- Modify: `inference-engine-v2/frontend/src/pages/Dashboard.tsx` — become Workspace Home.
- Modify: `inference-engine-v2/frontend/src/pages/Courses.tsx` — become research-space entry cards.
- Modify: `inference-engine-v2/frontend/src/pages/WorkspacePage/WorkspacePage.tsx` — become unified workbench view.
- Modify: `inference-engine-v2/frontend/src/pages/Discovery.tsx` — knowledge graph as workspace view.
- Create: `inference-engine-v2/frontend/src/pages/Library.tsx` — Evidence Library.
- Create: `inference-engine-v2/frontend/src/pages/Writing.tsx` — AI Writing and norms analysis.
- Modify: `inference-engine-v2/frontend/src/pages/LoginPage.tsx` — use the same tokens/components.
- Retire after migration: `inference-engine-v2/frontend/src/pages/Workbench.tsx`
- Retire stale assets: `inference-engine-v2/frontend/src/App.css`, `src/assets/react.svg`, `src/assets/vite.svg`

**Feature components**
- Modify: `inference-engine-v2/frontend/src/features/ai/AIChatInput.tsx`
- Modify: `inference-engine-v2/frontend/src/features/workspace/WorkspaceLayout.tsx`
- Modify: `inference-engine-v2/frontend/src/features/workspace/TopBar.tsx`
- Modify: `inference-engine-v2/frontend/src/features/workspace/LeftSidebar.tsx`
- Modify: `inference-engine-v2/frontend/src/features/workspace/RightKnowledgePanel.tsx`
- Create: `inference-engine-v2/frontend/src/features/references/ReferenceList.tsx`
- Create: `inference-engine-v2/frontend/src/features/references/CitationCard.tsx`
- Create: `inference-engine-v2/frontend/src/features/history/SessionHistoryCard.tsx`
- Create: `inference-engine-v2/frontend/src/features/writing/WritingAnalysisPanel.tsx`
- Create: `inference-engine-v2/frontend/src/features/writing/useWritingAnalysis.ts`

**Tests**
- Create: `inference-engine-v2/frontend/src/components/workspace/__tests__/WorkspaceShell.test.tsx`
- Create: `inference-engine-v2/frontend/src/api/__tests__/writing.test.ts`
- Modify: `inference-engine-v2/frontend/src/api/__tests__/connectSSE.test.ts`
- Modify: `inference-engine-v2/frontend/src/store/__tests__/workspace.test.ts`
- Modify: `inference-engine-v2/frontend/src/pages/WorkspacePage/__tests__/WorkspacePage.test.tsx`
- Create: `inference-engine-v2/frontend/src/pages/__tests__/CoursesToWorkbench.test.tsx`
- Create: `inference-engine-v2/frontend/src/pages/__tests__/Writing.test.tsx`

**Demo frontend**
- Modify: `inference-engine-v2/README.md` — document `frontend` as the only production UI.
- Modify or archive: `inference-engine-v2/academic-workbench-fe/README.md` — mark demo-only and non-production.
- Remove from deployment references if present: `inference-engine-v2/docker-compose.yml`

---

## Task 1: Baseline Guardrails And Current Break Tests

**Files:**
- Modify: `inference-engine-v2/frontend/src/pages/__tests__/CoursesToWorkbench.test.tsx`
- Modify: `inference-engine-v2/frontend/src/pages/WorkspacePage/__tests__/WorkspacePage.test.tsx`
- Modify: `inference-engine-v2/frontend/src/api/__tests__/connectSSE.test.ts`
- Modify: `inference-engine-v2/frontend/src/store/__tests__/workspace.test.ts`

- [ ] **Step 1: Add failing course-to-workbench context test**

Create `src/pages/__tests__/CoursesToWorkbench.test.tsx` with assertions that clicking `载入工作台剖析` navigates to `/workbench` and shows the chosen title in the workbench context bar and AI input prompt.

- [ ] **Step 2: Run the focused test**

Run:
```bash
cd /Users/huaodong/graduationDesign/inference-engine-v2/frontend
npm run test -- src/pages/__tests__/CoursesToWorkbench.test.tsx --run
```
Expected: FAIL because `WorkspacePage` does not consume `workbenchContext`.

- [ ] **Step 3: Add failing full session restore store test**

Extend `src/store/__tests__/workspace.test.ts` to verify that a restore action maps `messages`, `papers`, `gaps`, `final_outline`, document blocks, and current suggestion into workspace state instead of only setting `activeSessionId`.

- [ ] **Step 4: Add failing SSE references test**

Extend `src/api/__tests__/connectSSE.test.ts` with an SSE frame:
```ts
data: {"type":"references","data":[{"id":"r1","title":"GraphRAG in Education","year":2025,"score":0.91}]}
```
Expected: `onReferences` receives the parsed list.

- [ ] **Step 5: Add failing `/v1/writing/analyze` API test**

Create `src/api/__tests__/writing.test.ts` that mocks `fetch` and asserts `analyzeWriting({ text, mode: 'norms' })` posts JSON to `/v1/writing/analyze`.

---

## Task 2: Route All Authenticated Views Through One Workspace Shell

**Files:**
- Modify: `inference-engine-v2/frontend/src/App.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/WorkspaceShell.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/GlobalTopBar.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/GlobalSidebar.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/WorkspaceRightPanel.tsx`
- Create: `inference-engine-v2/frontend/src/components/workspace/WorkspaceContextBar.tsx`

- [ ] **Step 1: Implement `WorkspaceShell` layout**

It must render:
```tsx
<div className="min-h-screen bg-app text-text-primary">
  <GlobalTopBar />
  <div className="grid min-h-[calc(100vh-64px)] grid-cols-[248px_minmax(0,1fr)]">
    <GlobalSidebar />
    <main className="min-w-0">
      <Outlet />
    </main>
  </div>
</div>
```
Then add responsive behavior: desktop sidebar, tablet collapsed sidebar, mobile bottom navigation plus drawer right panel.

- [ ] **Step 2: Rewrite `App.tsx` routes**

All authenticated routes must be children of `WorkspaceShell`:
```tsx
<Route element={<ProtectedRoute><WorkspaceShell /></ProtectedRoute>}>
  <Route index element={<Dashboard />} />
  <Route path="courses" element={<Courses />} />
  <Route path="workbench" element={<WorkspacePage />} />
  <Route path="library" element={<Library />} />
  <Route path="graph" element={<Discovery />} />
  <Route path="writing" element={<Writing />} />
</Route>
```

- [ ] **Step 3: Run route smoke tests**

Run:
```bash
npm run test -- src/components/workspace/__tests__/WorkspaceShell.test.tsx src/pages/__tests__/CoursesToWorkbench.test.tsx --run
```
Expected after implementation: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/components/workspace src/pages/__tests__/CoursesToWorkbench.test.tsx
git commit -m "refactor: unify authenticated workspace shell"
```

---

## Task 3: Establish The Design System Layer

**Files:**
- Modify: `inference-engine-v2/frontend/tailwind.config.js`
- Modify: `inference-engine-v2/frontend/src/index.css`
- Create: `inference-engine-v2/frontend/src/components/ui/*`
- Modify pages and feature components progressively to consume UI components.

- [ ] **Step 1: Replace token source**

In `tailwind.config.js`, define semantic tokens:
```js
colors: {
  app: '#f6f8fc',
  surface: '#ffffff',
  panel: '#f9fbff',
  'panel-strong': '#eef3ff',
  'border-subtle': '#dfe5f2',
  'text-primary': '#172033',
  'text-secondary': '#5d687f',
  'text-muted': '#8a94a8',
  'accent-primary': '#4f46e5',
  'accent-ai': '#7c3aed',
  'accent-success': '#22c55e',
  'accent-warning': '#f59e0b',
  'accent-danger': '#ef4444',
}
```
Keep backwards-compatible `scholar.*` aliases during migration, then remove aliases in the cleanup task.

- [ ] **Step 2: Add radius, shadow, and motion utilities**

Use these names across the app:
- `rounded-control` = `12px`
- `rounded-card` = `18px`
- `rounded-panel` = `24px`
- `rounded-workspace` = `28px`
- `shadow-card` = `0 0 0 1px rgba(15,23,42,0.04), 0 10px 30px rgba(15,23,42,0.08)`

- [ ] **Step 3: Create reusable primitives**

Implement `Button`, `IconButton`, `Input`, `SearchInput`, `Card`, `Panel`, `Tabs`, `Badge`, `Notice`, and `StateBlock`. Every primitive must support `disabled`, `loading` where relevant, `aria-label` for icon-only controls, and consistent focus styles.

- [ ] **Step 4: Replace direct button/card/input styling in one thin slice**

Start with `Courses.tsx` and `AIChatInput.tsx`. Replace raw button/card styles with primitives before scaling to all pages.

- [ ] **Step 5: Run design-system regression tests**

Run:
```bash
npm run test -- src/components/ui src/pages/__tests__/CoursesToWorkbench.test.tsx --run
npm run lint
```
Expected: PASS, no raw empty handlers introduced.

---

## Task 4: Fix Course Context Handoff Into Workbench

**Files:**
- Modify: `inference-engine-v2/frontend/src/store/layout.ts`
- Modify: `inference-engine-v2/frontend/src/pages/Courses.tsx`
- Modify: `inference-engine-v2/frontend/src/pages/WorkspacePage/WorkspacePage.tsx`
- Modify: `inference-engine-v2/frontend/src/features/ai/AIChatInput.tsx`
- Create or modify: `inference-engine-v2/frontend/src/components/workspace/WorkspaceContextBar.tsx`

- [ ] **Step 1: Define `WorkbenchContext`**

Add a typed context:
```ts
export interface WorkbenchContext {
  sourceTitle: string
  actionType: 'outline' | 'review' | 'gap' | 'polish' | 'blank'
  courseTitle?: string
  sourceType?: 'course' | 'paper' | 'lecture' | 'manual'
  createdAt: string
}
```

- [ ] **Step 2: Persist route handoff safely**

When `Courses` calls `setWorkbenchContext`, also persist to `sessionStorage` under `workbench:context:v1`. On workbench mount, hydrate once from store first, then sessionStorage. This prevents losing context on route transition or refresh.

- [ ] **Step 3: Render visible context**

`WorkspaceContextBar` must show course, source title, action type, and a clear action like `继续文献综述` or `分析研究空白`.

- [ ] **Step 4: Feed context into AI input**

`AIChatInput` prompt must include:
```ts
const contextInstruction = workbenchContext
  ? `当前研究上下文：${workbenchContext.courseTitle ?? '未指定课程'} / ${workbenchContext.sourceTitle} / ${workbenchContext.actionType}`
  : '当前研究上下文：空白工作台'
```

- [ ] **Step 5: Run verification**

Run:
```bash
npm run test -- src/pages/__tests__/CoursesToWorkbench.test.tsx --run
```
Expected: PASS, selected course material appears in `/workbench`.

---

## Task 5: Restore Sessions Completely

**Files:**
- Modify: `inference-engine-v2/frontend/src/api/sessions.ts`
- Modify: `inference-engine-v2/frontend/src/store/workspace.ts`
- Modify: `inference-engine-v2/frontend/src/components/workspace/WorkspaceRightPanel.tsx`
- Modify: `inference-engine-v2/frontend/src/pages/WorkspacePage/WorkspacePage.tsx`
- Create: `inference-engine-v2/frontend/src/features/history/SessionHistoryCard.tsx`

- [ ] **Step 1: Add workspace restore action**

Add `restoreSession(sessionId: string): Promise<void>` or an equivalent action that:
1. Sets restore status to loading.
2. Calls `fetchSessionMessages(sessionId)` and `fetchSessionArtifact(sessionId)` in parallel.
3. Maps messages into current chat/history UI.
4. Maps `papers` to `ragPapers`.
5. Maps `gaps` to `ragGaps`.
6. Maps `final_outline` to document blocks or current suggestion.
7. Sets `activeSessionId`.
8. Shows success or error notice.

- [ ] **Step 2: Move restore event handling out of old layout**

`WorkspaceShell` or `WorkspaceRightPanel` should call `restoreSession(sessionId)` directly after navigating to `/workbench`; do not only dispatch a custom event that sets an id.

- [ ] **Step 3: Define artifact-to-document mapping**

If `final_outline` exists, create heading/paragraph blocks:
```ts
[
  { id: `outline-title-${sessionId}`, type: 'heading', content: '恢复的研究提纲' },
  { id: `outline-body-${sessionId}`, type: 'paragraph', content: artifact.final_outline }
]
```
Preserve existing draft only when artifact has no document-like content.

- [ ] **Step 4: Add restore status UI**

`WorkspaceRightPanel` history cards must show loading, error, empty, success notice, and retry. No silent catch.

- [ ] **Step 5: Run restore tests**

Run:
```bash
npm run test -- src/store/__tests__/workspace.test.ts src/pages/WorkspacePage/__tests__/WorkspacePage.test.tsx --run
```
Expected: PASS, full session restore maps all artifact fields.

---

## Task 6: Add References SSE Support And Visible Evidence

**Files:**
- Modify: `inference-engine-v2/frontend/src/types/events.ts`
- Modify: `inference-engine-v2/frontend/src/types/workspace.ts`
- Modify: `inference-engine-v2/frontend/src/api/sse.ts`
- Modify: `inference-engine-v2/frontend/src/store/workspace.ts`
- Create: `inference-engine-v2/frontend/src/features/references/ReferenceList.tsx`
- Create: `inference-engine-v2/frontend/src/features/references/CitationCard.tsx`
- Modify: `inference-engine-v2/frontend/src/features/workspace/RightKnowledgePanel.tsx`
- Modify: `inference-engine-v2/frontend/src/features/ai/AIChatInput.tsx`

- [ ] **Step 1: Extend event types**

Use:
```ts
export type EventType = 'stage' | 'papers' | 'gaps' | 'references' | 'token' | 'done' | 'error'
export interface ReferenceEventItem {
  id: string
  title?: string
  year?: number
  score?: number
  source?: string
  url?: string
  excerpt?: string
}
```

- [ ] **Step 2: Add handler**

`SSEHandlers` gets:
```ts
onReferences?: (references: ReferenceEventItem[]) => void
```
`handleEvent` dispatches `references`.

- [ ] **Step 3: Store and render references**

Add `upsertReferences(references)` in workspace store. `ReferenceList` renders title, year, source, score, excerpt, and empty state.

- [ ] **Step 4: Wire norms/citation mode**

`AIChatInput` must call `connectSSE` with a real mode option:
```ts
connectSSE(prompt, handlers, activeSessionId ?? undefined, { mode: 'norms' })
```
or a compatible signature. Only UI labels with real backend behavior remain enabled.

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/api/__tests__/connectSSE.test.ts src/store/__tests__/workspace.test.ts --run
```
Expected: PASS, `references` frame is visible in right evidence panel.

---

## Task 7: Connect `/v1/writing/analyze`

**Files:**
- Create: `inference-engine-v2/frontend/src/api/writing.ts`
- Create: `inference-engine-v2/frontend/src/features/writing/WritingAnalysisPanel.tsx`
- Create: `inference-engine-v2/frontend/src/features/writing/useWritingAnalysis.ts`
- Create: `inference-engine-v2/frontend/src/pages/Writing.tsx`
- Modify: `inference-engine-v2/frontend/src/features/ai/AIChatInput.tsx`
- Modify: `inference-engine-v2/frontend/vite.config.ts`
- Modify: `inference-engine-v2/frontend/nginx.conf`

- [x] **Step 1: Add API contract**

`src/api/writing.ts`:
```ts
export interface WritingAnalyzeRequest {
  text: string
  mode?: 'norms' | 'citation' | 'structure'
  session_id?: string
}

export interface WritingAnalyzeResponse {
  nodes: Array<{ id: string; label: string; type?: string; score?: number }>
  expanded_context: Array<{ id: string; title: string; excerpt?: string; score?: number }>
  validation: Array<{ id: string; status: 'pass' | 'warning' | 'error'; message: string }>
  references: Array<{ id: string; title: string; year?: number; source?: string; score?: number }>
}
```
Then implement `analyzeWriting(request)` with `apiFetch('/v1/writing/analyze', ...)`.

- [x] **Step 2: Proxy `/v1` in dev and nginx**

Mirror `/api` proxy behavior for `/v1` in both `vite.config.ts` and `nginx.conf`.

- [x] **Step 3: Build UI panel**

`WritingAnalysisPanel` renders four sections: nodes, expanded context, validation, references. Each section has loading, empty, error, and retry states.

- [x] **Step 4: Wire to citation enhancement and AI writing page**

The `引用增强` and `AI 写作` flows call `/v1/writing/analyze` before or after SSE generation and merge `references` into the right evidence panel.

- [x] **Step 5: Run tests**

```bash
npm run test -- src/api/__tests__/writing.test.ts src/pages/__tests__/Writing.test.tsx --run
```
Expected: PASS, UI displays returned nodes, validation, context, and references.

---

## Task 8: Rebuild Pages As Workspace Views

**Files:**
- Modify: `src/pages/Dashboard.tsx`
- Modify: `src/pages/Courses.tsx`
- Modify: `src/pages/WorkspacePage/WorkspacePage.tsx`
- Create: `src/pages/Library.tsx`
- Modify: `src/pages/Discovery.tsx`
- Create: `src/pages/Writing.tsx`
- Modify: `src/features/graph/*`

- [x] **Step 1: Dashboard becomes Workspace Home**

Sections:
- Welcome and current research focus.
- Current tasks.
- Recent courses.
- Recent documents.
- AI suggestions.
- Knowledge graph updates.
- Recent sessions.

No hero marketing layout.

- [x] **Step 2: Courses become research-space entries**

Each course card shows course name, teacher, current research topic, recent literature count, workbench status, graph updates, and a real `进入研究工作台` action.

- [x] **Step 3: Workbench becomes deep state of the same shell**

Work area contains context bar, source/document structure, central writing/analysis area, right AI/evidence/history panel, visible references, visible artifacts, and complete session restore.

- [x] **Step 4: Library becomes Evidence Library**

Add a page for literature list, filters, citation status, AI summary, and current workbench-linked evidence.

- [x] **Step 5: Graph stays inside workspace**

`Discovery` keeps TopBar, Sidebar, page title, filters, graph canvas, and right node detail. Do not use a disconnected full-screen graph experience.

- [x] **Step 6: AI Writing page**

`Writing` contains writing goal, document editor, AI suggestions, references, norms feedback, and `/v1/writing/analyze` result.

- [x] **Step 7: Page visual QA**

Run:
```bash
npm run test -- src/pages --run
npm run build
```
Expected: PASS, no TypeScript errors.

---

## Task 9: Profile, Onboarding, Error Handling, And Fake Feature Cleanup

**Files:**
- Modify: `src/components/onboarding/OnboardingModal.tsx`
- Modify: `src/store/user.ts`
- Modify: `src/hooks/useProfile.ts`
- Modify: `src/main.tsx`
- Modify: all pages/components with `alert`, empty `onClick`, or disabled missing state.
- Modify: `src/components/ErrorBoundary.tsx`

- [x] **Step 1: Fix onboarding save semantics**

`/api/profile/init` failure must keep onboarding incomplete, show an inline error, and allow retry. Only success calls `setProfile({ hasCompletedOnboarding: true })`.

- [x] **Step 2: Load profile on app mount/login**

After authentication, call `fetchProfile()` and map backend profile to user store. Settings page or profile menu must use `patchProfile()`.

- [x] **Step 3: Remove production debug `innerHTML`**

`main.tsx` must not inject `message`, `source`, or `stack` into DOM in production. `ErrorBoundary` shows generic copy, request id when available, and retry.

- [x] **Step 4: Clean fake controls**

Search:
```bash
rg "alert\\(|onClick=\\{undefined\\}|onClick=\\{\\(\\) => \\{\\}\\}|下一阶段接入|no-op|TODO" src
```
Every user-visible fake control must be removed, disabled with honest text, or wired to real behavior.

- [x] **Step 5: Run tests and lint**

```bash
npm run test -- src/components/onboarding src/store src/hooks --run
npm run lint
```
Expected: PASS, no silent onboarding completion and no fake visible handlers.

---

## Task 10: Decommission Or Fence `academic-workbench-fe`

**Files:**
- Modify: `inference-engine-v2/README.md`
- Modify: `inference-engine-v2/academic-workbench-fe/README.md`
- Modify: `inference-engine-v2/docker-compose.yml` if it references the demo frontend.

- [x] **Step 1: Confirm production entry**

Document: production deploy uses `inference-engine-v2/frontend` only.

- [x] **Step 2: Mark demo app non-production**

In `academic-workbench-fe/README.md`, add a warning that it is a design/demo app with no real API integration and must not be used as production deployment.

- [x] **Step 3: Remove deployment references**

If `docker-compose.yml` or deployment docs reference `academic-workbench-fe`, delete or comment those references and route all frontend service builds to `frontend`.

- [x] **Step 4: Run build for production frontend**

```bash
cd /Users/huaodong/graduationDesign/inference-engine-v2/frontend
npm run build
```
Expected: PASS.

---

## Task 11: Responsive And Interaction State Pass

**Files:**
- Modify: `src/components/workspace/WorkspaceShell.tsx`
- Modify: `src/components/workspace/WorkspaceRightPanel.tsx`
- Modify: page components under `src/pages`
- Modify: shared UI primitives under `src/components/ui`

- [x] **Step 1: Desktop layout**

Desktop uses sidebar + main + optional right panel. Fixed page elements use stable dimensions and do not shift when hover/loading text appears.

- [x] **Step 2: Tablet layout**

Sidebar collapses to icon rail or drawer. Right panel becomes an explicit drawer.

- [x] **Step 3: Mobile layout**

Use bottom navigation or drawer nav. Workbench becomes a staged view: context, document, AI/evidence. No fixed three-column width.

- [x] **Step 4: Interaction states**

Every interactive primitive and page action supports hover, focus, active, disabled, loading, error, empty, and success states where applicable.

- [x] **Step 5: Visual verification**

Run dev server:
```bash
npm run dev -- --host 127.0.0.1
```
Open desktop, tablet, and mobile widths. Verify no overlapping text, no clipped buttons, no hidden right-panel controls, and no page that looks like a separate product.

---

## Task 12: Final Cleanup And Acceptance

**Files:**
- Delete after migration: `src/pages/Workbench.tsx` if no logic remains.
- Delete: `src/App.css` if unused.
- Delete: `src/assets/react.svg`, `src/assets/vite.svg` if unused.
- Modify: `README.md` or frontend README for run/build/production entry.

- [x] **Step 1: Remove migrated stale code**

Before deletion, ensure useful logic from old `pages/Workbench.tsx` has moved into `WorkspacePage` or store actions.

- [x] **Step 2: Remove old raw style aliases**

After pages use semantic tokens, remove compatibility `scholar.*` aliases or keep only documented aliases with no direct page usage.

- [x] **Step 3: Run full verification**

```bash
cd /Users/huaodong/graduationDesign/inference-engine-v2/frontend
npm run lint
npm run test -- --run
npm run build
```
Expected: all PASS.

- [ ] **Step 4: Manual acceptance checklist**

Verify:
- From `/courses`, `载入工作台剖析` opens `/workbench` with course/source/action context visible.
- History restore restores messages, artifact, papers, gaps, outline, draft, and AI suggestion.
- `mode=norms` references are visible.
- `/v1/writing/analyze` renders nodes, expanded context, validation, and references.
- Dashboard, Courses, Workbench, Library, Graph, Writing, and Login share one visual language.
- No user-visible fake buttons, `alert`, empty handlers, or silent API failures remain.
- localStorage is draft cache only.
- Production error UI does not expose stack traces.

---

## Execution Order

1. Baseline failing tests.
2. Unified shell and routes.
3. Design system primitives.
4. Course context handoff.
5. Full session restore.
6. References SSE.
7. `/v1/writing/analyze`.
8. Page rebuilds.
9. Profile/onboarding/error/fake cleanup.
10. Demo frontend decommission.
11. Responsive pass.
12. Full verification and cleanup.

This order keeps functionality honest before polishing the surface, but starts the shell and token work early enough that every rewritten page lands in the same product language.

---

## Self-Review

**Spec coverage:** Covers all P0 items from `problem.md`, all P1 state/API issues from `prompt.md`, layout/design-system requirements from `plan.md`, the supplied visual direction, and final acceptance criteria.

**Known dependencies:** The plan assumes backend `/api/sessions/{id}/messages`, `/api/sessions/{id}/artifact`, `/api/profile/me`, `/api/profile/init`, `/api/chat`, and `/v1/writing/analyze` remain available with the audited contracts.

**Scope boundary:** This plan intentionally does not redesign backend contracts except for consuming existing `/v1/writing/analyze` and existing session/profile APIs. If document/version persistence gets new backend endpoints later, add a separate plan for that API contract.

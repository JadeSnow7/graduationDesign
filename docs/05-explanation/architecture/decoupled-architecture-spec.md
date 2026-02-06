# Decoupled Architecture Spec (Client)

Scope: frontend-React (web client)
Owner: project team
Status: draft

## 0. Goal (one sentence)
Keep UI responsive, state predictable, concurrency controlled, and modules independently evolvable as features grow.

## 1. Top-Level Principles

P1. Unidirectional dependency

Allowed dependency direction:

```
UI (Render) → Orchestrator (Coordination) → Scheduler (Timing) → Execution (IO)
                      ↓
                   State (Mutation)
```

Forbidden:
- Execution updates UI directly.
- Scheduler embeds business logic.
- State pulls data or performs IO on its own.

P2. Single responsibility by layer

Layer | Allowed responsibilities | Forbidden
--- | --- | ---
UI / Render | Render from state, raise intent | Business logic, IO, scheduling
State | Define observable state + transitions | IO, thread management
Scheduler | Concurrency, conflicts, cancellation, prioritization | Business state mutation
Execution | Perform domain work and IO | UI control, scheduling decisions

## 2. Layer Definitions (Normative)

### 2.1 Render Layer
Definition:
- Pure rendering: UI = f(State)

Rules:
- UI subscribes to state only.
- UI does not call IO or start tasks.
- UI does not keep a second source of truth for business data.

Checklist (any YES means non-compliant):
- UI contains network calls or task orchestration.
- UI owns long-running timers or cancellations that affect business state.
- Navigation or page changes implicitly drop tasks or data.

### 2.2 State Layer
Definition:
- Single source of truth for domain state.

Responsibilities:
- Define all observable state.
- Accept mutations and describe transitions.
- Produce deterministic state transitions.

Rules:
- State is mutated only through explicit mutation events.
- Mutations are replayable and debuggable.
- State update is decoupled from threads and IO.

Recommended mutation model (TypeScript example):
```
type StateMutation =
  | { type: "taskStarted"; taskId: string }
  | { type: "progressUpdated"; taskId: string; progress: number }
  | { type: "partialResult"; taskId: string; snapshot: unknown }
  | { type: "taskFinished"; taskId: string; result: unknown }
  | { type: "taskCancelled"; taskId: string };
```

### 2.3 Scheduler Layer
Definition:
- Controls when tasks run, never what tasks do.

Responsibilities:
- Task lifecycle management
- Concurrency limit
- Conflict detection
- Cancellation and replacement
- Priority arbitration

Task model:
```
type TaskDescriptor = {
  id: string;
  type: string;
  priority: number;
  conflictKeys: string[];
  cancellationPolicy: "drop-new" | "cancel-old" | "allow";
};
```

Scheduler must not:
- Perform IO or domain logic
- Mutate business state directly
- Track UI lifecycle

### 2.4 Execution Layer
Definition:
- Executes domain logic and IO.

Responsibilities:
- Network calls
- Simulation runs
- File and storage operations
- External tool calls

Rules:
- No UI dependencies
- No scheduling decisions
- Returns results only (no state mutation)

### 2.5 Orchestrator Layer
Definition:
- Coordinates between UI intents, scheduler, execution, and state.

Responsibilities:
- Translate UI intents into scheduled tasks
- Wire task callbacks to state mutations
- Handle cross-cutting concerns (auth checks, logging)
- Manage domain-specific workflow logic

Rules:
- One orchestrator per domain (chat, auth, simulation)
- Orchestrator calls scheduler.schedule(), not raw execution
- Orchestrator applies state mutations on task events
- No direct UI rendering or DOM access

Example structure:
```typescript
// src/domains/chat/orchestrator.ts
export const chatOrchestrator = {
  handleSendIntent(prompt: string): void {
    // 1. Update state: add user message
    // 2. Schedule streaming task
    // 3. Wire callbacks: onPartial → appendToken, onComplete → finishStreaming
  },
  handleStopIntent(): void {
    // Cancel task by conflict key
  },
};
```

## 3. Concurrency and Caching

3.1 Result caching
- UI renders the latest known result first, then progressively replaces it.
- Page switch does not clear tasks.
- New task does not reset previous state unless the scheduler decides.

3.2 Conflict resolution strategies
- Chunked writes for large scans
- Priority write-back for exclusive resources
- Copy-on-write + merge for high contention

3.3 Streaming concurrency (AI Chat specific)

Scenarios:
- User sends new message while previous stream is active → cancel-old policy
- User navigates away during stream → stream continues in background
- Network interruption → onError callback triggers state update
- Model returns reasoning/thinking phase → display as distinct UI state

Rules:
- Stream tasks use `conflictKeys: ['chat-stream']` for mutual exclusion
- Partial results (tokens) are appended incrementally via `onPartial` callback
- Reasoning content is formatted distinctly (e.g., blockquote) before appending
- AbortController is managed by Scheduler, not UI or State

## 4. Side Effects and Persistence

Rules:
- Side effects (localStorage, navigation, device access) happen only after state mutation is confirmed.
- Side effects are executed in a dedicated "effects/sync" module.
- Execution returns data; state decides; effects apply.

## 5. AI-Assisted Development Rules

Process:
Plan -> AI Draft -> Human Review -> AI Refine -> Debug -> Lock

Rules:
- AI must not directly author complex concurrency code.
- AI must not create cross-layer dependencies.
- AI is allowed for templates, pure functions, docs, and tests.

## 6. Project Mapping (Current Structure to Layers)

Render:
- frontend-React/src/pages
- frontend-React/src/components
- frontend-React/src/app

State:
- frontend-React/src/domains (stores/hooks), but only pure state and mutations

Scheduler:
- (Missing) propose frontend-React/src/scheduler or frontend-React/src/domains/*/scheduler

Execution:
- frontend-React/src/api
- frontend-React/src/services
- frontend-React/src/lib (IO clients only)

Data flow guideline (target):
UI intent -> State dispatch -> Scheduler -> Execution -> Result -> State mutation -> UI render

## 7. Compliance Audit (Current Code, No Changes)

Overall status: non-compliant with the decoupled architecture spec.

Major gaps:
- UI performs IO and task orchestration.
- State layer performs IO and embeds scheduling logic.
- Execution layer triggers UI navigation and mutates persistence.
- No centralized scheduler for concurrency and conflict resolution.

Findings (evidence, non-exhaustive):

1) UI directly performs IO (violates Render rules)
- frontend-React/src/pages/ChaptersPage.tsx
- frontend-React/src/pages/ChapterDetailPage.tsx
- frontend-React/src/pages/AssignmentsPage.tsx
- frontend-React/src/pages/AssignmentDetailPage.tsx
- frontend-React/src/pages/QuizzesPage.tsx
- frontend-React/src/pages/QuizDetailPage.tsx
- frontend-React/src/pages/ResourcesPage.tsx
- frontend-React/src/pages/CoursesPage.tsx
- frontend-React/src/pages/ProfilePage.tsx

2) UI directly schedules timers and background tasks
- frontend-React/src/pages/ChapterDetailPage.tsx
- frontend-React/src/pages/QuizDetailPage.tsx

3) State layer performs IO and scheduling (violates State rules)
- frontend-React/src/domains/chat/useChatStore.ts
- frontend-React/src/domains/simulation/useSimStore.ts
- frontend-React/src/domains/simulation/useSimulation.ts
- frontend-React/src/domains/course/useCourse.tsx
- frontend-React/src/domains/auth/useAuth.tsx

4) Execution layer triggers UI navigation or mutates persistence
- frontend-React/src/lib/ai-stream.ts
- frontend-React/src/lib/api-client.ts
- frontend-React/src/services/api/client.ts
- frontend-React/src/api/auth.ts
- frontend-React/src/api/ai.ts
- frontend-React/src/lib/auth-store.ts

5) Multiple implicit state sources (violates single source of truth)
- frontend-React/src/lib/auth-store.ts
- frontend-React/src/domains/auth/useAuth.tsx
- frontend-React/src/domains/course/useCourse.tsx
- frontend-React/src/domains/chat/useChatStore.ts
- frontend-React/src/domains/simulation/useSimStore.ts

6) Scheduler missing; concurrency logic scattered
- frontend-React/src/domains/chat/useChatStore.ts
- frontend-React/src/pages/ChapterDetailPage.tsx
- frontend-React/src/pages/QuizDetailPage.tsx

Partial alignment:
- UI generally renders from state in ChatPage and SimPage (state -> UI).
- Chat history persistence exists (zustand persist) and survives navigation.

## 8. Remediation Outline (No Code Changes)

1) Introduce a Scheduler module:
- Centralize AbortController, intervals, and concurrency limits.
- Provide a task registry for AI chat streaming and heartbeat timers.

2) Move IO out of UI and State:
- UI dispatches intent events only.
- State receives results and updates.
- Execution modules perform IO and return results.

3) Remove UI side effects from Execution:
- Replace window.location redirects with state events.
- Let UI decide navigation on auth changes.

4) Consolidate state sources per domain:
- Auth: one store only (do not mirror in localStorage as a "second state").
- Course: a single domain store or state machine.

5) Define a minimal mutation log:
- Store mutations for replayable debugging.

## 9. Error Handling Strategy

9.1 Error classification
| Type | Example | Handling |
|------|---------|----------|
| Network | 5xx, timeout | Retry with exponential backoff (max 3) |
| Auth | 401, 403 | Clear token, redirect to login |
| Validation | 400, 422 | Display inline error, no retry |
| Business | Custom codes | Domain-specific handling |

9.2 Error flow
```
Execution throws → Scheduler onError → Orchestrator handles → State mutation → UI displays
```

9.3 Rules
- Execution layer throws typed errors (e.g., `AuthorizationError`, `NetworkError`)
- Orchestrator catches and decides: retry, redirect, or display
- UI reads error state and renders appropriate feedback
- Never swallow errors silently

9.4 Optimistic updates
- Apply optimistic state change immediately
- On success: no action needed
- On failure: rollback via compensating mutation
- Use `pendingMutations` queue for tracking

## 10. Testing Guidelines

10.1 Layer testability
| Layer | Test Type | Mock Boundary |
|-------|-----------|---------------|
| Render | Component tests | Mock state store |
| State | Unit tests | Pure functions, no mocks |
| Scheduler | Unit tests | Mock execute functions |
| Orchestrator | Integration tests | Mock scheduler + execution |
| Execution | Integration tests | Mock network (MSW) |

10.2 Test requirements
- Scheduler: 100% branch coverage for conflict resolution
- State mutations: deterministic, snapshot testable
- Orchestrator: test intent → mutation mapping
- UI: test user interaction → intent dispatch

10.3 Test file structure
```
src/
  scheduler/__tests__/TaskRegistry.test.ts
  domains/chat/__tests__/orchestrator.test.ts
  domains/chat/__tests__/mutations.test.ts
```

End of document.

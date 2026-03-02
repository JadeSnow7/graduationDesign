# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Student-centric AI teaching platform (以学生为中心的智能教学平台) built with a microservices architecture. The pilot use case is HUST graduate-level professional English writing. Key capabilities: long-term student learning profile tracking, writing-type-aware analysis (rubric), AI chat/guided learning, GraphRAG knowledge base, and electromagnetic field simulation.

## Repository Layout

`code/` is a git submodule. Run `git submodule update --init --recursive` after cloning.

```
graduationDesign/           ← repo root (docs, scripts, tests)
├── code/                   ← main code submodule (git submodule)
│   ├── frontend/           ← React 19 + Vite (primary web UI)
│   ├── backend/            ← Go 1.24 + Gin + GORM
│   ├── ai_service/         ← Python FastAPI (LLM, GraphRAG)
│   ├── simulation/         ← Python FastAPI (EM field sim)
│   ├── simulation-rs/      ← Rust simulation (WIP)
│   ├── shared/             ← shared TS package (@classplatform/shared)
│   ├── mobile/             ← Expo React Native (optional)
│   ├── desktop-tauri/      ← Tauri desktop wrapper
│   ├── rust-core/          ← Rust core (WIP)
│   └── docker-compose.yml  ← full stack compose file
├── docs/                   ← VitePress documentation site
├── tests/                  ← repo-level consistency tests (vitest)
└── scripts/                ← CI, E2E, training, build scripts
```

## Development Commands

### Start Services

**Full stack (Docker):**
```bash
cd code
cp .env.example .env   # configure on first run
docker-compose up -d --build
```

**Backend only (SQLite, no Docker):**
```bash
cd code/backend
./run_local_sqlite.sh   # sets DB_DSN=sqlite:emfield.db and runs go run ./cmd/server
```

**Frontend:**
```bash
cd code/frontend
npm install
npm run dev             # http://localhost:5173
```

**AI service:**
```bash
cd code/ai_service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

**Simulation service:**
```bash
cd code/simulation
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8002
```

**Documentation site:**
```bash
npm run docs:dev        # from repo root (uses VitePress)
```

### Build

```bash
cd code
make build-frontend     # cd frontend && npm run build
make build-backend      # cd backend && go build -o bin/server ./cmd/server
```

### Test

Run a **single service**:
```bash
# Backend (Go)
cd code/backend
go test ./...                                         # all tests
go test -v ./internal/http/...                        # single package
go test -run TestFuncName ./internal/services/...     # single test

# AI service (Python)
cd code/ai_service
pytest                                                # all
pytest tests/test_session.py -v                       # single file
pytest -k "test_function_name" -v                     # single test

# Frontend (vitest)
cd code/frontend
npm run test                   # unit tests
npm run test:e2e               # Playwright E2E

# Repository consistency
cd tests && npm test
```

**Full pipeline:**
```bash
./scripts/test_pipeline.sh           # all 7 steps
./scripts/test_pipeline.sh --quick   # skip performance benchmarks
./scripts/test_pipeline.sh --skip-e2e
```

**Coverage:**
```bash
cd code/backend && go test -coverprofile=coverage.out ./... && go tool cover -func=coverage.out | tail -1
cd code/ai_service && pytest --cov=app --cov-report=term-missing
```

**Coverage thresholds:** core modules ≥ 60%, critical path pass rate ≥ 95%.

### Lint & Format

```bash
cd code
make lint              # all linters (golangci-lint, eslint, flake8)
make format            # gofmt + goimports, eslint --fix, black + isort
```

Per-service pre-commit checks:
```bash
cd code/frontend && npm run lint && npm run test -- --run
cd code/backend && go test ./...
cd code/ai_service && pytest -q
```

## Architecture

### Backend (Go) — `code/backend/`

Strict three-layer architecture: **handler → service → repository**.

- **`cmd/server/main.go`** — entry point; wires `config`, `db`, `clients`, and `app`
- **`internal/app/`** — top-level wiring: creates router, attaches all middleware and handlers
- **`internal/http/`** — Gin handlers (`handlers_*.go`), router wiring (`router.go` / `router_deps.go`), per-route access control (`course_access.go`, `module_gating.go`)
- **`internal/middleware/`** — auth JWT validation, RBAC permission check, rate-limit, request-ID, request logger
- **`internal/services/`** — business logic; all public APIs defined in `interfaces.go`
- **`internal/repositories/`** — GORM data access
- **`internal/models/`** — GORM model structs
- **`internal/auth/`** — JWT generation/parsing, password hashing
- **`internal/authz/`** — RBAC policy (`rbac.go`)
- **`internal/clients/`** — HTTP clients for external services: AI service (`ai.go`), MinIO (`minio.go`), WeCom (`wecom.go`)
- **`internal/db/`** — GORM connection setup and AutoMigrate
- **`internal/config/`** — env-based config (loaded via `config.Load()`)

All routes are prefixed `/api/v1/`. Auth uses JWT (middleware), RBAC enforced per route. Rate limiting: global IP limiter + dedicated auth/AI limiters. Supports MySQL (prod, via `DB_DSN`) and SQLite (dev).

### Frontend (React) — `code/frontend/src/`

- **`app/`** — BrowserRouter setup and `ProtectedRoute`
- **`domains/`** — domain-specific logic: `auth/`, `ai/`, `chat/`, `chapter/`, `course/`
- **`pages/`** — page-level components (one file per route)
- **`api/`** — typed API client functions per domain (e.g., `api/course.ts`)
- **`components/`** — shared UI components
- **`hooks/`** — shared hooks
- **`layouts/`** — `AppShell` (nav + outlet)
- **`lib/`** — third-party library wrappers/config
- **`services/`** — frontend service layer (non-API business logic)
- **`types/`** — shared TypeScript types
- **`utils/`** — pure utility helpers

State management: **Zustand**. Path alias `@` resolves to `src/`. Shared business types live in `code/shared/` (package `@classplatform/shared`), built before use (`npm run build:shared` from `code/`).

### AI Service (Python) — `code/ai_service/app/`

- **`main.py`** — FastAPI app, all endpoints (chat, guided, writing analysis/polish, GraphRAG CRUD)
- **`model_router.py`** — model family resolution (local / cloud / auto) based on `LLM_ROUTING_POLICY`
- **`session.py`** — per-user conversation session management
- **`student_profile.py`** — learning profile read/write (called from guided mode)
- **`weak_point_detector.py`** — detects weak points from session history
- **`tools.py`** — tool definitions for LLM function-calling
- **`writing_prompts.py`** / **`writing_concepts.py`** — writing rubric prompts and concept definitions
- **`skills/`** — pluggable skill modules invoked by the AI agent
- **`graphrag/`** — GraphRAG index, hybrid retrieval, embedding, vector store, updater

The service supports **multi-tier model routing**: local LLM → cloud LLM fallback. Authentication with backend uses a shared token (`AI_GATEWAY_SHARED_TOKEN`).

### Simulation Service (Python) — `code/simulation/app/`

FastAPI service providing EM field numerical simulation APIs:
- **`routes/electrostatics.py`** — point charges, Laplace, Gauss
- **`routes/magnetostatics.py`** — Biot-Savart, Ampere
- **`routes/wave.py`** — 1D FDTD, Fresnel
- **`routes/numerical.py`** — integration, differentiation, vector ops

### Infrastructure

| Service | Port | Notes |
|---------|------|-------|
| Frontend | 5173 | Vite dev server |
| Backend | 8080 | Go Gin; healthcheck: `GET /health` |
| AI Service | 8001 | FastAPI; healthcheck: `GET /healthz` |
| Simulation | 8002 | FastAPI; healthcheck: `GET /healthz` |
| MySQL | 3306 | prod DB |
| MinIO | 9000/9001 | object storage for uploads |

## Key Conventions

### Commits
Follow [Conventional Commits](https://conventionalcommits.org/): `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`.

### API Contract
The single source of truth for the backend API is `docs/04-reference/api/openapi.yaml`. Any `/api/v1/*` semantic change must update OpenAPI and the corresponding docs page under `docs/04-reference/api/`.

### Default Accounts (seed data)
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Teacher | teacher | teacher123 |
| Student | student | student123 |

### Environment Config
Copy `code/.env.example` to `code/.env`. Key vars: `DB_DSN`, `JWT_SECRET` / `BACKEND_JWT_SECRET`, `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`, `GRAPH_RAG_ENABLED`, `AI_GATEWAY_SHARED_TOKEN`.

### Documentation Site (Makefile targets at repo root)
```bash
make docs:bootstrap   # bootstrap docx validator
make docs:validate    # validate docx files
make docs:build       # build docx + PDFs
```

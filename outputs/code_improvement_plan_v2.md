# Code Improvement Plan (V2)

**Plan Date**: 2026-02-05
**Based On**: Audit Report V2 and Recent Fixes

---

## 📊 Status Update
- **CI/CD**: Workflows exist (Verified).
- **Backend Build**: Fixed (Verified).
- **Dependency Management**: Required `go mod tidy`.

---

## 🟢 Phase 1: Stabilization (Immediate - 1 Week)

### 1. Fix Broken Tests
**Priority**: Critical
- `go test` currently fails in `handlers_ai_test.go`, `handlers_assignment_test.go` (logic errors), `handlers_chapter_test.go`, and `handlers_quiz_test.go`.
- **Action**: Debug and fix these specific test failures to get a "Green Build".

### 2. Dependency Locking
**Priority**: High
- **Backend**: Run `go mod tidy` and commit `go.mod` + `go.sum`.
- **AI Service**: Generate `poetry.lock` or `requirements.lock`.
- **Frontends**: Ensure `package-lock.json` is committed and up to date.

### 3. CI/CD Enforcment
**Priority**: High
- The CI pipelines exist but likely failed on recent commits.
- **Action**: Fix the codebase until the existing `CI` workflow passes.

---

## 🟡 Phase 2: Coverage Expansion (1 Month)

### 1. Service Layer Testing
- Current tests focus on HTTP handlers.
- **Action**: Create `services/course_service_test.go`, `services/quiz_service_test.go`, etc.
- **Goal**: Test business logic (e.g., "calculate quiz score") independently of HTTP context.

### 2. Frontend Critical Path Tests
- **Action**: Add E2E tests (Cypress/Playwright) for:
    - Login Flow
    - Quiz Taking Flow
    - Assignment Submission

---

## 🔵 Phase 3: Release Optimization (Ongoing)

### 1. Release Workflow Validation
- The `release.yml` workflow builds both binaries and Docker images.
- **Action**: Trigger a dry-run release (e.g., tag `v0.0.1-rc1`) to ensure the artifact generation works as expected.

### 2. Documentation
- Update `README.md` to reflect the requirement of `gorm.io/datatypes` and correct build instructions.

# Documentation Improvement Plan

**Plan Date**: 2026-02-05
**Priority**: Medium

---

## 🟢 Phase 1: Critical Gaps (1 Week)

### 1. Complete Stub Documents
*   **Target Files**:
    - `docs/deployment/backup-recovery.md`
    - `docs/deployment/docker-deployment.md`
    - `docs/deployment/monitoring.md`
    - `docs/deployment/production-deployment.md`
    - `docs/deployment/troubleshooting.md`
*   **Action**: Each should have at least:
    - Overview section
    - Step-by-step instructions
    - Troubleshooting tips

### 2. Document CI/CD Workflows
*   **Target File**: `docs/ci-cd-setup.md`
*   **Content to Add**:
    - Explanation of `ci.yml` (what it tests, how to trigger)
    - Explanation of `release.yml` (tagging, artifact generation, Docker image push)
    - How to check build status

---

## 🟡 Phase 2: Enhancements (2 Weeks)

### 1. Add Dependency Management Guide
*   **New File**: `docs/development/dependency-management.md`
*   **Content**:
    - Go: `go get`, `go mod tidy`
    - Python: `pip install`, `poetry` (if migrated)
    - Frontend: `npm install`, workspace usage

### 2. Integrate Swagger UI
*   **Action**: Add a route in backend to serve Swagger UI
*   **Doc Update**: Add link in `docs/api/README.md`

---

## 🔵 Phase 3: Polish (Ongoing)

### 1. Verify All Internal Links
*   Use a markdown link checker to ensure all `[text](link)` references are valid.

### 2. Standardize Language
*   Decide on primary language (Chinese or English for technical terms).
*   Ensure consistency across all docs.

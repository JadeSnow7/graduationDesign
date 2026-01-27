# Shared Types & SDK Structure (Draft)

This document defines a draft structure for shared types and SDK layers to keep
Web and Mobile clients aligned with a single API contract.

---

## Goals

- Single source of truth for API types
- Reusable endpoint wrappers
- Platform-agnostic HTTP layer

---

## Proposed layout

```
code/shared/
  README.md
  types/
    index.ts
    response.ts
    auth.ts
    course.ts
    chapter.ts
    assignment.ts
    quiz.ts
    resource.ts
    ai.ts
    student-centric.ts
  sdk/
    README.md
    client.ts
    endpoints/
      auth.ts
      course.ts
      chapter.ts
      assignment.ts
      quiz.ts
      resource.ts
      ai.ts
      writing.ts
      stats.ts
```

---

## Adoption plan (suggested)

1. Keep the current app-specific clients running.
2. Introduce shared `types/*` and slowly migrate imports.
3. Move endpoint wrappers into `sdk/endpoints/*`.
4. Replace per-app API wrappers with shared SDK.

---

## Notes

- `student-centric.ts` already exists; new types should extend, not replace it.
- OpenAPI should be the authoritative source for `types/*`.


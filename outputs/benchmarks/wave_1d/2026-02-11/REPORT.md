# wave_1d Benchmark Report

- Generated: 2026-02-11T23:32:30
- Endpoint source: `/tmp/wave_endpoint.json`
- Kernel source: `/tmp/wave_kernel.json`

## Endpoint Scope

| Profile | Python p95 (ms) | Rust p95 (ms) | p95 reduction | p95 speedup |
|---|---:|---:|---:|---:|
| A | 88.915 | 93.377 | -5.02% | 0.95x |
| B | 112.397 | 98.491 | 12.37% | 1.14x |

## Kernel Scope

| Profile | Python p95 (ms) | Rust p95 (ms) | p95 reduction | p95 speedup |
|---|---:|---:|---:|---:|
| A | 5.798 | 0.073 | 98.75% | 79.69x |
| B | 20.406 | 0.568 | 97.22% | 35.91x |

## Correctness

| Profile | max_abs_diff | l2_rel_error | pass |
|---|---:|---:|---:|
| A | 0.00000000 | 0.00000000 | yes |
| B | 0.00000000 | 0.00000000 | yes |

## Acceptance

- Correctness threshold pass: `True`
- Any profile p95 reduction >= 30%: `True`

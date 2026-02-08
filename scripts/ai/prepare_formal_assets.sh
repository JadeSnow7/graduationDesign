#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

python3 "$ROOT_DIR/code/ai_service/training/build_formal_assets.py"

python3 "$ROOT_DIR/code/ai_service/training/validate_benchmark.py" \
  --input "$ROOT_DIR/data/training/eval/benchmark_formal_v1.jsonl" \
  --min-count 60 \
  --strict-meta

python3 "$ROOT_DIR/code/ai_service/training/validate_benchmark.py" \
  --input "$ROOT_DIR/data/training/eval/tool_benchmark_pilot_v1.jsonl" \
  --min-count 15 \
  --strict-meta

python3 "$ROOT_DIR/code/ai_service/training/validate_benchmark.py" \
  --input "$ROOT_DIR/data/training/eval/rag_benchmark_pilot_v1.jsonl" \
  --min-count 15 \
  --strict-meta

echo "[OK] formal assets prepared and validated"

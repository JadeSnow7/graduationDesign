#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <batch> [--stage <stage>] [--sync-docs]"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BATCH="$1"
shift
STAGE="all"
SYNC_DOCS=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --stage)
      STAGE="$2"
      shift 2
      ;;
    --sync-docs)
      SYNC_DOCS=1
      shift
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

python3 "$ROOT_DIR/code/ai_service/training/summarize_formal_batch.py" \
  --batch "$BATCH" \
  --stage "$STAGE"

SUMMARY_JSON="$ROOT_DIR/outputs/training_sync/$BATCH/acceptance_summary.json"
CAN_SYNC_DOCS="$(python3 - "$SUMMARY_JSON" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as f:
    data = json.load(f)
print("1" if data.get("can_sync_docs") else "0")
PY
)"

if [[ "$SYNC_DOCS" -eq 1 ]]; then
  if [[ "$CAN_SYNC_DOCS" == "1" ]]; then
    DOCS_BATCH="$BATCH" bash "$ROOT_DIR/scripts/docs/build_docx.sh" --batch "$BATCH"
    DOCS_BATCH="$BATCH" bash "$ROOT_DIR/scripts/docs/build_pdfs.sh" --batch "$BATCH"
    DOCS_BATCH="$BATCH" bash "$ROOT_DIR/scripts/docs/check_consistency.sh" --batch "$BATCH"
    DOCS_BATCH="$BATCH" bash "$ROOT_DIR/scripts/docs/sync_report.sh" --batch "$BATCH"
    echo "[OK] docs sync completed for batch: $BATCH"
  else
    echo "[INFO] docs sync skipped: phase gate not met for batch $BATCH"
  fi
fi

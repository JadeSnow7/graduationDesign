#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BATCH="${DOCS_BATCH:-$(date +%F)-docs-sync}"
ALLOW_FALLBACK=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --batch)
      BATCH="$2"
      shift 2
      ;;
    --allow-fallback)
      ALLOW_FALLBACK=1
      shift
      ;;
    *)
      echo "[ERROR] Unknown argument: $1"
      echo "Usage: $0 [--batch <batch>] [--allow-fallback]"
      exit 1
      ;;
  esac
done

OUT_DIR="$ROOT_DIR/outputs/training_sync/$BATCH"
LOG_DIR="$OUT_DIR/build_logs"
mkdir -p "$LOG_DIR"

OFFICIAL_VALIDATOR="/Users/huaodong/.cc-switch/skills/docx/scripts/office/validate.py"
VENV_PY="$ROOT_DIR/.venv-docx/bin/python"

DOCX_FILES=(
  "$ROOT_DIR/academic/thesis/proposal/开题报告.docx"
  "$ROOT_DIR/academic/thesis/src/毕业论文.docx"
  "$ROOT_DIR/hust-undergrad-thesis/毕业论文.docx"
)

if [[ ! -f "$OFFICIAL_VALIDATOR" ]]; then
  echo "[ERROR] Official validator not found: $OFFICIAL_VALIDATOR"
  exit 1
fi

if [[ ! -x "$VENV_PY" ]]; then
  echo "[ERROR] Missing docx validator runtime: $VENV_PY"
  echo "[HINT] Run make docs:bootstrap"
  exit 1
fi

declare -A STATUS

official_validate() {
  local file="$1"
  local log_file="$2"
  if "$VENV_PY" "$OFFICIAL_VALIDATOR" "$file" >"$log_file" 2>&1; then
    return 0
  fi
  return 1
}

fallback_validate() {
  local file="$1"
  local log_file="$2"
  "$VENV_PY" - "$file" >"$log_file" 2>&1 <<'PY'
import sys
import zipfile
import xml.etree.ElementTree as ET

path = sys.argv[1]
with zipfile.ZipFile(path, "r") as zf:
    bad = zf.testzip()
    if bad:
        raise SystemExit(f"zip corruption: {bad}")
    names = set(zf.namelist())
    for required in ("[Content_Types].xml", "word/document.xml"):
        if required not in names:
            raise SystemExit(f"missing required entry: {required}")
    for name in names:
        if name.endswith('.xml'):
            ET.fromstring(zf.read(name))
print("fallback_ok")
PY
}

overall_fail=0
degraded=0

for file in "${DOCX_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    STATUS["$file"]="FAIL"
    overall_fail=1
    continue
  fi

  base_name="$(basename "$file" .docx)"
  official_log="$LOG_DIR/validate_${base_name}.official.log"

  if official_validate "$file" "$official_log"; then
    STATUS["$file"]="PASS"
    continue
  fi

  if [[ "$ALLOW_FALLBACK" -eq 1 ]]; then
    fallback_log="$LOG_DIR/validate_${base_name}.fallback.log"
    if fallback_validate "$file" "$fallback_log"; then
      STATUS["$file"]="DEGRADED"
      degraded=1
    else
      STATUS["$file"]="FAIL"
      overall_fail=1
    fi
  else
    STATUS["$file"]="FAIL"
    overall_fail=1
  fi
done

report="$OUT_DIR/docx_validation.md"
{
  echo "# DOCX 校验报告"
  echo
  echo "- 批次: $BATCH"
  echo "- 官方校验器: \\`$OFFICIAL_VALIDATOR\\`"
  echo "- 规则: 默认必须通过官方校验；仅显式 \\`--allow-fallback\\` 时可降级。"
  echo
  echo "| 文件 | 结果 | 说明 |"
  echo "|---|---|---|"
  for file in "${DOCX_FILES[@]}"; do
    status="${STATUS[$file]:-FAIL}"
    case "$status" in
      PASS)
        note="官方校验通过"
        ;;
      DEGRADED)
        note="官方校验失败，fallback 通过（CI 应失败）"
        ;;
      *)
        note="官方/降级校验未通过或文件缺失"
        ;;
    esac
    echo "| $file | $status | $note |"
  done
  echo
  if [[ "$overall_fail" -eq 1 ]]; then
    echo "总体: **FAIL**"
  elif [[ "$degraded" -eq 1 ]]; then
    echo "总体: **DEGRADED**"
  else
    echo "总体: **PASS**"
  fi
} >"$report"

if [[ "$overall_fail" -eq 1 ]]; then
  echo "[ERROR] docx validation failed"
  exit 1
fi
if [[ "$degraded" -eq 1 ]]; then
  echo "[ERROR] docx validation degraded (fallback used)"
  exit 2
fi

echo "[INFO] docx validation passed: $report"

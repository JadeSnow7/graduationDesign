#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BATCH="${DOCS_BATCH:-$(date +%F)-docs-sync}"
BUDGET_FILE="$ROOT_DIR/config/docs_warning_budget.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --batch)
      BATCH="$2"
      shift 2
      ;;
    *)
      echo "[ERROR] Unknown argument: $1"
      echo "Usage: $0 [--batch <batch>]"
      exit 1
      ;;
  esac
done

OUT_DIR="$ROOT_DIR/outputs/training_sync/$BATCH"
LOG_DIR="$OUT_DIR/build_logs"
mkdir -p "$LOG_DIR"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "[ERROR] pandoc is required"
  exit 1
fi
if ! command -v xelatex >/dev/null 2>&1; then
  echo "[ERROR] xelatex is required"
  exit 1
fi
if ! command -v biber >/dev/null 2>&1; then
  echo "[ERROR] biber is required"
  exit 1
fi

proposal_md="$ROOT_DIR/academic/thesis/proposal/开题报告.md"
proposal_pdf="$ROOT_DIR/academic/thesis/proposal/开题报告.pdf"
proposal_log="$LOG_DIR/proposal_pdf_build.log"

pandoc "$proposal_md" -o "$proposal_pdf" --pdf-engine=xelatex >"$proposal_log" 2>&1

compile_latex_chain() {
  local workdir="$1"
  local log_file="$2"
  (
    cd "$workdir"
    xelatex -interaction=nonstopmode -halt-on-error main.tex
    biber main
    xelatex -interaction=nonstopmode -halt-on-error main.tex
    xelatex -interaction=nonstopmode -halt-on-error main.tex
  ) >"$log_file" 2>&1
}

academic_log="$LOG_DIR/academic_thesis_latex.log"
hust_log="$LOG_DIR/hust_thesis_latex.log"

compile_latex_chain "$ROOT_DIR/academic/thesis/src" "$academic_log"
compile_latex_chain "$ROOT_DIR/hust-undergrad-thesis" "$hust_log"

check_stheiti() {
  local log_file="$1"
  if rg -n "STHeiti" "$log_file" >/dev/null 2>&1; then
    echo "[ERROR] STHeiti missing-font issue found in: $log_file"
    exit 1
  fi
}

check_stheiti "$academic_log"
check_stheiti "$hust_log"

count_layout_warnings() {
  local log_file="$1"
  rg -n "Overfull \\\\hbox|Underfull \\\\hbox" "$log_file" | wc -l | tr -d ' '
}

academic_layout_count="$(count_layout_warnings "$academic_log")"
hust_layout_count="$(count_layout_warnings "$hust_log")"

if [[ ! -f "$BUDGET_FILE" ]]; then
  echo "[ERROR] Missing warning budget config: $BUDGET_FILE"
  exit 1
fi

python3 - "$BUDGET_FILE" "$academic_layout_count" "$hust_layout_count" <<'PY'
import json
import sys

budget_file, academic_count_s, hust_count_s = sys.argv[1:4]
academic_count = int(academic_count_s)
hust_count = int(hust_count_s)

cfg = json.load(open(budget_file, encoding="utf-8"))
layout = cfg.get("layout_warning_budget", {})
enforce = bool(layout.get("enforce", True))
baseline = layout.get("baseline", {})
base_academic = baseline.get("academic_pdf")
base_hust = baseline.get("hust_pdf")

if enforce:
    if base_academic is not None and academic_count > int(base_academic):
        raise SystemExit(f"academic layout warnings {academic_count} exceed baseline {base_academic}")
    if base_hust is not None and hust_count > int(base_hust):
        raise SystemExit(f"hust layout warnings {hust_count} exceed baseline {base_hust}")

print(f"layout_warning_count academic={academic_count} hust={hust_count}")
PY

echo "[INFO] pdf build completed"
echo "[INFO] proposal_pdf=$proposal_pdf"
echo "[INFO] academic_pdf=$ROOT_DIR/academic/thesis/src/main.pdf"
echo "[INFO] hust_pdf=$ROOT_DIR/hust-undergrad-thesis/main.pdf"

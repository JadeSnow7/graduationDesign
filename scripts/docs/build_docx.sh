#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BATCH="${DOCS_BATCH:-$(date +%F)-docs-sync}"

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

sanitize_math_backticks() {
  local src="$1"
  local dst="$2"
  perl -pe 's/\$`([^`\n]+)`\$/\$$1\$/g' "$src" >"$dst"
}

build_one() {
  local src="$1"
  local out_docx="$2"
  local ref_doc="$3"
  local tag="$4"

  if [[ ! -f "$src" ]]; then
    echo "[ERROR] Missing source markdown: $src"
    exit 1
  fi
  if [[ ! -f "$ref_doc" ]]; then
    echo "[ERROR] Missing reference doc: $ref_doc"
    exit 1
  fi

  local tmp_md
  tmp_md="$(mktemp)"
  local log_file="$LOG_DIR/pandoc_${tag}.log"

  sanitize_math_backticks "$src" "$tmp_md"

  if ! pandoc "$tmp_md" -o "$out_docx" --reference-doc="$ref_doc" >"$log_file" 2>&1; then
    echo "[ERROR] pandoc failed for $tag, see $log_file"
    rm -f "$tmp_md"
    exit 1
  fi

  if rg -n "Could not convert TeX math" "$log_file" >/dev/null 2>&1; then
    echo "[ERROR] TeX conversion warning detected for $tag, see $log_file"
    rm -f "$tmp_md"
    exit 1
  fi

  rm -f "$tmp_md"
  echo "[INFO] docx built: $out_docx"
}

proposal_src="$ROOT_DIR/academic/thesis/proposal/开题报告.md"
proposal_out="$ROOT_DIR/academic/thesis/proposal/开题报告.docx"
proposal_ref="$ROOT_DIR/academic/thesis/proposal/开题报告.docx.bak-20260208"
[[ -f "$proposal_ref" ]] || proposal_ref="$proposal_out"

academic_src="$ROOT_DIR/academic/thesis/src/docx_source.md"
academic_out="$ROOT_DIR/academic/thesis/src/毕业论文.docx"
academic_ref="$ROOT_DIR/academic/thesis/src/毕业论文.docx.bak-20260208"
[[ -f "$academic_ref" ]] || academic_ref="$academic_out"

hust_src="$ROOT_DIR/hust-undergrad-thesis/docx_source.md"
hust_out="$ROOT_DIR/hust-undergrad-thesis/毕业论文.docx"
hust_ref="$ROOT_DIR/hust-undergrad-thesis/毕业论文.docx.bak-20260208"
[[ -f "$hust_ref" ]] || hust_ref="$hust_out"

build_one "$proposal_src" "$proposal_out" "$proposal_ref" "proposal"
build_one "$academic_src" "$academic_out" "$academic_ref" "academic_thesis"
build_one "$hust_src" "$hust_out" "$hust_ref" "hust_thesis"

echo "[INFO] docx build completed"

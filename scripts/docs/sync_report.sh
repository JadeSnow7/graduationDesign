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
mkdir -p "$OUT_DIR" "$LOG_DIR"

now="$(date '+%Y-%m-%d %H:%M:%S %Z')"

count_warn() {
  local file="$1"
  if [[ -f "$file" ]]; then
    local count
    count="$(rg -n "Warning|warning|Overfull|Underfull|LaTeX Warning|Package .* Warning|Undefined" "$file" || true)"
    if [[ -z "$count" ]]; then
      echo 0
    else
      printf "%s\n" "$count" | wc -l | tr -d ' '
    fi
  else
    echo 0
  fi
}

proposal_warn="$(count_warn "$LOG_DIR/proposal_pdf_build.log")"
academic_warn="$(count_warn "$LOG_DIR/academic_thesis_latex.log")"
hust_warn="$(count_warn "$LOG_DIR/hust_thesis_latex.log")"

cat > "$OUT_DIR/change_summary_one_page.md" <<EOM
# 文档同步变更说明（一页）

## 批次信息
- 批次：$BATCH
- 生成时间：$now

## 本次产线动作
- 执行 docx 官方校验（默认强制）
- 构建 3 份 docx（开题 + 两套论文）
- 构建 3 份 PDF（开题 + 两套论文）
- 执行核心指标一致性检查（md/tex/docx）

## 关键口径
- 首次 all（n=5）：0.9167 / 0.8000 / 1.0000 / 0.0000
- 随机三组均值（每组 n=6）：0.7333 / 0.7778 / 0.8333 / 0.0000
- 所有新增结论均标注“阶段性验证”，不作为最终正式实验结论。
EOM

cat > "$OUT_DIR/delivery_report.md" <<EOM
# 文档产线交付报告

生成时间：$now
批次：$BATCH

## 产物
- /Users/huaodong/graduationDesign/academic/thesis/proposal/开题报告.docx
- /Users/huaodong/graduationDesign/academic/thesis/src/毕业论文.docx
- /Users/huaodong/graduationDesign/hust-undergrad-thesis/毕业论文.docx
- /Users/huaodong/graduationDesign/academic/thesis/proposal/开题报告.pdf
- /Users/huaodong/graduationDesign/academic/thesis/src/main.pdf
- /Users/huaodong/graduationDesign/hust-undergrad-thesis/main.pdf

## 校验与一致性
- docx 校验报告：$OUT_DIR/docx_validation.md
- 一致性检查：$OUT_DIR/consistency_check.md

## 告警统计
- proposal_pdf_build.log: $proposal_warn
- academic_thesis_latex.log: $academic_warn
- hust_thesis_latex.log: $hust_warn

## 日志目录
- $LOG_DIR
EOM

echo "[INFO] sync report generated under: $OUT_DIR"

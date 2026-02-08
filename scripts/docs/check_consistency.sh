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
DOCX_WORK_DIR="$OUT_DIR/docx_work"
mkdir -p "$DOCX_WORK_DIR"

if ! command -v pandoc >/dev/null 2>&1; then
  echo "[ERROR] pandoc is required"
  exit 1
fi

pandoc -f docx "$ROOT_DIR/academic/thesis/proposal/开题报告.docx" -t gfm -o "$DOCX_WORK_DIR/proposal_final_extracted.md"
pandoc -f docx "$ROOT_DIR/academic/thesis/src/毕业论文.docx" -t gfm -o "$DOCX_WORK_DIR/academic_thesis_final_extracted.md"
pandoc -f docx "$ROOT_DIR/hust-undergrad-thesis/毕业论文.docx" -t gfm -o "$DOCX_WORK_DIR/hust_thesis_final_extracted.md"

python3 - "$ROOT_DIR" "$OUT_DIR" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1])
out_dir = Path(sys.argv[2])

metric_tokens = [
    "0.9167",
    "0.8000",
    "1.0000",
    "0.0000",
    "0.7333",
    "0.7778",
    "0.8333",
    "n=5",
    "n=6",
]

stage_tokens = ["阶段性验证", "阶段性训练结果", "阶段性"]
finality_tokens = ["正式实验", "正式实验结论", "正式最终效果结论", "不作为", "不可替代", "局限"]

checks = [
    {
        "path": root / "academic/thesis/proposal/开题报告.md",
        "must_have_metrics": True,
        "must_have_stage": True,
        "must_have_finality": True,
    },
    {
        "path": root / "academic/thesis/proposal/opening-report.md",
        "must_have_metrics": True,
        "must_have_stage": True,
        "must_have_finality": True,
    },
    {
        "path": root / "academic/thesis/src/chapters/chapter2.tex",
        "must_have_metrics": True,
        "must_have_stage": True,
        "must_have_finality": True,
    },
    {
        "path": root / "hust-undergrad-thesis/chapters/chapter5.tex",
        "must_have_metrics": True,
        "must_have_stage": True,
        "must_have_finality": True,
    },
    {
        "path": root / "academic/thesis/src/chapters/conclusion.tex",
        "must_have_metrics": False,
        "must_have_stage": True,
        "must_have_finality": True,
    },
    {
        "path": root / "hust-undergrad-thesis/chapters/conclusion.tex",
        "must_have_metrics": False,
        "must_have_stage": True,
        "must_have_finality": True,
    },
    {
        "path": out_dir / "docx_work/proposal_final_extracted.md",
        "must_have_metrics": True,
        "must_have_stage": True,
        "must_have_finality": True,
    },
    {
        "path": out_dir / "docx_work/academic_thesis_final_extracted.md",
        "must_have_metrics": True,
        "must_have_stage": True,
        "must_have_finality": True,
    },
    {
        "path": out_dir / "docx_work/hust_thesis_final_extracted.md",
        "must_have_metrics": True,
        "must_have_stage": True,
        "must_have_finality": True,
    },
]

rows = [
    "# 文档一致性检查",
    "",
    "| 文件 | 结果 | 缺失项 |",
    "|---|---|---|",
]
overall = True

for item in checks:
    f = item["path"]
    if not f.exists():
        rows.append(f"| {f} | FAIL | 文件不存在 |")
        overall = False
        continue

    text = f.read_text(encoding="utf-8")
    missing = []

    if item["must_have_metrics"]:
        missing.extend([t for t in metric_tokens if t not in text])

    if item["must_have_stage"] and not any(t in text for t in stage_tokens):
        missing.append("阶段性定位语句")

    if item["must_have_finality"] and not any(t in text for t in finality_tokens):
        missing.append("非最终结论/正式实验说明")

    ok = not missing
    overall = overall and ok
    rows.append(f"| {f} | {'PASS' if ok else 'FAIL'} | {'、'.join(missing) if missing else '-'} |")

rows.append("")
rows.append(f"总体: **{'PASS' if overall else 'FAIL'}**")
report = out_dir / "consistency_check.md"
report.write_text("\n".join(rows), encoding="utf-8")
print(report)

if not overall:
    raise SystemExit(1)
PY

echo "[INFO] consistency check passed"

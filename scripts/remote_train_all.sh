#!/usr/bin/env bash
# 远程服务器训练执行脚本
# 使用方法: bash scripts/remote_train_all.sh [--project-root <path>] [--non-interactive] [--yes] [--skip-sample]

set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  bash scripts/remote_train_all.sh [options]

Options:
  --project-root <path>  Set project root (CLI overrides TRAIN_SYNC_PROJECT_ROOT)
  --non-interactive      Run without prompts
  --yes                  Assume "yes" for confirmation prompts (implies --non-interactive)
  --skip-sample          Skip sample stage and proceed to style/writing/all
  -h, --help             Show this help message

Environment variables:
  TRAIN_SYNC_PROJECT_ROOT   Project root path (default: current working directory)
  TRAIN_SYNC_NON_INTERACTIVE 1/0, true/false, yes/no (default: 0, auto=1 when no TTY)
  TRAIN_SYNC_ASSUME_YES     1/0, true/false, yes/no (default: 0)
  TRAIN_SYNC_SKIP_SAMPLE    1/0, true/false, yes/no (default: 0)
EOF
}

to_bool() {
    case "${1:-0}" in
      1|true|TRUE|yes|YES|y|Y|on|ON) echo 1 ;;
      0|false|FALSE|no|NO|n|N|off|OFF|"") echo 0 ;;
      *)
        echo "[WARN] Invalid boolean value '$1', fallback to 0" >&2
        echo 0
        ;;
    esac
}

# CLI/ENV controls (CLI > ENV > default)
PROJECT_ROOT="${TRAIN_SYNC_PROJECT_ROOT:-$(pwd)}"
NON_INTERACTIVE=$(to_bool "${TRAIN_SYNC_NON_INTERACTIVE:-0}")
ASSUME_YES=$(to_bool "${TRAIN_SYNC_ASSUME_YES:-0}")
SKIP_SAMPLE=$(to_bool "${TRAIN_SYNC_SKIP_SAMPLE:-0}")

while [ $# -gt 0 ]; do
    case "$1" in
      --project-root)
        if [ $# -lt 2 ] || [ -z "${2:-}" ]; then
            echo "[ERROR] --project-root requires a path"
            usage
            exit 1
        fi
        PROJECT_ROOT=$2
        shift 2
        ;;
      --non-interactive)
        NON_INTERACTIVE=1
        shift
        ;;
      --yes)
        ASSUME_YES=1
        NON_INTERACTIVE=1
        shift
        ;;
      --skip-sample)
        SKIP_SAMPLE=1
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        echo "[ERROR] Unknown argument: $1"
        usage
        exit 1
        ;;
    esac
done

# No-tty sessions must never block on read prompts.
if [ ! -t 0 ]; then
    NON_INTERACTIVE=1
fi
if [ "$ASSUME_YES" -eq 1 ]; then
    NON_INTERACTIVE=1
fi

if [ ! -d "$PROJECT_ROOT" ]; then
    echo "[ERROR] Project root not found: $PROJECT_ROOT"
    exit 1
fi
cd "$PROJECT_ROOT"

echo "=========================================="
echo "远程服务器训练执行脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="outputs/training_sync/run_${TIMESTAMP}"
START_TIME_HUMAN=$(date '+%Y-%m-%d %H:%M:%S %Z')
RUNTIME_BASE=${RUNTIME_BASE:-/root/autodl-tmp/graduationDesign_runtime}
MODELS_DIR=${MODELS_DIR:-$RUNTIME_BASE/models}
MODELSCOPE_CACHE=${MODELSCOPE_CACHE:-$RUNTIME_BASE/modelscope_cache}
HF_HOME=${HF_HOME:-$RUNTIME_BASE/hf_home}
USE_MODELSCOPE=${USE_MODELSCOPE:-1}
DEFAULT_MODELSCOPE_MODEL=${DEFAULT_MODELSCOPE_MODEL:-JunHowie/Qwen3-8B-Instruct}
if [ "$USE_MODELSCOPE" = "1" ] && [ -z "${MODEL_NAME_OR_PATH:-}" ]; then
    MODEL_NAME_OR_PATH="$DEFAULT_MODELSCOPE_MODEL"
fi
MODEL_NAME_OR_PATH=${MODEL_NAME_OR_PATH:-$DEFAULT_MODELSCOPE_MODEL}
OVERALL_FAILURE=0
FINALIZED=0
CURRENT_PHASE="bootstrap"
CURRENT_STAGE="init"
ISSUE_COUNT=0
ISSUES_MD="$REPORT_DIR/ISSUES.md"
ISSUES_JSONL="$REPORT_DIR/issues.jsonl"

export USE_MODELSCOPE MODELSCOPE_CACHE HF_HOME MODEL_NAME_OR_PATH
export TRAIN_SYNC_PROJECT_ROOT="$PROJECT_ROOT"
export TRAIN_SYNC_NON_INTERACTIVE="$NON_INTERACTIVE"
export TRAIN_SYNC_ASSUME_YES="$ASSUME_YES"
export TRAIN_SYNC_SKIP_SAMPLE="$SKIP_SAMPLE"

# 日志函数
sanitize_text() {
    printf '%s' "$1" | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g'
}

json_escape() {
    printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

record_issue() {
    local severity=$1
    local category=$2
    local symptom=${3:-}
    local root_cause=${4:-}
    local action=${5:-}
    local status=${6:-open}
    local ts human_ts symptom_clean root_clean action_clean

    ts=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
    human_ts=$(date '+%Y-%m-%d %H:%M:%S %Z')
    symptom_clean=$(sanitize_text "$symptom")
    root_clean=$(sanitize_text "$root_cause")
    action_clean=$(sanitize_text "$action")

    mkdir -p "$REPORT_DIR" 2>/dev/null || true
    if [ ! -f "$ISSUES_MD" ]; then
        cat > "$ISSUES_MD" <<'EOF'
# 训练问题记录

> 自动记录训练过程中的 warning/error，便于复盘依赖与流程治理。

EOF
    fi
    touch "$ISSUES_JSONL" 2>/dev/null || true

    ISSUE_COUNT=$((ISSUE_COUNT + 1))
    cat >> "$ISSUES_MD" <<EOF
## Issue $ISSUE_COUNT
- time: $human_ts
- phase: $CURRENT_PHASE
- stage: $CURRENT_STAGE
- category: $category
- severity: $severity
- symptom: $symptom_clean
- root_cause: ${root_clean:-N/A}
- action: ${action_clean:-N/A}
- status: $status

EOF

    printf '{"timestamp":"%s","phase":"%s","stage":"%s","category":"%s","severity":"%s","symptom":"%s","root_cause":"%s","action":"%s","status":"%s"}\n' \
      "$ts" \
      "$(json_escape "$CURRENT_PHASE")" \
      "$(json_escape "$CURRENT_STAGE")" \
      "$(json_escape "$category")" \
      "$(json_escape "$severity")" \
      "$(json_escape "$symptom_clean")" \
      "$(json_escape "${root_clean:-N/A}")" \
      "$(json_escape "${action_clean:-N/A}")" \
      "$(json_escape "$status")" \
      >> "$ISSUES_JSONL"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    local msg=$1
    local category=${2:-ops}
    local root_cause=${3:-}
    local action=${4:-}
    local status=${5:-open}
    echo -e "${YELLOW}[WARN]${NC} $msg"
    record_issue "warning" "$category" "$msg" "$root_cause" "$action" "$status"
}

log_error() {
    local msg=$1
    local category=${2:-ops}
    local root_cause=${3:-}
    local action=${4:-}
    local status=${5:-open}
    echo -e "${RED}[ERROR]${NC} $msg"
    record_issue "error" "$category" "$msg" "$root_cause" "$action" "$status"
}

ensure_python_path() {
    if command -v python3 >/dev/null 2>&1; then
        return 0
    fi
    if [ -x "/root/miniconda3/bin/python3" ]; then
        export PATH="/root/miniconda3/bin:$PATH"
        log_warn "python3 不在 PATH，已追加 /root/miniconda3/bin"
        return 0
    fi
    log_error "未找到 python3，请先激活 conda 或安装 Python"
    return 1
}

mark_stage() {
    local stage=$1
    local status=$2
    local marker="$REPORT_DIR/.stage_${stage}_${status}"
    touch "$marker"
    if [ "$status" = "done" ]; then
        rm -f "$REPORT_DIR/.stage_${stage}_failed"
    elif [ "$status" = "failed" ]; then
        rm -f "$REPORT_DIR/.stage_${stage}_done"
    fi
}

stage_status_text() {
    local stage=$1
    if [ -f "$REPORT_DIR/.stage_${stage}_done" ]; then
        echo "✓ 完成"
    elif [ -f "$REPORT_DIR/.stage_${stage}_failed" ]; then
        echo "✗ 失败"
    elif [ -f "$REPORT_DIR/.stage_${stage}_skipped" ]; then
        echo "↷ 跳过"
    else
        echo "○ 未执行"
    fi
}

adapter_dir_for_stage() {
    local stage=$1
    case "$stage" in
      sample) echo "outputs/adapter/adapter_sample" ;;
      style) echo "outputs/adapter/adapter_style" ;;
      writing) echo "outputs/adapter/adapter_writing" ;;
      all) echo "outputs/adapter/adapter_multitask" ;;
      *) return 1 ;;
    esac
}

eval_report_base_for_stage() {
    local stage=$1
    case "$stage" in
      all) echo "eval_report_all" ;;
      sample|style|writing) echo "eval_report_${stage}" ;;
      *) return 1 ;;
    esac
}

check_gpu() {
    log_info "检查GPU..."
    if command -v nvidia-smi >/dev/null 2>&1; then
        if nvidia-smi; then
            log_success "GPU检查完成"
        else
            log_error "nvidia-smi 执行失败"
            return 1
        fi
    else
        log_warn "未检测到 nvidia-smi（后续 verify 脚本会作为硬门禁）"
    fi
}

check_dependencies() {
    log_info "检查Python依赖..."
    python3 -c "import torch; print(f'PyTorch: {torch.__version__}')"
    python3 -c "import torch; print(f'CUDA available: {torch.cuda.is_available()}')"
    python3 -c "import transformers; print(f'Transformers: {transformers.__version__}')"
    python3 -c "import peft; print(f'PEFT: {peft.__version__}')"
    log_success "依赖检查完成"
}

setup_runtime_storage() {
    CURRENT_PHASE="runtime_setup"
    CURRENT_STAGE="storage"
    log_info "配置运行时存储隔离..."
    mkdir -p "$MODELS_DIR" "$MODELSCOPE_CACHE" "$HF_HOME"

    if [ -L "$PROJECT_ROOT/models" ]; then
        local current_target
        current_target=$(readlink "$PROJECT_ROOT/models" || true)
        if [ "$current_target" != "$MODELS_DIR" ]; then
            log_warn "models 软链目标与期望不一致，重置为 $MODELS_DIR"
            ln -sfn "$MODELS_DIR" "$PROJECT_ROOT/models"
        fi
    elif [ -e "$PROJECT_ROOT/models" ]; then
        local backup_path="$PROJECT_ROOT/models.backup_${TIMESTAMP}"
        log_warn "检测到现有 models 目录，备份到: $backup_path"
        mv "$PROJECT_ROOT/models" "$backup_path"
        ln -s "$MODELS_DIR" "$PROJECT_ROOT/models"
    else
        ln -s "$MODELS_DIR" "$PROJECT_ROOT/models"
    fi

    log_success "运行时目录就绪"
    log_info "USE_MODELSCOPE=$USE_MODELSCOPE"
    log_info "MODEL_NAME_OR_PATH=$MODEL_NAME_OR_PATH"
    log_info "MODELSCOPE_CACHE=$MODELSCOPE_CACHE"
    log_info "HF_HOME=$HF_HOME"
    log_info "models -> $MODELS_DIR"
}

run_training_stage() {
    local stage=$1
    local description=$2
    CURRENT_PHASE="training"
    CURRENT_STAGE="$stage"

    echo ""
    echo "=========================================="
    log_info "开始 ${description} 训练"
    echo "=========================================="

    local start_time
    start_time=$(date +%s)

    if bash code/ai_service/training/run_train.sh "$stage"; then
        local end_time
        local duration
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        mark_stage "$stage" "done"
        log_success "${description} 训练完成 (耗时: ${duration}秒)"

        local adapter_dir
        local eval_base
        adapter_dir=$(adapter_dir_for_stage "$stage")
        eval_base=$(eval_report_base_for_stage "$stage")

        if [ -f "${adapter_dir}/${eval_base}.md" ]; then
            echo ""
            log_info "评估报告:"
            cat "${adapter_dir}/${eval_base}.md"
        fi
        return 0
    else
        mark_stage "$stage" "failed"
        log_error "${description} 训练失败" "training_logic" "训练阶段执行失败，详见对应 train_*.log" "修复后只重跑该阶段"
        return 1
    fi
}

capture_python_fingerprint() {
    local outfile=$1
    python3 - <<'PY' > "$outfile" 2>/dev/null || true
import importlib
mods = ["torch", "transformers", "datasets", "peft", "bitsandbytes", "tensorboard"]
for mod_name in mods:
    try:
        mod = importlib.import_module(mod_name)
        print(f"{mod_name}: {getattr(mod, '__version__', 'n/a')}")
    except Exception as exc:
        print(f"{mod_name}: missing ({exc.__class__.__name__})")
PY

    if [ ! -s "$outfile" ]; then
        cat > "$outfile" <<'EOF'
torch: unavailable
transformers: unavailable
datasets: unavailable
peft: unavailable
bitsandbytes: unavailable
tensorboard: unavailable
EOF
    fi
}

collect_artifacts() {
    CURRENT_PHASE="artifact_collection"
    CURRENT_STAGE="all"
    log_info "收集训练结果..."
    mkdir -p "$REPORT_DIR"

    log_info "复制评估报告..."
    local stage
    for stage in sample style writing all; do
        local adapter_dir
        adapter_dir=$(adapter_dir_for_stage "$stage")
        if [ -d "$adapter_dir" ]; then
            cp "$adapter_dir"/eval_report_*.* "$REPORT_DIR/" 2>/dev/null || true
        fi
    done

    log_info "复制训练日志..."
    cp outputs/logs/train_*.log "$REPORT_DIR/" 2>/dev/null || true
}

generate_summary() {
    CURRENT_PHASE="summary"
    CURRENT_STAGE="all"
    local end_time_human
    local host_name
    local gpu_name="N/A"
    local driver_version="N/A"
    local cuda_version="N/A"
    local py_fingerprint_file="$REPORT_DIR/.python_env_versions.txt"

    end_time_human=$(date '+%Y-%m-%d %H:%M:%S %Z')
    host_name=$(hostname)

    if command -v nvidia-smi >/dev/null 2>&1; then
        gpu_name=$(nvidia-smi --query-gpu=name --format=csv,noheader | head -1 || true)
        driver_version=$(nvidia-smi --query-gpu=driver_version --format=csv,noheader | head -1 || true)
        cuda_version=$(nvidia-smi | sed -n 's/.*CUDA Version: \([^ ]*\).*/\1/p' | head -1 || true)
        cuda_version=${cuda_version:-N/A}
    fi

    capture_python_fingerprint "$py_fingerprint_file"

    cat > "$REPORT_DIR/TRAINING_SUMMARY.md" << EOF
# 训练执行总结

## 训练信息
- 开始时间: $START_TIME_HUMAN
- 结束时间: $end_time_human
- 服务器: $host_name

## 训练阶段

### Sample训练
- 状态: $(stage_status_text sample)
- 样本数: 3
- 输出: outputs/adapter/adapter_sample/

### Style训练
- 状态: $(stage_status_text style)
- 样本数: 28
- 输出: outputs/adapter/adapter_style/

### Writing训练
- 状态: $(stage_status_text writing)
- 样本数: 12
- 输出: outputs/adapter/adapter_writing/

### All训练
- 状态: $(stage_status_text all)
- 样本数: 40
- 输出: outputs/adapter/adapter_multitask/

## 环境指纹

- GPU型号: ${gpu_name:-N/A}
- Driver版本: ${driver_version:-N/A}
- CUDA版本: ${cuda_version:-N/A}
- USE_MODELSCOPE: $USE_MODELSCOPE
- MODEL_NAME_OR_PATH: $MODEL_NAME_OR_PATH
- MODELSCOPE_CACHE: $MODELSCOPE_CACHE
- HF_HOME: $HF_HOME
- TRAIN_SYNC_NON_INTERACTIVE: $NON_INTERACTIVE
- TRAIN_SYNC_ASSUME_YES: $ASSUME_YES
- TRAIN_SYNC_SKIP_SAMPLE: $SKIP_SAMPLE

### Python依赖版本
\`\`\`
$(cat "$py_fingerprint_file")
\`\`\`

## 问题记录

- 记录条数: $ISSUE_COUNT
- Markdown: $ISSUES_MD
- JSONL: $ISSUES_JSONL

## 阶段标记

\`\`\`
$(cd "$REPORT_DIR" && ls -1 .stage_* 2>/dev/null || echo "(none)")
\`\`\`

## 输出文件

\`\`\`
$REPORT_DIR/
$(ls -la "$REPORT_DIR/" | tail -n +4)
\`\`\`

## 下一步

1. 下载训练结果到本地
2. 对比各模型性能
3. 选择最佳模型部署
EOF

    log_success "综合报告已生成: $REPORT_DIR/TRAINING_SUMMARY.md"
}

finalize_run() {
    if [ "$FINALIZED" -eq 1 ]; then
        return
    fi
    FINALIZED=1

    # trap 里做兜底汇总，避免中断后无报告/无标记
    set +e
    collect_artifacts
    generate_summary
}

main() {
    CURRENT_PHASE="bootstrap"
    CURRENT_STAGE="init"
    ensure_python_path
    mkdir -p "$REPORT_DIR"
    touch "$REPORT_DIR/.stage_initialized"

    log_info "训练开始时间: $START_TIME_HUMAN"
    log_info "项目目录: $PROJECT_ROOT"
    log_info "结果目录: $REPORT_DIR"
    log_info "非交互模式: $NON_INTERACTIVE"
    log_info "自动确认: $ASSUME_YES"
    log_info "跳过Sample: $SKIP_SAMPLE"

    # 0. 运行时存储隔离
    echo ""
    log_info "=== 阶段0: 运行时存储隔离 ==="
    setup_runtime_storage

    # 1. 环境检查
    echo ""
    CURRENT_PHASE="precheck"
    CURRENT_STAGE="env"
    log_info "=== 阶段1: 环境检查 ==="
    check_gpu
    check_dependencies

    if [ -f "scripts/verify_training_ready.sh" ]; then
        log_info "运行准备验证..."
        if bash scripts/verify_training_ready.sh; then
            mark_stage "precheck" "done"
        else
            mark_stage "precheck" "failed"
            log_error "准备验证失败，停止训练" "infra" "verify_training_ready.sh 返回非0" "先修复依赖/数据/驱动问题后重试"
            exit 1
        fi
    else
        mark_stage "precheck" "failed"
        log_error "缺少 scripts/verify_training_ready.sh，停止训练" "ops" "远端脚本未同步" "重新同步训练脚本包"
        exit 1
    fi

    # 2. Sample训练（验证）
    echo ""
    log_info "=== 阶段2: Sample训练（验证流程） ==="
    if [ "$SKIP_SAMPLE" -eq 1 ]; then
        touch "$REPORT_DIR/.stage_sample_skipped"
        log_warn "按配置跳过 Sample 训练阶段" "ops" "TRAIN_SYNC_SKIP_SAMPLE=1 或 --skip-sample" "直接执行 style/writing/all 阶段" "observed"
    else
        if ! run_training_stage "sample" "Sample"; then
            OVERALL_FAILURE=1
            log_error "Sample训练失败，停止后续训练" "training_logic" "sample 阶段失败" "修复后重跑 sample"
            exit 1
        fi

        CURRENT_PHASE="manual_check"
        CURRENT_STAGE="sample"
        if [ "$NON_INTERACTIVE" -eq 1 ]; then
            log_info "非交互模式已启用，自动继续后续训练阶段。"
        else
            log_warn "Sample训练完成，请检查结果是否正常" "ops" "全量训练前人工确认点" "确认 eval_report_sample.md 后输入 y 继续" "observed"
            read -r -p "是否继续进行完整训练? (y/n) " -n 1 REPLY
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                touch "$REPORT_DIR/.stage_manual_stop"
                log_info "用户取消后续训练"
                exit 0
            fi
        fi
    fi

    # 3. Style训练
    echo ""
    log_info "=== 阶段3: Style训练（电磁学课程） ==="
    if ! run_training_stage "style" "Style"; then
        OVERALL_FAILURE=1
        log_error "Style训练失败，继续执行后续阶段" "training_logic" "style 阶段失败" "排查日志后单阶段重跑"
    fi

    # 4. Writing训练
    echo ""
    log_info "=== 阶段4: Writing训练（学术写作） ==="
    if ! run_training_stage "writing" "Writing"; then
        OVERALL_FAILURE=1
        log_error "Writing训练失败，继续执行后续阶段" "training_logic" "writing 阶段失败" "排查日志后单阶段重跑"
    fi

    # 5. All训练
    echo ""
    log_info "=== 阶段5: All训练（多任务） ==="
    if ! run_training_stage "all" "All"; then
        OVERALL_FAILURE=1
        log_error "All训练失败" "training_logic" "all 阶段失败" "排查日志后单阶段重跑"
    fi

    finalize_run

    echo ""
    echo "=========================================="
    if [ "$OVERALL_FAILURE" -eq 0 ]; then
        log_success "训练流程完成"
    else
        log_warn "训练流程完成（存在失败阶段）"
    fi
    echo "=========================================="
    log_info "训练结束时间: $(date '+%Y-%m-%d %H:%M:%S %Z')"
    log_info "结果目录: $REPORT_DIR"
    echo ""
    log_info "查看综合报告:"
    echo "  cat $REPORT_DIR/TRAINING_SUMMARY.md"
    echo ""
    log_info "下载结果到本地:"
    echo "  scp -P 43821 -r root@connect.cqa1.seetacloud.com:$PROJECT_ROOT/outputs/adapter ./outputs/"
    echo "  scp -P 43821 -r root@connect.cqa1.seetacloud.com:$PROJECT_ROOT/$REPORT_DIR ./outputs/training_sync/"
    echo ""

    if [ "$OVERALL_FAILURE" -ne 0 ]; then
        exit 1
    fi
}

trap finalize_run EXIT
main "$@"

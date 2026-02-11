#!/usr/bin/env bash
# Quantization feasibility checks for a completed training run.
# - BnB 4-bit load + LoRA smoke test
# - GGUF conversion + llama.cpp / llama-cpp-python smoke tests

set -euo pipefail

usage() {
    cat <<'EOF'
Usage:
  bash scripts/quantization_feasibility.sh [options]

Options:
  --run-id <id>          Run directory id under outputs/training_sync (default: run_20260209_132531)
  --project-root <path>  Project root (default: current working directory)
  -h, --help             Show this help

Environment overrides:
  PYTHON_BIN             Python binary (default: /root/miniconda3/bin/python3)
  BASE_MODEL_PATH        Base model path
  ADAPTER_STYLE_PATH     Style adapter path
  ADAPTER_MULTITASK_PATH Multitask adapter path
  WORK_BASE              Large artifact workspace (default: /root/autodl-tmp/quantization_work/<run-id>)
  TOOLS_BASE             Tool install base (default: /root/autodl-tmp/tools)
EOF
}

RUN_ID="run_20260209_132531"
PROJECT_ROOT="$(pwd)"
while [ $# -gt 0 ]; do
    case "$1" in
      --run-id)
        RUN_ID=${2:-}
        shift 2
        ;;
      --project-root)
        PROJECT_ROOT=${2:-}
        shift 2
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

if [ ! -d "$PROJECT_ROOT" ]; then
    echo "[ERROR] Project root not found: $PROJECT_ROOT"
    exit 1
fi
cd "$PROJECT_ROOT"

PYTHON_BIN=${PYTHON_BIN:-/root/miniconda3/bin/python3}
BASE_MODEL_PATH=${BASE_MODEL_PATH:-/root/autodl-tmp/graduationDesign_runtime/models/JunHowie/Qwen3-8B-Instruct}
ADAPTER_STYLE_PATH=${ADAPTER_STYLE_PATH:-$PROJECT_ROOT/outputs/adapter/adapter_style}
ADAPTER_MULTITASK_PATH=${ADAPTER_MULTITASK_PATH:-$PROJECT_ROOT/outputs/adapter/adapter_multitask}
WORK_BASE=${WORK_BASE:-/root/autodl-tmp/quantization_work/$RUN_ID}
TOOLS_BASE=${TOOLS_BASE:-/root/autodl-tmp/tools}
LLAMA_CPP_DIR=${LLAMA_CPP_DIR:-$TOOLS_BASE/llama.cpp}

REPORT_DIR="$PROJECT_ROOT/outputs/training_sync/$RUN_ID"
Q_DIR="$REPORT_DIR/quantization_feasibility"
mkdir -p "$Q_DIR" "$WORK_BASE" "$TOOLS_BASE" "$REPORT_DIR"

BNB_LOG="$Q_DIR/bnb_quant_smoke.log"
BNB_JSON="$Q_DIR/bnb_quant_result.json"
GGUF_LOG="$Q_DIR/gguf_convert.log"
GGUF_JSON="$Q_DIR/gguf_quant_result.json"
LLAMA_CLI_LOG="$Q_DIR/llama_cli_smoke.log"
LLAMA_CPP_PY_LOG="$Q_DIR/llama_cpp_python_smoke.log"
SUMMARY_MD="$Q_DIR/quantization_feasibility.md"

MERGED_STYLE_DIR="$WORK_BASE/merged_style_hf"
F16_GGUF="$WORK_BASE/model-f16.gguf"
Q4_GGUF="$WORK_BASE/model-q4_k_m.gguf"

export BNB_LOG GGUF_LOG LLAMA_CLI_LOG LLAMA_CPP_PY_LOG SUMMARY_MD
export BNB_JSON GGUF_JSON F16_GGUF Q4_GGUF

echo "[INFO] Run id: $RUN_ID"
echo "[INFO] Report dir: $REPORT_DIR"
echo "[INFO] Quantization dir: $Q_DIR"

# ---------------------------------------------------------------------------
# 1) BitsAndBytesConfig feasibility
# ---------------------------------------------------------------------------
echo "[INFO] Running BnB 4-bit feasibility smoke..."
nvidia-smi > "$Q_DIR/bnb_nvidia_pre.txt" 2>&1 || true

export BNB_JSON BASE_MODEL_PATH ADAPTER_STYLE_PATH ADAPTER_MULTITASK_PATH
"$PYTHON_BIN" - <<'PY' >"$BNB_LOG" 2>&1
import json
import os
import traceback

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig


def run_gen(model, tokenizer, prompt):
    messages = [
        {
            "role": "system",
            "content": "你是高校课程助教。请按以下结构回答：\n### 结论\n### 推导\n### 检查（单位/边界条件/极限情况）",
        },
        {"role": "user", "content": prompt},
    ]
    text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tokenizer(text, return_tensors="pt").to(model.device)
    with torch.no_grad():
        out = model.generate(**inputs, max_new_tokens=48)
    return tokenizer.decode(out[0], skip_special_tokens=True)


result = {
    "base_quant_load_ok": False,
    "style_lora_mount_ok": False,
    "style_generate_non_empty": False,
    "multitask_lora_mount_ok": False,
    "multitask_generate_non_empty": False,
    "error": "",
}

base = os.environ["BASE_MODEL_PATH"]
style_adapter = os.environ["ADAPTER_STYLE_PATH"]
multitask_adapter = os.environ["ADAPTER_MULTITASK_PATH"]

try:
    tokenizer = AutoTokenizer.from_pretrained(base, trust_remote_code=True)
    quant_cfg = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_use_double_quant=True,
        bnb_4bit_compute_dtype=torch.bfloat16,
    )

    model = AutoModelForCausalLM.from_pretrained(
        base,
        trust_remote_code=True,
        quantization_config=quant_cfg,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )
    result["base_quant_load_ok"] = True

    style_model = PeftModel.from_pretrained(model, style_adapter)
    result["style_lora_mount_ok"] = True
    style_text = run_gen(style_model, tokenizer, "请按结构简述高斯定律。")
    result["style_generate_non_empty"] = bool(style_text.strip())
    del style_model
    del model
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    model2 = AutoModelForCausalLM.from_pretrained(
        base,
        trust_remote_code=True,
        quantization_config=quant_cfg,
        torch_dtype=torch.bfloat16,
        device_map="auto",
    )
    multi_model = PeftModel.from_pretrained(model2, multitask_adapter)
    result["multitask_lora_mount_ok"] = True
    multi_text = run_gen(multi_model, tokenizer, "请按结构给出写作摘要长度建议。")
    result["multitask_generate_non_empty"] = bool(multi_text.strip())
except Exception as exc:  # pragma: no cover - runtime smoke
    result["error"] = f"{exc.__class__.__name__}: {exc}"
    traceback.print_exc()

with open(os.environ["BNB_JSON"], "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
PY

nvidia-smi > "$Q_DIR/bnb_nvidia_post.txt" 2>&1 || true

# ---------------------------------------------------------------------------
# 2) GGUF feasibility
# ---------------------------------------------------------------------------
echo "[INFO] Running GGUF feasibility smoke..."
GGUF_TOOLCHAIN_OK=0
GGUF_MERGE_OK=0
GGUF_CONVERT_OK=0
GGUF_QUANT_OK=0
GGUF_LLAMACLI_OK=0
GGUF_LLAMACPPPY_OK=0
OLLAMA_STATUS="SKIPPED_NOT_INSTALLED"

set +e
(
    set -e
    echo "=== [1/7] install conversion dependencies ==="
    "$PYTHON_BIN" -m pip install --upgrade --quiet sentencepiece gguf

    echo "=== [2/7] clone/update llama.cpp ==="
    rm -rf "$LLAMA_CPP_DIR"
    LLAMA_ARCHIVE="$WORK_BASE/llama.cpp-master.tar.gz"
    for attempt in 1 2 3; do
        if curl -L --http1.1 --retry 5 --retry-delay 2 \
            -o "$LLAMA_ARCHIVE" \
            https://codeload.github.com/ggerganov/llama.cpp/tar.gz/refs/heads/master; then
            break
        fi
        if [ "$attempt" -eq 3 ]; then
            exit 1
        fi
        sleep 3
    done
    tar -xzf "$LLAMA_ARCHIVE" -C "$TOOLS_BASE"
    mv "$TOOLS_BASE/llama.cpp-master" "$LLAMA_CPP_DIR"

    echo "=== [3/7] build llama.cpp ==="
    cmake -S "$LLAMA_CPP_DIR" -B "$LLAMA_CPP_DIR/build" -DLLAMA_BUILD_TESTS=OFF
    cmake --build "$LLAMA_CPP_DIR/build" --config Release -j"$(nproc)"

    echo "=== [4/7] merge base + style LoRA to HF ==="
    export BASE_MODEL_PATH ADAPTER_STYLE_PATH MERGED_STYLE_DIR
    "$PYTHON_BIN" - <<'PY'
import os
import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

base = os.environ["BASE_MODEL_PATH"]
adapter = os.environ["ADAPTER_STYLE_PATH"]
out_dir = os.environ["MERGED_STYLE_DIR"]

tokenizer = AutoTokenizer.from_pretrained(base, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    base,
    trust_remote_code=True,
    torch_dtype=torch.float16,
    low_cpu_mem_usage=True,
    device_map="auto",
)
model = PeftModel.from_pretrained(model, adapter)
merged = model.merge_and_unload()
merged.save_pretrained(out_dir, safe_serialization=True)
tokenizer.save_pretrained(out_dir)
print("merge_done", out_dir)
PY

    echo "=== [5/7] convert HF to GGUF (f16) ==="
    "$PYTHON_BIN" "$LLAMA_CPP_DIR/convert_hf_to_gguf.py" "$MERGED_STYLE_DIR" --outtype f16 --outfile "$F16_GGUF"

    echo "=== [6/7] quantize GGUF to q4_k_m ==="
    LLAMA_QUANT_BIN="$LLAMA_CPP_DIR/build/bin/llama-quantize"
    if [ ! -x "$LLAMA_QUANT_BIN" ]; then
        LLAMA_QUANT_BIN="$LLAMA_CPP_DIR/build/bin/quantize"
    fi
    "$LLAMA_QUANT_BIN" "$F16_GGUF" "$Q4_GGUF" q4_k_m
) >>"$GGUF_LOG" 2>&1
GGUF_RC=$?
set -e

if [ "$GGUF_RC" -eq 0 ]; then
    echo "[INFO] GGUF convert/llama.cpp smoke completed."
else
    echo "[WARN] GGUF convert pipeline failed. See: $GGUF_LOG"
fi

if [ -x "$LLAMA_CPP_DIR/build/bin/llama-cli" ] || [ -x "$LLAMA_CPP_DIR/build/bin/main" ]; then
    GGUF_TOOLCHAIN_OK=1
fi
if [ -f "$MERGED_STYLE_DIR/config.json" ]; then
    GGUF_MERGE_OK=1
fi
if [ -f "$F16_GGUF" ]; then
    GGUF_CONVERT_OK=1
fi
if [ -f "$Q4_GGUF" ]; then
    GGUF_QUANT_OK=1
fi

set +e
if [ "$GGUF_QUANT_OK" -eq 1 ]; then
    LLAMA_CLI_BIN="$LLAMA_CPP_DIR/build/bin/llama-cli"
    if [ ! -x "$LLAMA_CLI_BIN" ]; then
        LLAMA_CLI_BIN="$LLAMA_CPP_DIR/build/bin/main"
    fi
    # Use single-turn conversation mode to avoid interactive hangs / runaway logs.
    timeout 240 "$LLAMA_CLI_BIN" -cnv -st -m "$Q4_GGUF" -p "请用三句话解释高斯定律。" -n 32 -t 8 --temp 0.2 > "$LLAMA_CLI_LOG" 2>&1
    if [ $? -eq 0 ]; then
        GGUF_LLAMACLI_OK=1
    fi
else
    echo "[SKIP] q4 gguf missing, skip llama.cpp smoke." > "$LLAMA_CLI_LOG"
fi
set -e

set +e
if [ "$GGUF_QUANT_OK" -eq 1 ]; then
    {
        export CMAKE_ARGS="-DGGML_OPENMP=OFF -DLLAMA_BUILD_TOOLS=OFF -DLLAMA_BUILD_EXAMPLES=OFF -DLLAMA_BUILD_TESTS=OFF -DLLAMA_BUILD_SERVER=OFF"
        export FORCE_CMAKE=1
        timeout 1200 "$PYTHON_BIN" -m pip install --upgrade --no-cache-dir llama-cpp-python
        timeout 300 "$PYTHON_BIN" - <<'PY'
import os
from llama_cpp import Llama

model_path = os.environ["Q4_GGUF"]
llm = Llama(model_path=model_path, n_ctx=2048, n_threads=8, verbose=False)
resp = llm("Q: 请简述高斯定律。\\nA:", max_tokens=8, temperature=0.2)
text = resp["choices"][0]["text"]
print(text)
PY
    } >"$LLAMA_CPP_PY_LOG" 2>&1
    if [ $? -eq 0 ]; then
        GGUF_LLAMACPPPY_OK=1
    fi
else
    echo "[SKIP] q4 gguf missing, skip llama-cpp-python smoke." > "$LLAMA_CPP_PY_LOG"
fi
set -e

if command -v ollama >/dev/null 2>&1; then
    OLLAMA_STATUS="PRESENT_NOT_TESTED"
fi

export GGUF_JSON F16_GGUF Q4_GGUF
export GGUF_TOOLCHAIN_OK GGUF_MERGE_OK GGUF_CONVERT_OK GGUF_QUANT_OK GGUF_LLAMACLI_OK GGUF_LLAMACPPPY_OK OLLAMA_STATUS
"$PYTHON_BIN" - <<'PY'
import json
import os
from pathlib import Path

def b(name: str) -> bool:
    return os.environ.get(name, "0") == "1"

f16 = Path(os.environ["F16_GGUF"])
q4 = Path(os.environ["Q4_GGUF"])
result = {
    "toolchain_ready": b("GGUF_TOOLCHAIN_OK"),
    "merge_ok": b("GGUF_MERGE_OK"),
    "convert_f16_ok": b("GGUF_CONVERT_OK") and f16.exists(),
    "quantize_q4_ok": b("GGUF_QUANT_OK") and q4.exists(),
    "llama_cli_smoke_ok": b("GGUF_LLAMACLI_OK"),
    "llama_cpp_python_smoke_ok": b("GGUF_LLAMACPPPY_OK"),
    "ollama_status": os.environ.get("OLLAMA_STATUS", "UNKNOWN"),
    "artifacts": {
        "f16_gguf": str(f16),
        "q4_gguf": str(q4),
        "f16_size_bytes": f16.stat().st_size if f16.exists() else 0,
        "q4_size_bytes": q4.stat().st_size if q4.exists() else 0,
    },
}
with open(os.environ["GGUF_JSON"], "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
PY

# ---------------------------------------------------------------------------
# 3) Markdown summary
# ---------------------------------------------------------------------------
"$PYTHON_BIN" - <<'PY'
import json
import os
from pathlib import Path

bnb_path = Path(os.environ["BNB_JSON"])
gguf_path = Path(os.environ["GGUF_JSON"])
summary_path = Path(os.environ["SUMMARY_MD"])

bnb = json.loads(bnb_path.read_text(encoding="utf-8")) if bnb_path.exists() else {}
gguf = json.loads(gguf_path.read_text(encoding="utf-8")) if gguf_path.exists() else {}

def yesno(v):
    return "PASS" if bool(v) else "FAIL"

lines = [
    "# 量化可行性测试总结",
    "",
    "## BnB 4-bit",
    f"- base_quant_load_ok: {yesno(bnb.get('base_quant_load_ok'))}",
    f"- style_lora_mount_ok: {yesno(bnb.get('style_lora_mount_ok'))}",
    f"- style_generate_non_empty: {yesno(bnb.get('style_generate_non_empty'))}",
    f"- multitask_lora_mount_ok: {yesno(bnb.get('multitask_lora_mount_ok'))}",
    f"- multitask_generate_non_empty: {yesno(bnb.get('multitask_generate_non_empty'))}",
    f"- error: {bnb.get('error') or 'N/A'}",
    "",
    "## GGUF",
    f"- toolchain_ready: {yesno(gguf.get('toolchain_ready'))}",
    f"- merge_ok: {yesno(gguf.get('merge_ok'))}",
    f"- convert_f16_ok: {yesno(gguf.get('convert_f16_ok'))}",
    f"- quantize_q4_ok: {yesno(gguf.get('quantize_q4_ok'))}",
    f"- llama_cli_smoke_ok: {yesno(gguf.get('llama_cli_smoke_ok'))}",
    f"- llama_cpp_python_smoke_ok: {yesno(gguf.get('llama_cpp_python_smoke_ok'))}",
    f"- ollama_status: {gguf.get('ollama_status', 'UNKNOWN')}",
    "",
    "## 关键文件",
    f"- {bnb_path}",
    f"- {gguf_path}",
    f"- {Path(os.environ['BNB_LOG'])}",
    f"- {Path(os.environ['GGUF_LOG'])}",
    f"- {Path(os.environ['LLAMA_CLI_LOG'])}",
    f"- {Path(os.environ['LLAMA_CPP_PY_LOG'])}",
]
summary_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(summary_path)
PY

echo "[OK] Quantization feasibility artifacts generated in: $Q_DIR"
echo "[OK] Summary: $SUMMARY_MD"

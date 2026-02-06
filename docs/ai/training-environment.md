# 训练环境准备清单

本清单用于 LoRA/QLoRA 训练环境准备，配合 `scripts/ai/train_lora.py` 与 `scripts/ai/run_train.sh` 使用。

## 1. 硬件建议
- **GPU**：NVIDIA 24GB 显存及以上（RTX 4090 24GB 为起步推荐）
- **CPU**：8 核以上
- **内存**：32GB 以上
- **磁盘**：训练数据 + 模型权重 + checkpoint 预留 200GB+（模型权重可占数十 GB）

## 2. 操作系统与驱动
- **OS**：Ubuntu 20.04/22.04 或等价 Linux
- **NVIDIA 驱动**：建议 535+（保持与 CUDA 版本匹配）

检查：
```bash
nvidia-smi
```

## 3. CUDA 与 PyTorch
- **CUDA**：11.8 / 12.1 均可
- **PyTorch**：与 CUDA 版本匹配

示例（CUDA 12.1）：
```bash
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

## 4. Python 与虚拟环境
- **Python**：3.10 或 3.11
- **建议使用 venv**：
```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
```

## 5. 依赖安装
```bash
pip install transformers datasets peft accelerate bitsandbytes
```

> 如果使用 QLoRA，`bitsandbytes` 必须可用。

## 6. 加速与分布式（可选）
如需多卡：
```bash
pip install accelerate
accelerate config
```

## 7. HuggingFace 访问（可选）
如需下载受限模型：
```bash
pip install huggingface_hub
huggingface-cli login
```

## 8. 目录结构检查
确认数据目录：
```
data/training/
├── raw/
├── processed/
│   ├── style_sft.jsonl
│   ├── tool_sft.jsonl
│   └── rag_sft.jsonl
└── eval/
    └── benchmark.jsonl
```

## 9. 运行前快速自检
```bash
python3 - <<'PY'
import torch
print('CUDA available:', torch.cuda.is_available())
print('CUDA devices:', torch.cuda.device_count())
if torch.cuda.is_available():
    print('GPU:', torch.cuda.get_device_name(0))
PY
```

## 10. 常见问题
- **bitsandbytes 报错**：确认 CUDA 与驱动版本匹配，或升级 `bitsandbytes`。
- **显存不足**：降低 `max_length` 或增加 `gradient_accumulation_steps`。
- **加载模型慢**：使用本地缓存目录（`HF_HOME`）或提前下载模型。

## 11. 推荐环境变量
```bash
export HF_HOME=~/.cache/huggingface
export TRANSFORMERS_CACHE=~/.cache/huggingface
```

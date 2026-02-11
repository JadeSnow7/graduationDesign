# Edge PoC（MS-Swift 本机主线）

## 当前状态（2026-02-10）

本目录已完成端侧最小可用闭环：

- [x] 数据转换（train/valid/test -> ms-swift chat format）
- [x] 本机 LoRA 训练（Qwen3-0.6B-Instruct, Apple MPS）
- [x] `swift deploy` 本地 OpenAI-compatible 服务
- [x] AI Service + Backend 网关联调
- [x] Expo Web 路径客户端联测（12/12 非空回复）

整理结论见：`/Users/huaodong/graduationDesign/outputs/edge_poc/SUMMARY.md`

## 目录说明

```text
outputs/edge_poc/
├── README.md
├── SUMMARY.md
├── scripts/
│   ├── convert_edge_data_to_swift_chat.py
│   ├── prepare_qwen3_0p6b_instruct_model.py
│   ├── edge_gateway_smoke_test.sh
│   ├── run_client_web_e2e_edge_v1.sh
│   ├── quantize_edge_model.py              # 后续阶段
│   ├── export_to_onnx.py                   # 后续阶段
│   └── test_apple_neural_engine.py         # 后续阶段
└── reports/
    ├── edge_swift_data_check_20260210.json
    ├── model_prepare_qwen3_0p6b_instruct_20260210.json
    ├── swift_train_edge_v1_20260210.log
    ├── swift_train_edge_v1_20260210_summary.md
    ├── swift_deploy_edge_v1_20260210.log
    ├── edge_gateway_smoke_20260210.md
    └── client_web_e2e_edge_v1_20260210.md
```

## 复现实验（本机）

### 1) 数据转换

```bash
python3 /Users/huaodong/graduationDesign/outputs/edge_poc/scripts/convert_edge_data_to_swift_chat.py
```

默认输入：

- `/Volumes/Data/models/learning-assistant-training/data/train.jsonl`
- `/Volumes/Data/models/learning-assistant-training/data/eval.jsonl`
- `/Volumes/Data/models/learning-assistant-training/data/test.jsonl`

默认输出：

- `/Users/huaodong/graduationDesign/data/training/processed/edge_swift_v1/train.jsonl`
- `/Users/huaodong/graduationDesign/data/training/processed/edge_swift_v1/valid.jsonl`
- `/Users/huaodong/graduationDesign/data/training/processed/edge_swift_v1/test.jsonl`

### 2) 基座模型准备

```bash
python3 /Users/huaodong/graduationDesign/outputs/edge_poc/scripts/prepare_qwen3_0p6b_instruct_model.py
```

默认目标路径：

- `/Volumes/Data/models/qwen3-0.6b-instruct-hf`

### 3) 本机 LoRA 训练

```bash
export PYTORCH_ENABLE_MPS_FALLBACK=1
bash /Users/huaodong/graduationDesign/code/ai_service/training/run_edge_swift_local.sh
```

默认输出目录：

- `/Volumes/Data/models/learning-assistant-training/swift_ckpt/edge_qwen3_0p6b_v1`

### 4) 本地部署（OpenAI-compatible）

```bash
python3 -m swift.cli.deploy \
  --ckpt_dir /Volumes/Data/models/learning-assistant-training/swift_ckpt/edge_qwen3_0p6b_v1/v1-20260210-181349/checkpoint-100 \
  --infer_backend pt \
  --host 127.0.0.1 \
  --port 18080 \
  --api_key edge-local-key \
  --served_model_name qwen3-0.6b-edge-v1
```

### 5) AI Service / Backend / 联测

```bash
# AI Service（新终端）
cd /Users/huaodong/graduationDesign/code/ai_service
set -a
source .env.edge_swift_local
set +a
uvicorn app.main:app --host 127.0.0.1 --port 8001

# Backend（新终端）
bash /Users/huaodong/graduationDesign/code/backend/run_local_sqlite.sh

# 网关冒烟（新终端）
bash /Users/huaodong/graduationDesign/outputs/edge_poc/scripts/edge_gateway_smoke_test.sh

# 客户端联测（新终端）
bash /Users/huaodong/graduationDesign/outputs/edge_poc/scripts/run_client_web_e2e_edge_v1.sh
```

Expo Web 启动：

```bash
cd /Users/huaodong/graduationDesign/code/mobile
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080 npm run web
```

## 本轮固定配置

- 路由策略：`local_first`
- 非生产 cloud fallback：`false`
- 本地模型服务：`http://127.0.0.1:18080`
- API key：`edge-local-key`
- served model：`qwen3-0.6b-edge-v1`

## 已验证结果（摘要）

- 数据解析成功率：100%
- 训练 best checkpoint：`checkpoint-100`（eval loss 0.0245）
- 客户端联测：12/12 非空回复，复杂推理“转发云端”语义 2/2

## 后续任务（未完成）

- ONNX 导出与 ANE/NPU 优化
- INT8 量化后精度/性能联合评测
- 端侧功耗与峰值内存 profiling

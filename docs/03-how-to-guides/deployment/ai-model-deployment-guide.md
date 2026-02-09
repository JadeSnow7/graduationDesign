# 模型训练与部署指南（HF 推理 + GraphRAG，可选工具调用）

本指南基于仓库现有的训练计划与脚本：
- 训练路线：`docs/05-explanation/ai/post-training-finetuning-plan.md`
- 数据规范：`docs/05-explanation/ai/training-data-spec.md`
- 环境建议：`docs/05-explanation/ai/training-environment.md`
- 训练脚本：`code/ai_service/training/`
- 数据蒸馏：`docs/05-explanation/ai/distillation.md`
- 引导式学习：`docs/05-explanation/ai/guided-learning.md`
- 在线检索：`docs/05-explanation/ai/graph-rag.md`

目标：把 **Qwen3 8B** 训练出的 LoRA/QLoRA 产物接入本项目的 **AI Service**（`code/ai_service`），并与后端/前端一起部署。

---

## 0. 选择部署形态（推荐）

本仓库的 AI 服务（`code/ai_service/app/main.py`）支持 local/cloud 双上游（OpenAI-compatible）：
- local：`LLM_BASE_URL_LOCAL` / `LLM_API_KEY_LOCAL` / `LLM_MODEL_LOCAL`
- cloud：`LLM_BASE_URL_CLOUD` / `LLM_API_KEY_CLOUD` / `LLM_MODEL_CLOUD`
- 策略：`LLM_ROUTING_POLICY=local_first`（生产固定）

因此最省改动的方式是：
1) 在 GPU 机器上启动一个 **OpenAI-compatible 的本地推理服务**（例如 vLLM/TGI 等）  
2) 把 `LLM_BASE_URL_LOCAL` 指向该推理服务  
3) 用 `docker compose` 启动项目其他服务

> 如果你暂时不自建推理服务，也可以先把 `LLM_BASE_URL_LOCAL` 配成云厂商/第三方 API；`LLM_BASE_URL_CLOUD` 仅用于受控 fallback。

---

## 1. 训练环境准备（GPU 机器）

### 1.1 推荐版本（经验稳定档）
- CUDA：`12.1`（或 `11.8`）
- PyTorch：`2.3.x ~ 2.4.x`
- Python：`3.10/3.11`

> 你如果在 AutoDL 只能选到更“新”的组合，也可以先跑，但 **QLoRA（bitsandbytes）** 更容易踩兼容坑；开机后务必先做自检（见下）。

### 1.2 磁盘紧张（如数据盘 ≤ 86GB）时的必做项
把 HuggingFace 缓存与训练输出放到数据盘（避免系统盘 30GB 写爆）：
```bash
export HF_HOME=/path/to/data_disk/hf_cache
export TRANSFORMERS_CACHE=$HF_HOME
export OUT_BASE=/path/to/data_disk/outputs
export LOG_DIR=$OUT_BASE/logs
```

### 1.3 自检
```bash
nvidia-smi
python -c "import torch; print('cuda:', torch.cuda.is_available(), torch.version.cuda)"
python -c "import bitsandbytes as bnb; print('bitsandbytes ok')"
```

- `bitsandbytes ok` 通过：优先 QLoRA（省显存/省钱）
- 不通过：先用 LoRA（关闭 QLoRA），把管线跑通再处理兼容

---

## 2. 数据准备（100k 的推荐组织方式）

数据格式以 JSONL 为主，字段见 `docs/05-explanation/ai/training-data-spec.md`。

推荐按能力拆分（与你的目标：tool + rag + 引导风格一致）：
```
data/training/processed/
  tool_sft.jsonl
  rag_sft.jsonl
  style_sft.jsonl
data/training/eval/
  benchmark.jsonl
```

先用脚本创建目录与样例、再替换为真实数据：
```bash
python3 code/ai_service/training/prepare_training_data.py --create-dirs --create-samples
python3 code/ai_service/training/prepare_training_data.py --validate
```

### 2.4（可选但推荐）数据蒸馏与 smoke 链路验证

在进行 LoRA/QLoRA 训练前，建议先做一次“数据蒸馏 → smoke 指标”来验证数据链路可复现：

```bash
# chat-style JSONL -> prompt/response（用于快速检查与去重统计）
python3 scripts/ai/distill_data.py \
  --input assets/training_samples/processed/style_sft_sample.jsonl \
  --output outputs/distilled/style_sft_distilled.jsonl \
  --report outputs/distillation_report.json

python3 scripts/ai/distill_data.py \
  --input assets/training_samples/eval/benchmark_sample.jsonl \
  --output outputs/distilled/benchmark_distilled.jsonl \
  --report outputs/distillation_report_eval.json

# smoke “训练”：输出困惑度等轻量指标（不代表最终效果）
python3 scripts/ai/train_smoke.py \
  --train outputs/distilled/style_sft_distilled.jsonl \
  --eval outputs/distilled/benchmark_distilled.jsonl \
  --metrics outputs/smoke_train_metrics.json
```

> 这一步主要用于发现：空样本/乱码/重复激增、字段缺失、数据意外膨胀等工程问题；不用于宣称模型最终效果。

---

## 3. 开始训练（LoRA/QLoRA）

安装训练依赖（训练依赖与运行时依赖分离）：
```bash
pip install -r code/ai_service/training/requirements.txt
```

### 3.1 先跑通最小链路（强烈建议）
```bash
bash code/ai_service/training/run_train.sh sample
```

### 3.2 正式训练
按阶段训练（便于定位问题与回归）：
```bash
bash code/ai_service/training/run_train.sh tool
bash code/ai_service/training/run_train.sh rag
```

或直接多任务（推荐用于最终部署，减少模式切换时风格漂移）：
```bash
bash code/ai_service/training/run_train.sh all
```

训练输出（默认）：
- adapter：`outputs/adapter/*`（若设置了 `OUT_BASE`，则为 `$OUT_BASE/adapter_*`）
- 日志：`outputs/logs/*`（若设置了 `LOG_DIR`，则为 `$LOG_DIR/*`；TensorBoard 可读）

---

## 4. 训练后评测（回归必做）

生成预测：
```bash
python3 code/ai_service/training/generate_predictions.py \
  --model_name_or_path Qwen/Qwen3-8B-Instruct \
  --adapter_path "${OUT_BASE:-outputs/adapter}/adapter_multitask" \
  --eval_file data/training/eval/benchmark.jsonl \
  --output outputs/predictions.jsonl
```

生成评测报告：
```bash
python3 code/ai_service/training/eval_metrics.py \
  --eval_file data/training/eval/benchmark.jsonl \
  --pred_file outputs/predictions.jsonl \
  --output outputs/eval_report.json \
  --format markdown \
  --group_by_type
```

---

## 5. 导出与下载训练产物（到本地）

### 5.1 只下载 LoRA adapter（推荐：体积小）
在训练机上打包：
```bash
tar -czf adapter_multitask.tgz -C "${OUT_BASE:-outputs/adapter}" adapter_multitask
```

通过 SSH 下载到本地（示例）：
```bash
scp user@TRAIN_HOST:/path/to/repo/adapter_multitask.tgz .
```

### 5.2（可选）把 adapter 合并成“完整权重”（占空间大）
当你的推理服务不支持 LoRA 热加载时再用此方案（需要足够磁盘）：
```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel
import torch

base = "Qwen/Qwen3-8B-Instruct"
adapter = "outputs/adapter/adapter_multitask"  # 若设置 OUT_BASE，请改为 f"{OUT_BASE}/adapter_multitask"
out = "outputs/merged/qwen3-8b-writing"

model = AutoModelForCausalLM.from_pretrained(base, torch_dtype=torch.float16, device_map="auto")
model = PeftModel.from_pretrained(model, adapter)
model = model.merge_and_unload()
model.save_pretrained(out, safe_serialization=True)
AutoTokenizer.from_pretrained(base).save_pretrained(out)
```

---

## 6. 本地 HF 推理服务（OpenAI-compatible）

你需要一个对外提供 `POST /v1/chat/completions` 的服务，然后让 AI Service 指向它：
- `LLM_BASE_URL_LOCAL=http://<llm-host>:<port>`
- `LLM_API_KEY_LOCAL=任意非空`（本地服务一般不校验，但本项目会检查是否为空）
- `LLM_MODEL_LOCAL=<服务端暴露的 model 名称>`

启动完成后先做冒烟测试（示例）：
```bash
curl http://<llm-host>:<port>/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<your-model>",
    "messages": [{"role":"user","content":"Hello"}]
  }'
```

> 推理服务的具体选择（vLLM/TGI 等）与启动参数会随版本变化，建议以“能提供 OpenAI-compatible ChatCompletions”为硬约束；如果要加载 LoRA adapter，请优先选择支持 LoRA 的推理服务，否则用 5.2 的“合并权重”方案。

---

## 7. 启用 GraphRAG（可追溯引用，建议写作课必开）

### 7.1 构建索引（离线）
在仓库内生成索引文件（放进 `code/ai_service/app/data/`，便于容器打包或挂载）：
```bash
mkdir -p code/ai_service/app/data
cd code/ai_service
python3 -m app.graphrag.build --input ../../docs --output app/data/graphrag_index.json --root ../..
```

如果你用 `docker compose` 部署，建议把索引目录挂载成 volume（便于更新且不必重建镜像）：
```yaml
# code/docker-compose.yml (ai 服务)
volumes:
  - ./ai_service/app/data:/app/app/data
```

### 7.2 配置环境变量（`code/.env`）
```env
GRAPH_RAG_ENABLED=true
GRAPH_RAG_INDEX_PATH=app/data/graphrag_index.json
```

> 以上配置只启用“关键词 + 图扩展”的 RAG（无需向量库/embedding）。如需混合检索（`/v1/chat/hybrid`），再参考 `docs/05-explanation/ai/graph-rag.md` 配置 `EMBEDDING_PROVIDER/VECTOR_STORE_PATH`。

---

## 8. 部署项目服务（Docker Compose）

### 8.1 配置 `code/.env`
从模板复制：
```bash
cp code/.env.example code/.env
```

关键项（示例）：
```env
# 路由策略与网关信任
APP_ENV=prod
LLM_ROUTING_POLICY=local_first
AI_GATEWAY_SHARED_TOKEN=change_me_gateway_token
LLM_ENABLE_CLOUD_FALLBACK_NONPROD=false
LLM_LOCAL_TIMEOUT_SEC=30
LLM_CLOUD_TIMEOUT_SEC=60

# local upstream（指向你自建 HF 推理服务）
LLM_BASE_URL_LOCAL=http://<llm-host>:<port>
LLM_API_KEY_LOCAL=dummy
LLM_MODEL_LOCAL=<your-model-name>

# cloud upstream（仅用于 public 请求受控兜底）
LLM_BASE_URL_CLOUD=https://<cloud-endpoint>
LLM_API_KEY_CLOUD=<cloud-key>
LLM_MODEL_CLOUD=<cloud-model>

# GraphRAG（可选但推荐）
GRAPH_RAG_ENABLED=true
GRAPH_RAG_INDEX_PATH=app/data/graphrag_index.json
```

### 8.2 启动
```bash
cd code
docker compose up -d --build
```

### 8.3 健康检查
```bash
curl http://localhost:8080/healthz
curl http://localhost:8001/healthz
curl http://localhost:8002/healthz
```

---

## 9. 写作课程的接口建议（英文为主，兼顾中文）

### 9.1 结构化写作评估
接口：`POST /v1/writing/analyze`（实现见：`code/ai_service/app/main.py`）
```bash
curl -X POST http://localhost:8001/v1/writing/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "writing_type": "literature_review",
    "content": "Your text...",
    "student_profile": {"level":"graduate","lang":"en"}
  }'
```

### 9.2 启用 RAG 的对话（追加 `_rag` 后缀）
```bash
curl -X POST http://localhost:8001/v1/chat \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "tutor_rag",
    "messages": [{"role":"user","content":"Summarize key criteria for a literature review."}]
  }'
```

### 9.3 引导式学习（guided）

接口：`POST /v1/chat/guided`（实现见：`code/ai_service/app/main.py`）

```bash
curl -X POST http://localhost:8001/v1/chat/guided \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "如何写出清晰的 thesis statement",
    "messages": [{"role":"user","content":"我总写不清楚 thesis statement，应该怎么练？"}],
    "user_id": "student-001",
    "course_id": "course-001"
  }'
```

---

## 10. 推荐落地顺序（贴合仓库计划）
1) 先把训练管线跑通：`sample` → `tool`/`rag`
2) 固定小规模回归集（200-500 条）与评测脚本（见 `code/ai_service/training/`）
3) 出一个可部署的 `adapter_multitask`（`run_train.sh all`）
4) 上线时先只启用 Chat + GraphRAG；工具调用能力稳定后再启用 `/v1/chat_with_tools`
5) 写作课场景建议把 `guided` 与"学习档案/薄弱点"联动，用于形成过程性辅导闭环

---

## 11. 相关文档

- [NPU 分层部署策略](./npu-tiered-deployment.md) - 端侧 NPU 硬件分层与模型档位选择
- [配置说明](./configuration.md) - 环境变量与配置项详解
- [故障排查](./troubleshooting.md) - 常见部署问题与解决方案

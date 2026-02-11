# 第二次训练执行计划（参数化路径版）

**日期**: 2026-02-09  
**目标**: 在远程 GPU 环境稳定完成 `sample/style/writing/all` 训练并可回收产物

## 一、统一变量与约定

```bash
export REMOTE_HOST="connect.cqa1.seetacloud.com"
export REMOTE_PORT="43821"
export REMOTE_USER="root"
export REMOTE_PROJECT_ROOT="/root/graduationDesign"
```

统一状态机：

`precheck -> sample -> style -> writing -> all -> collect`

说明：

- 自动化脚本 `scripts/remote_train_all.sh` 与手动执行都遵循此状态机。
- 任何阶段失败，默认记录日志并进入问题分析，不直接跳过失败门禁。

## 二、阶段化执行

### 阶段0：连接与代码同步

```bash
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST"
cd "$REMOTE_PROJECT_ROOT"
git pull origin main
git log --oneline -5
```

### 阶段1：precheck

#### 自动化入口（推荐）

```bash
bash scripts/remote_train_all.sh \
  --project-root "$REMOTE_PROJECT_ROOT" \
  --non-interactive \
  --yes
```

#### 手动入口

```bash
bash scripts/verify_training_ready.sh --gpu-gate strict
```

GPU 门禁模式：

- `strict`：驱动异常立即失败
- `warn`：驱动异常仅告警
- `off`：跳过驱动门禁

### 阶段2：sample

```bash
bash code/ai_service/training/run_train.sh sample
```

验收：

- 产物存在：`outputs/adapter/adapter_sample/`
- 报告存在：`outputs/adapter/adapter_sample/eval_report_sample.md`

### 阶段3：style

```bash
bash code/ai_service/training/run_train.sh style
```

建议检查：

```bash
cat outputs/adapter/adapter_style/eval_report_style.md
```

### 阶段4：writing

```bash
bash code/ai_service/training/run_train.sh writing
```

建议检查：

```bash
cat outputs/adapter/adapter_writing/eval_report_writing.md
```

### 阶段5：all

```bash
bash code/ai_service/training/run_train.sh all
```

建议检查：

```bash
cat outputs/adapter/adapter_multitask/eval_report_all.md
```

### 阶段6：collect

自动化脚本会在 `outputs/training_sync/run_<timestamp>/` 下自动汇总。  
手动流程可执行：

```bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_DIR="outputs/training_sync/run_${TIMESTAMP}"
mkdir -p "$REPORT_DIR"
cp outputs/adapter/adapter_*/*.md "$REPORT_DIR/" 2>/dev/null || true
cp outputs/adapter/adapter_*/*.json "$REPORT_DIR/" 2>/dev/null || true
cp outputs/logs/train_*.log "$REPORT_DIR/" 2>/dev/null || true
```

## 三、非交互与CI场景

`remote_train_all.sh` 支持：

- `--project-root <path>`
- `--non-interactive`
- `--yes`
- `--skip-sample`

对应环境变量（CLI 优先）：

- `TRAIN_SYNC_PROJECT_ROOT`
- `TRAIN_SYNC_NON_INTERACTIVE`
- `TRAIN_SYNC_ASSUME_YES`
- `TRAIN_SYNC_SKIP_SAMPLE`

CI/无 TTY 推荐：

```bash
TRAIN_SYNC_NON_INTERACTIVE=1 TRAIN_SYNC_ASSUME_YES=1 \
bash scripts/remote_train_all.sh --project-root "$REMOTE_PROJECT_ROOT"
```

## 四、同步包链路（sha256 主流程 + 旧包兼容）

### 构建同步包

```bash
bash scripts/build_training_sync_bundle.sh
```

产物：

- `<bundle>.tar.gz`
- `<bundle>.tar.gz.sha256`
- `<bundle>.SYNC_MANIFEST.sha256`

### 应用同步包

```bash
bash scripts/apply_training_sync_bundle.sh \
  --bundle /path/to/bundle.tar.gz \
  --project-root "$REMOTE_PROJECT_ROOT"
```

验证顺序：

1. 若存在 `SYNC_MANIFEST.sha256`，走 sha256 校验。
2. 否则读取旧 `SYNC_MANIFEST.txt`：
- hash 长度 64 -> sha256
- hash 长度 40 -> sha1
- 其他长度 -> 报错退出

## 五、监控与故障排查

监控：

```bash
nvidia-smi -l 1
tail -f outputs/logs/train_*.log
ps aux | grep -E "train_lora|run_train" | grep -v grep
```

常见问题：

1. CUDA OOM
```bash
export PER_DEVICE_TRAIN_BATCH_SIZE=1
export GRADIENT_ACCUMULATION_STEPS=16
```

2. 模型下载失败
```bash
pip install -U modelscope
export USE_MODELSCOPE=1
```

3. 非交互阻塞
```bash
bash scripts/remote_train_all.sh --non-interactive --yes --project-root "$REMOTE_PROJECT_ROOT"
```

## 六、结果下载与本地归档

在本地机器执行：

```bash
scp -P "$REMOTE_PORT" -r \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_ROOT/outputs/adapter" \
  ./outputs/

scp -P "$REMOTE_PORT" -r \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_ROOT/outputs/training_sync/run_*" \
  ./outputs/training_sync/

scp -P "$REMOTE_PORT" -r \
  "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_ROOT/outputs/logs" \
  ./outputs/
```

## 七、执行验收

1. 状态机阶段完整，有日志和标记文件。
2. 至少生成 `sample/style/writing/all` 对应 eval 报告。
3. 非交互模式下无输入阻塞。
4. 同步包默认使用 sha256，旧 manifest 可兼容校验。

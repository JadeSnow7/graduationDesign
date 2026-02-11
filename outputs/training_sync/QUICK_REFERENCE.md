# 训练执行快速参考卡

## 0) 统一变量

```bash
export REMOTE_HOST="connect.cqa1.seetacloud.com"
export REMOTE_PORT="43821"
export REMOTE_USER="root"
export REMOTE_PROJECT_ROOT="/root/graduationDesign"
```

## 1) 连接与同步

```bash
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST"
cd "$REMOTE_PROJECT_ROOT"
git pull origin main
```

## 2) 自动化执行（推荐）

```bash
bash scripts/remote_train_all.sh \
  --project-root "$REMOTE_PROJECT_ROOT" \
  --non-interactive \
  --yes
```

可选：跳过 sample（已人工验证过流程时使用）

```bash
bash scripts/remote_train_all.sh \
  --project-root "$REMOTE_PROJECT_ROOT" \
  --non-interactive \
  --yes \
  --skip-sample
```

## 3) 手动分阶段执行

状态机：`precheck -> sample -> style -> writing -> all -> collect`

```bash
# precheck
bash scripts/verify_training_ready.sh --gpu-gate strict

# sample
bash code/ai_service/training/run_train.sh sample

# style
bash code/ai_service/training/run_train.sh style

# writing
bash code/ai_service/training/run_train.sh writing

# all
bash code/ai_service/training/run_train.sh all
```

## 4) 监控

```bash
nvidia-smi -l 1
tail -f outputs/logs/train_*.log
ps aux | grep -E "train_lora|run_train" | grep -v grep
df -h
```

## 5) 查看结果

```bash
cat outputs/adapter/adapter_sample/eval_report_sample.md
cat outputs/adapter/adapter_style/eval_report_style.md
cat outputs/adapter/adapter_writing/eval_report_writing.md
cat outputs/adapter/adapter_multitask/eval_report_all.md

cat outputs/training_sync/run_*/TRAINING_SUMMARY.md
```

## 6) 本地下载

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

## 7) 常见问题

GPU内存不足：

```bash
export PER_DEVICE_TRAIN_BATCH_SIZE=1
export GRADIENT_ACCUMULATION_STEPS=16
```

模型下载失败：

```bash
pip install -U modelscope
export USE_MODELSCOPE=1
```

无 TTY/CI 卡在确认输入：

```bash
TRAIN_SYNC_NON_INTERACTIVE=1 TRAIN_SYNC_ASSUME_YES=1 \
bash scripts/remote_train_all.sh --project-root "$REMOTE_PROJECT_ROOT"
```

## 8) 时间预估

| 阶段 | 时间 |
|---|---|
| precheck | 10-15分钟 |
| sample | 5-10分钟 |
| style | 20-30分钟 |
| writing | 15-20分钟 |
| all | 30-40分钟 |
| collect | 5-10分钟 |
| 总计 | 1.5-2小时 |

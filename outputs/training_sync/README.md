# 训练文档索引（Training Sync）

**最后更新**: 2026-02-09

## 目标

本目录用于远程训练同步执行，统一两种方式：

1. 自动化执行：`scripts/remote_train_all.sh`
2. 手动分阶段执行：`verify -> sample -> style -> writing -> all -> collect`

两种方式都映射到同一状态机：

`precheck -> sample -> style -> writing -> all -> collect`

## 统一变量

在远程环境先定义以下变量，后续命令全部复用：

```bash
export REMOTE_HOST="connect.cqa1.seetacloud.com"
export REMOTE_PORT="43821"
export REMOTE_USER="root"
export REMOTE_PROJECT_ROOT="/root/graduationDesign"
```

## 文档导航

1. [快速参考卡](./QUICK_REFERENCE.md)
- 一屏常用命令（连接、执行、监控、下载）
- 自动化与手动两种流程

2. [训练执行计划](./TRAINING_PLAN_EXECUTION.md)
- 阶段化操作步骤
- 门禁与失败回滚
- 验证与验收清单

3. [执行检查清单](./TRAINING_CHECKLIST.md)
- 训练前/训练中/训练后检查项

4. [2026-02-09 正式训练收尾报告](./2026-02-09-formal-train/final_closure_report.md)
- 包含后评估修复结果、问题双轨记录、量化可行性测试结论（BnB + GGUF）
- 对应远端运行目录：`run_20260209_132531`

## 快速开始

### 方式A：自动化执行（推荐）

```bash
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST"
cd "$REMOTE_PROJECT_ROOT"
git pull origin main

# 非交互执行（无TTY/CI推荐）
bash scripts/remote_train_all.sh \
  --project-root "$REMOTE_PROJECT_ROOT" \
  --non-interactive \
  --yes
```

### 方式B：手动分阶段执行

```bash
ssh -p "$REMOTE_PORT" "$REMOTE_USER@$REMOTE_HOST"
cd "$REMOTE_PROJECT_ROOT"
git pull origin main

# precheck
bash scripts/verify_training_ready.sh --gpu-gate strict

# sample
bash code/ai_service/training/run_train.sh sample

# style -> writing -> all
bash code/ai_service/training/run_train.sh style
bash code/ai_service/training/run_train.sh writing
bash code/ai_service/training/run_train.sh all
```

## 新脚本接口（本轮）

### `scripts/remote_train_all.sh`

支持以下参数（CLI 优先级高于环境变量）：

- `--project-root <path>`
- `--non-interactive`
- `--yes`
- `--skip-sample`

对应环境变量：

- `TRAIN_SYNC_PROJECT_ROOT`
- `TRAIN_SYNC_NON_INTERACTIVE`
- `TRAIN_SYNC_ASSUME_YES`
- `TRAIN_SYNC_SKIP_SAMPLE`

### `scripts/verify_training_ready.sh`

支持 GPU 门禁级别：

- `--gpu-gate strict`（默认，驱动异常即失败）
- `--gpu-gate warn`（驱动异常仅告警）
- `--gpu-gate off`（跳过 GPU 驱动门禁）

## 下载结果

在本地机器执行：

```bash
export REMOTE_HOST="connect.cqa1.seetacloud.com"
export REMOTE_PORT="43821"
export REMOTE_USER="root"
export REMOTE_PROJECT_ROOT="/root/graduationDesign"

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

## 失败回滚（推荐顺序）

1. 仅某阶段失败：修复后重跑该阶段
2. 自动化流程中断：查看 `outputs/training_sync/run_*/TRAINING_SUMMARY.md`
3. 同步包应用失败：使用 `scripts/apply_training_sync_bundle.sh` 生成的备份目录回滚

## 相关文件

- 训练系统说明：`/Users/huaodong/graduationDesign/code/ai_service/training/README.md`
- 自动化脚本：`/Users/huaodong/graduationDesign/scripts/remote_train_all.sh`
- 准备验证脚本：`/Users/huaodong/graduationDesign/scripts/verify_training_ready.sh`
- 同步包构建脚本：`/Users/huaodong/graduationDesign/scripts/build_training_sync_bundle.sh`
- 同步包应用脚本：`/Users/huaodong/graduationDesign/scripts/apply_training_sync_bundle.sh`

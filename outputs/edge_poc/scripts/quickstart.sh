#!/bin/bash
# 学习助手 PoC 快速启动脚本

set -e  # 遇到错误立即退出

echo "========================================="
echo "学习助手 PoC 快速启动"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 步骤 1: 检查环境
echo -e "\n${YELLOW}[Step 1/5]${NC} 检查环境..."

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}错误: 未找到 python3${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Python3 已安装"

# 检查 MLX
if python3 -c "import mlx.core" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} MLX 已安装"
else
    echo -e "${YELLOW}⚠${NC} MLX 未安装，正在安装..."
    pip3 install mlx mlx-lm
fi

# 检查其他依赖
echo -e "${YELLOW}检查依赖包...${NC}"
pip3 install -q transformers datasets peft

# 步骤 2: 创建目录结构
echo -e "\n${YELLOW}[Step 2/5]${NC} 创建目录结构..."

BASE_DIR="/Volumes/Data/models"

# 检查 /Volumes/Data 是否存在
if [ ! -d "/Volumes/Data" ]; then
    echo -e "${RED}错误: /Volumes/Data 目录不存在${NC}"
    echo "请确保外部存储已挂载，或修改 BASE_DIR 变量"
    exit 1
fi

# 创建目录
mkdir -p "$BASE_DIR/qwen3-0.6b-mlx-4bit"
mkdir -p "$BASE_DIR/learning-assistant-training/data"
mkdir -p "$BASE_DIR/learning-assistant-training/checkpoints"
mkdir -p "$BASE_DIR/learning-assistant-training/adapters"
mkdir -p "$BASE_DIR/learning-assistant-training/logs"
mkdir -p "$BASE_DIR/learning-assistant-deployed/merged_model"
mkdir -p "$BASE_DIR/learning-assistant-deployed/mlx_optimized"

echo -e "${GREEN}✓${NC} 目录结构创建完成"

# 步骤 3: 生成训练数据
echo -e "\n${YELLOW}[Step 3/5]${NC} 生成训练数据..."

python3 outputs/edge_poc/scripts/generate_learning_assistant_data.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} 训练数据生成完成"
else
    echo -e "${RED}✗${NC} 训练数据生成失败"
    exit 1
fi

# 步骤 4: 下载模型（可选）
echo -e "\n${YELLOW}[Step 4/5]${NC} 下载基座模型..."

if [ -f "$BASE_DIR/qwen3-0.6b-mlx-4bit/config.json" ]; then
    echo -e "${GREEN}✓${NC} 模型已存在，跳过下载"
else
    echo -e "${YELLOW}⚠${NC} 模型不存在，需要手动下载"
    echo "请访问: https://modelscope.cn/models/Qwen/Qwen3-0.6B-MLX-4bit"
    echo "或运行: modelscope download --model Qwen/Qwen3-0.6B-MLX-4bit --local_dir $BASE_DIR/qwen3-0.6b-mlx-4bit"
fi

# 步骤 5: 显示下一步操作
echo -e "\n${YELLOW}[Step 5/5]${NC} 下一步操作..."

echo -e "\n${GREEN}环境准备完成！${NC}"
echo -e "\n下一步操作："
echo -e "1. 确保模型已下载到: ${YELLOW}$BASE_DIR/qwen3-0.6b-mlx-4bit${NC}"
echo -e "2. 查看训练数据: ${YELLOW}$BASE_DIR/learning-assistant-training/data/${NC}"
echo -e "3. 开始训练（待实现）: ${YELLOW}python3 scripts/train_mlx_lora.py${NC}"

# 显示统计信息
echo -e "\n${GREEN}数据统计：${NC}"
if [ -f "$BASE_DIR/learning-assistant-training/data/train.jsonl" ]; then
    TRAIN_COUNT=$(wc -l < "$BASE_DIR/learning-assistant-training/data/train.jsonl")
    EVAL_COUNT=$(wc -l < "$BASE_DIR/learning-assistant-training/data/eval.jsonl")
    TEST_COUNT=$(wc -l < "$BASE_DIR/learning-assistant-training/data/test.jsonl")
    echo "  训练集: $TRAIN_COUNT 样本"
    echo "  验证集: $EVAL_COUNT 样本"
    echo "  测试集: $TEST_COUNT 样本"
fi

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}快速启动完成！${NC}"
echo -e "${GREEN}=========================================${NC}"

#!/usr/bin/env bash
# Training Readiness Verification Script
# Checks that all prerequisites are met before training

set -euo pipefail

echo "=========================================="
echo "Training Readiness Verification"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((ERRORS++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

# Check 1: Directory structure
echo "Checking directory structure..."
if [ -d "data/training/processed" ] && [ -d "data/training/eval" ]; then
    check_pass "Training directories exist"
else
    check_fail "Training directories missing"
fi

# Check 2: Training data files
echo ""
echo "Checking training data files..."
FILES=(
    "data/training/processed/style_sft.jsonl"
    "data/training/processed/writing_sft.jsonl"
    "data/training/processed/all_sft.jsonl"
    "data/training/processed/style_sft_sample.jsonl"
    "data/training/eval/style_benchmark.jsonl"
    "data/training/eval/writing_benchmark.jsonl"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        lines=$(wc -l < "$file" | tr -d ' ')
        check_pass "$file ($lines samples)"
    else
        check_fail "$file missing"
    fi
done

# Check 3: Python dependencies
echo ""
echo "Checking Python dependencies..."
DEPS=("torch" "transformers" "datasets" "peft")
for dep in "${DEPS[@]}"; do
    if python3 -c "import $dep" 2>/dev/null; then
        check_pass "Python package: $dep"
    else
        check_fail "Python package missing: $dep"
    fi
done

# Check 4: Optional dependencies
echo ""
echo "Checking optional dependencies..."
if python3 -c "import bitsandbytes" 2>/dev/null; then
    check_pass "bitsandbytes (for QLoRA)"
else
    check_warn "bitsandbytes not found (QLoRA may not work)"
fi

if python3 -c "import tensorboard" 2>/dev/null; then
    check_pass "tensorboard (for logging)"
else
    check_warn "tensorboard not found (logging may not work)"
fi

# Check 5: Training script
echo ""
echo "Checking training script..."
if [ -f "code/ai_service/training/run_train.sh" ]; then
    if grep -q "writing)" code/ai_service/training/run_train.sh; then
        check_pass "Training script has writing stage"
    else
        check_fail "Training script missing writing stage"
    fi
else
    check_fail "Training script not found"
fi

# Check 6: Data validation
echo ""
echo "Validating data format..."
python3 -c "
import json
import sys

files = [
    'data/training/processed/style_sft.jsonl',
    'data/training/processed/writing_sft.jsonl',
    'data/training/eval/style_benchmark.jsonl',
    'data/training/eval/writing_benchmark.jsonl'
]

all_valid = True
for f in files:
    try:
        with open(f) as fp:
            for i, line in enumerate(fp, 1):
                if line.strip():
                    data = json.loads(line)
                    if 'messages' not in data:
                        print(f'ERROR: {f} line {i} missing messages field')
                        all_valid = False
    except Exception as e:
        print(f'ERROR: {f} - {e}')
        all_valid = False

sys.exit(0 if all_valid else 1)
" && check_pass "Data format valid" || check_fail "Data format invalid"

# Check 7: GPU availability (optional)
echo ""
echo "Checking GPU availability..."
if python3 -c "import torch; assert torch.cuda.is_available()" 2>/dev/null; then
    GPU_NAME=$(python3 -c "import torch; print(torch.cuda.get_device_name(0))" 2>/dev/null)
    check_pass "GPU available: $GPU_NAME"
elif python3 -c "import torch; assert torch.backends.mps.is_available()" 2>/dev/null; then
    check_pass "Apple Silicon GPU (MPS) available"
else
    check_warn "No GPU detected (training will be slow)"
fi

# Check 8: Disk space
echo ""
echo "Checking disk space..."
AVAILABLE=$(df -h . | awk 'NR==2 {print $4}')
check_pass "Available disk space: $AVAILABLE"

# Summary
echo ""
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Ready to start training:"
    echo "  bash code/ai_service/training/run_train.sh sample   # Quick test"
    echo "  bash code/ai_service/training/run_train.sh style    # Electromagnetic course"
    echo "  bash code/ai_service/training/run_train.sh writing  # Academic writing"
    echo "  bash code/ai_service/training/run_train.sh all      # Multitask"
    exit 0
else
    echo -e "${RED}✗ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "Please fix the errors before training."
    exit 1
fi

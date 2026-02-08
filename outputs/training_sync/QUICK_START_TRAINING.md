# Quick Start: Training Guide

## Prerequisites

1. **Install Dependencies**
```bash
pip install -r code/ai_service/training/requirements.txt
```

2. **Set Up Model Access** (choose one):

**Option A: HuggingFace**
```bash
huggingface-cli login
# Or set token:
export HF_TOKEN=your_token_here
```

**Option B: ModelScope (China)**
```bash
pip install modelscope
export USE_MODELSCOPE=1
```

## Training Commands

### 1. Quick Test (Recommended First)
```bash
cd /Users/huaodong/graduationDesign
bash code/ai_service/training/run_train.sh sample
```
- **Duration**: 5-10 minutes
- **Samples**: 3
- **Purpose**: Validate pipeline

### 2. Electromagnetic Course Training
```bash
bash code/ai_service/training/run_train.sh style
```
- **Duration**: 20-30 minutes
- **Samples**: 28 training + 11 eval
- **Output**: `outputs/adapter/adapter_style/`

### 3. Academic Writing Training
```bash
bash code/ai_service/training/run_train.sh writing
```
- **Duration**: 15-20 minutes
- **Samples**: 12 training + 6 eval
- **Output**: `outputs/adapter/adapter_writing/`

### 4. Multitask Training
```bash
bash code/ai_service/training/run_train.sh all
```
- **Duration**: 30-40 minutes
- **Samples**: 40 training + 11 eval
- **Output**: `outputs/adapter/adapter_multitask/`

## Monitoring Training

### View Real-time Logs
```bash
tail -f outputs/logs/train_*.log
```

### TensorBoard
```bash
tensorboard --logdir outputs/logs
# Open http://localhost:6006
```

## After Training

### Check Evaluation Report
```bash
cat outputs/adapter/adapter_style/eval_report_style.md
```

### Test Model Manually
```bash
python3 code/ai_service/training/generate_predictions.py \
  --adapter_path outputs/adapter/adapter_style \
  --eval_file data/training/eval/style_benchmark.jsonl \
  --output_file outputs/test_predictions.jsonl
```

### View Predictions
```bash
cat outputs/test_predictions.jsonl | python3 -m json.tool | less
```

## Troubleshooting

### Out of Memory
```bash
# Reduce batch size
export PER_DEVICE_TRAIN_BATCH_SIZE=1
export GRADIENT_ACCUMULATION_STEPS=16
```

### Training Too Slow
```bash
# Reduce epochs
export NUM_TRAIN_EPOCHS=1
```

### Model Download Issues
```bash
# Use ModelScope instead
export USE_MODELSCOPE=1
bash code/ai_service/training/run_train.sh sample
```

## Expected Results

### Style Model
- Key point coverage: >90%
- Format compliance: >95%
- Can explain electromagnetic concepts clearly

### Writing Model
- Key point coverage: >85%
- Format compliance: >90%
- Can provide academic writing guidance

### Multitask Model
- Key point coverage: >88%
- Format compliance: >92%
- Handles both electromagnetic and writing tasks

## File Locations

### Training Data
```
data/training/processed/
├── style_sft.jsonl          (28 samples)
├── writing_sft.jsonl        (12 samples)
├── all_sft.jsonl            (40 samples)
└── style_sft_sample.jsonl   (3 samples)
```

### Evaluation Data
```
data/training/eval/
├── style_benchmark.jsonl    (11 samples)
└── writing_benchmark.jsonl  (6 samples)
```

### Outputs
```
outputs/
├── adapter/
│   ├── adapter_style/       # Style model
│   ├── adapter_writing/     # Writing model
│   └── adapter_multitask/   # Combined model
└── logs/                    # Training logs
```

## Next Steps

1. Run sample training to validate setup
2. Run style training for electromagnetic course
3. Run writing training for academic writing
4. Run multitask training for combined capabilities
5. Compare model performance
6. Deploy best model to production

## Support

- Training README: `code/ai_service/training/README.md`
- Implementation Summary: `outputs/training_sync/IMPLEMENTATION_SUMMARY.md`
- Training Plan: Original plan document

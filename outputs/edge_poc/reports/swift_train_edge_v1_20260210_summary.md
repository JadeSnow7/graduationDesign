# Swift Train Edge V1 Summary (20260210)

- command: `python3 -m swift.cli.sft --model /Volumes/Data/models/qwen3-0.6b-instruct-hf ...`
- output_root: `/Volumes/Data/models/learning-assistant-training/swift_ckpt/edge_qwen3_0p6b_v1/v1-20260210-181349`
- configured_epochs: 3
- configured_steps: 150
- logged_global_step: 150
- best_checkpoint: `/Volumes/Data/models/learning-assistant-training/swift_ckpt/edge_qwen3_0p6b_v1/v1-20260210-181349/checkpoint-100`
- best_metric(eval_loss): `0.02445082`

## Notes
- Training reached step 150 according to `logging.jsonl`.
- During final stage, local disk temporary space errors (`No space left on device`) occurred and process entered a hang state.
- Process was manually interrupted after metrics and checkpoints were confirmed.
- Deploy/integration tests in this round use `checkpoint-100`.

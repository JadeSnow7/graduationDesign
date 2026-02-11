# Training Synchronization

This directory contains training synchronization artifacts, logs, and reports.

## Structure

- `bundles/`: Contains training code/asset bundles sent to remote server.
- `run_<timestamp>_<tag>/`: Contains returned training artifacts (logs, reports, etc.) from remote runs.
- `2026-02-10-gap-analysis/`: V3 data augmentation and gap analysis.
- `2026-02-09-formal-train/`: V2.2 closure report.
- `2026-02-10-v3-closure/`: **[NEW]** V3 closure report (V3B/V3C results).

## Key Reports

- [V3 Closure Report (2026-02-10)](2026-02-10-v3-closure/final_closure_report.md) - **Latest**
- [V2.2 Closure Report (2026-02-09)](2026-02-09-formal-train/final_closure_report.md)

## Usage

Use `scripts/build_training_sync_bundle.sh` to package code updates.
Use `scripts/remote_train_all.sh` (on remote) to execute training.
Use `scripts/quantization_feasibility.sh` (on remote) to verify quantization.

#!/usr/bin/env python3
"""Prepare local HF-format Qwen3-0.6B-Instruct model with fallback download sources."""

from __future__ import annotations

import argparse
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional


def _download_from_modelscope(model_id: str, cache_dir: Optional[Path]) -> Optional[Path]:
    try:
        from modelscope import snapshot_download
    except Exception:
        return None

    try:
        path = snapshot_download(model_id, cache_dir=str(cache_dir) if cache_dir else None)
    except Exception:
        return None
    return Path(path)


def _download_from_huggingface(repo_id: str, cache_dir: Optional[Path]) -> Optional[Path]:
    try:
        from huggingface_hub import snapshot_download
    except Exception:
        return None

    try:
        path = snapshot_download(repo_id, cache_dir=str(cache_dir) if cache_dir else None)
    except Exception:
        return None
    return Path(path)


def _copy_tree(src: Path, dst: Path) -> None:
    if dst.exists():
        shutil.rmtree(dst)
    shutil.copytree(src, dst)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepare Qwen3-0.6B-Instruct local model directory")
    parser.add_argument(
        "--target-dir",
        type=Path,
        default=Path("/Volumes/Data/models/qwen3-0.6b-instruct-hf"),
        help="Final local model directory",
    )
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=Path("/Volumes/Data/models/.cache"),
        help="Download cache directory",
    )
    parser.add_argument(
        "--report-path",
        type=Path,
        default=Path(
            f"/Users/huaodong/graduationDesign/outputs/edge_poc/reports/"
            f"model_prepare_qwen3_0p6b_instruct_{datetime.now().strftime('%Y%m%d')}.json"
        ),
        help="Output report json path",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.cache_dir.mkdir(parents=True, exist_ok=True)
    args.report_path.parent.mkdir(parents=True, exist_ok=True)

    attempts: list[dict[str, str]] = []
    downloaded_path: Optional[Path] = None

    preferred_ids = (
        "Qwen/Qwen3-0.6B-Instruct",
        "qwen/Qwen3-0.6B-Instruct",
        "Qwen/Qwen3-0.6B",
        "qwen/Qwen3-0.6B",
        "Qwen/Qwen3-0.6B-Base",
        "qwen/Qwen3-0.6B-Base",
    )

    # ModelScope attempts
    for model_id in preferred_ids:
        path = _download_from_modelscope(model_id, args.cache_dir)
        attempts.append({"source": "modelscope", "id": model_id, "status": "ok" if path else "failed"})
        if path:
            downloaded_path = path
            break

    # HuggingFace fallback
    if downloaded_path is None:
        for repo_id in preferred_ids:
            path = _download_from_huggingface(repo_id, args.cache_dir)
            attempts.append({"source": "huggingface", "id": repo_id, "status": "ok" if path else "failed"})
            if path:
                downloaded_path = path
                break

    if downloaded_path is None:
        report = {
            "generated_at": datetime.now().isoformat(timespec="seconds"),
            "target_dir": str(args.target_dir),
            "status": "failed",
            "attempts": attempts,
            "message": "all download attempts failed",
        }
        args.report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        raise SystemExit("Failed to download Qwen3-0.6B-Instruct from all sources")

    _copy_tree(downloaded_path, args.target_dir)

    key_files = [
        "config.json",
        "tokenizer_config.json",
        "tokenizer.json",
    ]
    existing_key_files = [name for name in key_files if (args.target_dir / name).exists()]

    report = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "target_dir": str(args.target_dir),
        "source_dir": str(downloaded_path),
        "status": "ok",
        "attempts": attempts,
        "key_files_found": existing_key_files,
    }
    args.report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Model prepared at: {args.target_dir}")
    print(f"Source cache: {downloaded_path}")
    print(f"Report: {args.report_path}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
from __future__ import annotations

import runpy
from pathlib import Path


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    target = root / "code/ai_service/training/eval_metrics.py"
    runpy.run_path(str(target), run_name="__main__")


if __name__ == "__main__":
    main()

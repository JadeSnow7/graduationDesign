#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Iterable

TOKEN_PATTERN = re.compile(r"\S+")


def iter_jsonl(path: Path) -> Iterable[dict]:
    with path.open("r", encoding="utf-8") as handle:
        for line_num, line in enumerate(handle, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"Invalid JSON in {path}:{line_num}") from exc


def tokenize(text: str) -> list[str]:
    return TOKEN_PATTERN.findall(text)


def build_language_model(records: Iterable[dict]) -> tuple[Counter, int]:
    counts = Counter()
    total = 0
    for record in records:
        response = record.get("response") or ""
        tokens = tokenize(response)
        counts.update(tokens)
        total += len(tokens)
    return counts, total


def evaluate(records: Iterable[dict], counts: Counter, total: int) -> dict:
    vocab_size = max(len(counts), 1)
    total_tokens = 0
    nll = 0.0
    for record in records:
        response = record.get("response") or ""
        tokens = tokenize(response)
        for token in tokens:
            token_count = counts.get(token, 0)
            prob = (token_count + 1) / (total + vocab_size)
            nll -= math.log(prob)
        total_tokens += len(tokens)
    avg_nll = nll / total_tokens if total_tokens else 0.0
    perplexity = math.exp(avg_nll) if total_tokens else 0.0
    return {
        "tokens": total_tokens,
        "avg_nll": avg_nll,
        "perplexity": perplexity,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run a smoke-test training loop on distilled data.")
    parser.add_argument("--train", required=True, help="Distilled training JSONL file.")
    parser.add_argument("--eval", required=True, help="Distilled eval JSONL file.")
    parser.add_argument("--metrics", default="outputs/smoke_train_metrics.json", help="Metrics output path.")
    args = parser.parse_args()

    train_path = Path(args.train)
    eval_path = Path(args.eval)
    metrics_path = Path(args.metrics)
    metrics_path.parent.mkdir(parents=True, exist_ok=True)

    train_records = list(iter_jsonl(train_path))
    eval_records = list(iter_jsonl(eval_path))

    counts, total = build_language_model(train_records)
    train_eval = evaluate(train_records, counts, total)
    eval_eval = evaluate(eval_records, counts, total)

    metrics = {
        "train_file": str(train_path),
        "eval_file": str(eval_path),
        "train_records": len(train_records),
        "eval_records": len(eval_records),
        "vocab_size": len(counts),
        "train": train_eval,
        "eval": eval_eval,
    }
    metrics_path.write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()

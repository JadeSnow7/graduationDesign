#!/usr/bin/env python3
"""Convert edge assistant JSONL data into ms-swift chat JSONL format."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any


SYSTEM_PROMPT = (
    "你是端侧学习助手，优先本地处理请求。回答要简洁、结构化、可执行。\n"
    "对于课程资源检索、学习追踪、简单问答，直接给出本地可执行建议。\n"
    "当问题属于复杂推理、证明、深入理论分析时，不要编造长推导，"
    "请明确说明该问题将转发云端 AI 处理。"
)


@dataclass
class SplitStats:
    input_count: int = 0
    output_count: int = 0
    malformed_count: int = 0
    missing_field_count: int = 0


def build_user_content(instruction: str, user_input: str) -> str:
    instruction = instruction.strip()
    user_input = user_input.strip()
    if user_input:
        return f"指令:\n{instruction}\n\n输入:\n{user_input}"
    return f"指令:\n{instruction}"


def convert_record(obj: dict[str, Any], sample_id: str) -> dict[str, Any]:
    instruction = str(obj.get("instruction", "")).strip()
    output = str(obj.get("output", "")).strip()
    user_input = str(obj.get("input", "")).strip()

    if not instruction or not output:
        raise ValueError("record missing required field: instruction/output")

    meta = {
        "task_type": str(obj.get("task_type", "")).strip(),
        "route": str(obj.get("route", "")).strip(),
    }

    return {
        "id": sample_id,
        "mode": "tutor",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_user_content(instruction, user_input)},
            {"role": "assistant", "content": output},
        ],
        "meta": meta,
    }


def convert_split(
    split_name: str,
    input_path: Path,
    output_path: Path,
) -> tuple[SplitStats, Counter[str], Counter[str]]:
    stats = SplitStats()
    task_counter: Counter[str] = Counter()
    route_counter: Counter[str] = Counter()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with input_path.open("r", encoding="utf-8") as src, output_path.open("w", encoding="utf-8") as dst:
        for idx, line in enumerate(src, start=1):
            stats.input_count += 1
            raw = line.strip()
            if not raw:
                stats.malformed_count += 1
                continue
            try:
                obj = json.loads(raw)
            except json.JSONDecodeError:
                stats.malformed_count += 1
                continue

            sample_id = f"edge-{split_name}-{idx:06d}"
            try:
                record = convert_record(obj, sample_id)
            except ValueError:
                stats.missing_field_count += 1
                continue

            task_type = record["meta"].get("task_type", "")
            route = record["meta"].get("route", "")
            if task_type:
                task_counter[task_type] += 1
            if route:
                route_counter[route] += 1

            dst.write(json.dumps(record, ensure_ascii=False) + "\n")
            stats.output_count += 1

    return stats, task_counter, route_counter


def default_report_path() -> Path:
    date_tag = datetime.now().strftime("%Y%m%d")
    return Path(f"/Users/huaodong/graduationDesign/outputs/edge_poc/reports/edge_swift_data_check_{date_tag}.json")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Convert edge data to ms-swift chat JSONL")
    parser.add_argument(
        "--input-dir",
        type=Path,
        default=Path("/Volumes/Data/models/learning-assistant-training/data"),
        help="Input directory containing train/eval/test jsonl",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path("/Users/huaodong/graduationDesign/data/training/processed/edge_swift_v1"),
        help="Output directory for train/valid/test jsonl",
    )
    parser.add_argument(
        "--report-path",
        type=Path,
        default=default_report_path(),
        help="Validation report path (json)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    args.report_path.parent.mkdir(parents=True, exist_ok=True)

    mapping = {
        "train": ("train.jsonl", "train.jsonl"),
        "valid": ("eval.jsonl", "valid.jsonl"),
        "test": ("test.jsonl", "test.jsonl"),
    }

    split_results: dict[str, dict[str, Any]] = {}
    aggregate_task_counter: Counter[str] = Counter()
    aggregate_route_counter: Counter[str] = Counter()
    total_input = 0
    total_output = 0
    total_malformed = 0
    total_missing = 0

    for split_name, (input_file, output_file) in mapping.items():
        input_path = args.input_dir / input_file
        output_path = args.output_dir / output_file
        if not input_path.exists():
            raise FileNotFoundError(f"missing input file: {input_path}")

        stats, task_counter, route_counter = convert_split(split_name, input_path, output_path)
        total_input += stats.input_count
        total_output += stats.output_count
        total_malformed += stats.malformed_count
        total_missing += stats.missing_field_count
        aggregate_task_counter.update(task_counter)
        aggregate_route_counter.update(route_counter)

        split_results[split_name] = {
            "input_file": str(input_path),
            "output_file": str(output_path),
            "input_count": stats.input_count,
            "output_count": stats.output_count,
            "malformed_count": stats.malformed_count,
            "missing_field_count": stats.missing_field_count,
            "task_type_distribution": dict(task_counter),
            "route_distribution": dict(route_counter),
        }

    report = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "input_dir": str(args.input_dir),
        "output_dir": str(args.output_dir),
        "system_prompt": SYSTEM_PROMPT,
        "summary": {
            "total_input_count": total_input,
            "total_output_count": total_output,
            "total_malformed_count": total_malformed,
            "total_missing_field_count": total_missing,
            "parse_success_rate": round((total_output / total_input) if total_input else 0.0, 6),
            "task_type_distribution": dict(aggregate_task_counter),
            "route_distribution": dict(aggregate_route_counter),
        },
        "splits": split_results,
    }

    args.report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    print("Conversion completed successfully.")
    print(f"Output directory: {args.output_dir}")
    print(f"Report: {args.report_path}")
    print(
        f"Summary: input={total_input}, output={total_output}, "
        f"malformed={total_malformed}, missing={total_missing}"
    )


if __name__ == "__main__":
    main()

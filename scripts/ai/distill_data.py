#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Iterable


def iter_jsonl(paths: Iterable[Path]) -> Iterable[dict]:
    for path in paths:
        with path.open("r", encoding="utf-8") as handle:
            for line_num, line in enumerate(handle, start=1):
                line = line.strip()
                if not line:
                    continue
                try:
                    yield json.loads(line)
                except json.JSONDecodeError as exc:
                    raise ValueError(f"Invalid JSON in {path}:{line_num}") from exc


def build_prompt(messages: list[dict]) -> tuple[str | None, str | None]:
    system_parts = [m.get("content", "").strip() for m in messages if m.get("role") == "system"]
    user_parts = [m.get("content", "").strip() for m in messages if m.get("role") == "user"]
    assistant_parts = [m.get("content", "").strip() for m in messages if m.get("role") == "assistant"]

    if not user_parts or not assistant_parts:
        return None, None

    system_text = "\n".join([part for part in system_parts if part])
    user_text = "\n".join([part for part in user_parts if part])
    assistant_text = "\n".join([part for part in assistant_parts if part])

    prompt_sections = []
    if system_text:
        prompt_sections.append(system_text)
    prompt_sections.append(f"用户: {user_text}")
    prompt = "\n\n".join(prompt_sections)
    return prompt, assistant_text


def main() -> None:
    parser = argparse.ArgumentParser(description="Distill training data into prompt/response format.")
    parser.add_argument(
        "--input",
        required=True,
        nargs="+",
        help="Input JSONL file(s) or directories containing JSONL files.",
    )
    parser.add_argument("--output", required=True, help="Output distilled JSONL file.")
    parser.add_argument("--report", default="outputs/distillation_report.json", help="Report JSON path.")
    args = parser.parse_args()

    input_paths: list[Path] = []
    for raw in args.input:
        path = Path(raw)
        if path.is_dir():
            input_paths.extend(sorted(path.glob("*.jsonl")))
        else:
            input_paths.append(path)

    if not input_paths:
        raise SystemExit("No input JSONL files found.")

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    dropped = Counter()
    seen = set()
    distilled = []

    for record in iter_jsonl(input_paths):
        messages = record.get("messages")
        if not isinstance(messages, list):
            dropped["missing_messages"] += 1
            continue
        prompt, response = build_prompt(messages)
        if not prompt or not response:
            dropped["missing_prompt_or_response"] += 1
            continue
        key = (prompt, response)
        if key in seen:
            dropped["duplicate"] += 1
            continue
        seen.add(key)
        distilled.append(
            {
                "id": record.get("id"),
                "mode": record.get("mode"),
                "prompt": prompt,
                "response": response,
                "meta": record.get("meta", {}),
                "source_id": record.get("id"),
            }
        )

    with output_path.open("w", encoding="utf-8") as handle:
        for item in distilled:
            handle.write(json.dumps(item, ensure_ascii=False) + "\n")

    report = {
        "inputs": [str(path) for path in input_paths],
        "output": str(output_path),
        "total_records": sum(dropped.values()) + len(distilled),
        "distilled_records": len(distilled),
        "dropped": dict(dropped),
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()

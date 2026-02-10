#!/usr/bin/env python3
"""
导出模型到 ONNX 格式

用途: 将量化后的模型导出为 ONNX 格式，用于 Apple Neural Engine 推理
输入: 量化后的 PyTorch 模型
输出: ONNX 模型文件
"""

import torch
import argparse
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
import onnx
import onnxruntime as ort
import numpy as np
import json


def export_to_onnx(
    model_path: str,
    output_path: str,
    opset_version: int = 14,
    max_length: int = 128
):
    """
    导出模型到 ONNX 格式

    Args:
        model_path: 输入模型路径
        output_path: 输出 ONNX 文件路径
        opset_version: ONNX opset 版本
        max_length: 最大序列长度
    """
    print(f"Loading model from {model_path}...")

    # 加载模型和 tokenizer
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float32,
        device_map="cpu"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_path)

    # 设置为评估模式
    model.eval()

    # 准备示例输入
    dummy_text = "Hello, how are you?"
    dummy_input = tokenizer(
        dummy_text,
        return_tensors="pt",
        max_length=max_length,
        padding="max_length",
        truncation=True
    )

    print(f"Exporting to ONNX (opset {opset_version})...")

    # 导出到 ONNX
    torch.onnx.export(
        model,
        (dummy_input["input_ids"], dummy_input["attention_mask"]),
        output_path,
        opset_version=opset_version,
        input_names=["input_ids", "attention_mask"],
        output_names=["logits"],
        dynamic_axes={
            "input_ids": {0: "batch_size", 1: "sequence_length"},
            "attention_mask": {0: "batch_size", 1: "sequence_length"},
            "logits": {0: "batch_size", 1: "sequence_length"}
        },
        do_constant_folding=True,
        verbose=False
    )

    print(f"ONNX model exported to {output_path}")

    # 验证 ONNX 模型
    print("Validating ONNX model...")
    onnx_model = onnx.load(output_path)
    onnx.checker.check_model(onnx_model)
    print("ONNX model is valid")

    # 计算模型大小
    onnx_size = Path(output_path).stat().st_size / 1024 / 1024
    print(f"ONNX model size: {onnx_size:.2f} MB")

    # 保存导出报告
    report = {
        "onnx_path": str(output_path),
        "onnx_size_mb": round(onnx_size, 2),
        "opset_version": opset_version,
        "max_length": max_length,
        "input_names": ["input_ids", "attention_mask"],
        "output_names": ["logits"]
    }

    report_path = Path(output_path).parent / "onnx_export_report.json"
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)

    return output_path


def validate_onnx_inference(
    model_path: str,
    onnx_path: str,
    test_data_path: str,
    num_samples: int = 10
):
    """
    验证 ONNX 推理一致性

    Args:
        model_path: 原始 PyTorch 模型路径
        onnx_path: ONNX 模型路径
        test_data_path: 测试数据路径
        num_samples: 测试样本数量
    """
    print("\nValidating ONNX inference consistency...")

    # 加载 PyTorch 模型
    pytorch_model = AutoModelForCausalLM.from_pretrained(model_path)
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    pytorch_model.eval()

    # 加载 ONNX 模型
    ort_session = ort.InferenceSession(onnx_path)

    # 加载测试数据
    test_samples = []
    with open(test_data_path, 'r') as f:
        for line in f:
            test_samples.append(json.loads(line))

    # 比较输出
    matches = 0
    total = min(len(test_samples), num_samples)

    for i, sample in enumerate(test_samples[:total]):
        query = sample["query"]
        inputs = tokenizer(
            query,
            return_tensors="pt",
            max_length=128,
            padding="max_length",
            truncation=True
        )

        # PyTorch 推理
        with torch.no_grad():
            pytorch_outputs = pytorch_model(**inputs)
            pytorch_logits = pytorch_outputs.logits.numpy()

        # ONNX 推理
        ort_inputs = {
            "input_ids": inputs["input_ids"].numpy(),
            "attention_mask": inputs["attention_mask"].numpy()
        }
        onnx_logits = ort_session.run(None, ort_inputs)[0]

        # 比较 top-1 预测
        pytorch_pred = np.argmax(pytorch_logits[0, -1, :])
        onnx_pred = np.argmax(onnx_logits[0, -1, :])

        if pytorch_pred == onnx_pred:
            matches += 1

        # 计算 logits 差异
        logits_diff = np.abs(pytorch_logits - onnx_logits).mean()
        if i == 0:
            print(f"  Sample {i+1}: logits diff = {logits_diff:.6f}")

    consistency = matches / total * 100
    print(f"\nONNX inference consistency: {consistency:.2f}% ({matches}/{total} matches)")

    return consistency


def main():
    parser = argparse.ArgumentParser(description="Export model to ONNX format")
    parser.add_argument("--model_path", type=str, required=True, help="Path to input model")
    parser.add_argument("--output_path", type=str, required=True, help="Output ONNX file path")
    parser.add_argument("--opset_version", type=int, default=14, help="ONNX opset version")
    parser.add_argument("--max_length", type=int, default=128, help="Maximum sequence length")
    parser.add_argument("--validate", action="store_true", help="Validate ONNX inference")
    parser.add_argument("--test_data", type=str, help="Test data path for validation")

    args = parser.parse_args()

    # 导出到 ONNX
    onnx_path = export_to_onnx(
        args.model_path,
        args.output_path,
        args.opset_version,
        args.max_length
    )

    # 验证推理一致性（如果指定）
    if args.validate and args.test_data:
        validate_onnx_inference(
            args.model_path,
            onnx_path,
            args.test_data
        )


if __name__ == "__main__":
    main()

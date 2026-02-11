#!/usr/bin/env python3
"""
量化端侧模型到 INT8

用途: 将训练好的 qwen3-0.6B 模型量化到 INT8 以减少模型大小和提升推理速度
输入: 合并后的 PyTorch 模型
输出: INT8 量化模型
"""

import torch
import argparse
from pathlib import Path
from transformers import AutoModelForCausalLM, AutoTokenizer
import json


def quantize_model(model_path: str, output_dir: str):
    """
    量化模型到 INT8

    Args:
        model_path: 输入模型路径
        output_dir: 输出目录
    """
    print(f"Loading model from {model_path}...")

    # 加载模型和 tokenizer
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float32,
        device_map="cpu"
    )
    tokenizer = AutoTokenizer.from_pretrained(model_path)

    print(f"Original model size: {sum(p.numel() for p in model.parameters()) / 1e6:.2f}M parameters")

    # 动态量化到 INT8
    print("Quantizing model to INT8...")
    quantized_model = torch.quantization.quantize_dynamic(
        model,
        {torch.nn.Linear},  # 量化所有 Linear 层
        dtype=torch.qint8
    )

    # 创建输出目录
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # 保存量化模型
    print(f"Saving quantized model to {output_dir}...")
    quantized_model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    # 计算模型大小
    original_size = sum(p.numel() * p.element_size() for p in model.parameters()) / 1024 / 1024
    quantized_size = sum(p.numel() * p.element_size() for p in quantized_model.parameters()) / 1024 / 1024

    # 保存量化报告
    report = {
        "original_size_mb": round(original_size, 2),
        "quantized_size_mb": round(quantized_size, 2),
        "compression_ratio": round(original_size / quantized_size, 2),
        "quantization_type": "INT8",
        "quantized_layers": "Linear"
    }

    with open(output_path / "quantization_report.json", 'w') as f:
        json.dump(report, f, indent=2)

    print(f"\nQuantization Report:")
    print(f"  Original size: {original_size:.2f} MB")
    print(f"  Quantized size: {quantized_size:.2f} MB")
    print(f"  Compression ratio: {original_size / quantized_size:.2f}x")
    print(f"\nQuantized model saved to {output_dir}")


def validate_quantization(original_path: str, quantized_path: str, test_data_path: str):
    """
    验证量化后的精度损失

    Args:
        original_path: 原始模型路径
        quantized_path: 量化模型路径
        test_data_path: 测试数据路径
    """
    print("\nValidating quantization accuracy...")

    # 加载模型
    original_model = AutoModelForCausalLM.from_pretrained(original_path)
    quantized_model = AutoModelForCausalLM.from_pretrained(quantized_path)
    tokenizer = AutoTokenizer.from_pretrained(original_path)

    # 加载测试数据
    test_samples = []
    with open(test_data_path, 'r') as f:
        for line in f:
            test_samples.append(json.loads(line))

    # 比较输出
    matches = 0
    total = min(len(test_samples), 10)  # 只测试前 10 个样本

    for i, sample in enumerate(test_samples[:total]):
        query = sample["query"]
        inputs = tokenizer(query, return_tensors="pt")

        # 原始模型输出
        with torch.no_grad():
            original_outputs = original_model(**inputs)
            original_logits = original_outputs.logits

        # 量化模型输出
        with torch.no_grad():
            quantized_outputs = quantized_model(**inputs)
            quantized_logits = quantized_outputs.logits

        # 比较 top-1 预测
        original_pred = torch.argmax(original_logits[0, -1, :]).item()
        quantized_pred = torch.argmax(quantized_logits[0, -1, :]).item()

        if original_pred == quantized_pred:
            matches += 1

    accuracy = matches / total * 100
    print(f"  Quantization accuracy: {accuracy:.2f}% ({matches}/{total} matches)")
    print(f"  Precision loss: {100 - accuracy:.2f}%")

    return accuracy


def main():
    parser = argparse.ArgumentParser(description="Quantize edge model to INT8")
    parser.add_argument("--model_path", type=str, required=True, help="Path to input model")
    parser.add_argument("--output_dir", type=str, required=True, help="Output directory")
    parser.add_argument("--validate", action="store_true", help="Validate quantization accuracy")
    parser.add_argument("--test_data", type=str, help="Test data path for validation")

    args = parser.parse_args()

    # 量化模型
    quantize_model(args.model_path, args.output_dir)

    # 验证精度（如果指定）
    if args.validate and args.test_data:
        validate_quantization(args.model_path, args.output_dir, args.test_data)


if __name__ == "__main__":
    main()

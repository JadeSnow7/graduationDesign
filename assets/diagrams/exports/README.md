# 导出的图表文件

本目录包含从源文件导出的图表文件，用于在文档中引用。

## 文件格式

- **SVG**: 矢量格式，推荐用于文档
- **PNG**: 位图格式，适合演示
- **PDF**: 高质量打印格式

## 生成方式

使用 Mermaid CLI 或其他工具从源文件生成：

```bash
# 从 Mermaid 源文件生成 SVG
mmdc -i ../system-architecture.mmd -o system-architecture.svg

# 从 Mermaid 源文件生成 PNG
mmdc -i ../system-architecture.mmd -o system-architecture.png
```

## 维护说明

- 当源文件更新时，需要重新生成导出文件
- 保持文件名与源文件一致
- 定期检查导出文件的有效性
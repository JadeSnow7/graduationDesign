# 毕业论文 (Thesis)

本目录包含毕业论文的所有相关文件，按照源码和构建产物分离的原则组织。

## 目录结构

- **[proposal/](./proposal/)** - 开题报告
  - 开题报告.md - 毕业设计开题报告
- **[src/](./src/)** - LaTeX 源码
  - main.tex - 主文档
  - chapters/ - 各章节源码
  - figures/ - 图片资源
  - references.bib - 参考文献
  - .latexmkrc - LaTeX 编译配置
- **[build/](./build/)** - 编译产物
  - main.pdf - 最终论文PDF
  - *.aux, *.log, *.bbl 等 - LaTeX 编译中间文件

## 编译说明

在 `src/` 目录下使用以下命令编译论文：

```bash
cd src/
latexmk -pdf main.tex
```

编译产物会自动生成到 `build/` 目录中。

## 版本管理

- 源码文件（src/）应纳入版本控制
- 编译产物（build/）可选择性纳入版本控制
- 重要的里程碑版本PDF应保留备份
# LaTeX 源码 (Source)

本目录包含毕业论文的 LaTeX 源码文件。

## 文件结构

- **main.tex** - 主文档，包含文档结构和章节引用
- **chapters/** - 各章节源码目录
  - abstract.tex - 中文摘要
  - abstract-en.tex - 英文摘要
  - chapter1.tex - 第一章：绪论
  - chapter2.tex - 第二章：相关技术介绍
  - conclusion.tex - 结论
  - appendix.tex - 附录
  - statement.tex - 声明
- **figures/** - 图片资源目录
- **references.bib** - 参考文献数据库
- **.latexmkrc** - LaTeX 编译配置文件

## 编译方法

### 使用 latexmk（推荐）
```bash
latexmk -pdf main.tex
```

### 手动编译
```bash
xelatex main.tex
biber main
xelatex main.tex
xelatex main.tex
```

## 编写规范

1. 每章内容独立成文件，便于协作和版本控制
2. 图片统一放在 figures/ 目录下
3. 参考文献使用 BibTeX 格式管理
4. 使用中文 LaTeX 模板，支持中英文混排

## 注意事项

- 编译前确保安装了完整的 LaTeX 发行版
- 推荐使用 TeXLive 或 MiKTeX
- 图片格式建议使用 PDF、PNG 或 JPG
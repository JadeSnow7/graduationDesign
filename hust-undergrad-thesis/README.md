# 华中科技大学本科毕业论文 LaTeX 模板

这是一个简洁、可直接改写的本科毕业论文模板，基于 `ctexbook`，适合中文论文排版。

## 编译方式

推荐使用 XeLaTeX + Biber：

```bash
xelatex main.tex
biber main
xelatex main.tex
xelatex main.tex
```

如果使用图形化编辑器（如 TeXStudio），将编译器设置为 XeLaTeX，并确保可调用 Biber。

## 主要入口

- `main.tex`：论文主文件，包含封面字段和整体结构
- `chapters/`：各章节内容
- `references.bib`：参考文献数据库

## 需要修改的字段

在 `main.tex` 顶部修改如下宏：

- `\HUSTTitle` 论文题目
- `\HUSTSubtitle` 副标题（可留空）
- `\HUSTAuthor` 学生姓名
- `\HUSTStudentId` 学号
- `\HUSTMajor` 专业
- `\HUSTSchool` 学院
- `\HUSTAdvisor` 指导教师
- `\HUSTDate` 日期

## 说明

- 已包含“原创性声明/授权使用声明”。如学校模板有固定格式，请按学院要求调整。
- 参考文献使用 `gb7714-2015` 样式，如本地 TeX 发行版缺少该样式，请升级 TeX Live 或改用学校提供的 bst。

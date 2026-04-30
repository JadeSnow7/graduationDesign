# 论文用户调研数据融入计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 n=67 真实问卷数据与两条缺失相关工作（LLM迭代自修正、知识追踪）融入现有毕业论文，增强研究背景的量化依据与第二章的文献覆盖完整性，同时深化第四章薄弱点模型的理论论述。

**Architecture:** 涉及三个 .tex 文件的局部修改（chapter1.tex、chapter2.tex、chapter4.tex），不改动章节编号与结构，仅在已有节内追加或替换段落。

**Tech Stack:** XeLaTeX；编译命令 `cd hust-undergrad-thesis && latexmk -xelatex main.tex`

---

## 调研数据速查（执行时直接使用，不要重新读文件）

| 题目 | 关键数据 |
|------|---------|
| 有效样本 | n=67（IC/微电子/电子方向在校生） |
| 零写作基础 | 76.12% |
| 最大痛点① | 结构搭建与逻辑推进 62.69% |
| 最大痛点② | 文献检索与筛选 61.19% |
| 痛点③ | 研究问题/创新点提炼 46.27% |
| 痛点④ | 引用规范与文献管理 34.33% |
| 专业学术工具使用率 | 0%（Elicit/Consensus 等） |
| 最高频写作需求 | 开题/中期/组会材料 46.27% |
| 课程论文 | 38.81% |
| 等待15秒接受度 | 4.49/5（55.22% 完全接受） |
| AI引导代替代写接受度 | 3.72/5 |
| 带教风格①指出问题+方向 | 37.31% |
| 带教风格②严格拆步 | 32.84% |
| 带教风格③先改写再解释 | 29.85% |
| DeepSeek 使用率 | 89.55%（最高） |

---

## 文件位置

- `hust-undergrad-thesis/chapters/chapter1.tex`
- `hust-undergrad-thesis/chapters/chapter2.tex`
- `hust-undergrad-thesis/chapters/chapter4.tex`

---

## Task 1：chapter1.tex — §1.1 末尾添加用户调研段落

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter1.tex`（§1.1 末尾，"基于企业微信…" 那一段之前）

**目标效果：**
在 §1.1 的最后一段（"基于企业微信内嵌 H5 或网页的入口具备便捷触达…"）前面，插入一段用户调研数据，为系统设计提供量化动机。

- [ ] **Step 1：定位插入位置**

  读 chapter1.tex，找到以下文字：
  ```
  基于企业微信内嵌 H5 或网页的入口具备便捷触达与组织管理优势
  ```
  在此行之前插入新段落。

- [ ] **Step 2：插入以下段落**

  ```latex
  为进一步了解目标用户的实际需求，本文对平台首批注册用户（集成电路与微电子方向在校生）开展了问卷调研（$n=67$）。结果显示：76.12\% 的受访者处于零写作基础阶段，仅 7.46\% 有过投稿或发表经历；主要学习痛点依次为结构搭建与逻辑推进（62.69\%）和文献检索与筛选（61.19\%），研究问题与创新点提炼困难同样突出（46.27\%）。此外，专业学术工具（Elicit、Consensus 等）的使用率为 0\%，而 DeepSeek、豆包等通用 AI 工具的使用率高达 89.55\% 与 80.60\%，表明用户已大量使用通用 AI 进行写作辅助，但缺乏与学术规范直接关联的可溯源引导工具，存在明显功能空白。上述调研结果表明，面向该群体的写作辅助平台应优先解决"结构搭建引导"与"规范绑定反馈"两类需求，仅依赖通用生成能力难以满足学术规范的可追溯性要求。
  ```

- [ ] **Step 3：在 §1.3 创新目标②后加数据支撑**

  找到 §1.3 中以下文字：
  ```
  确保反馈可追溯性是系统约束而非仅靠提示词约定。
  ```
  在其后紧接加一句：
  ```latex
  用户调研同时显示，受访者对"等待 10--15 秒以换取更高质量分析"的接受度均分为 4.49/5（55.22\% 选择"完全接受"），为系统引入多轮校验闭环所带来的额外延迟提供了用户行为依据。
  ```

- [ ] **Step 4：编译验证**

  ```bash
  cd /Users/huaodong/graduationDesign/hust-undergrad-thesis
  latexmk -xelatex main.tex 2>&1 | grep -E "^(!)|\(.*\.tex\)" | head -20
  ```
  预期：无 `!` 开头的错误。

- [ ] **Step 5：commit**

  ```bash
  git add hust-undergrad-thesis/chapters/chapter1.tex
  git commit -m "thesis: add user survey data (n=67) to ch1 background and innovation goals"
  ```

---

## Task 2：chapter2.tex — 新增两节相关工作

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter2.tex`（在 §2.5「引导式学习」节之后、§2.6「异构加速」节之前插入两个新节）

**目标：** 补充 Self-Refine/Reflexion（LLM 迭代自修正）与 DKT（知识追踪）两块现有 ch2 缺失的相关工作，为 §3（GraphRAG 四步校验闭环）和 §4.5（薄弱点模型）提供文献铺垫。

- [ ] **Step 1：定位插入位置**

  在 chapter2.tex 中找到：
  ```
  \section{异构加速：NPU 与 FPGA}
  ```
  在此行之前插入两个新节。

- [ ] **Step 2：插入「LLM 迭代自修正方法」节**

  ```latex
  \section{大语言模型的迭代自修正方法}
  大语言模型在单次生成时可能产生不准确或结构不完整的输出。针对这一问题，研究者提出了基于自我反思的迭代修正范式。Self-Refine\cite{madaan2023selfrefine}令同一模型在生成后对输出进行自我批评并据此修正，在摘要生成、代码纠错等任务上取得了优于单次生成的效果。Reflexion\cite{shinn2023reflexion}进一步引入语言层面的强化信号，将任务失败的反馈以文本形式写入记忆，驱动下一轮生成策略调整。

  上述方法验证了迭代自修正在通用任务上的有效性，但在以下两点上存在局限：其一，均采用固定迭代轮数或外部评判器作为退出条件，未将退出决策与具体质量标准（如 KG 节点存在性与相关性阈值）绑定；其二，未针对推理服务按 token 计费的工程场景提出迭代成本控制机制。本文第四章的 GraphRAG 绑定校验闭环以"节点校验通过"作为退出条件，并以层级降级策略（重排→标记低置信度）控制额外开销，是对上述局限的工程层面响应。
  ```

  同时在 `\begin{document}` 前的参考文献区（或 main.tex 中的 .bib 文件）添加两条参考文献条目（如尚未存在）：
  ```
  @inproceedings{madaan2023selfrefine,
    title={Self-Refine: Iterative Refinement with Self-Feedback},
    author={Madaan, Aman and others},
    booktitle={NeurIPS},
    year={2023}
  }
  @inproceedings{shinn2023reflexion,
    title={Reflexion: Language Agents with Verbal Reinforcement Learning},
    author={Shinn, Noah and others},
    booktitle={NeurIPS},
    year={2023}
  }
  ```

- [ ] **Step 3：插入「学习者建模方法」节**

  紧接在上一节之后插入：

  ```latex
  \section{学习者建模方法}
  学习者建模旨在从学习行为数据中估计学生的知识状态，为个性化辅导提供依据。深度知识追踪（DKT）\cite{piech2015dkt}以循环神经网络建模学生在习题序列上的作答表现，能够捕捉跨时间步的知识变化，在基准数据集上取得了较高的预测准确率。此后，基于注意力机制的 SAKT\cite{pandey2019sakt}等变体进一步提升了长序列场景下的建模能力。

  然而，上述方法依赖大量有标注的答题记录作为训练数据，对于零写作基础、无答题历史的新用户（本文调研中占 76.12\%）难以直接适用。本文第四章的薄弱点模型采用轻量化的对话语义提取方案：从每轮 AI 回复中解析"纠错/提示"语句提取概念薄弱点，并以带衰减权重的计数器代替序列模型估计掌握程度，在数据稀疏的冷启动场景下实现可用的动态学习者建模。
  ```

  添加参考文献条目：
  ```
  @inproceedings{piech2015dkt,
    title={Deep Knowledge Tracing},
    author={Piech, Chris and others},
    booktitle={NeurIPS},
    year={2015}
  }
  @inproceedings{pandey2019sakt,
    title={A Self-Attentive model for Knowledge Tracing},
    author={Pandey, Shalini and Karypis, George},
    booktitle={EDM},
    year={2019}
  }
  ```

- [ ] **Step 4：更新 §2 本章小结**

  找到本章小结中的列举，在末尾补充两条：
  ```
  找到：此外，本章新增了学术写作规范本体建模的研究现状
  在末尾（上述技术共同支撑第三章...之前）加：
  ```
  在小结末段"上述技术共同支撑第三章"之前，追加：
  ```latex
  本章新增了两节相关工作综述：LLM 迭代自修正方法（Self-Refine/Reflexion）揭示了固定轮数退出与成本控制未解决的局限，为第四章 GraphRAG 绑定校验闭环的质量驱动退出设计提供对比依据；学习者建模方法（DKT/SAKT）说明了深度方法对标注数据的依赖，引出第四章薄弱点模型在数据稀疏场景下的轻量化替代方案。
  ```

- [ ] **Step 5：编译验证**

  ```bash
  cd /Users/huaodong/graduationDesign/hust-undergrad-thesis
  latexmk -xelatex main.tex 2>&1 | grep -E "^(!)" | head -10
  ```
  预期：无编译错误。

- [ ] **Step 6：commit**

  ```bash
  git add hust-undergrad-thesis/chapters/chapter2.tex
  git commit -m "thesis: add Self-Refine/Reflexion and DKT related work sections to ch2"
  ```

---

## Task 3：chapter4.tex — §4.5.2 深化薄弱点衰减机制

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter4.tex`（§4.5.2「薄弱点检测与学习画像」）

**目标：** 在现有段落基础上，补充衰减权重更新规则及其认知科学依据，与 Task 2 中的 DKT 对比形成前后呼应。

- [ ] **Step 1：定位现有段落**

  找到：
  ```
  平台对辅导过程中的"纠错/提示"语句进行轻量解析，在负面信号上下文中提取概念薄弱点（如写作中的"逻辑连接"或理工科中的"边界条件"），并在会话内累积统计。
  ```

- [ ] **Step 2：将该段替换为以下扩展版本**

  ```latex
  平台对辅导过程中的"纠错/提示"语句进行轻量解析，在负面信号上下文中提取概念薄弱点（如写作中的"逻辑连接"或理工科中的"边界条件"），并以带衰减权重的计数器维护每个概念的掌握估计：当某概念在本轮对话中出现困惑或纠错信号时，其权重加一（$w \leftarrow w+1$）；当学生在后续对话中对该概念展现出理解时，权重减一（$w \leftarrow w-1$）而非直接删除；权重降至零时方将其从画像中移除。这一衰减而非即删的设计来自间隔复习效应（Ebbinghaus 遗忘曲线）的启示：单次正确作答不等于完全掌握，需多次强化才能从工作记忆转化为稳定知识。与深度知识追踪（DKT\cite{piech2015dkt}）等需要大量标注答题数据的序列模型相比，本方案以对话语义提取替代显式答题记录，适合零写作基础、无历史数据的冷启动用户（占本文调研样本的 76.12\%）。
  ```

- [ ] **Step 3：更新 §4.5.1 个性化辅导策略段落——加带教风格数据支撑**

  找到 §4.5.1（个性化辅导策略生成）中：
  ```
  在具备学习档案后，系统可基于历史薄弱点与学习进度生成结构化辅导策略
  ```
  在该句前插入一句：
  ```latex
  用户调研显示，受访者的带教风格偏好分布较为均衡：37.31\% 倾向"指出问题并给 2--3 个修改方向"，32.84\% 倾向"严格拆步推进、不直接代写"，29.85\% 倾向"先给可用改写再解释原因"，三类偏好无明显主导，表明单一固定的反馈策略难以覆盖全体用户，个性化辅导策略的设计具有用户需求依据。
  ```

- [ ] **Step 4：编译验证**

  ```bash
  cd /Users/huaodong/graduationDesign/hust-undergrad-thesis
  latexmk -xelatex main.tex 2>&1 | grep -E "^(!)" | head -10
  ```

- [ ] **Step 5：commit**

  ```bash
  git add hust-undergrad-thesis/chapters/chapter4.tex
  git commit -m "thesis: deepen weak point decay model with Ebbinghaus rationale and survey data"
  ```

---

## Task 4：bib 文件 — 添加新引用条目

**Files:**
- Modify: `hust-undergrad-thesis/references.bib`（或实际 bib 文件路径，需先确认）

**目标：** 确保 Task 2 中新增的四条引用（Self-Refine、Reflexion、DKT、SAKT）在 bib 文件中存在，避免编译时 undefined citation 警告。

- [ ] **Step 1：确认 bib 文件路径**

  ```bash
  grep -r "bibliography{" /Users/huaodong/graduationDesign/hust-undergrad-thesis/main.tex
  ```

- [ ] **Step 2：检查并追加缺失条目**

  检查 bib 文件中是否已存在 `madaan2023selfrefine`、`shinn2023reflexion`、`piech2015dkt`、`pandey2019sakt`；对缺失的条目追加以下内容：

  ```bibtex
  @inproceedings{madaan2023selfrefine,
    title     = {Self-Refine: Iterative Refinement with Self-Feedback},
    author    = {Madaan, Aman and Tandon, Niket and Gupta, Prakhar and others},
    booktitle = {Advances in Neural Information Processing Systems},
    year      = {2023}
  }

  @inproceedings{shinn2023reflexion,
    title     = {Reflexion: Language Agents with Verbal Reinforcement Learning},
    author    = {Shinn, Noah and Cassano, Federico and Berman, Edward and others},
    booktitle = {Advances in Neural Information Processing Systems},
    year      = {2023}
  }

  @inproceedings{piech2015dkt,
    title     = {Deep Knowledge Tracing},
    author    = {Piech, Chris and Bassen, Jonathan and Huang, Jonathan and others},
    booktitle = {Advances in Neural Information Processing Systems},
    year      = {2015}
  }

  @inproceedings{pandey2019sakt,
    title     = {A Self-Attentive Model for Knowledge Tracing},
    author    = {Pandey, Shalini and Karypis, George},
    booktitle = {Proceedings of the 12th International Conference on Educational Data Mining},
    year      = {2019}
  }
  ```

- [ ] **Step 3：最终全量编译确认**

  ```bash
  cd /Users/huaodong/graduationDesign/hust-undergrad-thesis
  latexmk -xelatex main.tex 2>&1 | tail -5
  ```
  预期最后一行：`Latexmk: All targets (main.pdf) are up-to-date.` 或 `Latexmk: Done.`

- [ ] **Step 4：commit**

  ```bash
  git add hust-undergrad-thesis/references.bib
  git commit -m "thesis: add Self-Refine, Reflexion, DKT, SAKT bib entries"
  ```

---

## 验收检查清单

完成全部四个 Task 后，逐项核查：

- [ ] `chapter1.tex §1.1` 包含 n=67、76.12%、62.69%、61.19% 等数据
- [ ] `chapter1.tex §1.3` 包含 4.49/5 数据
- [ ] `chapter2.tex` 新增「大语言模型的迭代自修正方法」节（含 Self-Refine、Reflexion 引用）
- [ ] `chapter2.tex` 新增「学习者建模方法」节（含 DKT、SAKT 引用）
- [ ] `chapter2.tex` 本章小结更新
- [ ] `chapter4.tex §4.5.2` 包含 $w \leftarrow w+1$、Ebbinghaus、DKT 对比
- [ ] `chapter4.tex §4.5.1` 包含带教风格三向分布数据
- [ ] `references.bib` 无 undefined citation 警告
- [ ] 全量编译通过，无 `!` 错误

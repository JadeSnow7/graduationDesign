# Thesis Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revise `hust-undergrad-thesis` so the thesis resolves the Major and high-value Minor issues from the PDF audit: RQ1 completion status, GraphRAG hop configuration, model/platform wording, Figure 5-4 evidence alignment, statistical-strength wording, engineering-report tone, terminology definitions, and AI-use statement visibility.

**Architecture:** Treat `hust-undergrad-thesis/main.tex` as the only compile entrypoint and make targeted edits in chapter files. Preserve the thesis's conservative evidence boundary: RQ2 is a provenance and traceability engineering evaluation, not a classroom learning-effect study; RQ1 has an ontology and audit subset, not a completed full KG quality study. Keep detailed engineering traceability in the appendix and keep Chapter 5 focused on evidence level, cases, RQ2 metrics, and limitations.

**Tech Stack:** LaTeX thesis project compiled with XeLaTeX; figures in `hust-undergrad-thesis/figures`; RQ2 manifest evidence in `inference-engine-v2/data/rq2_traceability/run_manifest.json`; RQ2 metrics in `inference-engine-v2/outputs/rq2_metrics.md` and `inference-engine-v2/paper_tables/*.tex`.

---

## Source Facts To Preserve

- The formal thesis source is `hust-undergrad-thesis/`, not the historical `academic/thesis/src/` tree.
- Current RQ2 manifest records `model: "dashscope"` and `model_version: "dashscope"`, with `run_id: "rq2-v2-live-full-20260514"` and `run_type: "real"`.
- Current thesis text already reports a 60-sample, four-method full live LLM RQ2 run with 240 real LLM outputs.
- Current thesis text reports full GraphRAG expected-reference recall `0.848`, no-expansion recall `0.337`, grounded reference precision `0.990`, hallucinated reference rate `0.010`, false positive rate `1.0000`, and irrelevant node rate `0.6988`.
- Current thesis text already states that classroom learning-effect experiments are not completed; preserve that boundary.
- Current RQ1 evidence is ontology design plus small audit subset evidence; system-level two-annotator consistency, triple Precision/Recall/F1, and full dimension completeness evaluation are not completed.
- Current Figure 5-4 image file is `hust-undergrad-thesis/figures/fig-runtime-writing-analysis.png`; the audit says it shows the writing-analysis entry and waiting state, not a completed structured-result panel.

## Files To Modify

- Modify: `hust-undergrad-thesis/chapters/abstract.tex`
  - Keep Chinese abstract aligned with the final RQ1/RQ2/RQ3 completion boundary.

- Modify: `hust-undergrad-thesis/chapters/abstract-en.tex`
  - Mirror the Chinese abstract's conservative completion boundary.

- Modify: `hust-undergrad-thesis/chapters/chapter1.tex`
  - Replace the completed-sounding RQ1 contribution sentence.
  - Add short first-use definitions for `GraphRAG` and `[REF:X]` if not already nearby.

- Modify: `hust-undergrad-thesis/chapters/chapter3.tex`
  - Keep the KG evaluation methods as a designed framework.
  - Ensure the chapter summary says the complete KG quality experiment remains future work.

- Modify: `hust-undergrad-thesis/chapters/chapter4.tex`
  - Make hop configuration wording explicit: design supports `1-2 hop`, RQ2 uses `1-hop`.
  - Add short first-use definitions for `FastAPI` and `vLLM` if needed.

- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`
  - Fix Figure 5-4 caption/body mismatch.
  - Replace statistically loaded wording such as "显著提升".
  - Distinguish DashScope as the live-call platform/channel recorded by the manifest.
  - Compress PR and interface-change wording in the main body.

- Modify: `hust-undergrad-thesis/chapters/conclusion.tex`
  - Add or tighten the RQ answer summary.
  - Keep limitations aligned with RQ1/RQ3 unfinished status.

- Modify: `hust-undergrad-thesis/chapters/appendix.tex`
  - Keep engineering commit/API details here.
  - Keep the detailed AI tool-use statement here and optionally add a front-matter pointer from `main.tex`.

- Optional Modify: `hust-undergrad-thesis/main.tex`
  - Add a short AI tool-use statement page only if the school or department expects a front-positioned declaration.

- Optional Replace: `hust-undergrad-thesis/figures/fig-runtime-writing-analysis.png`
  - Replace only after capturing a completed analysis-result screen; otherwise keep the image and revise text/caption to match the waiting state.

---

## Task 1: Establish Baseline And Evidence

**Files:**
- Read: `hust-undergrad-thesis/chapters/chapter1.tex`
- Read: `hust-undergrad-thesis/chapters/chapter3.tex`
- Read: `hust-undergrad-thesis/chapters/chapter5.tex`
- Read: `hust-undergrad-thesis/chapters/conclusion.tex`
- Read: `inference-engine-v2/data/rq2_traceability/run_manifest.json`

- [ ] **Step 1: Confirm working tree before editing**

Run:

```bash
git status --short
git -C hust-undergrad-thesis status --short
```

Expected: record existing unrelated changes and do not revert them.

- [ ] **Step 2: Confirm manifest wording**

Run:

```bash
sed -n '1,80p' inference-engine-v2/data/rq2_traceability/run_manifest.json
```

Expected facts to preserve in wording:

```text
"model": "dashscope"
"model_version": "dashscope"
"run_id": "rq2-v2-live-full-20260514"
"run_type": "real"
```

- [ ] **Step 3: Confirm high-risk text anchors**

Run:

```bash
rg -n "并用 \\$\\\\kappa\\$|一致性评估|显著提升|模型为 \\\\texttt\\{dashscope\\}|1-hop|1–2|Merge pull request|等待分析|AI 工具使用" hust-undergrad-thesis/chapters
```

Expected: hits in `chapter1.tex`, `chapter3.tex`, `chapter5.tex`, `conclusion.tex`, and `appendix.tex`.

---

## Task 2: Unify RQ1 Completion Status

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter1.tex`
- Modify: `hust-undergrad-thesis/chapters/chapter3.tex`
- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`
- Modify: `hust-undergrad-thesis/chapters/conclusion.tex`
- Check: `hust-undergrad-thesis/chapters/abstract.tex`
- Check: `hust-undergrad-thesis/chapters/abstract-en.tex`

- [ ] **Step 1: Replace the completed-sounding RQ1 contribution sentence in Chapter 1**

Find this sentence in `chapter1.tex`:

```latex
知识结构采用 B+C 双路线（AO 本体映射 + LLM 半自动抽取 + 人工审校）生成，并用 $\kappa$、三元组 F1、节点覆盖率和维度完整性检查其质量。
```

Replace it with:

```latex
知识结构采用 B+C 双路线（AO 本体映射 + LLM 半自动抽取 + 人工审校）生成；本文已设计 $\kappa$、三元组 F1、节点覆盖率和维度完整性等质量评估指标，并完成小规模审计子集检查，系统性的双人一致性与全量 KG 质量评估仍留待后续实验补充。
```

- [ ] **Step 2: Keep Chapter 3 evaluation methods as planned metrics**

In `chapter3.tex`, keep the formulas and criteria, but make the lead-in before the evaluation subsections use this framing:

```latex
为避免将当前审计子集误解为完整 KG 质量结论，本文将 KG 质量评估分为两层：本科毕设阶段完成可复核审计子集，用于证明节点、关系、来源和评价维度具备程序化核查基础；后续系统性实验再引入双人独立标注、Cohen's $\kappa$、三元组 Precision/Recall/F1、节点覆盖率和维度完整性等完整指标。
```

- [ ] **Step 3: Add a compact RQ answer summary in the conclusion**

Add this paragraph near the start of `conclusion.tex` after the work-review paragraph:

```latex
对应三个研究问题，本文的完成状态可以概括为：RQ1 完成了学术规范 KG 的本体设计、B+C 构建流程和小规模审计子集检查，但尚未完成双人一致性与全量三元组质量评估；RQ2 完成了 60 条分层受控样本下的四方案 full live LLM 溯源性工程评测；RQ3 完成了平台原型、过程记录机制和课程部署评测方案设计，但尚未完成正式课堂部署中的学习效果实验。
```

- [ ] **Step 4: Re-scan for over-completed RQ1 wording**

Run:

```bash
rg -n "已完成.*一致性|已完成.*三元组.*F1|检查其质量|完整.*KG.*质量结论|双人一致性.*已" hust-undergrad-thesis/chapters
```

Expected: no sentence claims completed full RQ1 quality evaluation.

---

## Task 3: Unify Hop Configuration And Model/Platform Wording

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter4.tex`
- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`
- Modify: `hust-undergrad-thesis/chapters/appendix.tex`
- Check: `hust-undergrad-thesis/chapters/conclusion.tex`

- [ ] **Step 1: Add the hop-scope rule in Chapter 4**

Where Chapter 4 describes local graph expansion, add:

```latex
需要说明的是，系统设计层支持 1--2 跳局部图扩展，用于兼容不同课程规范图谱的密度差异；本文第 5 章 RQ2 批量评测为控制变量，固定采用 1-hop 图扩展配置。
```

- [ ] **Step 2: Keep RQ2 experimental wording fixed at 1-hop**

In `chapter5.tex`, keep this meaning:

```latex
完整方案为检索增强、1-hop 局部图扩展和节点绑定校验。
```

If another sentence implies RQ2 used `1-2 hop`, revise it to:

```latex
RQ2 批量评测固定使用 1-hop 图扩展，2-hop 仅属于系统设计可支持的扩展范围，未纳入本批次结果解释。
```

- [ ] **Step 3: Replace "模型为 dashscope" with platform/channel wording**

Find in `chapter5.tex`:

```latex
模型为 \texttt{dashscope}
```

Replace the surrounding sentence with:

```latex
评测调用通道按 manifest 记录为 \texttt{dashscope}，表示本批次输出来自 DashScope 在线调用链路；当前 manifest 未进一步记录具体底层模型名称，因此本文不将 \texttt{dashscope} 表述为具体模型。生产原型中的本地推理说明另行使用 Qwen2.5-7B-Instruct 与 vLLM 推理框架口径，两者不混同。
```

- [ ] **Step 4: Mirror the same wording in Appendix D**

In `appendix.tex`, replace:

```latex
模型（\texttt{dashscope}）
```

with:

```latex
评测调用通道（\texttt{dashscope}，manifest 未记录更细的底层模型名）
```

- [ ] **Step 5: Re-scan for model/platform ambiguity**

Run:

```bash
rg -n "模型为|模型（\\\\texttt\\{dashscope\\}|DashScope|Qwen2\\.5|vLLM" hust-undergrad-thesis/chapters
```

Expected: `dashscope` is described as a platform/channel; Qwen2.5 and vLLM are described as local deployment or inference-framework facts.

---

## Task 4: Fix Figure 5-4 Evidence Alignment

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`
- Optional Replace: `hust-undergrad-thesis/figures/fig-runtime-writing-analysis.png`

- [ ] **Step 1: Choose image policy**

Use this rule:

```text
If a completed analysis-result screenshot is available today, replace fig-runtime-writing-analysis.png and keep the result-oriented case text.
If no completed result screenshot is available today, keep the current image and revise Chapter 5 so Figure 5-4 is explicitly an entry/waiting-state screenshot.
```

- [ ] **Step 2: If keeping the current image, revise the Figure 5-4 paragraph**

Replace any claim that the figure itself shows `nodes / expanded context / validation / references` results with:

```latex
图~\ref{fig:runtime-writing-analysis}~展示的是 AI 写作分析入口与待分析状态。用户点击“分析学术规范”后，分析链路通过 \texttt{/v1/writing/analyze} 返回 nodes、expanded context、validation 与 references 四类结构化结果；这些结果由前端按规范节点、上下文证据与引用候选组织展示，并可进一步进入审查队列。当前图示用于证明入口和页面状态已经集成，不单独作为结构化结果面板的视觉证据。
```

- [ ] **Step 3: If keeping the current image, revise the caption**

Set the caption to:

```latex
\caption{案例一中 AI 写作分析入口与待分析状态}
```

- [ ] **Step 4: If replacing the image, preserve visual evidence naming**

After replacing the PNG, keep the filename `fig-runtime-writing-analysis.png` so `chapter5.tex` does not need path changes. Then revise the caption to:

```latex
\caption{案例一中 AI 写作分析完成后的规范节点、证据上下文与引用候选结果}
```

- [ ] **Step 5: Verify no unsupported screenshot claim remains**

Run:

```bash
rg -n "图~\\\\ref\\{fig:runtime-writing-analysis\\}|等待分析|nodes、expanded context|结构化结果|结果面板" hust-undergrad-thesis/chapters/chapter5.tex
```

Expected: the body and caption match the actual image state.

---

## Task 5: Remove Statistical Overclaiming

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`
- Modify: `hust-undergrad-thesis/chapters/conclusion.tex`
- Check: `hust-undergrad-thesis/chapters/abstract.tex`
- Check: `hust-undergrad-thesis/chapters/abstract-en.tex`

- [ ] **Step 1: Replace the key "显著提升" sentence**

Find in `chapter5.tex`:

```latex
该结果说明，在当前受控样本与评测脚本口径下，局部图扩展能够显著提升预期规范节点覆盖，并与节点绑定校验共同增强反馈引用的可验证性。
```

Replace with:

```latex
该结果说明，在当前受控样本与评测脚本口径下，1-hop 局部图扩展使预期规范节点召回率由 0.337 提升至 0.848，带来 0.511 的召回增益；节点绑定校验则使生成引用能够接受节点存在性与相关性检查，从而增强反馈引用的可验证性。
```

- [ ] **Step 2: Replace high-strength English abstract wording if needed**

If `abstract-en.tex` says:

```latex
outperforms
```

replace with:

```latex
achieves higher expected-reference recall and lower hallucinated-reference rate than the no-expansion ablation in this controlled batch
```

- [ ] **Step 3: Re-scan all chapters for high-strength words**

Run:

```bash
rg -n "显著|证明.*优越|性能优势|outperform|superior|effective|有效提升|更好" hust-undergrad-thesis/chapters
```

Expected: any remaining strong wording is either explicitly bounded by controlled engineering evaluation or revised to neutral wording such as "在本批次中提高".

---

## Task 6: Move Engineering-Report Details Out Of Main Argument

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`
- Modify: `hust-undergrad-thesis/chapters/appendix.tex`

- [ ] **Step 1: Compress PR/commit wording in Chapter 5**

Replace PR-title-heavy wording such as:

```latex
最新主分支包含 7fd7718（Merge pull request #5: P0 academic writing workbench refactor）……
```

with:

```latex
最新工程版本已完成学术写作工作台重构，补充持久化审查队列、证据状态和版本元数据联动，使 AI 建议与写作分析结果能够进入可回看、可采纳、可拒绝的过程记录。
```

- [ ] **Step 2: Keep exact commit and interface details in the appendix**

Ensure `appendix.tex` contains one compact evidence row:

```latex
\texttt{7fd7718} & P0 工作台重构 & 新增持久化 Review Queue、Evidence Ledger 状态、版本元数据联动和 \texttt{/api/review-items} 接口 & 用于说明功能实现与论文运行证据之间的对应关系，不作为教学效果证明 \\
```

- [ ] **Step 3: Re-scan Chapter 5 for engineering-report tone**

Run:

```bash
rg -n "Merge pull request|PR #|目录|新增 /api|接口清单|commit message|7fd7718" hust-undergrad-thesis/chapters/chapter5.tex
```

Expected: Chapter 5 may mention `7fd7718` once as version evidence, but PR title and interface-list details should be absent or moved to the appendix.

---

## Task 7: Add Short Definitions For Fast-Moving Terms

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter1.tex`
- Modify: `hust-undergrad-thesis/chapters/chapter4.tex`
- Check: `hust-undergrad-thesis/chapters/appendix.tex`

- [ ] **Step 1: Define GraphRAG briefly at first major use**

Use this wording near the first Chapter 1 use:

```latex
本文所称 GraphRAG 指“候选节点检索 + 局部图扩展 + 反馈节点绑定校验”的课程规范反馈实现。
```

- [ ] **Step 2: Define `[REF:X]` briefly before relying on it**

Use this wording where `[REF:X]` first appears:

```latex
\texttt{[REF:X]} 表示生成反馈中指向 KG 规范节点的绑定引用标记，系统会检查该标记对应节点是否存在并与输入片段达到相关性阈值。
```

- [ ] **Step 3: Define FastAPI and vLLM briefly**

Use these short appositions at first mention in Chapter 4 or Chapter 5:

```latex
FastAPI Web 服务框架
```

```latex
vLLM 推理服务框架
```

- [ ] **Step 4: Re-scan term first-use density**

Run:

```bash
rg -n "GraphRAG|\\[REF:X\\]|FastAPI|vLLM" hust-undergrad-thesis/chapters/chapter1.tex hust-undergrad-thesis/chapters/chapter4.tex hust-undergrad-thesis/chapters/chapter5.tex
```

Expected: the first occurrences are close to a short definition or apposition.

---

## Task 8: Decide Whether To Add A Front AI-Use Statement

**Files:**
- Check: `hust-undergrad-thesis/chapters/appendix.tex`
- Optional Modify: `hust-undergrad-thesis/main.tex`
- Optional Create/Modify: `hust-undergrad-thesis/chapters/ai-use-statement.tex`

- [ ] **Step 1: Keep the detailed appendix statement**

Verify Appendix D.8 remains:

```latex
\section{AI 工具使用与作者责任说明}
```

Expected: it states tool use was auxiliary and that the author takes final academic responsibility.

- [ ] **Step 2: If adding a front statement, create a half-page declaration**

Create `hust-undergrad-thesis/chapters/ai-use-statement.tex` with:

```latex
\chapter*{AI 工具使用说明}
\addcontentsline{toc}{chapter}{AI 工具使用说明}

本文在资料整理、语言润色、代码检查、图表说明和格式核对过程中使用生成式人工智能工具作为辅助。相关工具未替代作者完成研究设计、数据解释、系统实现、实验结论或学术判断。论文中的观点、数据、代码、图表、引用、实验记录和最终结论均由作者核查并承担全部学术责任。更详细的使用边界与备查材料说明见附录 D.8。
```

- [ ] **Step 3: If adding the front statement, include it after declarations or abstract**

In `main.tex`, include:

```latex
\input{chapters/ai-use-statement}
```

Place it after the originality/copyright statement pages or after the Chinese and English abstracts, according to department template preference. If no department preference exists, place it after the statement pages and before abstracts for maximum visibility.

---

## Task 9: Compile And Verify The Revision

**Files:**
- Verify: `hust-undergrad-thesis/main.pdf`
- Verify: `hust-undergrad-thesis/main.log`

- [ ] **Step 1: Compile twice with XeLaTeX**

Run:

```bash
cd hust-undergrad-thesis
xelatex -interaction=nonstopmode main.tex
xelatex -interaction=nonstopmode main.tex
```

Expected: `main.pdf` updates and `main.log` has no fatal error.

- [ ] **Step 2: Check warnings that matter**

Run:

```bash
rg -n "Undefined control sequence|LaTeX Error|Citation.*undefined|Reference.*undefined|Overfull \\\\hbox" hust-undergrad-thesis/main.log
```

Expected: no fatal errors; inspect any undefined references or obvious overfull boxes introduced by the edits.

- [ ] **Step 3: Re-run audit-target scans**

Run:

```bash
rg -n "检查其质量|显著提升|模型为 \\\\texttt\\{dashscope\\}|Merge pull request|已完成.*双人一致性|已完成.*三元组.*F1" hust-undergrad-thesis/chapters
```

Expected: no stale audit-trigger phrases remain in the main chapters.

- [ ] **Step 4: Produce a final change summary**

Prepare a short summary with these four bullets:

```text
1. RQ1 completion wording unified.
2. RQ2 configuration/model-platform wording unified.
3. Figure 5-4 text/caption aligned with actual screenshot state.
4. Overclaiming and engineering-report tone reduced; appendix retains detailed traceability.
```

---

## Review Checklist

- [ ] RQ1 never sounds like full KG consistency and F1 evaluation are completed.
- [ ] RQ2 still clearly reports 60 samples, 240 outputs, `full live LLM`, and the existing metrics.
- [ ] `dashscope` is not called a concrete model unless a real log proves the concrete model name.
- [ ] `1-2 hop` appears only as design capability; `1-hop` appears as RQ2 fixed evaluation configuration.
- [ ] Figure 5-4 caption and body match the actual PNG.
- [ ] "显著" and similar statistical-strength terms are removed unless supported by statistical testing.
- [ ] Chapter 5 reads like academic evidence explanation, while commit/API details live in the appendix.
- [ ] AI-use statement remains available in Appendix D.8, with optional front-page version if required.

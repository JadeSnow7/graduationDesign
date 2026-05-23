# Thesis Sync P0 Workbench Revision Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update `hust-undergrad-thesis` so the thesis matches the latest `inference-engine-v2` main branch after PR #5, especially the document-centered academic writing workbench, persisted review queue, evidence ledger status, document version metadata, and removal of the archived prototype.

**Architecture:** Treat `hust-undergrad-thesis/main.tex` as the only thesis entrypoint and edit chapter files in place. Keep the thesis argument conservative: PR #5 strengthens the engineering evidence for reviewability and persistence, but it does not prove classroom learning effectiveness. The revision should update system architecture, implementation status, runtime evidence, and conclusion boundaries without overstating the result.

**Tech Stack:** LaTeX thesis project, `latexmk`, existing PNG figures in `hust-undergrad-thesis/figures`, source evidence from `inference-engine-v2` `origin/main` commit `7fd7718`.

---

## Source Facts To Preserve

- Latest GitHub main for `inference-engine-v2`: `7fd7718 Merge pull request #5 from JadeSnow7/p0-workbench-implementation`.
- PR #5 title: `P0 academic writing workbench refactor`.
- PR #5 merged at: `2026-05-16T04:24:37Z`.
- PR #5 summary:
  - Adds persistent review items.
  - Adds evidence ledger status.
  - Adds document version metadata support.
  - Refactors workspace into a document-centered layout with Review / Evidence / Graph / Versions context drawer.
  - Routes AI suggestions and writing-analysis results into the review queue with persisted acceptance fixes.
- Production boundary now says `academic-workbench-fe/` has been removed; production is `backend/` and `frontend/`.
- New API surface: `/api/review-items`.
- Persistence boundary now includes Redis-backed review items in addition to sessions, users, documents, versions, courses, evidence, notifications, and settings.
- Remaining limitations remain:
  - Initial `workspaceMock` seed still needs a backend bootstrap/default-document endpoint.
  - Web search quick mode remains disabled until a real provider exists.
  - Auth token storage still needs production hardening.
  - Bundle splitting is still deferred.

## Files To Modify

- Modify: `hust-undergrad-thesis/chapters/chapter4.tex`
  - Align system architecture and implementation status with latest production boundary.
  - Replace old "suggestion only" phrasing with persisted review queue / document-centered drawer phrasing where appropriate.
  - Add `/api/review-items` and Redis review-item persistence to implementation description.

- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`
  - Update runtime evidence and audit table to mention PR #5, review queue persistence, evidence ledger status, and version metadata.
  - Reframe screenshot/runtime descriptions if the current figures still show the old layout.
  - Add an explicit limitation that current thesis figures may represent the previous production preview unless new screenshots are regenerated.

- Modify: `hust-undergrad-thesis/chapters/conclusion.tex`
  - Update contributions and limitations to reflect stronger engineering persistence evidence.
  - Keep the "not classroom effect proof" boundary.

- Modify: `hust-undergrad-thesis/chapters/appendix.tex`
  - Add `/api/review-items` to the interface appendix.
  - Add commit/PR evidence to the repository evidence appendix.

- Modify: `hust-undergrad-thesis/docx_source.md`
  - Keep Markdown export in sync with the LaTeX edits if this file is still used for DOCX generation.

- Optional Modify: `hust-undergrad-thesis/figures/*.png`
  - Only regenerate if the final thesis requires visual evidence of the new Review / Evidence / Graph / Versions drawer.

## Task 1: Pin Revision Scope And Evidence

**Files:**
- Read: `inference-engine-v2` `origin/main:docs/architecture/current-production-architecture.md`
- Read: `inference-engine-v2` `origin/main:docs/roadmap/remaining-integrations.md`
- Read: `hust-undergrad-thesis/chapters/chapter4.tex`
- Read: `hust-undergrad-thesis/chapters/chapter5.tex`

- [ ] **Step 1: Record exact latest code facts**

Run:

```bash
git -C inference-engine-v2 rev-parse --short origin/main
git -C inference-engine-v2 show -s --format='%H%n%ci%n%s' origin/main
git -C inference-engine-v2 show --name-only --format='%h %s' origin/main | sed -n '1,120p'
```

Expected:

```text
7fd7718
7fd771887edd9f79cceb7cf04f87adb18c6466e1
2026-05-16 ...
Merge pull request #5 from JadeSnow7/p0-workbench-implementation
```

- [ ] **Step 2: Extract architecture deltas**

Run:

```bash
git -C inference-engine-v2 show origin/main:docs/architecture/current-production-architecture.md | sed -n '1,180p'
git -C inference-engine-v2 show origin/main:docs/roadmap/remaining-integrations.md | sed -n '1,180p'
```

Expected facts to use in thesis:

```text
academic-workbench-fe/ prototype removed from production repository
/api/review-items added
Redis persistence includes review items
P0 refactor introduces review items, evidence statuses, and version associations
```

- [ ] **Step 3: Decide figure policy**

If no new screenshots are generated, revise captions and text so they do not claim the figures show the new context drawer. Use wording such as:

```text
图示展示的是统一工作台的生产预览运行状态；最新工程版本在该工作台基础上进一步加入持久化 Review Queue、Evidence Ledger 状态与 Review / Evidence / Graph / Versions 上下文抽屉。
```

If new screenshots are generated later, replace or add figures after the text revision.

## Task 2: Update Chapter 4 Architecture And Implementation

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter4.tex`

- [ ] **Step 1: Update overall architecture paragraph**

In `\section{课程支持平台总体运行机制}`, replace claims that production is still three-layer `React + Go + Python FastAPI` if they conflict with current `inference-engine-v2` evidence. Use this conservative replacement idea:

```latex
根据最新工程边界，当前生产原型主要由 \texttt{frontend/} 与 \texttt{backend/} 两部分构成：前端采用 React、TypeScript 与 Vite 实现统一学术写作工作台；后端采用 FastAPI 暴露文档、会话、检索、写作分析、证据库、通知设置与 Review Queue 等接口，并以 Redis 作为会话、文档、版本、审查项和证据状态的持久化边界。早期 \texttt{academic-workbench-fe/} 原型已经从生产仓库移除，不再作为部署、验收或论文运行证据来源。
```

- [ ] **Step 2: Update implementation status table**

In table `tab:implementation-status`, revise rows as follows:

```latex
suggestion 与 Diff 审查 & 已实现 & AI 输出进入持久化 Review Queue，用户可在 Review / Evidence / Graph / Versions 上下文抽屉中审查、接受或拒绝，采纳结果与版本元数据关联 \\
```

Add or revise a row:

```latex
证据台账与审查队列 & 已实现 & 后端提供 \texttt{/api/review-items} 与证据状态字段，写作分析结果和 AI 建议可进入持久化审查队列 \\
```

- [ ] **Step 3: Update personal work list**

In "本人本科毕业设计阶段主要完成了以下工作", add one item:

```latex
\item 完成文档中心工作台的持久化审查队列、证据状态和版本元数据联动，使 AI 建议与写作分析结果不再停留于前端临时状态，而能够进入可回看、可采纳、可拒绝的过程记录。
```

- [ ] **Step 4: Revise workspace layout subsection**

In `\subsection{工作台总体布局}`, add the latest drawer model:

```latex
最新工程版本进一步将右侧上下文区拆分为 Review、Evidence、Graph 与 Versions 四类上下文视图：Review 视图承载待审查建议队列，Evidence 视图展示证据台账与证据状态，Graph 视图解释知识节点关系，Versions 视图呈现文档版本与采纳记录。该设计使正文、建议、证据和版本之间形成文档中心的审查闭环。
```

- [ ] **Step 5: Revise suggestion/Diff subsection**

Replace purely local suggestion language with persisted review-item language:

```latex
最新实现中，AI 修改建议与写作分析发现会被路由到持久化 Review Queue。Review Item 记录建议来源、关联文档、证据状态、采纳状态和版本关联信息；用户接受建议后，系统将采纳结果与文档版本元数据绑定，拒绝或暂缓的建议仍可作为过程记录保留。由此，AI 输出从一次性前端中间态进一步演进为可追踪的学习过程证据。
```

- [ ] **Step 6: Update persistence subsection**

Where Chapter 4 mentions localStorage or local-only snapshots, keep it as fallback and add:

```latex
在最新生产边界中，Redis 已成为文档、版本、Review Item、证据状态、课程、会话和设置等对象的主要持久化边界；前端本地草稿仅作为保存失败时的降级机制。
```

## Task 3: Update Chapter 5 Runtime Evidence

**Files:**
- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`

- [ ] **Step 1: Update evidence hierarchy**

In `\section{验证边界与运行证据层级}`, add a sentence after the first paragraph:

```latex
在 2026 年 5 月 16 日合并的 P0 工作台重构后，平台进一步补充了持久化 Review Queue、Evidence Ledger 状态和文档版本元数据支持；因此，本章对运行证据的表述将前端可操作性与后端过程记录能力区分开来，避免仅凭界面截图推断长期教学效果。
```

- [ ] **Step 2: Update environment/API flow**

Where the feedback request flow mentions `/api/chat` and `/v1/writing/analyze`, add:

```latex
对于进入正文修改流程的建议，最新版本还会通过 \texttt{/api/review-items} 形成持久化审查项，使写作分析结果、AI 建议、证据状态和版本采纳记录能够在后续会话中继续追踪。
```

- [ ] **Step 3: Update runtime audit table**

Add rows or revise the table:

```latex
Review Queue 接口 & 通过 & 最新工程版本新增 \texttt{/api/review-items}，后端单测覆盖 review item 创建、列表与状态更新 \\
证据状态与版本元数据 & 通过 & 文献库、写作分析与工作台状态已加入证据状态和版本关联字段，支持审查项与文档版本联动 \\
```

Keep existing limitations and add:

```latex
截图同步 & 待更新 & 当前论文截图主要用于说明统一 Workspace 主流程；如需展示最新 Review / Evidence / Graph / Versions 抽屉，应重新生成生产预览截图 \\
```

- [ ] **Step 4: Update feature chain table**

Add one row to `tab:function-flow`:

```latex
审查队列与证据台账 & Review/Evidence 抽屉 & \texttt{/api/review-items}、\texttt{/api/library} 与文档版本服务联动 & AI 建议、写作分析发现、证据状态和版本记录可追踪 \\
```

- [ ] **Step 5: Add PR evidence paragraph**

Near the end of runtime evidence or appendix reference paragraph, add:

```latex
工程提交方面，最新主分支包含 \texttt{7fd7718}（Merge pull request \#5: P0 academic writing workbench refactor）。该合并删除早期 \texttt{academic-workbench-fe/} 原型代码，新增 \texttt{/api/review-items}、Review Queue 前后端接口、Evidence/Graph/Versions 上下文面板及相关单元测试，说明生产边界已从原型页面展示进一步收敛到文档中心工作台与过程证据持久化。
```

## Task 4: Update Conclusion Boundaries

**Files:**
- Modify: `hust-undergrad-thesis/chapters/conclusion.tex`

- [ ] **Step 1: Update work review**

Add to the Workspace paragraph:

```latex
最新工程版本进一步将 AI 建议、写作分析发现、证据状态和版本采纳结果组织为持久化审查项，使过程记录不再只依赖前端临时状态，而具备跨会话复核与后续教师查看的工程基础。
```

- [ ] **Step 2: Update contribution 3**

Revise the third contribution so it includes:

```latex
统一 Workspace 已演进为文档中心工作台，包含 Review Queue、Evidence Ledger、Graph 解释视图和 Versions 版本视图，为学生审查 AI 建议、查看证据依据、回看版本和后续教师复核提供统一入口。
```

- [ ] **Step 3: Update limitations**

Add a limitation:

```latex
虽然最新工程版本已实现审查项和证据状态持久化，但当前论文仍缺少基于真实课程长期使用日志的采纳率、回看率和教师复核行为统计；因此，持久化机制只能说明平台具备记录过程证据的工程能力，不能直接证明学生反馈投入或写作能力已经提升。
```

## Task 5: Update Appendix Interfaces And Evidence

**Files:**
- Modify: `hust-undergrad-thesis/chapters/appendix.tex`

- [ ] **Step 1: Add `/api/review-items` to API appendix**

In the backend or AI service interface section, add:

```latex
\texttt{/api/review-items} & Review Queue 接口，用于创建、查询和更新 AI 建议及写作分析发现的审查项，支持与文档、证据状态和版本元数据关联。 \\
```

- [ ] **Step 2: Add latest commit evidence**

In the repository evidence section, add:

```latex
最新主分支证据：\texttt{inference-engine-v2} 于 2026-05-16 合并 \texttt{7fd7718}（PR \#5，\textit{P0 academic writing workbench refactor}），新增 Review Queue、Evidence/Graph/Versions 上下文面板、Review Item API 与相关测试，并移除早期 \texttt{academic-workbench-fe/} 原型目录。
```

## Task 6: Sync `docx_source.md`

**Files:**
- Modify: `hust-undergrad-thesis/docx_source.md`

- [ ] **Step 1: Locate matching sections**

Run:

```bash
rg -n "Review|Evidence|Versions|suggestion|Diff|工作台|运行证据|总结与展望|review-items|academic-workbench-fe" hust-undergrad-thesis/docx_source.md
```

Expected: locations matching Chapter 4, Chapter 5, Appendix, and Conclusion content.

- [ ] **Step 2: Mirror the LaTeX meaning**

Edit the Markdown so the content matches the final LaTeX wording. Do not introduce extra claims that are absent from the LaTeX source.

## Task 7: Verification

**Files:**
- Verify: `hust-undergrad-thesis/main.tex`
- Verify: `hust-undergrad-thesis/main.pdf`

- [ ] **Step 1: Check for stale prototype claims**

Run:

```bash
rg -n "academic-workbench-fe|原型代码|本地版本快照|localStorage|suggestion 中间态|联网搜索|教师统计" hust-undergrad-thesis/chapters hust-undergrad-thesis/docx_source.md
```

Expected:

```text
Any remaining matches are either historical/limitation statements or explicit fallback/deferred-work statements.
```

- [ ] **Step 2: Check for latest PR terminology**

Run:

```bash
rg -n "Review Queue|Evidence Ledger|review-items|版本元数据|文档中心|7fd7718|PR \\#5|P0" hust-undergrad-thesis/chapters hust-undergrad-thesis/docx_source.md
```

Expected:

```text
Matches appear in Chapter 4, Chapter 5, Appendix, and Conclusion.
```

- [ ] **Step 3: Build the thesis PDF**

Run:

```bash
cd hust-undergrad-thesis
latexmk -xelatex -interaction=nonstopmode main.tex
```

Expected:

```text
Latexmk: All targets (...) are up-to-date
```

If `latexmk` exits nonzero, inspect `hust-undergrad-thesis/main.log` and fix only the introduced LaTeX errors.

- [ ] **Step 4: Review generated PDF pages**

Open or inspect `hust-undergrad-thesis/main.pdf`. Confirm:

```text
Chapter 4 contains latest workbench and persistence description.
Chapter 5 distinguishes runtime screenshots from latest PR #5 engineering evidence.
Conclusion keeps classroom-effect limitations explicit.
Appendix includes /api/review-items and latest commit evidence.
No figure caption claims to show UI that has not been regenerated.
```

## Execution Notes

- Do not reset or discard existing uncommitted thesis edits.
- Keep tone academically conservative.
- Do not claim that review-item persistence proves teaching effectiveness.
- Do not claim web search is available; it remains disabled until a real provider exists.
- Do not use `academic-workbench-fe/` as current production evidence.
- If screenshots are not regenerated, say the new P0 refactor is engineering evidence rather than visual screenshot evidence.

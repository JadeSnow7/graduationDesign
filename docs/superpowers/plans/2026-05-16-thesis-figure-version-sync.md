# Thesis Figure Version Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** First get the latest `inference-engine-v2` code running correctly on the server, then test the live website and use that same website session to replace stale Chapter 5 screenshots and add visual evidence to the two typical writing cases.

**Architecture:** Treat the server deployment as the source of truth. Pull latest `origin/main` on `/root/inference-engine-v2` through the server proxy, build and run the backend/frontend there, verify API health plus key website routes, then capture a single coherent screenshot batch from the reachable website. Local clean worktree screenshots are only a fallback if the live site is temporarily unreachable and must be explicitly described as fallback evidence.

**Tech Stack:** React + Vite production preview, Chrome DevTools Protocol screenshot script, LaTeX `figure/subfigure`, existing `hust-undergrad-thesis/scripts/optimize_figures.py`, `latexmk -xelatex`.

---

## File Map

- Server: `root@47.122.126.45:/root/inference-engine-v2`
  - Pull latest main through `http://127.0.0.1:7890`.
  - Build and run the latest backend/frontend before any website testing.
  - Record the tested commit hash and website URL used for screenshots.
- Modify: `inference-engine-v2/scripts/audit_screenshots.mjs`
  - Add optional thesis screenshot targets for latest workbench panels and two case-analysis states.
  - Keep existing 21-page audit behavior available by default.
- Modify or create: `inference-engine-v2/scripts/thesis_case_screenshots.mjs`
  - Prefer creating this separate script if the case state injection becomes too specific for the general audit script.
  - It should render deterministic case screenshots without requiring real student data.
- Modify: `hust-undergrad-thesis/figures/*.png`
  - Replace stale runtime figures, especially `fig-runtime-login.png` and `fig-runtime-learning-dashboard.png` used by Figure 5-1.
  - Replace other runtime screenshots in the same batch for version consistency.
- Create: `hust-undergrad-thesis/figures/fig-case-citation-feedback.png`
  - Case 1 screenshot showing citation-format analysis feedback and norm-node references.
- Create: `hust-undergrad-thesis/figures/fig-case-experiment-feedback.png`
  - Case 2 screenshot showing experiment-structure feedback and claim-boundary guidance.
- Optional create: `hust-undergrad-thesis/figures/fig-workbench-review-evidence.png`
  - Latest workbench screenshot showing Review/Evidence/Graph/Versions or equivalent latest context panel if it is visually stable.
- Modify: `hust-undergrad-thesis/chapters/chapter5.tex`
  - Insert case figures in Section 5.4.
  - Update Figure 5-1 and surrounding text to remove “old page” mismatch.
  - Adjust figure numbering/cross-references naturally through LaTeX labels.
- Modify: `hust-undergrad-thesis/docx_source.md`
  - Mirror all Chapter 5 figure additions and caption changes for the Word source.
- Optional modify: `hust-undergrad-thesis/scripts/optimize_figures.py`
  - Add the new case PNGs to the optimization list so print clarity matches existing screenshots.

## Task 1: Deploy And Verify The Latest Server Code First

- [ ] **Step 1: Confirm GitHub latest main locally**

Run:

```bash
git -C /Users/huaodong/graduationDesign/inference-engine-v2 fetch origin main
git -C /Users/huaodong/graduationDesign/inference-engine-v2 rev-parse --short origin/main
```

Expected: `7fd7718` or a newer intentional main commit. If it is newer than `7fd7718`, record the new short hash in Chapter 5 wording and the final report.

- [ ] **Step 2: Pull latest main on the server through proxy**

Run:

```bash
ssh -i /Users/huaodong/graduationDesign/secret/jxfz.pem root@47.122.126.45 'cd /root/inference-engine-v2 && git -c http.proxy=http://127.0.0.1:7890 -c https.proxy=http://127.0.0.1:7890 fetch origin main && git checkout main && git pull --ff-only origin main && git rev-parse --short HEAD'
```

Expected: server prints the same latest short hash as local `origin/main`. If the server worktree has uncommitted changes that block checkout/pull, stop and report; do not reset or overwrite server changes without explicit approval.

- [ ] **Step 3: Install/build frontend on the server**

Run:

```bash
ssh -i /Users/huaodong/graduationDesign/secret/jxfz.pem root@47.122.126.45 'cd /root/inference-engine-v2/frontend && npm ci && npm run build'
```

Expected: `npm ci` and `npm run build` exit `0`. Peer dependency and Vite chunk-size warnings are acceptable; build failure is not.

- [ ] **Step 4: Verify backend import/start health on the server**

Run the server’s existing backend start command if documented in `README`, `AGENTS.md`, or deployment scripts. If no single command exists, use the project’s FastAPI module entrypoint and then check health/API routes.

Run:

```bash
ssh -i /Users/huaodong/graduationDesign/secret/jxfz.pem root@47.122.126.45 'cd /root/inference-engine-v2 && python -m py_compile backend/main.py && echo backend_py_compile_ok'
```

Expected: `backend_py_compile_ok`. Then start or restart the backend service and verify at least one backend route responds with HTTP 200/401/404 as appropriate rather than connection failure.

- [ ] **Step 5: Start or restart the website on the server**

Use the deployment mechanism already present on the server. If the app is served by a persistent service, restart that service. If this is a thesis screenshot session only, run Vite preview bound to the server interface:

Run:

```bash
ssh -i /Users/huaodong/graduationDesign/secret/jxfz.pem root@47.122.126.45 'cd /root/inference-engine-v2/frontend && nohup npm run preview -- --host 0.0.0.0 --port 5174 > /tmp/inference-engine-v2-frontend-preview.log 2>&1 &'
```

Expected: website process starts. Record whether the tested website URL is a domain, `http://47.122.126.45:5174`, or an SSH-tunneled URL.

- [ ] **Step 6: Confirm website routes from outside the server**

Run from the local machine:

```bash
curl -I http://47.122.126.45:5174/login
curl -I http://47.122.126.45:5174/
```

Expected: HTTP response is reachable. If the public port is blocked, create an SSH tunnel and use `http://127.0.0.1:<local-port>` for website testing:

```bash
ssh -N -L 5174:127.0.0.1:5174 -i /Users/huaodong/graduationDesign/secret/jxfz.pem root@47.122.126.45
```

Expected: local tunnel makes the server website reachable at `http://127.0.0.1:5174`.

## Task 2: Test The Live Website Before Taking Thesis Screenshots

- [ ] **Step 1: Run page-level audit against the live website URL**

Run from the local `inference-engine-v2` repo, but point the script at the server website URL:

```bash
AUDIT_APP_URL=http://47.122.126.45:5174 AUDIT_SCREENSHOT_DIR=/private/tmp/thesis-runtime-shots node /Users/huaodong/graduationDesign/inference-engine-v2/scripts/audit_screenshots.mjs
```

If using an SSH tunnel, replace `AUDIT_APP_URL` with `http://127.0.0.1:5174`.

Expected: 21 PNGs are created under `/private/tmp/thesis-runtime-shots`, covering desktop/tablet/mobile for login, dashboard, courses, workbench, library, graph, and writing from the server-hosted website.

- [ ] **Step 2: Manually inspect the live website critical routes**

Use browser automation or a normal browser session to inspect:

```text
/login
/
/courses
/workbench
/writing
/graph
/library
```

Expected:

```text
1. No route shows a blank page.
2. Login/dashboard UI is the latest page style.
3. Workbench contains the latest document-centered layout.
4. Writing page can submit or display analysis.
5. Console has no fatal runtime errors.
```

- [ ] **Step 3: Select the replacement runtime figures**

Copy these files into `hust-undergrad-thesis/figures` using the same figure names:

```text
/private/tmp/thesis-runtime-shots/desktop-login.png              -> fig-runtime-login.png
/private/tmp/thesis-runtime-shots/desktop-dashboard.png          -> fig-runtime-learning-dashboard.png
/private/tmp/thesis-runtime-shots/desktop-courses.png            -> fig-runtime-courses.png
/private/tmp/thesis-runtime-shots/desktop-workbench.png          -> fig-workspace-ui.png
/private/tmp/thesis-runtime-shots/desktop-writing.png            -> fig-runtime-writing-feedback.png
/private/tmp/thesis-runtime-shots/desktop-graph.png              -> fig-runtime-knowledge-graph.png
/private/tmp/thesis-runtime-shots/desktop-library.png            -> fig-runtime-library.png
/private/tmp/thesis-runtime-shots/mobile-dashboard.png           -> fig-runtime-mobile-dashboard.png
/private/tmp/thesis-runtime-shots/tablet-library.png             -> fig-runtime-tablet-library.png
```

Expected: Figure 5-1 and all Chapter 5 runtime figures come from the same latest production preview batch.

## Task 3: Capture Typical Case Screenshots From The Website

- [ ] **Step 1: Add a deterministic case screenshot script**

Create `inference-engine-v2/scripts/thesis_case_screenshots.mjs`. The script must target the server website via `AUDIT_APP_URL`, not a separate local preview, unless the final report explicitly marks it as fallback. The script should:

```text
1. launch headless Chrome with CDP;
2. set the same audit login localStorage values as audit_screenshots.mjs;
3. intercept /v1/writing/analyze before page scripts run;
4. return deterministic JSON for the citation case and experiment-structure case;
5. navigate to /writing;
6. fill the textarea with the exact case input from chapter5.tex;
7. click “分析学术规范”;
8. wait until “规范节点”“校验结果”“引用来源” are visible;
9. capture one PNG for each case.
```

Use these output paths:

```text
/private/tmp/thesis-case-shots/fig-case-citation-feedback.png
/private/tmp/thesis-case-shots/fig-case-experiment-feedback.png
```

Run:

```bash
AUDIT_APP_URL=http://47.122.126.45:5174 node /Users/huaodong/graduationDesign/inference-engine-v2/scripts/thesis_case_screenshots.mjs
```

If using an SSH tunnel, replace `AUDIT_APP_URL` with `http://127.0.0.1:5174`.

- [ ] **Step 2: Use citation-case fixture data**

The `/v1/writing/analyze` mock for Case 1 must include:

```json
{
  "nodes": [
    {"id": "citation_in_text_format", "label": "文内引用格式", "type": "citation", "score": 0.94},
    {"id": "reference_list_consistency", "label": "参考文献一致性", "type": "citation", "score": 0.91},
    {"id": "evidence_support_requirement", "label": "证据支撑要求", "type": "evidence", "score": 0.88}
  ],
  "expanded_context": [
    {"id": "citation-context", "title": "引用格式与文末条目一致", "excerpt": "文内引用应能在参考文献列表中找到完整对应条目。", "score": 0.9}
  ],
  "validation": [
    {"id": "citation-format", "status": "warning", "message": "当前句子使用 Smith, 2023，但需要核对引用格式和文末条目。"},
    {"id": "claim-evidence", "status": "warning", "message": "widely used 与 improve reliability 属于较强概括，应补充证据或弱化表述。"}
  ],
  "references": [
    {"id": "citation_in_text_format", "title": "citation_in_text_format", "source": "Academic writing KG", "year": "2026"},
    {"id": "reference_list_consistency", "title": "reference_list_consistency", "source": "Academic writing KG", "year": "2026"}
  ]
}
```

Expected screenshot: the left side shows the exact Case 1 input, and the right side shows norm nodes plus validation warnings.

- [ ] **Step 3: Use experiment-case fixture data**

The `/v1/writing/analyze` mock for Case 2 must include:

```json
{
  "nodes": [
    {"id": "experiment_goal_statement", "label": "实验目标说明", "type": "structure", "score": 0.93},
    {"id": "baseline_comparison_requirement", "label": "对照方法要求", "type": "experiment", "score": 0.89},
    {"id": "metric_supported_claim", "label": "指标支撑要求", "type": "evidence", "score": 0.87},
    {"id": "claim_boundary_control", "label": "结论边界控制", "type": "argument", "score": 0.92}
  ],
  "expanded_context": [
    {"id": "experiment-context", "title": "实验章节需要说明目标、指标与边界", "excerpt": "系统测试结果应区分流程验证、集成证据和教学效果结论。", "score": 0.91}
  ],
  "validation": [
    {"id": "goal", "status": "warning", "message": "段落说明了系统组成，但没有明确实验目标。"},
    {"id": "metric", "status": "warning", "message": "good results 缺少指标支撑，不宜直接作为性能结论。"},
    {"id": "boundary", "status": "warning", "message": "应区分 pipeline validation、live smoke test 与教学效果证明。"}
  ],
  "references": [
    {"id": "experiment_goal_statement", "title": "experiment_goal_statement", "source": "Academic writing KG", "year": "2026"},
    {"id": "claim_boundary_control", "title": "claim_boundary_control", "source": "Academic writing KG", "year": "2026"}
  ]
}
```

Expected screenshot: the figure visually supports Case 2’s claim that the platform identifies missing goals, metrics, baselines, and conclusion boundaries.

- [ ] **Step 4: Copy case screenshots into thesis figures**

Run:

```bash
cp /private/tmp/thesis-case-shots/fig-case-citation-feedback.png /Users/huaodong/graduationDesign/hust-undergrad-thesis/figures/fig-case-citation-feedback.png
cp /private/tmp/thesis-case-shots/fig-case-experiment-feedback.png /Users/huaodong/graduationDesign/hust-undergrad-thesis/figures/fig-case-experiment-feedback.png
```

Expected: both files exist in `hust-undergrad-thesis/figures`.

## Task 4: Update Chapter 5 Figure Text

- [ ] **Step 1: Update Section 5.3 figure wording**

Modify `hust-undergrad-thesis/chapters/chapter5.tex` around Figure 5-1 so it states the screenshots are from the latest production preview batch, not an earlier UI version.

Use this wording principle:

```text
图 5-1 展示最新生产预览批次中的登录入口和学生端总览页面，二者与后续课程、工作台、AI 写作和案例截图来自同一前端版本。
```

- [ ] **Step 2: Insert Case 1 figure**

Insert this figure after Case 1 “平台分析过程” or before “系统反馈示例”:

```latex
\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.96\textwidth]{fig-case-citation-feedback.png}
  \caption{引用格式检查案例的规范节点与校验结果展示}
  \label{fig:case-citation-feedback}
\end{figure}
```

Then add one sentence before the figure:

```latex
该案例在平台中的可视化分析结果如图~\ref{fig:case-citation-feedback}~所示，页面同时呈现待分析文本、命中的规范节点、校验提示和引用来源。
```

- [ ] **Step 3: Insert Case 2 figure**

Insert this figure after Case 2 “平台分析过程” or before “系统反馈示例”:

```latex
\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.96\textwidth]{fig-case-experiment-feedback.png}
  \caption{实验章节结构优化案例的规范节点与结论边界提示}
  \label{fig:case-experiment-feedback}
\end{figure}
```

Then add one sentence before the figure:

```latex
该案例在平台中的可视化分析结果如图~\ref{fig:case-experiment-feedback}~所示，系统将实验目标、对照方法、指标支撑和结论边界分别映射到规范节点与校验提示。
```

- [ ] **Step 4: Update the screenshot audit paragraph**

Modify the paragraph after Table 5.2 to say:

```text
本次最终论文截图批次除 7 个页面、3 类视口的运行审计截图外，还补充了 2 张典型案例截图。案例截图使用固定示例文本和确定性分析结果，仅用于展示交互链路与反馈结构，不作为真实用户数据或教学效果证据。
```

Expected: Chapter 5 no longer says latest visual presentation “needs future screenshot update” if the latest workbench/case screenshots are actually inserted.

## Task 5: Mirror Changes In `docx_source.md`

- [ ] **Step 1: Update the Figure 5-1 paragraph**

Modify the matching paragraph in `hust-undergrad-thesis/docx_source.md` so it matches the latest-version wording used in `chapter5.tex`.

- [ ] **Step 2: Insert Case 1 HTML figure block**

Insert after the Case 1 analysis-process paragraph:

```html
<figure id="fig:case-citation-feedback" data-latex-placement="htbp">
<img src="fig-case-citation-feedback.png" style="width:96.0%" />
<figcaption>引用格式检查案例的规范节点与校验结果展示</figcaption>
</figure>
```

- [ ] **Step 3: Insert Case 2 HTML figure block**

Insert after the Case 2 analysis-process paragraph:

```html
<figure id="fig:case-experiment-feedback" data-latex-placement="htbp">
<img src="fig-case-experiment-feedback.png" style="width:96.0%" />
<figcaption>实验章节结构优化案例的规范节点与结论边界提示</figcaption>
</figure>
```

Expected: LaTeX source and docx source include the same two case figures.

## Task 6: Optimize And Verify Figures

- [ ] **Step 1: Optimize screenshots for print clarity**

Run:

```bash
python3 /Users/huaodong/graduationDesign/hust-undergrad-thesis/scripts/optimize_figures.py
```

Expected: script completes and preserves screenshot content while sharpening text. If the script does not yet include the new case figures, add them to the screenshot plan in `optimize_figures.py` first.

- [ ] **Step 2: Verify all referenced image files exist**

Run:

```bash
rg -o "\\\\includegraphics(?:\\[[^]]*\\])?\\{([^}]+)\\}" /Users/huaodong/graduationDesign/hust-undergrad-thesis/chapters \
  | sed -E 's/.*\\{([^}]+)\\}.*/\\1/' \
  | while read f; do test -f "/Users/huaodong/graduationDesign/hust-undergrad-thesis/figures/$f" || echo "missing $f"; done
```

Expected: no `missing ...` output.

- [ ] **Step 3: Build the thesis**

Run:

```bash
latexmk -xelatex -interaction=nonstopmode main.tex
```

Working directory:

```text
/Users/huaodong/graduationDesign/hust-undergrad-thesis
```

Expected: exit code `0`, `main.pdf` regenerated. Overfull/underfull warnings are acceptable if they do not hide or misplace figures.

- [ ] **Step 4: Inspect generated PDF around Chapter 5**

Open or render pages around:

```text
Figure 5-1 runtime screenshots
Section 5.4 Case 1 figure
Section 5.4 Case 2 figure
```

Expected:

```text
1. Figure 5-1 is no longer an old UI version.
2. Case figures are readable at PDF scale.
3. Captions match the text around them.
4. No figure floats are separated so far from their case text that the section becomes confusing.
```

## Task 7: Final Consistency Checks

- [ ] **Step 1: Record server-tested commit and website URL**

Add the tested server commit and website URL to the final work report, and if Chapter 5 mentions screenshot provenance, keep it concrete:

```text
截图来自服务器 `/root/inference-engine-v2` 最新主分支提交 <short-hash>，通过 <tested-url> 访问并测试。
```

Expected: final evidence does not ambiguously mix local preview, old screenshots, and live website screenshots.

- [ ] **Step 2: Check stale screenshot-boundary wording**

Run:

```bash
rg -n "旧版|后续截图更新|相关视觉呈现需以后续截图更新|截图同步 & 待更新|academic-workbench-fe" /Users/huaodong/graduationDesign/hust-undergrad-thesis/chapters /Users/huaodong/graduationDesign/hust-undergrad-thesis/docx_source.md
```

Expected:

```text
No stale “future screenshot update” wording remains, unless it intentionally describes a still-unshown feature.
`academic-workbench-fe` may appear only in historical removal/boundary statements.
```

- [ ] **Step 3: Check new figure references**

Run:

```bash
rg -n "fig:case-citation-feedback|fig:case-experiment-feedback|fig-case-citation-feedback|fig-case-experiment-feedback" /Users/huaodong/graduationDesign/hust-undergrad-thesis/chapters/chapter5.tex /Users/huaodong/graduationDesign/hust-undergrad-thesis/docx_source.md
```

Expected: both case figures appear in both LaTeX and docx source.

- [ ] **Step 4: Summarize changed files**

Run:

```bash
git -C /Users/huaodong/graduationDesign/hust-undergrad-thesis diff --stat
git -C /Users/huaodong/graduationDesign/inference-engine-v2 diff --stat
```

Expected: thesis diff includes updated figures and Chapter 5/docx source; inference diff includes only screenshot-script changes if the script was edited in the main worktree. If the script was created only in `/private/tmp`, no inference-engine-v2 source diff is required.

## Execution Notes

- Server website screenshots are the primary evidence path. Use local clean-worktree screenshots only as a fallback when the server website cannot be made reachable, and label that fallback explicitly in the thesis wording and final report.
- Avoid using the existing dirty `/Users/huaodong/graduationDesign/inference-engine-v2` runtime state as screenshot evidence. The server-tested commit and website URL must be recorded.
- Use fixed demonstration text only; do not use real student submissions.
- Keep case screenshots tied to the exact text already printed in Section 5.4.
- If the latest workbench UI cannot visually show Review/Evidence/Graph/Versions in a stable way, do not force a screenshot. Instead, keep the runtime image focused on stable pages and use the two case screenshots to strengthen Section 5.4.
- Do not renumber figures manually. Let LaTeX assign figure numbers through labels.

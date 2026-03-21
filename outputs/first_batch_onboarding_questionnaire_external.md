# 首批内测用户建档问卷（外部问卷版）

适用场景：
- 在问卷星、腾讯问卷、金数据等外部平台快速创建同版问卷。
- 便于后续统一导出为 JSON，并回写平台的 `account`、`onboarding_profile`、`learning_style`、`global_competencies`。

建议：
- 使用同一份问卷完成 `账号开通` 与 `画像初始化`。
- 如果问卷平台支持“变量名 / 字段编码 / 选项编码”，优先使用本文给出的 `export_key` 与 `option_code`。
- 如果问卷平台只支持导出中文题干和中文选项，回收后按本文映射表做一次转码。

---

## 卷首语

欢迎加入平台首批内测。本表单用于：

1. 账号开通与身份确认。
2. 个性化初始化与冷启动建模。
3. 去标识化后的首批用户群体分析与产品优化（仅在用户勾选同意后进行）。

说明：
- 本表单为非匿名采集。
- 姓名与学号仅用于账号开通，不进入群体统计报表。
- 画像字段将按最小必要原则使用，并与账号字段分权限存储。
- 全表预计 4 分钟内完成。

---

## 创建规则

- 表单标题：`【内测专属】AI 学术写作辅助平台 · 激活与用户建档问卷`
- 表单副标题：`14 题 + 2 项同意说明，约 4 分钟完成`
- 建议分区：
  - `同意说明`
  - `账号开通信息`
  - `画像初始化信息`
- 建议额外增加隐藏字段：
  - `form_version = onboarding_v1_external`
  - `source = external_survey`

---

## 题目清单

### CONSENT_A
- export_key: `consent_personalization`
- 类型：单选 / 判断
- 必填：是
- 题面：`我同意平台将本表信息用于账号开通与个性化初始化。`
- 选项：
  - `true`：同意
  - `false`：不同意（选择后问卷自动结束，不予开通账号）
- 跳题逻辑：选 `false` 时跳至结束页，不再展示后续题目。

### CONSENT_B
- export_key: `analytics_opt_in`
- 类型：单选 / 判断
- 必填：否
- 题面：`我同意平台将去标识化结果用于首批用户群体分析与产品优化。`
- 选项：
  - `true`：同意
  - `false`：不同意

### Q1 真实姓名
- export_key: `real_name`
- 类型：单行文本
- 必填：是
- 题面：`您的真实姓名是？`
- 备注：仅用于账号开通，不进入聚合分析导出。

### Q2 学号
- export_key: `student_id`
- 类型：单行文本
- 必填：是
- 题面：`您的学号是？`
- 备注：将作为登录账号与主键。

### Q3 所属专业方向
- export_key: `major_track`
- 类型：单选
- 必填：是
- 题面：`您目前所属的专业方向是？（如不在以下选项中，请选最后一项）`
- 选项：
  - `ic_design`：集成电路设计
  - `microelectronics`：微电子学与固体电子学
  - `electronic_info`：电子信息
  - `cross_discipline`：交叉方向或其他

### Q4 未来 1-2 个月最需要平台帮助的写作任务
- export_key: `current_tasks`
- 类型：多选
- 必填：是
- 最多选择：2
- 题面：`未来 1-2 个月，您最希望平台重点帮助您完成哪些写作任务？（若暂不明确，请单独勾选最后一项）`
- 选项：
  - `course_paper`：课程论文
  - `lab_report`：实验或项目报告
  - `english_abstract_mail`：英文摘要或英文邮件
  - `literature_review`：文献综述
  - `proposal_midterm`：开题 / 中期 / 组会材料
  - `thesis_chapter`：学位论文章节
  - `unclear`：暂不明确
- 互斥规则：`unclear` 与其他选项互斥，选择后自动取消其余勾选。

### Q5 主要使用终端
- export_key: `primary_platform`
- 类型：单选
- 必填：是
- 题面：`您主要使用什么终端访问平台？`
- 选项：
  - `windows`：Windows
  - `macos_apple_silicon`：macOS（Apple Silicon）
  - `macos_intel`：macOS（Intel）
  - `linux`：Linux
  - `mobile_tablet`：手机 / 平板为主

### Q6 本地算力情况
- export_key: `local_compute_tier`
- 类型：单选
- 必填：是
- 题面：`您的常用设备本地算力情况更接近哪一项？`
- 选项：
  - `cpu_only`：仅 CPU / 核显
  - `nvidia_gpu`：NVIDIA 独显
  - `apple_silicon_local`：Apple Silicon 可本地推理
  - `unknown`：不确定
  - `no_local`：不希望占用本地资源

### Q7 常见网络环境
- export_key: `network_tier`
- 类型：单选
- 必填：是
- 题面：`您常见的网络环境是？`
- 选项：
  - `stable_network`：校园网 / 家宽稳定
  - `occasional_hotspot`：偶尔使用热点
  - `weak_network`：经常弱网
  - `offline_expected`：希望离线也能用

### Q8 学术写作阶段
- export_key: `writing_stage`
- 类型：单选
- 必填：是
- 题面：`您当前的学术写作阶段是？`
- 选项：
  - `beginner_zero`：零基础
  - `first_paper`：正在写第一篇
  - `published_experience`：有投稿或发表经历
  - `thesis_in_progress`：正在推进学位论文

### Q9 当前最头疼的环节
- export_key: `pain_points`
- 类型：多选
- 必填：是
- 最多选择：3
- 题面：`在学术写作中，您当前最头疼的环节有哪些？`
- 选项：
  - `literature_search`：文献检索与筛选
  - `citation_management`：引用规范与文献管理
  - `structure_logic`：结构搭建与逻辑推进
  - `academic_tone_rewriting`：学术语态与改写
  - `results_discussion`：结果分析与讨论
  - `english_expression`：中英转换与英文表达
  - `research_question`：研究问题 / 创新点提炼
  - `other`：其他

### Q10 使用过的 AI 工具
- export_key: `prior_tools`
- 类型：多选
- 必填：是
- 题面：`您使用过哪些 AI 工具？`
- 选项：
  - `chatgpt`：ChatGPT / GPT 系列
  - `kimi`：Kimi
  - `deepseek`：DeepSeek
  - `wenxin`：文心一言
  - `qwen`：通义千问
  - `gemini`：Gemini
  - `copilot`：GitHub Copilot
  - `academic_tools`：专业学术工具（Elicit / Consensus 等）
  - `other`：其他工具
  - `none`：从未使用过 AI 工具
- 规则：`none` 不应与其他选项同时出现。

### Q11 更常在什么时段使用平台
- export_key: `preferred_time`
- 类型：单选
- 必填：是
- 题面：`您更常在什么时段使用平台？`
- 选项：
  - `morning`：上午
  - `afternoon`：下午
  - `evening`：晚上
  - `late_night`：深夜
  - `flexible`：无固定时段
- 备注：用于运营推送时段优化，不影响 AI 推理策略。

### Q12 更希望 AI 如何带你改稿
- export_key: `guidance_style`
- 类型：单选
- 必填：是
- 题面：`如果 AI 作为写作助教，您更希望它如何带您改稿？`
- 选项：
  - `strict_scaffold`：严格拆步推进，不直接代写
  - `options_guidance`：指出问题并给 2-3 个修改方向
  - `rewrite_then_explain`：先给可用改写，再解释原因

### Q13 希望反馈详略程度
- export_key: `feedback_verbosity`
- 类型：单选
- 必填：是
- 题面：`您更偏好的反馈详略程度是？`
- 选项：
  - `concise`：简洁
  - `balanced`：平衡
  - `detailed`：详细

### Q14（矩阵量表）对以下平台行为的接受程度
- 类型：矩阵单选量表（1-5）
- 必填：是
- 引导语：`请评价您对以下平台行为的接受程度（1 = 完全不接受，5 = 完全接受）。`
- 量表标签：
  - `1`：完全不接受
  - `2`：比较不接受
  - `3`：中立
  - `4`：比较接受
  - `5`：完全接受

#### Q14-A
- export_key: `latency_tolerance`
- 题面：`等待 10–15 秒以换取更高质量的分析结果`

#### Q14-B
- export_key: `guided_refusal_tolerance`
- 题面：`AI 拒绝直接代写，转为引导您逐步完成`

#### Q14-C
- export_key: `evidence_first_tolerance`
- 题面：`AI 因证据不足，要求您先补充文献 / 上下文再作答`

---

## 推荐 JSON 导出目标结构

建议在外部问卷导出后，统一整理为以下 JSON：

```json
{
  "account": {
    "real_name": "胡傲东",
    "student_id": "M202500123"
  },
  "consents": {
    "consent_personalization": true,
    "analytics_opt_in": true
  },
  "onboarding_profile": {
    "major_track": "ic_design",
    "current_tasks": ["course_paper", "thesis_chapter"],
    "primary_platform": "macos_apple_silicon",
    "local_compute_tier": "apple_silicon_local",
    "network_tier": "offline_expected",
    "writing_stage": "first_paper",
    "pain_points": ["citation_management", "structure_logic"],
    "prior_tools": ["chatgpt", "kimi"]
  },
  "learning_style": {
    "preferred_time": "evening",
    "guidance_style": "options_guidance",
    "feedback_verbosity": "detailed",
    "latency_tolerance": 4,
    "guided_refusal_tolerance": 3,
    "evidence_first_tolerance": 5
  }
}
```

---

## 派生字段规则

### 1. `learning_style.pace`

由 `guidance_style` 派生：

- `strict_scaffold -> slow`
- `options_guidance -> moderate`
- `rewrite_then_explain -> fast`

### 2. `onboarding_profile.route_preference`

由设备与网络字段派生：

- 当 `local_compute_tier in {nvidia_gpu, apple_silicon_local}` 且 `network_tier in {weak_network, offline_expected}` 时：`local_first`
- 当 `primary_platform = mobile_tablet`，或 `local_compute_tier in {cpu_only, no_local}` 时：`cloud_first`
- 其他情况：`auto`

### 3. `global_competencies`

固定维度：

- `academic_writing`
- `citation`
- `structure`
- `logic`
- `grammar`
- `critical_thinking`

基础分：

- `beginner_zero = 0.25`
- `first_paper = 0.40`
- `published_experience = 0.60`
- `thesis_in_progress = 0.70`

痛点扣分规则：

- `literature_search -> critical_thinking - 0.15`
- `citation_management -> citation - 0.15`
- `structure_logic -> structure - 0.15, logic - 0.15`
- `academic_tone_rewriting -> academic_writing - 0.15, grammar - 0.15`
- `results_discussion -> logic - 0.15, critical_thinking - 0.15`
- `english_expression -> grammar - 0.15, academic_writing - 0.15`
- `research_question -> critical_thinking - 0.15, logic - 0.15`

边界：

- 最低不低于 `0.15`
- 最高不高于 `0.85`

---

## 导出注意事项

- 群体分析导出中，不要输出 `real_name` 和 `student_id`。
- 如果问卷平台导出的是中文选项文本，先按下方映射表转成标准 code，再进入 JSON。
- `current_tasks` 最多 2 项，`pain_points` 最多 3 项。
- `prior_tools` 中如果出现 `none`，应确保没有其他工具编码同时存在。
- 建议导出时额外保留：
  - `submitted_at`
  - `channel`
  - `form_version`（每次修订后同步更新版本号，避免不同版本混用）

---

## 选项中英映射表（快速校对用）

| 字段 | code | 中文显示 |
|------|------|----------|
| `major_track` | `ic_design` | 集成电路设计 |
| | `microelectronics` | 微电子学与固体电子学 |
| | `electronic_info` | 电子信息 |
| | `cross_discipline` | 交叉方向或其他 |
| `current_tasks` | `course_paper` | 课程论文 |
| | `lab_report` | 实验或项目报告 |
| | `english_abstract_mail` | 英文摘要或英文邮件 |
| | `literature_review` | 文献综述 |
| | `proposal_midterm` | 开题 / 中期 / 组会材料 |
| | `thesis_chapter` | 学位论文章节 |
| | `unclear` | 暂不明确 |
| `primary_platform` | `windows` | Windows |
| | `macos_apple_silicon` | macOS（Apple Silicon）|
| | `macos_intel` | macOS（Intel）|
| | `linux` | Linux |
| | `mobile_tablet` | 手机 / 平板为主 |
| `local_compute_tier` | `cpu_only` | 仅 CPU / 核显 |
| | `nvidia_gpu` | NVIDIA 独显 |
| | `apple_silicon_local` | Apple Silicon 可本地推理 |
| | `unknown` | 不确定 |
| | `no_local` | 不希望占用本地资源 |
| `network_tier` | `stable_network` | 校园网 / 家宽稳定 |
| | `occasional_hotspot` | 偶尔使用热点 |
| | `weak_network` | 经常弱网 |
| | `offline_expected` | 希望离线也能用 |
| `writing_stage` | `beginner_zero` | 零基础 |
| | `first_paper` | 正在写第一篇 |
| | `published_experience` | 有投稿或发表经历 |
| | `thesis_in_progress` | 正在推进学位论文 |
| `pain_points` | `literature_search` | 文献检索与筛选 |
| | `citation_management` | 引用规范与文献管理 |
| | `structure_logic` | 结构搭建与逻辑推进 |
| | `academic_tone_rewriting` | 学术语态与改写 |
| | `results_discussion` | 结果分析与讨论 |
| | `english_expression` | 中英转换与英文表达 |
| | `research_question` | 研究问题 / 创新点提炼 |
| | `other` | 其他 |
| `guidance_style` | `strict_scaffold` | 严格拆步推进，不直接代写 |
| | `options_guidance` | 指出问题并给 2-3 个修改方向 |
| | `rewrite_then_explain` | 先给可用改写，再解释原因 |
| `feedback_verbosity` | `concise` | 简洁 |
| | `balanced` | 平衡 |
| | `detailed` | 详细 |
| `preferred_time` | `morning` | 上午 |
| | `afternoon` | 下午 |
| | `evening` | 晚上 |
| | `late_night` | 深夜 |
| | `flexible` | 无固定时段 |

---

## 最小回收验收

- 必填项缺失率为 0。
- `other` 占比低于 15%。
- 100% 问卷都能映射成结构化 JSON，无需人工清洗自由文本。
- 群体切片至少可按以下四维稳定聚合：
  - `major_track`
  - `current_tasks`
  - `writing_stage`
  - `prior_tools`

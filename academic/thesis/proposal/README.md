# 开题报告 (Proposal)

本目录包含毕业设计的开题报告相关文件。

## 文件说明

- **开题报告.md** - 毕业设计开题报告正文
  - 包含课题背景、研究意义、技术路线等内容
  - 详细的进度安排和预期成果
- **opening-report.md** - 开题报告简版（用于汇报/展示）

## 开题报告要点

### 项目概述
基于大模型的以学生为中心的智能教学平台设计与实现——以研究生专业英文写作课程为例

### 主要创新点
1. 以学生为中心的学习档案与学习事件闭环：面向“过程性数据”，支持跨课程、纵向追踪与可解释的学情分析。
2. 写作类型感知的评估与反馈：区分文献综述、课程论文、学位论文、摘要等类型，采用差异化 rubric 与提示策略。
3. 可追溯的检索增强生成（GraphRAG）：回答绑定课程知识库片段并标注引用，降低幻觉与“凭空建议”风险。
4. 跨端一致的工程落地：抽取共享 types 与统一 SDK，实现 Web/Mobile 共享核心与 API，UI 按平台适配。
5. 可迭代的模型训练管线：基于 LoRA/QLoRA 的后训练脚本、数据规范与评测脚本，为 100k 规模写作数据的迭代提供支撑。

### 技术栈
- Web 前端：React + TypeScript + Vite
- 移动端：Expo（React Native）
- 后端：Go + Gin + GORM
- AI 服务：Python + FastAPI（OpenAI-compatible，支持 GraphRAG 与写作分析）
- 数据库：MySQL；对象存储（可选）：MinIO
- 部署：Docker Compose；Monorepo（npm workspaces）+ 共享包（types/SDK）

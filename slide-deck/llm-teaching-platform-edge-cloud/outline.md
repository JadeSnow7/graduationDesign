# Slide Deck Outline

**Topic**: 通用大模型大学教学平台 - 端云协同智能教学系统
**Style**: intuition-machine
**Audience**: Experts/professionals
**Language**: Chinese (zh)
**Total Slides**: 15

---

## STYLE_INSTRUCTIONS

```
Technical briefing infographic style with aged paper texture and bilingual explanatory text boxes.

DESIGN AESTHETIC: Academic/technical briefing presentation style, NOT artistic 3D renders. Clean 2D or isometric technical illustrations with multiple explanatory text boxes containing article content. Split layouts with visuals on left/center and text on right/bottom. Information-dense but organized with clear visual hierarchy. Vintage blueprint aesthetic with modern clarity.

BACKGROUND: Aged Cream (#F5F0E6) with subtle paper texture, light creases, warm nostalgic feel reminiscent of vintage technical prints.

TYPOGRAPHY:
- Primary Font (Headlines): Bold display font in dark maroon (#5D3A3A), ALL CAPS in brackets for main titles. English subtitle below in smaller size.
- Secondary Font (Labels): Clean sans-serif for bilingual callout labels. Format: "ENGLISH TERM 中文翻译"
- Body Font: Clean geometric sans-serif for text box content

COLOR PALETTE:
- Background: Aged Cream #F5F0E6
- Primary Text: Dark Maroon #5D3A3A
- Body Text: Near Black #1A1A1A
- Accent 1: Teal #2F7373 (primary illustrations)
- Accent 2: Warm Brown #8B7355 (secondary elements)
- Accent 3: Maroon #722F37 (titles, emphasis)
- Outline: Deep Charcoal #2D2D2D

VISUAL ELEMENTS:
- Isometric 3D technical illustrations OR flat 2D diagrams
- 3-5 explanatory text boxes per slide with labeled content
- Bilingual callout labels pointing to key parts
- Faded thematic background patterns (circuits, gears, flowcharts)
- Clean black outlines on all elements
- Split or triptych layouts
- "KEY QUOTE:" box at bottom with core insight
```

---

## Slide Structure

### Slide 1: Cover
**Type**: Cover
**Layout**: title-hero
**Title**: [通用大模型大学教学平台]
**Subtitle**: LLM Teaching Platform - Edge-Cloud Collaborative Intelligent Education System
**Content**:
- Main title in Chinese with English subtitle
- Subtitle: 基于边缘AI与云端AI协同的通用化教学平台
- Author placeholder
- Date: 2026
- Background: Faded technical patterns (neural networks, cloud icons, edge devices)

---

### Slide 2: 研究背景与动机
**Type**: Content
**Layout**: split-visual-text
**Title**: [研究背景与动机]
**Subtitle**: Background & Motivation
**Content**:
- Visual: Isometric illustration showing traditional classroom challenges (scattered resources, delayed feedback, manual grading)
- Text boxes:
  1. "高校教学挑战 TEACHING CHALLENGES": 概念抽象难以直观呈现、答疑反馈不及时、作业批改效率低、教学管理分散
  2. "AI技术机遇 AI OPPORTUNITIES": 大模型技术为教育带来智能化转型机遇
  3. "端云协同必要性 EDGE-CLOUD NECESSITY": 平衡性能、成本与隐私的最优方案
- KEY QUOTE: "传统教学模式亟需AI技术赋能，端云协同架构提供最优解决方案"

---

### Slide 3: 研究目标与贡献
**Type**: Content
**Layout**: grid-2x2
**Title**: [研究目标与贡献]
**Subtitle**: Goals & Contributions
**Content**:
- Visual: Four quadrants showing key contributions
- Text boxes:
  1. "核心目标 CORE GOALS": 构建通用化智能教学平台、实现端侧AI与云端AI协同、支持多学科扩展
  2. "端云协同架构 EDGE-CLOUD ARCHITECTURE": 创新性架构设计，智能路由决策机制
  3. "边缘侧优化 EDGE OPTIMIZATION": 模型压缩、量化与硬件加速方案
  4. "GraphRAG + Multi-agent": 知识检索系统与多智能体协作机制
- KEY QUOTE: "四大核心贡献：架构创新、边缘优化、知识检索、智能协作"

---

### Slide 4: 系统架构总览
**Type**: Content
**Layout**: architecture-diagram
**Title**: [系统架构总览]
**Subtitle**: Architecture Overview
**Content**:
- Visual: Layered architecture diagram showing all components
- Text boxes:
  1. "前端层 FRONTEND": React + TypeScript + Vite, 跨端支持
  2. "后端层 BACKEND": Go + Gin + GORM, 微服务架构
  3. "AI服务层 AI SERVICE": Python + FastAPI, 流式输出
  4. "数据层 DATA LAYER": MySQL + MinIO, 数据持久化
  5. "端云协同 EDGE-CLOUD": 智能路由决策，负载均衡
- Background: Faded flowchart patterns
- KEY QUOTE: "四层架构设计，端云协同，模块化可扩展"

---

### Slide 5: 端侧设计 - 架构与模型
**Type**: Content
**Layout**: split-visual-text
**Title**: [端侧设计：架构与模型]
**Subtitle**: Edge-side Design: Architecture & Model
**Content**:
- Visual: Isometric view of edge device (Apple M4) with model layers
- Text boxes:
  1. "模型选型 MODEL SELECTION": Qwen3-0.6B, 轻量级高性能
  2. "量化方案 QUANTIZATION": MLX-4bit, 内存占用降低75%
  3. "硬件平台 HARDWARE": Apple M4, 统一内存架构, Metal加速
  4. "性能指标 PERFORMANCE": 推理延迟 < 500ms, 内存占用 < 2GB
- KEY QUOTE: "Qwen3-0.6B + MLX-4bit + Apple M4 = 高性能边缘AI"

---

### Slide 6: 端侧设计 - 任务路由
**Type**: Content
**Layout**: flowchart
**Title**: [端侧设计：任务分类与路由]
**Subtitle**: Edge-side Design: Task Classification & Routing
**Content**:
- Visual: Decision tree flowchart showing routing logic
- Text boxes:
  1. "本地任务 LOCAL TASKS": 课程资源管理、学习状况追踪、简单问答
  2. "云端任务 CLOUD TASKS": 复杂推理、深度分析、多模态处理
  3. "路由决策 ROUTING LOGIC": 基于任务复杂度、响应时间要求、隐私级别
  4. "智能降级 FALLBACK": 云端不可用时本地兜底
- KEY QUOTE: "智能路由：简单任务本地处理，复杂任务云端计算"

---

### Slide 7: 云端设计 - 服务架构
**Type**: Content
**Layout**: architecture-diagram
**Title**: [云端设计：服务架构]
**Subtitle**: Cloud-side Design: Service Architecture
**Content**:
- Visual: Microservices architecture diagram
- Text boxes:
  1. "AI服务 AI SERVICE": FastAPI, 流式输出, 工具调用
  2. "后端API BACKEND API": Go + Gin, RESTful, JWT认证
  3. "数据库 DATABASE": MySQL 8.4+, GORM ORM
  4. "对象存储 OBJECT STORAGE": MinIO, 文件管理
  5. "容器化 CONTAINERIZATION": Docker Compose, 一键部署
- KEY QUOTE: "微服务架构，模块解耦，独立扩展"

---

### Slide 8: 云端设计 - 核心功能
**Type**: Content
**Layout**: grid-2x2
**Title**: [云端设计：核心功能模块]
**Subtitle**: Cloud-side Design: Core Modules
**Content**:
- Visual: Four modules with icons
- Text boxes:
  1. "认证与权限 AUTH & RBAC": JWT + RBAC, 多角色支持
  2. "课程管理 COURSE MGMT": CRUD, 成员管理, 教学日历
  3. "作业系统 ASSIGNMENT": 发布/提交/批改, AI辅助评分
  4. "资源中心 RESOURCE CENTER": 课件上传, 分类浏览, 访问追踪
- KEY QUOTE: "四大核心模块，覆盖完整教学流程"

---

### Slide 9: 性能优化 - 端云协同
**Type**: Content
**Layout**: comparison-table
**Title**: [性能优化：端云协同策略]
**Subtitle**: Performance Optimization: Edge-Cloud Collaboration
**Content**:
- Visual: Comparison table with optimization strategies
- Text boxes:
  1. "端侧优化 EDGE OPT": 4-bit量化, MLX推理, 内存管理
  2. "云端优化 CLOUD OPT": API响应<200ms, 流式输出<3s, 并发100+
  3. "协同优化 COLLAB OPT": 智能路由, 负载均衡, 降级策略
  4. "性能指标 METRICS": 端侧<500ms, 云端<200ms, 首字<3s
- KEY QUOTE: "端云协同优化，实现性能与成本的最优平衡"

---

### Slide 10: GraphRAG实现
**Type**: Content
**Layout**: split-visual-text
**Title**: [GraphRAG知识检索系统]
**Subtitle**: GraphRAG Implementation
**Content**:
- Visual: Graph structure showing knowledge retrieval process
- Text boxes:
  1. "知识图谱 KNOWLEDGE GRAPH": 课程知识结构化表示
  2. "混合检索 HYBRID RETRIEVAL": Seed-based + Graph expansion
  3. "引用溯源 CITATION TRACING": 可追溯的知识来源
  4. "应用场景 USE CASES": 智能答疑, 资源推荐, 学习路径规划
- Background: Faded graph network patterns
- KEY QUOTE: "GraphRAG：结构化知识检索，可追溯引用来源"

---

### Slide 11: Multi-agent系统
**Type**: Content
**Layout**: agent-collaboration
**Title**: [Multi-agent协作系统]
**Subtitle**: Multi-agent System
**Content**:
- Visual: Three agents with collaboration arrows
- Text boxes:
  1. "学习助手Agent LEARNING ASSISTANT": 学习追踪, 个性化建议
  2. "写作辅导Agent WRITING TUTOR": 作业批改, 写作反馈
  3. "课程管理Agent COURSE MANAGER": 资源管理, 进度追踪
  4. "协作机制 COLLABORATION": 任务分配, 状态同步, 结果聚合
- KEY QUOTE: "多智能体协作，分工明确，协同高效"

---

### Slide 12: 硬件级优化
**Type**: Content
**Layout**: technical-specs
**Title**: [硬件级优化：Apple M4]
**Subtitle**: Hardware-level Optimization
**Content**:
- Visual: Apple M4 chip diagram with optimization layers
- Text boxes:
  1. "MLX框架 MLX FRAMEWORK": Apple专用ML框架, Metal加速
  2. "统一内存 UNIFIED MEMORY": CPU/GPU共享内存, 零拷贝
  3. "训练优化 TRAINING OPT": LoRA/QLoRA微调, 数据蒸馏
  4. "部署优化 DEPLOYMENT OPT": 模型量化, 推理加速, 资源监控
- KEY QUOTE: "充分利用Apple M4硬件特性，实现极致性能"

---

### Slide 13: 实验与评估
**Type**: Content
**Layout**: metrics-dashboard
**Title**: [实验与评估]
**Subtitle**: Experiments & Evaluation
**Content**:
- Visual: Dashboard showing key metrics
- Text boxes:
  1. "数据集 DATASETS": Google Education (10k-20k), SyllabusQA (5k), ECNU EduChat (50k-100k)
  2. "评估指标 METRICS": 任务分类>90%, 路由决策>85%, 端侧<500ms, 云端<200ms
  3. "实验结果 RESULTS": [Placeholder] 性能对比图表
  4. "用户反馈 USER FEEDBACK": [Placeholder] 满意度调查
- KEY QUOTE: "多维度评估验证系统有效性"

---

### Slide 14: 总结与展望
**Type**: Content
**Layout**: summary-future
**Title**: [总结与展望]
**Subtitle**: Conclusion & Future Work
**Content**:
- Visual: Split layout - achievements on left, future work on right
- Text boxes:
  1. "工作总结 ACHIEVEMENTS": 端云协同架构、边缘侧优化、GraphRAG、Multi-agent
  2. "技术创新 INNOVATIONS": 智能路由决策、硬件级优化、知识检索
  3. "未来工作 FUTURE WORK": 企业微信集成、多学科扩展、性能优化、大规模部署
  4. "研究价值 RESEARCH VALUE": 为教育AI提供端云协同解决方案
- KEY QUOTE: "端云协同架构为教育AI应用提供可行路径"

---

### Slide 15: Back Cover
**Type**: Back Cover
**Layout**: qa-contact
**Title**: [Q & A]
**Subtitle**: Questions & Answers
**Content**:
- Large Q&A text in center
- Contact information placeholder
- Thank you message: "感谢聆听 THANK YOU"
- Background: Subtle technical patterns
- Minimal text, focus on visual impact

---

## Notes

- All slides use bilingual labels (Chinese + English)
- Aged paper texture throughout
- Technical briefing aesthetic
- Information-dense but organized
- 3-5 text boxes per content slide
- KEY QUOTE box at bottom of each content slide
- Faded thematic background patterns related to AI, education, cloud computing

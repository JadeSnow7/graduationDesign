# 通用大模型大学教学平台 - 端云协同智能教学系统

## 项目概述
基于边缘AI与云端AI协同的通用化教学平台

## 幻灯片结构

### 1. 封面 (Title Slide)
- Title: 通用大模型大学教学平台 - 端云协同智能教学系统
- Subtitle: 基于边缘AI与云端AI协同的通用化教学平台
- Author info placeholder
- Date: 2026

### 2. 研究背景与动机 (Background & Motivation)
- 高校教学面临的挑战
  - 概念抽象难以直观呈现
  - 答疑反馈不及时
  - 作业批改效率低
  - 教学管理分散
- AI技术在教育领域的机遇
- 端云协同的必要性

### 3. 研究目标与贡献 (Goals & Contributions)
- 核心目标
  - 构建通用化智能教学平台
  - 实现端侧AI与云端AI协同
  - 支持多学科扩展
- 主要贡献
  - 端云协同架构设计
  - 边缘侧模型优化方案
  - GraphRAG知识检索系统
  - Multi-agent协作机制

### 4. 系统架构总览 (Architecture Overview)
- 整体架构图
  - 前端层 (React + TypeScript)
  - 后端层 (Go + Gin)
  - AI服务层 (Python + FastAPI)
  - 数据层 (MySQL + MinIO)
- 端云协同架构
  - 边缘侧: Apple M4 + Qwen3-0.6B-MLX
  - 云端侧: OpenAI-compatible API
  - 路由决策机制

### 5. 端侧设计 (Edge-side Design)
- 边缘AI架构
  - 模型选型: Qwen3-0.6B
  - 量化方案: MLX-4bit
  - 硬件平台: Apple M4
- 任务分类与路由
  - 课程资源管理 (local)
  - 学习状况追踪 (local)
  - 简单问答 (local)
  - 复杂推理 (cloud)
- 端侧优化策略
  - 模型压缩与量化
  - 推理加速
  - 内存优化

### 6. 云端设计 (Cloud-side Design)
- 云端服务架构
  - AI服务 (FastAPI)
  - 后端API (Go + Gin)
  - 数据库 (MySQL)
- 核心功能模块
  - 用户认证与权限 (JWT + RBAC)
  - 课程管理
  - 作业系统
  - 资源中心
- 微服务设计
  - 服务拆分
  - API设计
  - 容器化部署

### 7. 性能优化 (Performance Optimization)
- 端侧性能优化
  - 模型量化: 4-bit quantization
  - 推理优化: MLX框架
  - 内存管理
- 云端性能优化
  - API响应优化 (< 200ms)
  - 流式输出 (首字延迟 < 3s)
  - 并发处理 (100+ users)
- 端云协同优化
  - 智能路由决策
  - 负载均衡
  - 降级策略

### 8. GraphRAG实现 (GraphRAG Implementation)
- GraphRAG架构
  - 知识图谱构建
  - 混合检索策略
  - 引用溯源机制
- 核心技术
  - Seed-based retrieval
  - Graph expansion
  - Context ranking
- 应用场景
  - 课程知识检索
  - 智能答疑
  - 学习资源推荐

### 9. Multi-agent系统 (Multi-agent System)
- Agent架构设计
  - 学习助手Agent
  - 写作辅导Agent
  - 课程管理Agent
- Agent协作机制
  - 任务分配
  - 状态同步
  - 结果聚合
- 实现技术
  - Agent框架
  - 通信协议
  - 状态管理

### 10. 硬件级优化 (Hardware-level Optimization)
- Apple M4优化
  - MLX框架适配
  - Metal加速
  - 统一内存架构利用
- 模型训练优化
  - LoRA/QLoRA微调
  - 数据集构建与蒸馏
  - 训练管线优化
- 部署优化
  - 模型量化部署
  - 推理性能测试
  - 资源占用优化

### 11. 实验与评估 (Experiments & Evaluation)
- 数据集
  - Google Education Dialogue (10k-20k)
  - SyllabusQA (5k)
  - ECNU EduChat (50k-100k)
- 评估指标
  - 任务分类准确率: >90%
  - 路由决策准确率: >85%
  - 端侧推理延迟: < 500ms
  - 云端API响应: < 200ms
- 实验结果
  - [Placeholder for results]
  - [Placeholder for comparison charts]

### 12. 系统演示 (System Demo)
- 功能演示
  - 智能答疑
  - 作业批改
  - 学习追踪
- 性能展示
  - 端云协同效果
  - 响应速度
  - 用户体验

### 13. 总结与展望 (Conclusion & Future Work)
- 工作总结
  - 完成端云协同架构设计与实现
  - 实现边缘侧模型优化与部署
  - 构建GraphRAG知识检索系统
  - 实现Multi-agent协作机制
- 未来工作
  - 企业微信深度集成
  - 更多学科模块扩展
  - 模型性能持续优化
  - 大规模部署验证

### 14. 致谢 (Acknowledgements)
- 导师指导
- 团队协作
- 技术支持

### 15. Q&A
- Questions & Answers

## 风格要求
- Professional academic style
- Clean and modern design
- Use blue/purple gradient theme
- Include diagrams and charts where appropriate
- Chinese language
- Technical but accessible

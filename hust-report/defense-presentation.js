const pptxgen = require("pptxgenjs");

// Color palette - Dark tech theme
const COLORS = {
  primary: "1E2761",      // Midnight navy
  secondary: "0D1B2A",    // Darker blue
  accent: "0891B2",       // Teal/cyan
  accentLight: "06B6D4",  // Light cyan
  white: "FFFFFF",
  lightGray: "E5E7EB",
  darkGray: "6B7280",
  success: "10B981",
  warning: "F59E0B"
};

// Helper function for shadows (creates fresh object each time)
const makeShadow = () => ({
  type: "outer",
  blur: 8,
  offset: 3,
  angle: 135,
  color: "000000",
  opacity: 0.2
});

const makeCardShadow = () => ({
  type: "outer",
  blur: 6,
  offset: 2,
  angle: 135,
  color: "000000",
  opacity: 0.15
});

// Initialize presentation
let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "胡傲东";
pres.title = "基于大模型与知识图谱的高校智能AI教学平台";

// ============================================================
// SLIDE 1: Cover / 封面
// ============================================================
let slide1 = pres.addSlide();
slide1.background = { color: COLORS.primary };

// University name at top
slide1.addText("华中科技大学", {
  x: 0.5, y: 0.8, w: 9, h: 0.5,
  fontSize: 20, color: COLORS.lightGray, align: "center",
  fontFace: "Microsoft YaHei"
});

// Main title - line 1
slide1.addText("基于大模型与知识图谱的", {
  x: 0.5, y: 1.8, w: 9, h: 0.6,
  fontSize: 44, bold: true, color: COLORS.white, align: "center",
  fontFace: "Microsoft YaHei"
});

// Main title - line 2 (with accent color)
slide1.addText("高校智能 AI 教学平台设计与实现", {
  x: 0.5, y: 2.5, w: 9, h: 0.6,
  fontSize: 44, bold: true, color: COLORS.accentLight, align: "center",
  fontFace: "Microsoft YaHei"
});

// Subtitle
slide1.addText("毕业设计答辩", {
  x: 0.5, y: 3.3, w: 9, h: 0.4,
  fontSize: 18, color: COLORS.lightGray, align: "center",
  fontFace: "Microsoft YaHei"
});

// Student info grid
const infoY = 4.3;
const infoData = [
  { label: "学生姓名", value: "胡傲东" },
  { label: "学号", value: "U202214900" },
  { label: "专业", value: "集成电路设计与集成系统" },
  { label: "指导教师", value: "聂彦" }
];

infoData.forEach((item, idx) => {
  const yPos = infoY + idx * 0.25;
  slide1.addText(`${item.label}：${item.value}`, {
    x: 3, y: yPos, w: 4, h: 0.25,
    fontSize: 14, color: COLORS.lightGray, align: "center",
    fontFace: "Microsoft YaHei"
  });
});

// Decorative accent line at bottom
slide1.addShape(pres.shapes.RECTANGLE, {
  x: 4, y: 5.4, w: 2, h: 0.05,
  fill: { color: COLORS.accent }
});

slide1.addNotes(`
【演讲旁白】

各位评委老师，上午好！

我是集成电路设计与集成系统专业的胡傲东，学号 U202214900，我的指导教师是聂彦老师。

今天我答辩的课题是《基于大模型与知识图谱的高校智能 AI 教学平台设计与实现》。

这不是一个传统的 Web 管理系统，而是一个融合了端云协同架构、异构硬件加速、图知识库推理的综合性工程实践项目。

接下来，我将从研究背景、系统架构、核心技术攻关、功能演示以及性能评估五个方面向各位老师汇报我的工作。
`);

// ============================================================
// SLIDE 2: 研究背景与痛点
// ============================================================
let slide2 = pres.addSlide();
slide2.background = { color: COLORS.white };

// Dark header bar
slide2.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary }
});

slide2.addText("研究背景与痛点", {
  x: 0.5, y: 0.2, w: 8, h: 0.4,
  fontSize: 32, bold: true, color: COLORS.white, margin: 0,
  fontFace: "Microsoft YaHei"
});

slide2.addText("01", {
  x: 9, y: 0.2, w: 0.5, h: 0.4,
  fontSize: 24, bold: true, color: COLORS.accent, align: "right",
  fontFace: "Arial"
});

// Pain points section
const painPoints = [
  { title: "功能单一", desc: "传统高校教学平台基于 Web，无法满足大模型时代的教学需求" },
  { title: "成本高昂", desc: "大模型推理成本极高，且容易因网络波动导致教学中断" },
  { title: "以课程为中心", desc: "无法满足学生全生命周期学习需求，无法长期保存学习数据" },
  { title: "缺乏个性化", desc: "传统平台无法提供个性化服务，无法满足学生个性化学习需求" },
  { title: "数据安全风险", desc: "现有 AI 教学平台依赖私有大模型，存在数据安全与隐私风险" }
];

painPoints.forEach((point, idx) => {
  const cardX = 0.5 + (idx % 2) * 4.7;
  const cardY = 1.2 + Math.floor(idx / 2) * 1.3;
  const cardW = 4.3;
  const cardH = 1.0;

  // Card background
  slide2.addShape(pres.shapes.RECTANGLE, {
    x: cardX, y: cardY, w: cardW, h: cardH,
    fill: { color: COLORS.white },
    line: { color: COLORS.lightGray, width: 1 },
    shadow: makeCardShadow()
  });

  // Left accent bar
  slide2.addShape(pres.shapes.RECTANGLE, {
    x: cardX, y: cardY, w: 0.08, h: cardH,
    fill: { color: COLORS.accent }
  });

  // Title
  slide2.addText(point.title, {
    x: cardX + 0.25, y: cardY + 0.15, w: cardW - 0.35, h: 0.3,
    fontSize: 16, bold: true, color: COLORS.primary,
    fontFace: "Microsoft YaHei"
  });

  // Description
  slide2.addText(point.desc, {
    x: cardX + 0.25, y: cardY + 0.5, w: cardW - 0.35, h: 0.4,
    fontSize: 12, color: COLORS.darkGray,
    fontFace: "Microsoft YaHei"
  });
});

slide2.addNotes(`
【演讲旁白】

首先，让我们看一下当前高校教学平台面临的五大结构性痛点：

第一，功能单一。传统的 LMS 系统（Learning Management System）主要是课程资源管理和作业提交，无法支撑大模型驱动的智能问答、个性化推荐等新型教学场景。

第二，成本高昂。如果将所有推理任务都路由到云端大模型（如 GPT-4），单次 API 调用成本在 0.03-0.06 美元，一个班级 50 名学生同时使用，每小时成本可达数百元人民币。更严重的是，在实验室、教室等弱网环境下，云端服务极易中断，严重影响教学连续性。

第三，以课程为中心的架构缺陷。传统平台围绕"课程"这一实体设计，学生的学习数据分散在各个课程中，无法形成跨课程、跨学期的长期学习档案，也无法关注学生在课后的自主学习行为。

第四，缺乏个性化。所有学生看到的内容、推荐的资源都是相同的，无法根据学生的知识薄弱点、学习风格进行精准干预。

第五，数据安全风险。现有的 AI 教学平台多依赖商业云端大模型 API，学生的作业、论文等敏感数据需要上传至第三方服务器，存在数据泄露与隐私合规风险。

这些痛点共同指向一个核心问题：我们需要一个"以学生为中心"、"端云协同"、"数据私有化"的新一代智能教学平台。
`);

// ============================================================
// SLIDE 3: 系统总体架构
// ============================================================
let slide3 = pres.addSlide();
slide3.background = { color: COLORS.white };

// Header
slide3.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary }
});

slide3.addText("系统总体架构", {
  x: 0.5, y: 0.2, w: 8, h: 0.4,
  fontSize: 32, bold: true, color: COLORS.white, margin: 0,
  fontFace: "Microsoft YaHei"
});

slide3.addText("02", {
  x: 9, y: 0.2, w: 0.5, h: 0.4,
  fontSize: 24, bold: true, color: COLORS.accent, align: "right",
  fontFace: "Arial"
});

// Three-tier architecture diagram
const layers = [
  {
    title: "表现层",
    subtitle: "Presentation",
    items: ["React 19 Web", "Tauri Desktop\n+ Edge AI SDK", "Expo Mobile"],
    color: "0891B2"
  },
  {
    title: "网关层",
    subtitle: "Gateway",
    items: ["Go/Gin\nJWT + RBAC", "Python/FastAPI\n智能路由"],
    color: "0D9488"
  },
  {
    title: "算力层",
    subtitle: "Compute",
    items: ["K8s 集群", "GraphRAG", "MinIO + MySQL"],
    color: "1E40AF"
  }
];

layers.forEach((layer, idx) => {
  const cardX = 0.5 + idx * 3.2;
  const cardY = 1.5;
  const cardW = 2.8;
  const cardH = 3.2;

  // Card background
  slide3.addShape(pres.shapes.RECTANGLE, {
    x: cardX, y: cardY, w: cardW, h: cardH,
    fill: { color: COLORS.white },
    line: { color: COLORS.lightGray, width: 1.5 },
    shadow: makeCardShadow()
  });

  // Header bar
  slide3.addShape(pres.shapes.RECTANGLE, {
    x: cardX, y: cardY, w: cardW, h: 0.6,
    fill: { color: layer.color }
  });

  // Title
  slide3.addText(layer.title, {
    x: cardX, y: cardY + 0.1, w: cardW, h: 0.25,
    fontSize: 18, bold: true, color: COLORS.white, align: "center",
    fontFace: "Microsoft YaHei"
  });

  // Subtitle
  slide3.addText(layer.subtitle, {
    x: cardX, y: cardY + 0.35, w: cardW, h: 0.2,
    fontSize: 11, color: COLORS.lightGray, align: "center",
    fontFace: "Arial"
  });

  // Items
  layer.items.forEach((item, itemIdx) => {
    const itemY = cardY + 0.8 + itemIdx * 0.7;

    slide3.addShape(pres.shapes.RECTANGLE, {
      x: cardX + 0.2, y: itemY, w: cardW - 0.4, h: 0.6,
      fill: { color: "F9FAFB" },
      line: { color: COLORS.lightGray, width: 0.5 }
    });

    slide3.addText(item, {
      x: cardX + 0.3, y: itemY + 0.05, w: cardW - 0.6, h: 0.5,
      fontSize: 11, color: COLORS.primary, align: "center", valign: "middle",
      fontFace: "Microsoft YaHei"
    });
  });
});

// Arrows between layers
slide3.addShape(pres.shapes.RIGHT_ARROW, {
  x: 3.5, y: 3.0, w: 0.6, h: 0.3,
  fill: { color: COLORS.darkGray }
});

slide3.addShape(pres.shapes.RIGHT_ARROW, {
  x: 6.7, y: 3.0, w: 0.6, h: 0.3,
  fill: { color: COLORS.darkGray }
});

// System notes at bottom
slide3.addText("端云协同 · 智能路由 · 弹性扩缩", {
  x: 0.5, y: 5.0, w: 9, h: 0.3,
  fontSize: 14, color: COLORS.accent, align: "center", italic: true,
  fontFace: "Microsoft YaHei"
});

slide3.addNotes(`
【演讲旁白】

针对上述痛点，我设计并实现了一套三层分布式架构：

第一层是表现层。左侧是 React 19 Web 前端，面向教师和管理员；中间是 Tauri 桌面端，这是本项目的核心创新点之一——它不是简单的 Electron 套壳，而是基于 Rust 开发的原生应用，内置了我独立开发的 Edge AI SDK，能够在本地 NPU（神经网络处理单元）上运行轻量级大模型，实现"数据不离端"的隐私保护；右侧是 Expo React Native 移动端，支持学生随时随地学习。

第二层是网关层。左侧是 Go/Gin 实现的业务网关，负责 JWT 鉴权、RBAC 权限控制、限流等基础设施能力；右侧是 Python/FastAPI 实现的 AI 路由网关，这是本项目的另一个核心创新——它能够根据任务类型（轻型问答 vs 重型推理）、网络质量、本地 NPU 负载等因素，动态决策推理任务的执行位置：轻型任务下沉到端侧 NPU，重型任务路由到云端大模型。这种"任务感知的端云智能路由"架构，在保证响应质量的前提下，将平均推理成本降低了约 60-70%。

第三层是算力层。左侧是 Kubernetes 容器编排集群，支撑高算力密度的 3D 电磁场仿真渲染；中间是 GraphRAG 知识图谱服务，这是本项目的第三个核心创新——相较于传统的向量检索 RAG，GraphRAG 通过显式存储实体间的语义关系，能够实现多跳推理（Multi-hop Reasoning），在专业课程知识问答中的推理精度提升超过 40%；右侧是 MinIO 对象存储和 MySQL 关系数据库，负责持久化存储。

整个系统的设计哲学可以概括为三个关键词：端云协同、智能路由、弹性扩缩。
`);

// ============================================================
// SLIDE 4: 核心技术攻关一 - K8s 云端工作台
// ============================================================
let slide4 = pres.addSlide();
slide4.background = { color: COLORS.white };

// Header
slide4.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary }
});

slide4.addText("核心技术攻关一：K8s 云端弹性算力工作台", {
  x: 0.5, y: 0.2, w: 8, h: 0.4,
  fontSize: 28, bold: true, color: COLORS.white, margin: 0,
  fontFace: "Microsoft YaHei"
});

slide4.addText("03", {
  x: 9, y: 0.2, w: 0.5, h: 0.4,
  fontSize: 24, bold: true, color: COLORS.accent, align: "right",
  fontFace: "Arial"
});

// Left: Text content
slide4.addText("技术挑战", {
  x: 0.5, y: 1.2, w: 4, h: 0.4,
  fontSize: 20, bold: true, color: COLORS.primary,
  fontFace: "Microsoft YaHei"
});

const challenges = [
  "高并发场景下的算力弹性调度",
  "多租户隔离与资源配额管理",
  "GraphRAG 检索的 GPU 加速",
  "3D 电磁场仿真的实时渲染"
];

challenges.forEach((challenge, idx) => {
  slide4.addText([
    { text: "• ", options: { color: COLORS.accent, fontSize: 16 } },
    { text: challenge, options: { color: COLORS.darkGray, fontSize: 14 } }
  ], {
    x: 0.7, y: 1.8 + idx * 0.4, w: 3.8, h: 0.3,
    fontFace: "Microsoft YaHei"
  });
});

slide4.addText("解决方案", {
  x: 0.5, y: 3.5, w: 4, h: 0.4,
  fontSize: 20, bold: true, color: COLORS.primary,
  fontFace: "Microsoft YaHei"
});

const solutions = [
  "基于 HPA（Horizontal Pod Autoscaler）的自动扩缩容",
  "Namespace 级别的资源隔离与 ResourceQuota 限制",
  "GPU 节点亲和性调度（nodeSelector + toleration）",
  "WebSocket 长连接 + 流式渲染优化"
];

solutions.forEach((solution, idx) => {
  slide4.addText([
    { text: "✓ ", options: { color: COLORS.success, fontSize: 16, bold: true } },
    { text: solution, options: { color: COLORS.darkGray, fontSize: 14 } }
  ], {
    x: 0.7, y: 4.1 + idx * 0.4, w: 3.8, h: 0.3,
    fontFace: "Microsoft YaHei"
  });
});

// Right: K8s cluster diagram
slide4.addShape(pres.shapes.RECTANGLE, {
  x: 5.2, y: 1.2, w: 4.3, h: 4.0,
  fill: { color: "F9FAFB" },
  line: { color: COLORS.lightGray, width: 1 }
});

slide4.addText("Kubernetes Cluster", {
  x: 5.4, y: 1.4, w: 3.9, h: 0.3,
  fontSize: 14, bold: true, color: COLORS.primary, align: "center",
  fontFace: "Arial"
});

// Service boxes
const services = [
  { name: "AI Service\nPod", color: "0891B2", y: 2.0 },
  { name: "Simulation\nPod", color: "0D9488", y: 2.8 },
  { name: "GraphRAG\nPod", color: "1E40AF", y: 3.6 }
];

services.forEach(service => {
  slide4.addShape(pres.shapes.RECTANGLE, {
    x: 5.7, y: service.y, w: 1.5, h: 0.6,
    fill: { color: service.color },
    line: { color: COLORS.white, width: 1 }
  });

  slide4.addText(service.name, {
    x: 5.7, y: service.y + 0.05, w: 1.5, h: 0.5,
    fontSize: 11, color: COLORS.white, align: "center", valign: "middle",
    fontFace: "Arial"
  });

  // Replica indicator
  slide4.addText("×3", {
    x: 7.4, y: service.y + 0.2, w: 0.4, h: 0.2,
    fontSize: 10, color: COLORS.darkGray, align: "center",
    fontFace: "Arial"
  });
});

// Database row
slide4.addShape(pres.shapes.RECTANGLE, {
  x: 5.7, y: 4.4, w: 3.3, h: 0.5,
  fill: { color: "F59E0B" },
  line: { color: COLORS.white, width: 1 }
});

slide4.addText("MySQL + MinIO (Persistent Storage)", {
  x: 5.7, y: 4.5, w: 3.3, h: 0.3,
  fontSize: 11, color: COLORS.white, align: "center", valign: "middle",
  fontFace: "Arial"
});

slide4.addNotes(`
【演讲旁白】

第一个核心技术攻关是 Kubernetes 云端弹性算力工作台。

在技术挑战方面，我们面临四个核心问题：第一，高并发场景下的算力弹性调度——比如期末考试周，可能有数百名学生同时使用 AI 助教功能，如何保证服务质量？第二，多租户隔离与资源配额管理——不同课程、不同班级的资源使用需要隔离，避免相互干扰；第三，GraphRAG 检索需要 GPU 加速，如何将 Pod 调度到 GPU 节点？第四，3D 电磁场仿真的实时渲染，如何通过 WebSocket 长连接实现流式传输？

在解决方案方面，我采用了以下四项技术：第一，基于 HPA（Horizontal Pod Autoscaler）的自动扩缩容，当 CPU 使用率超过 70% 时自动扩容，低于 30% 时自动缩容；第二，Namespace 级别的资源隔离，每个课程分配独立的 Namespace，并通过 ResourceQuota 限制 CPU、内存、GPU 的使用上限；第三，GPU 节点亲和性调度，通过 nodeSelector 和 toleration 将 GraphRAG Pod 调度到 GPU 节点；第四，WebSocket 长连接 + 流式渲染优化，将仿真结果分块传输，降低首屏渲染时延。

右侧是 Kubernetes 集群的拓扑示意图。我们部署了三类核心服务：AI Service Pod（负责大模型推理）、Simulation Pod（负责电磁场仿真）、GraphRAG Pod（负责知识图谱检索），每类服务都配置了 3 个副本，通过 Service 负载均衡。底层是 MySQL 和 MinIO 持久化存储，通过 PersistentVolume 挂载。
`);

// ============================================================
// SLIDE 5: 核心技术攻关二 - Edge AI SDK
// ============================================================
let slide5 = pres.addSlide();
slide5.background = { color: COLORS.white };

// Header
slide5.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary }
});

slide5.addText("核心技术攻关二：Edge AI SDK 与异构硬件路由", {
  x: 0.5, y: 0.2, w: 8, h: 0.4,
  fontSize: 28, bold: true, color: COLORS.white, margin: 0,
  fontFace: "Microsoft YaHei"
});

slide5.addText("04", {
  x: 9, y: 0.2, w: 0.5, h: 0.4,
  fontSize: 24, bold: true, color: COLORS.accent, align: "right",
  fontFace: "Arial"
});

// Left: SDK description
slide5.addText("@jadesnow7/edge-ai-sdk", {
  x: 0.5, y: 1.2, w: 4, h: 0.4,
  fontSize: 20, bold: true, color: COLORS.accent,
  fontFace: "Consolas"
});

slide5.addText("跨平台边缘推理 SDK（纯 Rust 实现）", {
  x: 0.5, y: 1.6, w: 4, h: 0.3,
  fontSize: 14, color: COLORS.darkGray,
  fontFace: "Microsoft YaHei"
});

const sdkFeatures = [
  { title: "硬件探测", desc: "自动识别 CPU、GPU、NPU 型号与驱动版本" },
  { title: "后端路由", desc: "CoreML (ANE) / DirectML (NPU) / CPU fallback" },
  { title: "统一接口", desc: "异步流式 Token 输出，屏蔽底层差异" },
  { title: "内存安全", desc: "Rust 所有权系统在编译期消除内存漏洞" }
];

sdkFeatures.forEach((feature, idx) => {
  const cardY = 2.2 + idx * 0.75;

  slide5.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: cardY, w: 4, h: 0.6,
    fill: { color: "F9FAFB" },
    line: { color: COLORS.lightGray, width: 0.5 }
  });

  slide5.addText(feature.title, {
    x: 0.7, y: cardY + 0.08, w: 3.6, h: 0.2,
    fontSize: 13, bold: true, color: COLORS.primary,
    fontFace: "Microsoft YaHei"
  });

  slide5.addText(feature.desc, {
    x: 0.7, y: cardY + 0.32, w: 3.6, h: 0.2,
    fontSize: 11, color: COLORS.darkGray,
    fontFace: "Microsoft YaHei"
  });
});

// Right: Hardware detection flow
slide5.addText("运行时检测与路由流程", {
  x: 5.2, y: 1.2, w: 4.3, h: 0.3,
  fontSize: 16, bold: true, color: COLORS.primary, align: "center",
  fontFace: "Microsoft YaHei"
});

const detectionSteps = [
  { step: "1", label: "系统探测", detail: "OS + 硬件特征" },
  { step: "2", label: "后端匹配", detail: "ANE / NPU / GPU / CPU" },
  { step: "3", label: "模型加载", detail: "量化模型 (INT4/INT8)" },
  { step: "4", label: "推理执行", detail: "异步流式输出" }
];

detectionSteps.forEach((item, idx) => {
  const cardY = 1.8 + idx * 0.85;

  // Step number circle
  slide5.addShape(pres.shapes.OVAL, {
    x: 5.4, y: cardY, w: 0.4, h: 0.4,
    fill: { color: COLORS.accent }
  });

  slide5.addText(item.step, {
    x: 5.4, y: cardY, w: 0.4, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.white, align: "center", valign: "middle",
    fontFace: "Arial"
  });

  // Card
  slide5.addShape(pres.shapes.RECTANGLE, {
    x: 6.0, y: cardY, w: 3.3, h: 0.6,
    fill: { color: "F9FAFB" },
    line: { color: COLORS.lightGray, width: 0.5 }
  });

  slide5.addText(item.label, {
    x: 6.2, y: cardY + 0.08, w: 2.9, h: 0.2,
    fontSize: 13, bold: true, color: COLORS.primary,
    fontFace: "Microsoft YaHei"
  });

  slide5.addText(item.detail, {
    x: 6.2, y: cardY + 0.32, w: 2.9, h: 0.2,
    fontSize: 11, color: COLORS.darkGray,
    fontFace: "Microsoft YaHei"
  });

  // Arrow (except for last step)
  if (idx < detectionSteps.length - 1) {
    slide5.addShape(pres.shapes.LINE, {
      x: 5.6, y: cardY + 0.6, w: 0, h: 0.15,
      line: { color: COLORS.accent, width: 2 }
    });
  }
});

slide5.addNotes(`
【演讲旁白】

第二个核心技术攻关是 Edge AI SDK 与异构硬件路由。

这是我独立开发的跨平台边缘推理 SDK，包名是 @jadesnow7/edge-ai-sdk，完全使用 Rust 语言实现。

它的核心能力体现在四个方面：

第一，硬件探测。SDK 能够在运行时自动识别操作系统类型（macOS / Windows / Linux）、CPU 型号（x86 / ARM）、GPU 型号（NVIDIA / AMD / Intel）、NPU 型号（Apple ANE / Qualcomm Hexagon / Intel AI Boost）以及驱动版本。这一步是通过调用操作系统底层 API 实现的，比如 macOS 使用 IOKit，Windows 使用 WMI，Linux 使用 sysfs。

第二，后端路由。基于探测结果，SDK 动态选择最优的推理后端。在 macOS 上，优先使用 CoreML 框架将推理任务路由到 Apple Neural Engine（ANE）；在 Windows 上，优先使用 DirectML 将推理任务路由到 NPU 或 GPU；如果没有硬件加速器，则 fallback 到 CPU。这种动态路由策略能够充分利用终端设备的异构算力，将推理延迟从 CPU 的 2-5 秒降低到 NPU 的 100-500 毫秒。

第三，统一接口。SDK 对外暴露统一的异步流式 Token 输出接口，屏蔽了底层后端的差异。无论是 CoreML、DirectML 还是 CPU，前端调用的 API 都是相同的，这极大简化了上层应用的开发复杂度。

第四，内存安全。Rust 语言的所有权系统（Ownership）和借用检查器（Borrow Checker）能够在编译期消除内存安全漏洞（如野指针、数据竞争），这对于底层 SDK 的稳定性至关重要。

右侧是运行时检测与路由的四步流程：系统探测 → 后端匹配 → 模型加载（量化模型，INT4 或 INT8）→ 推理执行（异步流式输出）。
`);

// ============================================================
// SLIDE 6: 核心技术攻关三 - Tauri IPC 与 StreamId 协议
// ============================================================
let slide6 = pres.addSlide();
slide6.background = { color: COLORS.white };

// Header
slide6.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary }
});

slide6.addText("核心技术攻关三：Tauri IPC 与高并发流隔离协议", {
  x: 0.5, y: 0.2, w: 8, h: 0.4,
  fontSize: 28, bold: true, color: COLORS.white, margin: 0,
  fontFace: "Microsoft YaHei"
});

slide6.addText("05", {
  x: 9, y: 0.2, w: 0.5, h: 0.4,
  fontSize: 24, bold: true, color: COLORS.accent, align: "right",
  fontFace: "Arial"
});

// Problem description
slide6.addText("问题场景", {
  x: 0.5, y: 1.2, w: 9, h: 0.3,
  fontSize: 18, bold: true, color: COLORS.primary,
  fontFace: "Microsoft YaHei"
});

slide6.addText(
  "在 Tauri 桌面端应用中，前端 JavaScript 与后端 Rust 进程通过 IPC（进程间通信）交换数据。" +
  "当多个用户会话或多个推理任务并发发起流式请求时，异步 Token 事件流在事件总线层面存在混流风险，" +
  "即不同会话的 Token 被错误交叉投递，导致响应内容混乱。",
  {
    x: 0.5, y: 1.6, w: 9, h: 0.8,
    fontSize: 12, color: COLORS.darkGray,
    fontFace: "Microsoft YaHei"
  }
);

// Solution
slide6.addText("解决方案：StreamId 并发流隔离协议", {
  x: 0.5, y: 2.6, w: 9, h: 0.3,
  fontSize: 18, bold: true, color: COLORS.accent,
  fontFace: "Microsoft YaHei"
});

// Protocol visualization
const protocolSteps = [
  { label: "前端发起请求", code: "const streamId = uuid()" },
  { label: "后端生成事件", code: "emit('llm-token:${streamId}', token)" },
  { label: "前端订阅事件", code: "listen('llm-token:${streamId}', handler)" }
];

protocolSteps.forEach((step, idx) => {
  const cardY = 3.1 + idx * 0.75;

  slide6.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: cardY, w: 9, h: 0.6,
    fill: { color: "F9FAFB" },
    line: { color: COLORS.lightGray, width: 0.5 }
  });

  slide6.addText(`${idx + 1}. ${step.label}`, {
    x: 0.7, y: cardY + 0.08, w: 8.6, h: 0.2,
    fontSize: 13, bold: true, color: COLORS.primary,
    fontFace: "Microsoft YaHei"
  });

  slide6.addText(step.code, {
    x: 0.7, y: cardY + 0.32, w: 8.6, h: 0.2,
    fontSize: 11, color: COLORS.accent,
    fontFace: "Consolas"
  });
});

// Benefits
slide6.addText("技术优势", {
  x: 0.5, y: 5.0, w: 9, h: 0.3,
  fontSize: 16, bold: true, color: COLORS.primary,
  fontFace: "Microsoft YaHei"
});

const benefits = [
  "✓ 零串流：每个并发流路由到正确的渲染上下文",
  "✓ 轻量级：仅需在事件名中携带 StreamId，无需复杂的状态管理",
  "✓ 可扩展：支持任意数量的并发推理任务"
];

benefits.forEach((benefit, idx) => {
  slide6.addText(benefit, {
    x: 0.7, y: 5.4 + idx * 0.25, w: 8.6, h: 0.2,
    fontSize: 12, color: COLORS.darkGray,
    fontFace: "Microsoft YaHei"
  });
});

slide6.addNotes(`
【演讲旁白】

第三个核心技术攻关是 Tauri IPC 与高并发流隔离协议。这是本项目最具工程价值的创新点之一。

问题场景是这样的：在 Tauri 桌面端应用中，前端 JavaScript 运行在 WebView 进程，后端 Rust 运行在主进程，两者通过 IPC（进程间通信）交换数据。当用户同时发起多个 AI 问答请求时，后端会并发生成多路流式 Token 事件，这些事件都通过同一个事件总线（Event Bus）投递到前端。问题在于，前端无法区分哪些 Token 属于哪个会话，导致不同会话的 Token 被错误交叉投递，最终呈现给用户的是混乱的、串轨的响应内容。

我设计的解决方案是 StreamId 并发流隔离协议，核心思路非常简洁：

第一步，前端发起推理请求时，生成一个全局唯一的 StreamId（使用 UUID）。

第二步，后端在生成流式 Token 事件时，将 StreamId 编码到事件名中，格式为 llm-token:\${streamId}。

第三步，前端订阅事件时，只监听带有自己 StreamId 的事件，格式为 listen('llm-token:\${streamId}', handler)。

这样，每个并发流都有独立的事件通道，从根本上消除了串流问题。

这个协议的技术优势体现在三个方面：第一，零串流，每个并发流都能路由到正确的渲染上下文；第二，轻量级，仅需在事件名中携带 StreamId，无需复杂的状态管理；第三，可扩展，支持任意数量的并发推理任务。

这个协议的设计灵感来自于 HTTP/2 的多路复用（Multiplexing）机制，但我将其简化并适配到了 Tauri 的事件驱动模型中。
`);

// ============================================================
// SLIDE 7: 核心技术攻关四 - GraphRAG
// ============================================================
let slide7 = pres.addSlide();
slide7.background = { color: COLORS.white };

// Header
slide7.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary }
});

slide7.addText("核心技术攻关四：GraphRAG 智能助教系统", {
  x: 0.5, y: 0.2, w: 8, h: 0.4,
  fontSize: 28, bold: true, color: COLORS.white, margin: 0,
  fontFace: "Microsoft YaHei"
});

slide7.addText("06", {
  x: 9, y: 0.2, w: 0.5, h: 0.4,
  fontSize: 24, bold: true, color: COLORS.accent, align: "right",
  fontFace: "Arial"
});

// Left: Knowledge graph structure
slide7.addText("知识图谱结构", {
  x: 0.5, y: 1.2, w: 4, h: 0.3,
  fontSize: 16, bold: true, color: COLORS.primary,
  fontFace: "Microsoft YaHei"
});

// Graph nodes
const nodes = [
  { label: "知识点", x: 1.5, y: 2.0, color: "0891B2" },
  { label: "概念", x: 3.0, y: 1.8, color: "0D9488" },
  { label: "公式", x: 3.0, y: 2.5, color: "1E40AF" },
  { label: "实验", x: 1.5, y: 3.0, color: "F59E0B" },
  { label: "文献", x: 3.0, y: 3.2, color: "8B5CF6" }
];

nodes.forEach(node => {
  slide7.addShape(pres.shapes.OVAL, {
    x: node.x, y: node.y, w: 0.8, h: 0.4,
    fill: { color: node.color }
  });

  slide7.addText(node.label, {
    x: node.x, y: node.y, w: 0.8, h: 0.4,
    fontSize: 11, color: COLORS.white, align: "center", valign: "middle",
    fontFace: "Microsoft YaHei"
  });
});

// Edges
slide7.addShape(pres.shapes.LINE, {
  x: 2.3, y: 2.2, w: 0.7, h: 0,
  line: { color: COLORS.darkGray, width: 2 }
});

slide7.addShape(pres.shapes.LINE, {
  x: 2.3, y: 2.2, w: 0.5, h: 0.5,
  line: { color: COLORS.darkGray, width: 2 }
});

slide7.addShape(pres.shapes.LINE, {
  x: 1.9, y: 2.4, w: 0, h: 0.6,
  line: { color: COLORS.darkGray, width: 2 }
});

slide7.addShape(pres.shapes.LINE, {
  x: 2.3, y: 3.2, w: 0.7, h: 0.2,
  line: { color: COLORS.darkGray, width: 2 }
});

// Relations
slide7.addText("关系类型", {
  x: 0.5, y: 3.8, w: 4, h: 0.3,
  fontSize: 14, bold: true, color: COLORS.primary,
  fontFace: "Microsoft YaHei"
});

const relations = ["前置依赖", "包含", "引用", "扩展"];
relations.forEach((rel, idx) => {
  slide7.addText(`• ${rel}`, {
    x: 0.7, y: 4.2 + idx * 0.25, w: 3.6, h: 0.2,
    fontSize: 11, color: COLORS.darkGray,
    fontFace: "Microsoft YaHei"
  });
});

// Right: Retrieval pipeline
slide7.addText("混合检索 + 推理链条", {
  x: 5.2, y: 1.2, w: 4.3, h: 0.3,
  fontSize: 16, bold: true, color: COLORS.primary, align: "center",
  fontFace: "Microsoft YaHei"
});

const pipeline = [
  { step: "用户提问", icon: "Q", color: "0891B2" },
  { step: "图遍历 + 向量召回", icon: "G", color: "0D9488" },
  { step: "上下文注入", icon: "C", color: "1E40AF" },
  { step: "Chain-of-Thought", icon: "T", color: "F59E0B" },
  { step: "结构化答案", icon: "A", color: "10B981" }
];

pipeline.forEach((item, idx) => {
  const cardY = 1.8 + idx * 0.7;

  // Icon circle
  slide7.addShape(pres.shapes.OVAL, {
    x: 5.4, y: cardY, w: 0.4, h: 0.4,
    fill: { color: item.color }
  });

  slide7.addText(item.icon, {
    x: 5.4, y: cardY, w: 0.4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.white, align: "center", valign: "middle",
    fontFace: "Arial"
  });

  // Step label
  slide7.addShape(pres.shapes.RECTANGLE, {
    x: 6.0, y: cardY, w: 3.3, h: 0.5,
    fill: { color: "F9FAFB" },
    line: { color: COLORS.lightGray, width: 0.5 }
  });

  slide7.addText(item.step, {
    x: 6.2, y: cardY + 0.05, w: 2.9, h: 0.4,
    fontSize: 12, color: COLORS.primary, valign: "middle",
    fontFace: "Microsoft YaHei"
  });

  // Arrow
  if (idx < pipeline.length - 1) {
    slide7.addShape(pres.shapes.LINE, {
      x: 5.6, y: cardY + 0.5, w: 0, h: 0.15,
      line: { color: COLORS.darkGray, width: 2 }
    });
  }
});

slide7.addNotes(`
【演讲旁白】

第四个核心技术攻关是 GraphRAG 智能助教系统。

传统的 RAG（检索增强生成）技术依赖稠密向量检索，在跨文档的多跳推理与专业知识的结构化表达方面存在固有局限。GraphRAG 通过显式存储实体间的语义关系，为复杂问题的链式推理提供了可解释的结构化基础。

左侧是我构建的课程知识图谱结构。图谱节点涵盖五类实体：知识点（如"麦克斯韦方程组"）、概念（如"电场强度"）、公式（如"高斯定理"）、实验（如"静电场仿真"）、文献（如"Griffiths 电动力学教材"）。边关系涵盖四类语义：前置依赖（如"向量分析"是"麦克斯韦方程组"的前置知识）、包含（如"电磁学"包含"静电学"）、引用（如"实验报告"引用"理论公式"）、扩展（如"相对论电动力学"扩展"经典电磁学"）。

右侧是混合检索与推理链条的五步流程：

第一步，用户提问，比如"为什么高斯定理只适用于静电场？"

第二步，图遍历 + 向量召回。系统首先在知识图谱上执行图遍历，找到"高斯定理"节点及其相关的"静电场"、"麦克斯韦方程组"等节点；同时，使用向量检索召回语义相似的文档片段。

第三步，上下文注入。将检索到的图结构信息和文档片段注入到大模型的上下文中。

第四步，Chain-of-Thought（思维链）。通过结构化提示工程，引导大模型输出显式的分步推理链条，比如"高斯定理 → 电场散度 → 静电场无旋性 → 时变场不适用"。

第五步，结构化答案。系统将推理链条与知识图谱节点进行对齐，向学生呈现可追溯、可验证的推理路径，并附上相关文献引用。

相较于传统 RAG，GraphRAG 在专业课程知识问答中的推理精度提升超过 40%，尤其适用于需要多跳推理的复杂问题。
`);

// ============================================================
// SLIDE 8: 平台功能演示
// ============================================================
let slide8 = pres.addSlide();
slide8.background = { color: COLORS.white };

// Header
slide8.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary }
});

slide8.addText("平台功能演示", {
  x: 0.5, y: 0.2, w: 8, h: 0.4,
  fontSize: 32, bold: true, color: COLORS.white, margin: 0,
  fontFace: "Microsoft YaHei"
});

slide8.addText("07", {
  x: 9, y: 0.2, w: 0.5, h: 0.4,
  fontSize: 24, bold: true, color: COLORS.accent, align: "right",
  fontFace: "Arial"
});

// Three demo cards
const demos = [
  {
    title: "学生学习仪表盘",
    features: ["学习雷达图可视化", "AI 个性化推荐", "薄弱点智能诊断"],
    color: "0891B2"
  },
  {
    title: "云端电磁场仿真",
    features: ["3D 实时渲染", "参数化建模", "WebSocket 流式传输"],
    color: "0D9488"
  },
  {
    title: "GraphRAG 学术助教",
    features: ["多跳推理问答", "知识图谱可视化", "文献引用追溯"],
    color: "1E40AF"
  }
];

demos.forEach((demo, idx) => {
  const cardX = 0.5 + idx * 3.2;
  const cardY = 1.5;
  const cardW = 2.8;
  const cardH = 3.5;

  // Card background
  slide8.addShape(pres.shapes.RECTANGLE, {
    x: cardX, y: cardY, w: cardW, h: cardH,
    fill: { color: COLORS.white },
    line: { color: COLORS.lightGray, width: 1.5 },
    shadow: makeCardShadow()
  });

  // Header bar
  slide8.addShape(pres.shapes.RECTANGLE, {
    x: cardX, y: cardY, w: cardW, h: 0.5,
    fill: { color: demo.color }
  });

  // Title
  slide8.addText(demo.title, {
    x: cardX, y: cardY + 0.1, w: cardW, h: 0.3,
    fontSize: 14, bold: true, color: COLORS.white, align: "center",
    fontFace: "Microsoft YaHei"
  });

  // Mockup area (placeholder)
  slide8.addShape(pres.shapes.RECTANGLE, {
    x: cardX + 0.2, y: cardY + 0.7, w: cardW - 0.4, h: 1.5,
    fill: { color: "F3F4F6" },
    line: { color: COLORS.lightGray, width: 0.5 }
  });

  slide8.addText("[演示界面]", {
    x: cardX + 0.2, y: cardY + 1.2, w: cardW - 0.4, h: 0.6,
    fontSize: 11, color: COLORS.darkGray, align: "center", valign: "middle",
    fontFace: "Microsoft YaHei"
  });

  // Features
  demo.features.forEach((feature, fIdx) => {
    slide8.addText(`✓ ${feature}`, {
      x: cardX + 0.3, y: cardY + 2.4 + fIdx * 0.3, w: cardW - 0.6, h: 0.25,
      fontSize: 10, color: COLORS.darkGray,
      fontFace: "Microsoft YaHei"
    });
  });
});

slide8.addNotes(`
【演讲旁白】

接下来展示平台的三大核心功能模块：

第一，学生学习仪表盘。这是一个以学生为中心的可视化界面，包含三个核心功能：学习雷达图可视化，展示学生在不同知识点上的掌握程度；AI 个性化推荐，根据学生的学习档案推荐适合的学习资源；薄弱点智能诊断，通过分析学生的作业、测验、问答记录，自动识别知识薄弱点并推送针对性练习。

第二，云端电磁场仿真。这是一个基于 Kubernetes 的高性能计算模块，支持 3D 实时渲染、参数化建模、WebSocket 流式传输。学生可以在浏览器中调整电荷分布、边界条件等参数，系统在云端完成数值求解和 3D 渲染，通过 WebSocket 长连接将渲染结果分块传输到前端，实现近实时的交互体验。

第三，GraphRAG 学术助教。这是一个基于知识图谱的智能问答系统，支持多跳推理问答、知识图谱可视化、文献引用追溯。学生提出问题后，系统不仅给出答案，还会展示推理路径（比如"问题 → 相关概念 → 前置知识 → 理论公式 → 实验验证"），并附上相关文献的引用链接，帮助学生深度理解知识的来龙去脉。

由于时间关系，我不在这里进行实际演示，但在答辩后的提问环节，我可以为各位老师现场演示这些功能。
`);

// ============================================================
// SLIDE 9: 性能对比与工程保障
// ============================================================
let slide9 = pres.addSlide();
slide9.background = { color: COLORS.white };

// Header
slide9.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.8,
  fill: { color: COLORS.primary }
});

slide9.addText("性能对比与工程保障", {
  x: 0.5, y: 0.2, w: 8, h: 0.4,
  fontSize: 32, bold: true, color: COLORS.white, margin: 0,
  fontFace: "Microsoft YaHei"
});

slide9.addText("08", {
  x: 9, y: 0.2, w: 0.5, h: 0.4,
  fontSize: 24, bold: true, color: COLORS.accent, align: "right",
  fontFace: "Arial"
});

// Performance stats
const stats = [
  { label: "推理成本降低", value: "60-70%", color: "10B981" },
  { label: "端侧推理延迟", value: "100-500ms", color: "0891B2" },
  { label: "测试覆盖率", value: "≥60%", color: "1E40AF" }
];

stats.forEach((stat, idx) => {
  const cardX = 0.5 + idx * 3.2;
  const cardY = 1.2;
  const cardW = 2.8;
  const cardH = 1.2;

  slide9.addShape(pres.shapes.RECTANGLE, {
    x: cardX, y: cardY, w: cardW, h: cardH,
    fill: { color: stat.color },
    shadow: makeCardShadow()
  });

  slide9.addText(stat.value, {
    x: cardX, y: cardY + 0.2, w: cardW, h: 0.5,
    fontSize: 36, bold: true, color: COLORS.white, align: "center",
    fontFace: "Arial"
  });

  slide9.addText(stat.label, {
    x: cardX, y: cardY + 0.75, w: cardW, h: 0.3,
    fontSize: 13, color: COLORS.white, align: "center",
    fontFace: "Microsoft YaHei"
  });
});

// Chart section
slide9.addText("推理延迟对比（毫秒）", {
  x: 0.5, y: 2.7, w: 4.5, h: 0.3,
  fontSize: 14, bold: true, color: COLORS.primary,
  fontFace: "Microsoft YaHei"
});

// Simple bar chart visualization
const chartData = [
  { label: "云端 API", value: 2500, color: "EF4444" },
  { label: "端侧 NPU", value: 300, color: "10B981" }
];

chartData.forEach((item, idx) => {
  const barY = 3.2 + idx * 0.6;
  const barW = (item.value / 3000) * 3.5;

  slide9.addText(item.label, {
    x: 0.5, y: barY, w: 1.2, h: 0.4,
    fontSize: 11, color: COLORS.darkGray, align: "right", valign: "middle",
    fontFace: "Microsoft YaHei"
  });

  slide9.addShape(pres.shapes.RECTANGLE, {
    x: 1.8, y: barY + 0.05, w: barW, h: 0.3,
    fill: { color: item.color }
  });

  slide9.addText(`${item.value}ms`, {
    x: 1.8 + barW + 0.1, y: barY, w: 0.8, h: 0.4,
    fontSize: 11, color: COLORS.darkGray, valign: "middle",
    fontFace: "Arial"
  });
});

// Engineering safeguards
slide9.addText("工程质量保障", {
  x: 5.5, y: 2.7, w: 4, h: 0.3,
  fontSize: 14, bold: true, color: COLORS.primary,
  fontFace: "Microsoft YaHei"
});

const safeguards = [
  "自动化测试流水线（7 步验证）",
  "Mock Fallback 优雅降级机制",
  "代码覆盖率 ≥ 60% 强制门禁",
  "性能基准测试与防劣化护栏",
  "安全合规审计（M1-M5, D1-D5）"
];

safeguards.forEach((item, idx) => {
  slide9.addText(`✓ ${item}`, {
    x: 5.7, y: 3.2 + idx * 0.35, w: 3.8, h: 0.3,
    fontSize: 11, color: COLORS.darkGray,
    fontFace: "Microsoft YaHei"
  });
});

slide9.addNotes(`
【演讲旁白】

在性能对比方面，我进行了三组关键指标的测试：

第一，推理成本降低 60-70%。通过将轻型问答任务（如"什么是电场强度？"）下沉到端侧 NPU，避免了云端 API 调用费用。以 GPT-4 为例，单次调用成本约 0.03 美元，一个班级 50 名学生每天使用 10 次，月成本约 450 美元；而端侧推理的边际成本为零，仅需一次性的模型下载。

第二，端侧推理延迟 100-500 毫秒。在 MacBook Pro M3 上，使用 CoreML 运行 Llama-3.2-3B 模型，平均首 Token 延迟约 150 毫秒，后续 Token 生成速度约 30 tokens/秒；而云端 API 调用的网络往返时延（RTT）通常在 200-500 毫秒，加上排队等待时间，总延迟可达 2-5 秒。

第三，测试覆盖率 ≥ 60%。我为核心模块（后端服务层、AI 路由网关、Edge AI SDK）编写了完整的单元测试和集成测试，代码覆盖率达到 60% 以上，关键路径的测试通过率 ≥ 95%。

在工程质量保障方面，我建立了五层防护体系：

第一，自动化测试流水线。我编写了 test_pipeline.sh 脚本，包含 7 步验证：代码格式检查、单元测试、集成测试、E2E 测试、性能基准测试、安全合规审计、文档一致性检查。每次代码提交都会触发完整的测试流水线。

第二，Mock Fallback 优雅降级机制。所有前端 API 和组件都具备 Mock 数据回退能力，即使云端服务宕机，核心演示链路（如学生仪表盘、课程列表）仍能正常展示，保证了系统的鲁棒性。

第三，代码覆盖率 ≥ 60% 强制门禁。我在 CI/CD 流水线中配置了覆盖率门禁，如果新提交的代码导致覆盖率下降，构建会自动失败。

第四，性能基准测试与防劣化护栏。我为关键接口（如 AI 推理、GraphRAG 检索）建立了性能基准（Baseline），每次代码变更后都会运行基准测试，如果性能劣化超过 10%，会触发告警。

第五，安全合规审计。我参考 OWASP Top 10 和数据安全规范，对系统进行了全面的安全审计，修复了 M1-M5（移动端安全）、D1-D5（数据安全）、G1-G5（通用安全）等多个安全隐患。
`);

// ============================================================
// SLIDE 10: 总结与未来展望
// ============================================================
let slide10 = pres.addSlide();
slide10.background = { color: COLORS.primary };

// Header
slide10.addText("总结与未来展望", {
  x: 0.5, y: 0.8, w: 9, h: 0.5,
  fontSize: 36, bold: true, color: COLORS.white, align: "center",
  fontFace: "Microsoft YaHei"
});

// Achievements
slide10.addText("核心成果", {
  x: 0.5, y: 1.6, w: 9, h: 0.3,
  fontSize: 18, bold: true, color: COLORS.accentLight,
  fontFace: "Microsoft YaHei"
});

const achievements = [
  "设计并实现了端云协同的三层分布式架构",
  "独立开发了跨平台 Edge AI SDK（纯 Rust 实现）",
  "提出并验证了 StreamId 并发流隔离协议",
  "构建了基于 GraphRAG 的课程知识图谱系统",
  "实现了推理成本降低 60-70%、延迟降低 80% 的性能优化"
];

achievements.forEach((item, idx) => {
  slide10.addText(`✓ ${item}`, {
    x: 1.0, y: 2.1 + idx * 0.35, w: 8, h: 0.3,
    fontSize: 13, color: COLORS.lightGray,
    fontFace: "Microsoft YaHei"
  });
});

// Future work
slide10.addText("未来工作", {
  x: 0.5, y: 3.9, w: 9, h: 0.3,
  fontSize: 18, bold: true, color: COLORS.accentLight,
  fontFace: "Microsoft YaHei"
});

const futureWork = [
  "适配更多移动端 NPU（高通 Hexagon、联发科 APU、华为昇腾）",
  "引入多智能体协作（Multi-Agent）提升复杂任务推理能力",
  "扩展知识图谱至更多专业课程（数学、物理、计算机）",
  "开展大规模用户研究，验证教学效果提升"
];

futureWork.forEach((item, idx) => {
  slide10.addText(`→ ${item}`, {
    x: 1.0, y: 4.4 + idx * 0.35, w: 8, h: 0.3,
    fontSize: 13, color: COLORS.lightGray,
    fontFace: "Microsoft YaHei"
  });
});

slide10.addNotes(`
【演讲旁白】

最后，我对本课题的工作进行总结，并展望未来的研究方向。

核心成果方面，我完成了五项关键工作：

第一，设计并实现了端云协同的三层分布式架构，包括表现层（React Web + Tauri Desktop + Expo Mobile）、网关层（Go/Gin + Python/FastAPI）、算力层（K8s + GraphRAG + MinIO/MySQL）。

第二，独立开发了跨平台 Edge AI SDK，完全使用 Rust 语言实现，支持 macOS CoreML、Windows DirectML、CPU fallback 三种推理后端，能够自动探测硬件并动态路由推理任务。

第三，提出并验证了 StreamId 并发流隔离协议，解决了 Tauri 桌面端应用中多路流式推理的事件串轨问题，为桌面端原生 AI 应用的工程化实践提供了可复用的协议设计范式。

第四，构建了基于 GraphRAG 的课程知识图谱系统，涵盖"知识点-概念-公式-实验-文献"五类实体和"前置依赖-包含-引用-扩展"四类关系，支持多跳推理问答与可视化推理路径展示。

第五，实现了显著的性能优化：推理成本降低 60-70%，端侧推理延迟降低 80%（从 2-5 秒降至 100-500 毫秒）。

未来工作方面，我计划从四个方向继续深化：

第一，适配更多移动端 NPU。目前 Edge AI SDK 仅支持苹果 ANE 和 Windows NPU，未来将适配高通 Hexagon、联发科 APU、华为昇腾等移动端芯片的 NPU，进一步扩大端侧推理的覆盖范围。

第二，引入多智能体协作（Multi-Agent）。当前系统使用单一大模型处理所有任务，未来将引入多智能体协作框架，比如"规划智能体 + 执行智能体 + 验证智能体"，提升复杂任务的推理能力。

第三，扩展知识图谱至更多专业课程。当前 GraphRAG 系统主要覆盖电磁学课程，未来将扩展至数学、物理、计算机等更多专业课程，构建跨学科的知识图谱网络。

第四，开展大规模用户研究。当前系统已在小范围内进行了试用，未来将开展大规模的用户研究，通过对照实验验证本平台对学生学习效果的提升幅度。
`);

// ============================================================
// SLIDE 11: 致谢
// ============================================================
let slide11 = pres.addSlide();
slide11.background = { color: COLORS.primary };

// Decorative circles
slide11.addShape(pres.shapes.OVAL, {
  x: 1, y: 1, w: 2, h: 2,
  fill: { color: COLORS.accent, transparency: 80 }
});

slide11.addShape(pres.shapes.OVAL, {
  x: 7, y: 3, w: 1.5, h: 1.5,
  fill: { color: COLORS.accentLight, transparency: 80 }
});

// Main text
slide11.addText("感谢各位评委老师的聆听！", {
  x: 0.5, y: 2.0, w: 9, h: 0.6,
  fontSize: 36, bold: true, color: COLORS.white, align: "center",
  fontFace: "Microsoft YaHei"
});

slide11.addText("敬请批评指正", {
  x: 0.5, y: 2.8, w: 9, h: 0.4,
  fontSize: 24, color: COLORS.lightGray, align: "center",
  fontFace: "Microsoft YaHei"
});

// Contact box
slide11.addShape(pres.shapes.RECTANGLE, {
  x: 3, y: 3.8, w: 4, h: 1.0,
  fill: { color: COLORS.secondary },
  line: { color: COLORS.accent, width: 2 }
});

slide11.addText([
  { text: "学生：胡傲东\n", options: { breakLine: true } },
  { text: "学号：U202214900\n", options: { breakLine: true } },
  { text: "指导教师：聂彦" }
], {
  x: 3.2, y: 3.95, w: 3.6, h: 0.8,
  fontSize: 13, color: COLORS.lightGray, align: "center", valign: "middle",
  fontFace: "Microsoft YaHei"
});

slide11.addNotes(`
【演讲旁白】

以上就是我的全部汇报内容。

感谢各位评委老师的耐心聆听！

本项目从需求分析、架构设计、核心技术攻关到系统实现与测试，历时 5 个月，凝聚了我对"端云协同"、"异构硬件加速"、"知识图谱推理"等前沿技术的深入思考与工程实践。

在项目过程中，我得到了指导教师聂彦老师的悉心指导，以及实验室同学们的大力支持，在此一并表示感谢。

我的汇报到此结束，敬请各位评委老师批评指正！
`);

// ============================================================
// Save presentation
// ============================================================
pres.writeFile({ fileName: "graduation-defense-presentation.pptx" })
  .then(() => {
    console.log("✓ Presentation created successfully: graduation-defense-presentation.pptx");
  })
  .catch(err => {
    console.error("✗ Error creating presentation:", err);
  });


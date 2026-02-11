const PptxGenJS = require("pptxgenjs");

// Create presentation
const pptx = new PptxGenJS();

// Set presentation properties
pptx.author = "Graduation Defense";
pptx.title = "LLM Teaching Platform";
pptx.subject = "Edge-Cloud Collaborative Intelligent Education System";

// Define color scheme
const colors = {
  agedCream: "F5F0E6",
  deepMaroon: "800000",
  darkCharcoal: "333333",
  accentGold: "B8860B",
  white: "FFFFFF"
};

// Helper function to add footer
function addFooter(slide, text, pageNum) {
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 6.8, w: "100%", h: 0.5,
    fill: { color: colors.deepMaroon }
  });
  slide.addText(text, {
    x: 0.5, y: 6.85, w: 8, h: 0.4,
    fontSize: 11, color: colors.white, italic: true
  });
  slide.addText(`${pageNum} / 15`, {
    x: 8.5, y: 6.85, w: 1, h: 0.4,
    fontSize: 11, color: colors.white, align: "right"
  });
}

// Slide 1: Cover
const slide1 = pptx.addSlide();
slide1.background = { color: colors.agedCream };
slide1.addText("GRADUATION THESIS DEFENSE", {
  x: 0.5, y: 1.5, w: 9, h: 0.3,
  fontSize: 14, color: colors.accentGold, align: "center",
  bold: true, charSpacing: 2
});
slide1.addText("通用大模型大学教学平台", {
  x: 0.5, y: 2.0, w: 9, h: 0.8,
  fontSize: 44, color: colors.deepMaroon, align: "center", bold: true
});
slide1.addText("LLM Teaching Platform - Edge-Cloud Collaborative Intelligent Education System", {
  x: 0.5, y: 2.9, w: 9, h: 0.5,
  fontSize: 18, color: colors.darkCharcoal, align: "center"
});
slide1.addShape(pptx.ShapeType.rect, {
  x: 4.5, y: 3.6, w: 1, h: 0.02,
  fill: { color: colors.accentGold }
});
slide1.addText("基于边缘 AI 与云端 AI 协同的通用化教学平台", {
  x: 0.5, y: 4.0, w: 9, h: 0.4,
  fontSize: 20, color: colors.deepMaroon, align: "center", bold: true
});
slide1.addText("答辩人：[作者姓名]  |  指导教师：[导师姓名]\n[学校名称] · 2026", {
  x: 0.5, y: 5.2, w: 9, h: 0.8,
  fontSize: 16, color: colors.darkCharcoal, align: "center"
});
addFooter(slide1, "结论：聚焦端云协同智能教学平台的工程与研究价值。", "01");

// Slide 2: Background & Motivation
const slide2 = pptx.addSlide();
slide2.background = { color: colors.agedCream };
slide2.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide2.addText("BACKGROUND & MOTIVATION", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide2.addText("研究背景与动机", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Left column - icon representation
slide2.addText("传统课堂痛点示意", {
  x: 0.5, y: 3.5, w: 4, h: 0.3,
  fontSize: 14, color: "666666", align: "center", italic: true
});
// Right column - pain points
slide2.addShape(pptx.ShapeType.rect, {
  x: 5, y: 1.8, w: 4.5, h: 1.3,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1, dashType: "solid" }
});
slide2.addText("高校教学痛点", {
  x: 5.2, y: 1.9, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide2.addText("• 抽象概念难以直观呈现\n• 答疑反馈平均延迟较高\n• 作业批改效率低，缺乏个性化指导\n• 教学资源与管理流程分散", {
  x: 5.2, y: 2.3, w: 4, h: 0.7,
  fontSize: 13, color: colors.darkCharcoal
});
// AI opportunity box
slide2.addShape(pptx.ShapeType.rect, {
  x: 5, y: 3.3, w: 4.5, h: 1.2,
  fill: { color: colors.white },
  line: { color: colors.accentGold, width: 1, dashType: "solid" }
});
slide2.addText("AI 技术机遇", {
  x: 5.2, y: 3.4, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide2.addText("• LLM 通用推理能力可赋能教学全流程\n• 端侧 NPU 算力普及，支持本地推理\n• 云端模型可补充复杂分析与多模态能力", {
  x: 5.2, y: 3.8, w: 4, h: 0.6,
  fontSize: 13, color: colors.darkCharcoal
});
// Edge-cloud necessity box
slide2.addShape(pptx.ShapeType.rect, {
  x: 5, y: 4.7, w: 4.5, h: 0.9,
  fill: { color: colors.white },
  line: { color: "2c3e50", width: 1, dashType: "solid" }
});
slide2.addText("端云协同必要性", {
  x: 5.2, y: 4.8, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide2.addText("平衡隐私安全、响应速度与计算成本，形成教学场景下的最优工程解。", {
  x: 5.2, y: 5.2, w: 4, h: 0.3,
  fontSize: 13, color: colors.darkCharcoal
});
addFooter(slide2, "结论：端云协同是性能、成本、隐私的平衡解。", "02");

// Slide 3: Research Innovations
const slide3 = pptx.addSlide();
slide3.background = { color: colors.agedCream };
slide3.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide3.addText("RESEARCH INNOVATIONS", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide3.addText("研究创新点提炼", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
slide3.addText("总体目标：构建低延迟、高隐私、低成本的通用化 AI 教学基础设施。", {
  x: 0.5, y: 1.5, w: 9, h: 0.3,
  fontSize: 16, color: colors.darkCharcoal, bold: true
});
// Innovation 1: NPU Acceleration
slide3.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 2.0, w: 3, h: 2.2,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide3.addText("异构 NPU 加速", {
  x: 0.7, y: 2.2, w: 2.6, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide3.addText("突破单一硬件限制，实现对 Snapdragon / Ascend / M4 的统一算子映射与推理加速。", {
  x: 0.7, y: 2.6, w: 2.6, h: 0.6,
  fontSize: 12, color: colors.darkCharcoal
});
slide3.addShape(pptx.ShapeType.rect, {
  x: 0.9, y: 3.4, w: 2.2, h: 0.6,
  fill: { color: "FFF8DC" },
  line: { color: colors.accentGold, width: 1 }
});
slide3.addText("300%", {
  x: 0.9, y: 3.45, w: 2.2, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});
slide3.addText("能效比提升", {
  x: 0.9, y: 3.8, w: 2.2, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
// Innovation 2: GraphRAG
slide3.addShape(pptx.ShapeType.rect, {
  x: 3.7, y: 2.0, w: 3, h: 2.2,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide3.addText("GraphRAG 增强", {
  x: 3.9, y: 2.2, w: 2.6, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide3.addText("构建课程-知识点-前置要求图模型，缓解长程教学逻辑中的检索幻觉。", {
  x: 3.9, y: 2.6, w: 2.6, h: 0.6,
  fontSize: 12, color: colors.darkCharcoal
});
slide3.addShape(pptx.ShapeType.rect, {
  x: 4.1, y: 3.4, w: 2.2, h: 0.6,
  fill: { color: "FFF8DC" },
  line: { color: colors.accentGold, width: 1 }
});
slide3.addText("+24%", {
  x: 4.1, y: 3.45, w: 2.2, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});
slide3.addText("复杂问答准确率提升", {
  x: 4.1, y: 3.8, w: 2.2, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
// Innovation 3: Smart Routing
slide3.addShape(pptx.ShapeType.rect, {
  x: 6.9, y: 2.0, w: 3, h: 2.2,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide3.addText("智能协同路由", {
  x: 7.1, y: 2.2, w: 2.6, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide3.addText("设计基于 Token × Latency 代价函数的动态路由算法，平衡隐私与算力消耗。", {
  x: 7.1, y: 2.6, w: 2.6, h: 0.6,
  fontSize: 12, color: colors.darkCharcoal
});
slide3.addShape(pptx.ShapeType.rect, {
  x: 7.3, y: 3.4, w: 2.2, h: 0.6,
  fill: { color: "FFF8DC" },
  line: { color: colors.accentGold, width: 1 }
});
slide3.addText("Dynamic", {
  x: 7.3, y: 3.45, w: 2.2, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});
slide3.addText("实时任务分流", {
  x: 7.3, y: 3.8, w: 2.2, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
// Summary box
slide3.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 4.5, w: 9, h: 0.8,
  fill: { color: "FFF8DC" },
  line: { color: colors.accentGold, width: 1 }
});
slide3.addText("本研究不仅完成系统工程实现，更在边缘智能的异构兼容性与教学知识关联性上给出可验证方案。", {
  x: 0.7, y: 4.7, w: 8.6, h: 0.4,
  fontSize: 13, color: colors.darkCharcoal
});
addFooter(slide3, "结论：创新重点是异构兼容性与教学逻辑关联性。", "03");

// Slide 4: System Architecture
const slide4 = pptx.addSlide();
slide4.background = { color: colors.agedCream };
slide4.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide4.addText("SYSTEM ARCHITECTURE", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide4.addText("系统架构总览", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Frontend Layer
slide4.addShape(pptx.ShapeType.rect, {
  x: 1.5, y: 1.8, w: 7, h: 0.7,
  fill: { color: colors.white },
  line: { color: colors.darkCharcoal, width: 2 }
});
slide4.addText("前端应用层 (Frontend)", {
  x: 1.7, y: 1.9, w: 6.6, h: 0.25,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide4.addText("React + TypeScript + Vite | 响应式设计 | 教学看板", {
  x: 1.7, y: 2.2, w: 6.6, h: 0.2,
  fontSize: 11, color: "555555", align: "center"
});
// Arrow down
slide4.addText("↓", {
  x: 4.8, y: 2.6, w: 0.4, h: 0.3,
  fontSize: 20, color: colors.accentGold, align: "center"
});
// Collaborative Layer
slide4.addShape(pptx.ShapeType.rect, {
  x: 1.5, y: 3.0, w: 7, h: 0.7,
  fill: { color: "FFF8DC" },
  line: { color: colors.accentGold, width: 3 }
});
slide4.addText("端云协同层 (Collaborative Layer)", {
  x: 1.7, y: 3.1, w: 6.6, h: 0.25,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide4.addText("智能路由网关 | 负载均衡 | 离线降级策略 | 状态同步", {
  x: 1.7, y: 3.4, w: 6.6, h: 0.2,
  fontSize: 11, color: "555555", align: "center"
});
// Arrows down (two)
slide4.addText("↓", {
  x: 3.5, y: 3.8, w: 0.4, h: 0.3,
  fontSize: 20, color: colors.accentGold, align: "center"
});
slide4.addText("↓", {
  x: 6.1, y: 3.8, w: 0.4, h: 0.3,
  fontSize: 20, color: colors.accentGold, align: "center"
});
// Cloud Layer
slide4.addShape(pptx.ShapeType.rect, {
  x: 1.5, y: 4.2, w: 3.3, h: 1.0,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 2 }
});
slide4.addText("云端服务层 (Cloud)", {
  x: 1.7, y: 4.3, w: 2.9, h: 0.25,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide4.addText("Go (Gin) 业务后端\nPython (FastAPI) 模型服务\nMySQL + MinIO + Neo4j", {
  x: 1.7, y: 4.6, w: 2.9, h: 0.5,
  fontSize: 10, color: "555555", align: "center"
});
// Edge Layer
slide4.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 4.2, w: 3.3, h: 1.0,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 2 }
});
slide4.addText("端侧智能层 (Edge)", {
  x: 5.4, y: 4.3, w: 2.9, h: 0.25,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide4.addText("NPU 推理引擎 (MLX/ONNX)\n本地向量索引 (FAISS)\n4-bit 量化模型", {
  x: 5.4, y: 4.6, w: 2.9, h: 0.5,
  fontSize: 10, color: "555555", align: "center"
});
addFooter(slide4, "结论：四层模块化架构支持扩展与稳定演进。", "04");

// Slide 5: Edge Design
const slide5 = pptx.addSlide();
slide5.background = { color: colors.agedCream };
slide5.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide5.addText("EDGE DESIGN: ARCHITECTURE & MODEL", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide5.addText("端侧设计：架构与模型", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Left: NPU Architecture visualization
slide5.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 1.8, w: 4, h: 3.5,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 2 }
});
slide5.addText("Apple M4 / NPU Architecture", {
  x: 0.7, y: 3.3, w: 3.6, h: 0.3,
  fontSize: 14, color: colors.darkCharcoal, bold: true, align: "center"
});
// Right: Model details
slide5.addShape(pptx.ShapeType.rect, {
  x: 5, y: 1.8, w: 4.5, h: 1.1,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide5.addText("模型选型", {
  x: 5.2, y: 1.95, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide5.addText("Qwen3-0.6B (Base/Instruct)\n结合 MLX-4bit 极致量化技术", {
  x: 5.2, y: 2.3, w: 4, h: 0.4,
  fontSize: 13, color: colors.darkCharcoal
});
slide5.addShape(pptx.ShapeType.rect, {
  x: 5, y: 3.1, w: 4.5, h: 1.1,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide5.addText("硬件加速", {
  x: 5.2, y: 3.25, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide5.addText("利用 Apple M4 Neural Engine\nMetal API 直接调用，减少框架开销", {
  x: 5.2, y: 3.6, w: 4, h: 0.4,
  fontSize: 13, color: colors.darkCharcoal
});
slide5.addShape(pptx.ShapeType.rect, {
  x: 5, y: 4.4, w: 4.5, h: 0.9,
  fill: { color: colors.deepMaroon }
});
slide5.addText("性能目标", {
  x: 5.2, y: 4.55, w: 4, h: 0.25,
  fontSize: 16, color: colors.accentGold, bold: true
});
slide5.addText("• 端侧推理延迟 < 500ms\n• 运行时内存占用 < 2GB", {
  x: 5.2, y: 4.85, w: 4, h: 0.35,
  fontSize: 13, color: colors.white
});
addFooter(slide5, "结论：轻量模型与硬件协同满足端侧实时性。", "05");

// Slide 6: Core Algorithm - Routing Logic
const slide6 = pptx.addSlide();
slide6.background = { color: colors.agedCream };
slide6.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide6.addText("CORE ALGORITHM", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide6.addText("核心算法：智能路由逻辑", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Left: Algorithm
slide6.addText("自适应任务分配策略", {
  x: 0.5, y: 1.6, w: 4.5, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true
});
slide6.addText("系统根据环境参数 E = {Net, NPU_Load, Privacy_Level} 计算决策因子 Ψ：", {
  x: 0.5, y: 2.0, w: 4.5, h: 0.3,
  fontSize: 13, color: colors.darkCharcoal
});
// Algorithm code box
slide6.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 2.4, w: 4.5, h: 2.8,
  fill: { color: "2d2d2d" }
});
slide6.addText([
  { text: "def ", options: { color: "ff79c6" } },
  { text: "route_decision", options: { color: "50fa7b" } },
  { text: "(", options: { color: "f8f8f2" } },
  { text: "request", options: { color: "8be9fd" } },
  { text: "):\n", options: { color: "f8f8f2" } },
  { text: "  complexity", options: { color: "8be9fd" } },
  { text: " = estimate_tokens(request)\n", options: { color: "f8f8f2" } },
  { text: "  if ", options: { color: "ff79c6" } },
  { text: "request.privacy_high:\n", options: { color: "f8f8f2" } },
  { text: "    return ", options: { color: "ff79c6" } },
  { text: "LOCAL_NPU_INFERENCE\n\n", options: { color: "50fa7b" } },
  { text: "  cost_cloud", options: { color: "8be9fd" } },
  { text: " = complexity * network_delay\n", options: { color: "f8f8f2" } },
  { text: "  cost_local", options: { color: "8be9fd" } },
  { text: " = complexity / npu_tops\n\n", options: { color: "f8f8f2" } },
  { text: "  if ", options: { color: "ff79c6" } },
  { text: "cost_local < cost_cloud * 0.7:\n", options: { color: "f8f8f2" } },
  { text: "    return ", options: { color: "ff79c6" } },
  { text: "LOCAL_NPU_INFERENCE\n", options: { color: "50fa7b" } },
  { text: "  else:\n", options: { color: "ff79c6" } },
  { text: "    return ", options: { color: "ff79c6" } },
  { text: "CLOUD_LLM_API", options: { color: "50fa7b" } }
], {
  x: 0.6, y: 2.5, w: 4.3, h: 2.6,
  fontSize: 10, fontFace: "Courier New", color: "f8f8f2", valign: "top"
});
// Right: Decision factors
slide6.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 1.8, w: 4.3, h: 2.0,
  fill: { color: colors.agedCream },
  line: { color: colors.accentGold, width: 1 }
});
slide6.addText("决策考量因素", {
  x: 5.4, y: 1.95, w: 3.9, h: 0.3,
  fontSize: 14, color: colors.deepMaroon, bold: true
});
slide6.addText("✓ 隐私权重：学生成绩、私密答疑任务强制本地。\n\n✓ 网络状态：弱覆盖区域自动降级到本地 NPU。\n\n✓ Token 密度：短文本任务优先本地 0.6B 模型。", {
  x: 5.4, y: 2.35, w: 3.9, h: 1.3,
  fontSize: 12, color: colors.darkCharcoal
});
slide6.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 4.0, w: 4.3, h: 0.7,
  fill: { color: "FFF8DC" },
  line: { color: colors.accentGold, width: 1 }
});
slide6.addText("本地任务：资源管理/学习追踪/简单问答；云端任务：复杂推理/深度分析/多模态处理。", {
  x: 5.4, y: 4.15, w: 3.9, h: 0.4,
  fontSize: 11, color: colors.darkCharcoal
});
addFooter(slide6, "结论：展示数学建模与工程权衡能力。", "06");

// Slide 7: Cloud Services Architecture
const slide7 = pptx.addSlide();
slide7.background = { color: colors.agedCream };
slide7.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide7.addText("CLOUD SERVICES ARCHITECTURE", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide7.addText("云端设计：服务架构", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// AI Inference Service
slide7.addShape(pptx.ShapeType.rect, {
  x: 0.8, y: 1.8, w: 2.8, h: 2.5,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide7.addText("AI 推理服务", {
  x: 1.0, y: 2.8, w: 2.4, h: 0.3,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide7.addText("FastAPI\nStreaming Output\nTool Calling\nAgent Orchestration", {
  x: 1.0, y: 3.2, w: 2.4, h: 0.8,
  fontSize: 11, color: colors.darkCharcoal, align: "center"
});
// Business Backend API
slide7.addShape(pptx.ShapeType.rect, {
  x: 3.8, y: 1.8, w: 2.8, h: 2.5,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide7.addText("业务后端 API", {
  x: 4.0, y: 2.8, w: 2.4, h: 0.3,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide7.addText("Go + Gin\nRESTful API\nJWT Auth\nHigh Concurrency", {
  x: 4.0, y: 3.2, w: 2.4, h: 0.8,
  fontSize: 11, color: colors.darkCharcoal, align: "center"
});
// Data Storage
slide7.addShape(pptx.ShapeType.rect, {
  x: 6.8, y: 1.8, w: 2.8, h: 2.5,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide7.addText("数据存储", {
  x: 7.0, y: 2.8, w: 2.4, h: 0.3,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide7.addText("MySQL 8.0 (Business)\nMinIO (Object)\nNeo4j (Graph)\nDocker Compose", {
  x: 7.0, y: 3.2, w: 2.4, h: 0.8,
  fontSize: 11, color: colors.darkCharcoal, align: "center"
});
// Summary
slide7.addShape(pptx.ShapeType.line, {
  x: 0.5, y: 4.6, w: 9, h: 0,
  line: { color: "aaaaaa", width: 1, dashType: "dash" }
});
slide7.addText("微服务部署架构：所有组件容器化部署，支持独立扩缩容与灰度演进。", {
  x: 0.5, y: 4.9, w: 9, h: 0.4,
  fontSize: 15, color: colors.darkCharcoal, align: "center", bold: true
});
addFooter(slide7, "结论：云端服务解耦，支持独立扩缩容。", "07");

// Slide 8: Core Functional Modules
const slide8 = pptx.addSlide();
slide8.background = { color: colors.agedCream };
slide8.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide8.addText("CORE FUNCTIONAL MODULES", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide8.addText("云端设计：核心功能模块", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Authentication & Authorization
slide8.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 1.8, w: 4.5, h: 1.8,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide8.addText("认证与权限", {
  x: 0.7, y: 1.95, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide8.addText("JWT 无状态认证 + RBAC 模型，实现教师、学生、管理员的分级权限控制。", {
  x: 0.7, y: 2.35, w: 4, h: 0.5,
  fontSize: 13, color: colors.darkCharcoal
});
// Course Management
slide8.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 1.8, w: 4.5, h: 1.8,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide8.addText("课程管理", {
  x: 5.4, y: 1.95, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide8.addText("教学日历同步、成员分组管理与教学大纲 CRUD 能力。", {
  x: 5.4, y: 2.35, w: 4, h: 0.5,
  fontSize: 13, color: colors.darkCharcoal
});
// Assignment System
slide8.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 3.8, w: 4.5, h: 1.8,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide8.addText("作业系统", {
  x: 0.7, y: 3.95, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide8.addText("作业发布、提交与归档全流程，集成 AI 辅助评分 与反馈建议。", {
  x: 0.7, y: 4.35, w: 4, h: 0.5,
  fontSize: 13, color: colors.darkCharcoal
});
// Resource Center
slide8.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 3.8, w: 4.5, h: 1.8,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide8.addText("资源中心", {
  x: 5.4, y: 3.95, w: 4, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});
slide8.addText("支持 PDF/Markdown/视频上传、自动分类与访问轨迹追踪。", {
  x: 5.4, y: 4.35, w: 4, h: 0.5,
  fontSize: 13, color: colors.darkCharcoal
});
addFooter(slide8, "结论：覆盖教学全流程业务闭环。", "08");

// Slide 9: Performance Optimization
const slide9 = pptx.addSlide();
slide9.background = { color: colors.agedCream };
slide9.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide9.addText("PERFORMANCE OPTIMIZATION", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide9.addText("性能优化：端云协同策略", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Edge Optimization
slide9.addText("端侧优化", {
  x: 0.5, y: 1.7, w: 3, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true
});
slide9.addText("• 4-bit 量化：显存占用减少约 70%\n• MLX 推理：充分利用 Metal 加速\n• 内存管理：KV Cache 动态释放", {
  x: 0.5, y: 2.15, w: 3, h: 0.8,
  fontSize: 14, color: colors.darkCharcoal
});
// Cloud Optimization
slide9.addText("云端优化", {
  x: 3.7, y: 1.7, w: 3, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true
});
slide9.addText("• 低延迟 API：响应 < 200ms\n• 高并发：支持 100+ QPS\n• 首字生成 (TTFT)：< 3s", {
  x: 3.7, y: 2.15, w: 3, h: 0.8,
  fontSize: 14, color: colors.darkCharcoal
});
// Collaborative Optimization
slide9.addText("协同优化", {
  x: 6.9, y: 1.7, w: 3, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true
});
slide9.addText("• 智能路由：动态负载均衡\n• 离线降级：服务高可用\n• Prompt 压缩：减少云端 Token 成本", {
  x: 6.9, y: 2.15, w: 3, h: 0.8,
  fontSize: 14, color: colors.darkCharcoal
});
// Performance metrics
slide9.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 3.5, w: 9, h: 1.8,
  fill: { color: colors.white },
  line: { color: "dddddd", width: 1 }
});
slide9.addText("60%", {
  x: 1.5, y: 3.8, w: 2, h: 0.5,
  fontSize: 28, color: colors.deepMaroon, bold: true, align: "center"
});
slide9.addText("成本降低", {
  x: 1.5, y: 4.35, w: 2, h: 0.3,
  fontSize: 12, color: colors.darkCharcoal, align: "center"
});
slide9.addText("2x", {
  x: 4, y: 3.8, w: 2, h: 0.5,
  fontSize: 28, color: colors.accentGold, bold: true, align: "center"
});
slide9.addText("吞吐提升", {
  x: 4, y: 4.35, w: 2, h: 0.3,
  fontSize: 12, color: colors.darkCharcoal, align: "center"
});
slide9.addText("< 500ms", {
  x: 6.5, y: 3.8, w: 2, h: 0.5,
  fontSize: 28, color: "2c3e50", bold: true, align: "center"
});
slide9.addText("端侧延迟", {
  x: 6.5, y: 4.35, w: 2, h: 0.3,
  fontSize: 12, color: colors.darkCharcoal, align: "center"
});
addFooter(slide9, "结论：端云协同带来性能与成本双收益。", "09");

// Slide 10: GraphRAG Knowledge Retrieval
const slide10 = pptx.addSlide();
slide10.background = { color: colors.agedCream };
slide10.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide10.addText("GRAPHRAG KNOWLEDGE RETRIEVAL", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide10.addText("GraphRAG 知识检索系统", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Left: Features
slide10.addText("• 知识建模：将非结构化课件转化为课程-知识点-依赖关系图谱。\n\n• 混合检索：结合 Seed-based 搜索与图遍历 (Graph Expansion)。\n\n• 引用溯源：每个回答都可追溯到教材或课件来源。\n\n• 应用场景：智能答疑、学习路径规划、资源推荐。", {
  x: 0.5, y: 1.8, w: 4.5, h: 3.5,
  fontSize: 15, color: colors.darkCharcoal, lineSpacing: 32
});
// Right: Graph visualization
slide10.addShape(pptx.ShapeType.ellipse, {
  x: 5.5, y: 2.0, w: 3.5, h: 3.5,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 2 }
});
slide10.addText("Knowledge Graph Topology", {
  x: 5.5, y: 5.7, w: 3.5, h: 0.3,
  fontSize: 12, color: colors.darkCharcoal, bold: true, align: "center"
});
// Central node
slide10.addShape(pptx.ShapeType.ellipse, {
  x: 6.9, y: 3.4, w: 0.25, h: 0.25,
  fill: { color: colors.deepMaroon }
});
// Satellite nodes
slide10.addShape(pptx.ShapeType.ellipse, {
  x: 7.8, y: 2.5, w: 0.2, h: 0.2,
  fill: { color: colors.accentGold }
});
slide10.addShape(pptx.ShapeType.ellipse, {
  x: 6.2, y: 4.8, w: 0.2, h: 0.2,
  fill: { color: colors.accentGold }
});
slide10.addShape(pptx.ShapeType.ellipse, {
  x: 6.0, y: 2.8, w: 0.15, h: 0.15,
  fill: { color: colors.darkCharcoal }
});
addFooter(slide10, "结论：GraphRAG 提升复杂教育场景检索质量。", "10");

// Slide 11: Multi-agent Collaboration
const slide11 = pptx.addSlide();
slide11.background = { color: colors.agedCream };
slide11.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide11.addText("MULTI-AGENT COLLABORATION", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide11.addText("Multi-agent 协作系统", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Central State Sync
slide11.addShape(pptx.ShapeType.ellipse, {
  x: 4.0, y: 2.8, w: 2.0, h: 2.0,
  fill: { color: colors.deepMaroon }
});
slide11.addText("状态同步\nState Sync", {
  x: 4.2, y: 3.5, w: 1.6, h: 0.6,
  fontSize: 12, color: colors.white, bold: true, align: "center"
});
// Learning Assistant Agent (Top)
slide11.addShape(pptx.ShapeType.rect, {
  x: 3.5, y: 1.0, w: 3.0, h: 1.2,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide11.addText("🎓 学习助手 Agent", {
  x: 3.7, y: 1.15, w: 2.6, h: 0.3,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide11.addText("答疑解惑\n概念解释", {
  x: 3.7, y: 1.5, w: 2.6, h: 0.5,
  fontSize: 11, color: colors.darkCharcoal, align: "center"
});
// Writing Assistant Agent (Bottom Left)
slide11.addShape(pptx.ShapeType.rect, {
  x: 0.8, y: 5.0, w: 3.0, h: 1.2,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide11.addText("📝 写作辅导 Agent", {
  x: 1.0, y: 5.15, w: 2.6, h: 0.3,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide11.addText("论文润色\n语法检查", {
  x: 1.0, y: 5.5, w: 2.6, h: 0.5,
  fontSize: 11, color: colors.darkCharcoal, align: "center"
});
// Course Management Agent (Bottom Right)
slide11.addShape(pptx.ShapeType.rect, {
  x: 6.2, y: 5.0, w: 3.0, h: 1.2,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide11.addText("📅 课程管理 Agent", {
  x: 6.4, y: 5.15, w: 2.6, h: 0.3,
  fontSize: 14, color: colors.deepMaroon, bold: true, align: "center"
});
slide11.addText("进度提醒\n作业催交", {
  x: 6.4, y: 5.5, w: 2.6, h: 0.5,
  fontSize: 11, color: colors.darkCharcoal, align: "center"
});
// Connection lines
slide11.addShape(pptx.ShapeType.line, {
  x: 5.0, y: 2.2, w: 0, h: 0.6,
  line: { color: colors.accentGold, width: 2, dashType: "dash" }
});
slide11.addShape(pptx.ShapeType.line, {
  x: 2.3, y: 5.0, w: 2.2, h: -1.2,
  line: { color: colors.accentGold, width: 2, dashType: "dash" }
});
slide11.addShape(pptx.ShapeType.line, {
  x: 7.7, y: 5.0, w: -2.2, h: -1.2,
  line: { color: colors.accentGold, width: 2, dashType: "dash" }
});
addFooter(slide11, "结论：多智能体提高任务处理效率与教学服务质量。", "11");

// Slide 12: Hardware Optimization - Apple M4
const slide12 = pptx.addSlide();
slide12.background = { color: colors.agedCream };
slide12.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide12.addText("HARDWARE OPTIMIZATION", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide12.addText("硬件级优化：Apple M4", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Left: Optimization details
slide12.addText("• MLX + Metal 加速：直接调用 GPU/NPU，提升推理吞吐。\n\n• 统一内存零拷贝：利用 UMA 架构降低数据搬运开销。\n\n• 训练优化：支持 LoRA / QLoRA 微调与蒸馏策略。\n\n• 部署优化：动态监控资源并进行智能调度。", {
  x: 0.5, y: 1.8, w: 4.5, h: 3.5,
  fontSize: 15, color: colors.darkCharcoal, lineSpacing: 32
});
// Right: Neural Engine visualization
slide12.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 1.8, w: 4.3, h: 3.5,
  fill: { color: colors.white },
  line: { color: "cccccc", width: 1 }
});
slide12.addText("Neural Engine Utilization", {
  x: 5.4, y: 4.8, w: 3.9, h: 0.3,
  fontSize: 13, color: colors.deepMaroon, bold: true, align: "center"
});
addFooter(slide12, "结论：硬件感知优化决定端侧落地上限。", "12");

// Slide 13: Evaluation & Contrast
const slide13 = pptx.addSlide();
slide13.background = { color: colors.agedCream };
slide13.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide13.addText("EVALUATION & CONTRAST", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide13.addText("性能评估与消融实验对比", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Chart 1: RAG vs GraphRAG
slide13.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 1.8, w: 4.5, h: 2.2,
  fill: { color: "FAFAFA" },
  line: { color: "c8c8c8", width: 1, dashType: "dash" }
});
slide13.addText("检索准确率 (RAG vs. GraphRAG)", {
  x: 0.7, y: 1.95, w: 4.1, h: 0.25,
  fontSize: 13, color: colors.darkCharcoal, bold: true, align: "center"
});
// Vector bar
slide13.addShape(pptx.ShapeType.rect, {
  x: 1.5, y: 3.2, w: 0.5, h: 0.9,
  fill: { color: "bbbbbb" }
});
slide13.addText("72%", {
  x: 1.5, y: 2.95, w: 0.5, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
slide13.addText("Vector", {
  x: 1.5, y: 4.2, w: 0.5, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
// Graph bar
slide13.addShape(pptx.ShapeType.rect, {
  x: 2.8, y: 2.5, w: 0.5, h: 1.6,
  fill: { color: colors.deepMaroon }
});
slide13.addText("96%", {
  x: 2.8, y: 2.25, w: 0.5, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
slide13.addText("Graph", {
  x: 2.8, y: 4.2, w: 0.5, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
slide13.addText("复杂逻辑问答准确率提升 24.3%", {
  x: 0.7, y: 4.5, w: 4.1, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
// Chart 2: CPU vs NPU
slide13.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 1.8, w: 4.5, h: 2.2,
  fill: { color: "FAFAFA" },
  line: { color: "c8c8c8", width: 1, dashType: "dash" }
});
slide13.addText("能耗对比 (CPU vs. NPU)", {
  x: 5.4, y: 1.95, w: 4.1, h: 0.25,
  fontSize: 13, color: colors.darkCharcoal, bold: true, align: "center"
});
// CPU bar
slide13.addShape(pptx.ShapeType.rect, {
  x: 6.2, y: 2.5, w: 0.5, h: 1.5,
  fill: { color: "bbbbbb" }
});
slide13.addText("CPU", {
  x: 6.2, y: 2.25, w: 0.5, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
// NPU bar
slide13.addShape(pptx.ShapeType.rect, {
  x: 7.5, y: 3.8, w: 0.5, h: 0.2,
  fill: { color: "4caf50" }
});
slide13.addText("NPU", {
  x: 7.5, y: 3.55, w: 0.5, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
slide13.addText("NPU 每 Token 功耗降低 85%", {
  x: 5.4, y: 4.5, w: 4.1, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
// Performance metrics grid
slide13.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 4.9, w: 2.2, h: 0.7,
  fill: { color: "FAFAFA" },
  line: { color: "dddddd", width: 1 }
});
slide13.addText("92.4%", {
  x: 0.5, y: 4.95, w: 2.2, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});
slide13.addText("分类准确率", {
  x: 0.5, y: 5.35, w: 2.2, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
slide13.addShape(pptx.ShapeType.rect, {
  x: 2.8, y: 4.9, w: 2.2, h: 0.7,
  fill: { color: "FAFAFA" },
  line: { color: "dddddd", width: 1 }
});
slide13.addText("320ms", {
  x: 2.8, y: 4.95, w: 2.2, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});
slide13.addText("端侧平均首字延时", {
  x: 2.8, y: 5.35, w: 2.2, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
slide13.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 4.9, w: 2.2, h: 0.7,
  fill: { color: "FAFAFA" },
  line: { color: "dddddd", width: 1 }
});
slide13.addText("-62%", {
  x: 5.2, y: 4.95, w: 2.2, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});
slide13.addText("云端 Token 成本节约", {
  x: 5.2, y: 5.35, w: 2.2, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
slide13.addShape(pptx.ShapeType.rect, {
  x: 7.5, y: 4.9, w: 2.2, h: 0.7,
  fill: { color: "FAFAFA" },
  line: { color: "dddddd", width: 1 }
});
slide13.addText("4-bit", {
  x: 7.5, y: 4.95, w: 2.2, h: 0.35,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});
slide13.addText("主流 NPU 适配量化", {
  x: 7.5, y: 5.35, w: 2.2, h: 0.2,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});
addFooter(slide13, "结论：以量化证据支撑方案有效性与先进性。", "13");

// Slide 14: System Implementation & Summary
const slide14 = pptx.addSlide();
slide14.background = { color: colors.agedCream };
slide14.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 0.5, w: 0.08, h: 0.8,
  fill: { color: colors.deepMaroon }
});
slide14.addText("SYSTEM IMPLEMENTATION & SUMMARY", {
  x: 0.7, y: 0.55, w: 8, h: 0.25,
  fontSize: 12, color: colors.accentGold, bold: true, charSpacing: 2
});
slide14.addText("系统实现与演示 + 总结展望", {
  x: 0.7, y: 0.85, w: 8, h: 0.4,
  fontSize: 32, color: colors.deepMaroon, bold: true
});
// Left: Demo placeholder
slide14.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 1.8, w: 4.5, h: 3.5,
  fill: { color: "f2f2f2" },
  line: { color: colors.darkCharcoal, width: 1 }
});
// Window controls
slide14.addShape(pptx.ShapeType.rect, {
  x: 0.5, y: 1.8, w: 4.5, h: 0.3,
  fill: { color: colors.darkCharcoal }
});
slide14.addShape(pptx.ShapeType.ellipse, {
  x: 0.6, y: 1.9, w: 0.1, h: 0.1,
  fill: { color: "ff5f56" }
});
slide14.addShape(pptx.ShapeType.ellipse, {
  x: 0.75, y: 1.9, w: 0.1, h: 0.1,
  fill: { color: "ffbd2e" }
});
slide14.addShape(pptx.ShapeType.ellipse, {
  x: 0.9, y: 1.9, w: 0.1, h: 0.1,
  fill: { color: "27c93f" }
});
slide14.addShape(pptx.ShapeType.rect, {
  x: 0.6, y: 2.2, w: 3.8, h: 2.9,
  fill: { color: "fafafa" },
  line: { color: "bbbbbb", width: 2, dashType: "dash" }
});
slide14.addText("[ 插入端云协同交互界面截图 / 演示视频 ]", {
  x: 0.8, y: 3.4, w: 3.4, h: 0.4,
  fontSize: 12, color: "888888", italic: true, align: "center"
});
// Right: Tech stack and summary
slide14.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 1.8, w: 4.5, h: 1.5,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1 }
});
slide14.addText("技术栈实现确认", {
  x: 5.4, y: 1.95, w: 4, h: 0.3,
  fontSize: 14, color: colors.deepMaroon, bold: true
});
slide14.addText("• 端侧推理：MLX + ONNX Runtime\n• 云端后端：Go 1.22 + Gin\n• 前端适配：响应式 React\n• 知识库：Neo4j 图关系 + FAISS 向量索引", {
  x: 5.4, y: 2.35, w: 4, h: 0.8,
  fontSize: 12, color: colors.darkCharcoal
});
slide14.addShape(pptx.ShapeType.rect, {
  x: 5.2, y: 3.5, w: 4.5, h: 0.9,
  fill: { color: "FFF8DC" },
  line: { color: colors.accentGold, width: 1, dashType: "dash" }
});
slide14.addText("评委提问预演：为什么选择 Go 而不是 Python 做后端？\n回答：业务侧高并发与内存管理由 Go 承担，AI 推理由 Python 服务承担，实现动静分离与稳定扩展。", {
  x: 5.4, y: 3.65, w: 4, h: 0.6,
  fontSize: 11, color: colors.darkCharcoal
});
slide14.addShape(pptx.ShapeType.line, {
  x: 5.2, y: 4.6, w: 4.5, h: 0,
  line: { color: colors.accentGold, width: 2 }
});
slide14.addText("未来展望：企业微信集成、多学科扩展、持续优化与规模化部署验证。", {
  x: 5.2, y: 4.75, w: 4.5, h: 0.4,
  fontSize: 12, color: colors.darkCharcoal, bold: true
});
addFooter(slide14, "结论：证明系统完成度、工程工作量与可演进路线。", "14");

// Slide 15: Q&A
const slide15 = pptx.addSlide();
slide15.background = { color: colors.deepMaroon };
slide15.addShape(pptx.ShapeType.rect, {
  x: 0, y: 0, w: "100%", h: "100%",
  fill: { color: colors.deepMaroon },
  line: { color: colors.accentGold, width: 5 }
});
slide15.addText("Q & A", {
  x: 0.5, y: 2.0, w: 9, h: 1.2,
  fontSize: 100, color: colors.white, bold: true, align: "center"
});
slide15.addText("Questions & Answers", {
  x: 0.5, y: 3.3, w: 9, h: 0.5,
  fontSize: 28, color: colors.white, align: "center", fontFace: "Georgia"
});
slide15.addShape(pptx.ShapeType.rect, {
  x: 4.0, y: 4.0, w: 2.0, h: 0.02,
  fill: { color: colors.accentGold }
});
slide15.addText("感谢聆听 THANK YOU", {
  x: 0.5, y: 4.4, w: 9, h: 0.4,
  fontSize: 20, color: colors.white, align: "center"
});
slide15.addText("[联系方式 / GitHub 地址]", {
  x: 0.5, y: 5.5, w: 9, h: 0.3,
  fontSize: 14, color: colors.white, align: "center"
});

// Save presentation
pptx.writeFile({ fileName: "/Users/huaodong/graduationDesign/slide-deck/llm-teaching-platform-defense.pptx" })
  .then(() => {
    console.log("✓ PowerPoint presentation generated successfully!");
    console.log("✓ File saved to: /Users/huaodong/graduationDesign/slide-deck/llm-teaching-platform-defense.pptx");
    console.log("✓ Total slides: 15");
  })
  .catch((err) => {
    console.error("✗ Error generating presentation:", err);
    process.exit(1);
  });

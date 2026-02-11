#!/usr/bin/env node

const pptxgen = require("pptxgenjs");

// Create presentation
const pres = new pptxgen();

// Define color scheme (matching HTML)
const colors = {
  agedCream: "F5F0E6",
  deepMaroon: "800000",
  darkCharcoal: "333333",
  accentGold: "B8860B",
  white: "FFFFFF",
  nearBlack: "1A1A1A"
};

// Set presentation properties
pres.layout = "LAYOUT_16x9";
pres.author = "Graduation Defense";
pres.title = "通用大模型大学教学平台";

// Helper function to add footer
function addFooter(slide, text, pageNum) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 6.5, w: "100%", h: 0.75,
    fill: { color: colors.deepMaroon }
  });

  slide.addText(text, {
    x: 0.5, y: 6.6, w: 8, h: 0.5,
    fontSize: 11, color: colors.white, italic: true,
    fontFace: "Arial"
  });

  slide.addText(pageNum, {
    x: 11.5, y: 6.6, w: 1.5, h: 0.5,
    fontSize: 11, color: colors.white, align: "right"
  });
}

// Slide 1: Cover
const slide1 = pres.addSlide();
slide1.background = { color: colors.agedCream };

slide1.addText("GRADUATION THESIS DEFENSE", {
  x: 0.5, y: 1.2, w: "90%", h: 0.4,
  fontSize: 14, color: colors.accentGold, align: "center",
  fontFace: "Arial", bold: true
});

slide1.addText("通用大模型大学教学平台", {
  x: 0.5, y: 2, w: "90%", h: 1,
  fontSize: 48, color: colors.deepMaroon, align: "center",
  fontFace: "Arial", bold: true
});

slide1.addText("LLM Teaching Platform - Edge-Cloud Collaborative Intelligent Education System", {
  x: 0.5, y: 3.2, w: "90%", h: 0.6,
  fontSize: 20, color: colors.darkCharcoal, align: "center"
});

slide1.addShape(pres.ShapeType.rect, {
  x: 5.5, y: 4, w: 2, h: 0.03,
  fill: { color: colors.accentGold }
});

slide1.addText("基于边缘 AI 与云端 AI 协同的通用化教学平台", {
  x: 0.5, y: 4.5, w: "90%", h: 0.5,
  fontSize: 20, color: colors.deepMaroon, align: "center",
  fontFace: "Arial", bold: true
});

slide1.addText([
  { text: "答辩人：", options: { bold: true } },
  { text: "[作者姓名]  |  ", options: {} },
  { text: "指导教师：", options: { bold: true } },
  { text: "[导师姓名]", options: {} }
], {
  x: 0.5, y: 5.5, w: "90%", h: 0.4,
  fontSize: 16, color: colors.darkCharcoal, align: "center"
});

slide1.addText("[学校名称] · 2026", {
  x: 0.5, y: 6, w: "90%", h: 0.3,
  fontSize: 16, color: colors.darkCharcoal, align: "center"
});

addFooter(slide1, "结论：聚焦端云协同智能教学平台的工程与研究价值。", "01 / 15");

// Slide 2: Background & Motivation
const slide2 = pres.addSlide();
slide2.background = { color: colors.agedCream };

slide2.addText("BACKGROUND & MOTIVATION", {
  x: 0.7, y: 0.5, w: 11, h: 0.3,
  fontSize: 12, color: colors.accentGold, bold: true
});

slide2.addText("研究背景与动机", {
  x: 0.7, y: 0.85, w: 11, h: 0.6,
  fontSize: 32, color: colors.deepMaroon, bold: true
});

// Left column - icon placeholder
slide2.addText("📚", {
  x: 1, y: 2.5, w: 4, h: 1.5,
  fontSize: 80, align: "center"
});

slide2.addText("传统课堂痛点示意", {
  x: 1, y: 4.2, w: 4, h: 0.3,
  fontSize: 12, color: "666666", align: "center", italic: true
});

// Right column - content boxes
const boxY = 1.8;
const boxH = 1.2;
const boxGap = 0.15;

// Box 1: Teaching Challenges
slide2.addShape(pres.ShapeType.rect, {
  x: 5.5, y: boxY, w: 6.5, h: boxH,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1, pt: 1 }
});

slide2.addText("🔺 高校教学痛点", {
  x: 5.7, y: boxY + 0.15, w: 6, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});

slide2.addText([
  "• 抽象概念难以直观呈现\n",
  "• 答疑反馈平均延迟较高\n",
  "• 作业批改效率低，缺乏个性化指导\n",
  "• 教学资源与管理流程分散"
].join(""), {
  x: 5.7, y: boxY + 0.5, w: 6, h: 0.6,
  fontSize: 13, color: colors.darkCharcoal
});

// Box 2: AI Opportunities
const box2Y = boxY + boxH + boxGap;
slide2.addShape(pres.ShapeType.rect, {
  x: 5.5, y: box2Y, w: 6.5, h: boxH,
  fill: { color: colors.white },
  line: { color: colors.accentGold, width: 1, pt: 1 }
});

slide2.addText("🚀 AI 技术机遇", {
  x: 5.7, y: box2Y + 0.15, w: 6, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});

slide2.addText([
  "• LLM 通用推理能力可赋能教学全流程\n",
  "• 端侧 NPU 算力普及，支持本地推理\n",
  "• 云端模型可补充复杂分析与多模态能力"
].join(""), {
  x: 5.7, y: box2Y + 0.5, w: 6, h: 0.6,
  fontSize: 13, color: colors.darkCharcoal
});

// Box 3: Edge-Cloud Necessity
const box3Y = box2Y + boxH + boxGap;
slide2.addShape(pres.ShapeType.rect, {
  x: 5.5, y: box3Y, w: 6.5, h: 0.9,
  fill: { color: colors.white },
  line: { color: "2c3e50", width: 1, pt: 1 }
});

slide2.addText("⚖️ 端云协同必要性", {
  x: 5.7, y: box3Y + 0.15, w: 6, h: 0.3,
  fontSize: 16, color: colors.deepMaroon, bold: true
});

slide2.addText("平衡隐私安全、响应速度与计算成本，形成教学场景下的最优工程解。", {
  x: 5.7, y: box3Y + 0.5, w: 6, h: 0.3,
  fontSize: 13, color: colors.darkCharcoal
});

addFooter(slide2, "结论：端云协同是性能、成本、隐私的平衡解。", "02 / 15");

// Slide 3: Research Innovations
const slide3 = pres.addSlide();
slide3.background = { color: colors.agedCream };

slide3.addText("RESEARCH INNOVATIONS", {
  x: 0.7, y: 0.5, w: 11, h: 0.3,
  fontSize: 12, color: colors.accentGold, bold: true
});

slide3.addText("研究创新点提炼", {
  x: 0.7, y: 0.85, w: 11, h: 0.6,
  fontSize: 32, color: colors.deepMaroon, bold: true
});

slide3.addText("总体目标：构建低延迟、高隐私、低成本的通用化 AI 教学基础设施。", {
  x: 0.7, y: 1.6, w: 11, h: 0.4,
  fontSize: 16, color: colors.darkCharcoal, bold: true
});

// Three innovation cards
const cardW = 3.6;
const cardH = 2.8;
const cardY = 2.2;
const cardGap = 0.4;

// Card 1
slide3.addShape(pres.ShapeType.rect, {
  x: 0.7, y: cardY, w: cardW, h: cardH,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1, pt: 2 }
});

slide3.addText("💻 异构 NPU 加速", {
  x: 0.9, y: cardY + 0.2, w: cardW - 0.4, h: 0.4,
  fontSize: 16, color: colors.deepMaroon, bold: true
});

slide3.addText("突破单一硬件限制，实现对 Snapdragon / Ascend / M4 的统一算子映射与推理加速。", {
  x: 0.9, y: cardY + 0.7, w: cardW - 0.4, h: 0.8,
  fontSize: 13, color: colors.darkCharcoal
});

slide3.addShape(pres.ShapeType.rect, {
  x: 1.2, y: cardY + 1.7, w: cardW - 1, h: 0.8,
  fill: { color: "F5E6CC" },
  line: { color: colors.accentGold, width: 1 }
});

slide3.addText("300%", {
  x: 1.2, y: cardY + 1.8, w: cardW - 1, h: 0.4,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});

slide3.addText("能效比提升", {
  x: 1.2, y: cardY + 2.2, w: cardW - 1, h: 0.3,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});

// Card 2
const card2X = 0.7 + cardW + cardGap;
slide3.addShape(pres.ShapeType.rect, {
  x: card2X, y: cardY, w: cardW, h: cardH,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1, pt: 2 }
});

slide3.addText("📊 GraphRAG 增强", {
  x: card2X + 0.2, y: cardY + 0.2, w: cardW - 0.4, h: 0.4,
  fontSize: 16, color: colors.deepMaroon, bold: true
});

slide3.addText("构建"课程-知识点-前置要求"图模型，缓解长程教学逻辑中的检索幻觉。", {
  x: card2X + 0.2, y: cardY + 0.7, w: cardW - 0.4, h: 0.8,
  fontSize: 13, color: colors.darkCharcoal
});

slide3.addShape(pres.ShapeType.rect, {
  x: card2X + 0.5, y: cardY + 1.7, w: cardW - 1, h: 0.8,
  fill: { color: "F5E6CC" },
  line: { color: colors.accentGold, width: 1 }
});

slide3.addText("+24%", {
  x: card2X + 0.5, y: cardY + 1.8, w: cardW - 1, h: 0.4,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});

slide3.addText("复杂问答准确率提升", {
  x: card2X + 0.5, y: cardY + 2.2, w: cardW - 1, h: 0.3,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});

// Card 3
const card3X = card2X + cardW + cardGap;
slide3.addShape(pres.ShapeType.rect, {
  x: card3X, y: cardY, w: cardW, h: cardH,
  fill: { color: colors.white },
  line: { color: colors.deepMaroon, width: 1, pt: 2 }
});

slide3.addText("🛣️ 智能协同路由", {
  x: card3X + 0.2, y: cardY + 0.2, w: cardW - 0.4, h: 0.4,
  fontSize: 16, color: colors.deepMaroon, bold: true
});

slide3.addText("设计基于 Token × Latency 代价函数的动态路由算法，平衡隐私与算力消耗。", {
  x: card3X + 0.2, y: cardY + 0.7, w: cardW - 0.4, h: 0.8,
  fontSize: 13, color: colors.darkCharcoal
});

slide3.addShape(pres.ShapeType.rect, {
  x: card3X + 0.5, y: cardY + 1.7, w: cardW - 1, h: 0.8,
  fill: { color: "F5E6CC" },
  line: { color: colors.accentGold, width: 1 }
});

slide3.addText("Dynamic", {
  x: card3X + 0.5, y: cardY + 1.8, w: cardW - 1, h: 0.4,
  fontSize: 20, color: colors.deepMaroon, bold: true, align: "center"
});

slide3.addText("实时任务分流", {
  x: card3X + 0.5, y: cardY + 2.2, w: cardW - 1, h: 0.3,
  fontSize: 10, color: colors.darkCharcoal, align: "center"
});

// Quote box
slide3.addShape(pres.ShapeType.rect, {
  x: 0.7, y: 5.3, w: 11.6, h: 0.7,
  fill: { color: "F5E6CC" },
  line: { color: colors.accentGold, width: 1 }
});

slide3.addText("💡 本研究不仅完成系统工程实现，更在边缘智能的"异构兼容性"与"教学知识关联性"上给出可验证方案。", {
  x: 0.9, y: 5.4, w: 11.2, h: 0.5,
  fontSize: 14, color: colors.darkCharcoal
});

addFooter(slide3, "结论：创新重点是"异构兼容性 + 教学逻辑关联性"。", "03 / 15");

console.log("Generating slides 1-3...");

// Save presentation
pres.writeFile({ fileName: "/Users/huaodong/graduationDesign/slide-deck/llm-teaching-platform-defense.pptx" })
  .then(() => {
    console.log("✅ PowerPoint created successfully!");
    console.log("📁 Location: /Users/huaodong/graduationDesign/slide-deck/llm-teaching-platform-defense.pptx");
  })
  .catch((err) => {
    console.error("❌ Error creating PowerPoint:", err);
  });

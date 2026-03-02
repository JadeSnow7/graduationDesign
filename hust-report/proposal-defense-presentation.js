const path = require("path");
const PptxGenJS = require("pptxgenjs");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "胡傲东";
pptx.company = "华中科技大学";
pptx.subject = "毕业设计开题答辩";
pptx.title = "基于图增强检索与多智能体协同的智能教学平台设计与实现";

const COLORS = {
  navy: "15304A",
  blue: "2F6690",
  teal: "3A7D7C",
  sand: "F3EFE7",
  cream: "FCFAF6",
  ink: "1E2A32",
  muted: "5C6B73",
  accent: "C97C1A",
  line: "D8D0C2",
  white: "FFFFFF",
  paleBlue: "EAF2F8",
  paleTeal: "EAF6F4",
  paleGold: "F9F1E1",
  paleRose: "F7ECE9",
};

const TITLE_STYLE = {
  fontFace: "Microsoft YaHei",
  bold: true,
  color: COLORS.navy,
  fontSize: 28,
};

const BODY_STYLE = {
  fontFace: "Microsoft YaHei",
  color: COLORS.ink,
  fontSize: 14,
  margin: 0.06,
  valign: "top",
};

function asset(...parts) {
  return path.resolve(__dirname, ...parts);
}

function addPageFrame(slide, pageNo, section) {
  slide.background = { color: COLORS.cream };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 0.34,
    fill: { color: COLORS.navy },
    line: { color: COLORS.navy },
  });
  slide.addText(section, {
    x: 0.45,
    y: 0.1,
    w: 3.3,
    h: 0.18,
    fontFace: "Microsoft YaHei",
    fontSize: 10,
    bold: true,
    color: COLORS.white,
    margin: 0,
  });
  slide.addText(String(pageNo).padStart(2, "0"), {
    x: 12.45,
    y: 7.02,
    w: 0.45,
    h: 0.18,
    fontFace: "Consolas",
    fontSize: 10,
    color: COLORS.muted,
    align: "right",
    margin: 0,
  });
}

function addTitle(slide, title, subtitle = "") {
  slide.addText(title, {
    x: 0.55,
    y: 0.55,
    w: 8.8,
    h: 0.5,
    ...TITLE_STYLE,
    margin: 0,
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.58,
      y: 1.02,
      w: 9.8,
      h: 0.28,
      fontFace: "Microsoft YaHei",
      fontSize: 11,
      color: COLORS.muted,
      italic: true,
      margin: 0,
    });
  }
}

function addCard(slide, opts) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x: opts.x,
    y: opts.y,
    w: opts.w,
    h: opts.h,
    rectRadius: 0.08,
    fill: { color: opts.fill || COLORS.white, transparency: opts.transparency || 0 },
    line: { color: opts.line || COLORS.line, pt: 1 },
  });
  if (opts.title) {
    slide.addText(opts.title, {
      x: opts.x + 0.16,
      y: opts.y + 0.12,
      w: opts.w - 0.32,
      h: 0.22,
      fontFace: "Microsoft YaHei",
      fontSize: 14,
      bold: true,
      color: opts.titleColor || COLORS.navy,
      margin: 0,
    });
  }
  if (opts.body) {
    slide.addText(opts.body, {
      x: opts.x + 0.16,
      y: opts.y + (opts.title ? 0.42 : 0.16),
      w: opts.w - 0.32,
      h: opts.h - (opts.title ? 0.54 : 0.32),
      ...BODY_STYLE,
      color: opts.bodyColor || COLORS.ink,
      fontSize: opts.fontSize || 13,
      breakLine: false,
    });
  }
}

function addBullets(slide, title, items, x, y, w, h, fill) {
  addCard(slide, {
    x,
    y,
    w,
    h,
    fill,
    title,
    body: items.map((item) => `• ${item}`).join("\n"),
  });
}

function addImageCard(slide, title, imagePath, x, y, w, h, caption) {
  addCard(slide, { x, y, w, h, fill: COLORS.white, title });
  slide.addImage({
    path: imagePath,
    x: x + 0.18,
    y: y + 0.46,
    w: w - 0.36,
    h: h - 0.92,
  });
  if (caption) {
    slide.addText(caption, {
      x: x + 0.18,
      y: y + h - 0.34,
      w: w - 0.36,
      h: 0.15,
      fontFace: "Microsoft YaHei",
      fontSize: 9,
      color: COLORS.muted,
      align: "center",
      margin: 0,
    });
  }
}

function addNotes(slide, text) {
  slide.addNotes(text.trim());
}

// Slide 1
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.navy };
  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: 13.333,
    h: 7.5,
    fill: { color: COLORS.navy },
    line: { color: COLORS.navy },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.65,
    y: 0.8,
    w: 5.6,
    h: 0.08,
    fill: { color: COLORS.accent },
    line: { color: COLORS.accent },
  });
  slide.addText("华中科技大学毕业设计开题答辩", {
    x: 0.68,
    y: 1.0,
    w: 4.5,
    h: 0.25,
    fontFace: "Microsoft YaHei",
    fontSize: 14,
    bold: true,
    color: "D8E6F0",
    margin: 0,
  });
  slide.addText("基于图增强检索与多智能体协同的\n智能教学平台设计与实现", {
    x: 0.68,
    y: 1.45,
    w: 7.0,
    h: 1.2,
    fontFace: "Microsoft YaHei",
    fontSize: 24,
    bold: true,
    color: COLORS.white,
    margin: 0,
    breakLine: false,
  });
  slide.addText("主验证场景：研究生《学术规范与专业写作》课程", {
    x: 0.72,
    y: 2.85,
    w: 5.5,
    h: 0.24,
    fontFace: "Microsoft YaHei",
    fontSize: 12,
    color: "CFE0EC",
    italic: true,
    margin: 0,
  });
  addCard(slide, {
    x: 0.72,
    y: 3.4,
    w: 2.45,
    h: 1.05,
    fill: "1E4668",
    line: "315B80",
    title: "研究对象",
    titleColor: COLORS.white,
    body: "智能教学平台\n图增强混合检索\n多智能体闭环仲裁",
    bodyColor: "EAF2F8",
  });
  addCard(slide, {
    x: 3.35,
    y: 3.4,
    w: 2.45,
    h: 1.05,
    fill: "1E4668",
    line: "315B80",
    title: "研究边界",
    titleColor: COLORS.white,
    body: "平台为载体\n算法为内核\nEdge/端云协同为基础",
    bodyColor: "EAF2F8",
  });
  addCard(slide, {
    x: 5.98,
    y: 3.4,
    w: 2.45,
    h: 1.05,
    fill: "1E4668",
    line: "315B80",
    title: "核心问题",
    titleColor: COLORS.white,
    body: "多跳检索\n协同稳定性\n可信生成权衡",
    bodyColor: "EAF2F8",
  });
  addCard(slide, {
    x: 9.0,
    y: 1.15,
    w: 3.55,
    h: 4.6,
    fill: "163957",
    line: "315B80",
  });
  slide.addText("答辩信息", {
    x: 9.28,
    y: 1.45,
    w: 1.2,
    h: 0.22,
    fontFace: "Microsoft YaHei",
    fontSize: 15,
    bold: true,
    color: COLORS.white,
    margin: 0,
  });
  slide.addText("答辩人：胡傲东\n专业：集成电路设计与集成系统\n指导教师：聂彦\n日期：2026 年 3 月", {
    x: 9.28,
    y: 1.9,
    w: 2.7,
    h: 1.2,
    fontFace: "Microsoft YaHei",
    fontSize: 14,
    color: "DCE9F2",
    margin: 0,
  });
  slide.addText("平台叙事：系统载体 + 算法内核\n答辩主线：问题 -> 方法 -> 证据 -> 可行性", {
    x: 9.28,
    y: 3.55,
    w: 2.75,
    h: 0.9,
    fontFace: "Microsoft YaHei",
    fontSize: 13,
    color: "DCE9F2",
    margin: 0,
  });
  slide.addText("Graph-Enhanced Retrieval\nMulti-Agent Verification\nTrustworthy Teaching Platform", {
    x: 9.28,
    y: 4.8,
    w: 2.75,
    h: 0.7,
    fontFace: "Consolas",
    fontSize: 11,
    color: "A9C3D7",
    margin: 0,
  });
  addNotes(slide, `
【演讲稿】
各位老师好，我汇报的题目是“基于图增强检索与多智能体协同的智能教学平台设计与实现”。

这次开题的主验证场景聚焦研究生《学术规范与专业写作》课程。我的汇报重点不是泛泛介绍平台，而是回答三个问题：为什么传统教学问答在复杂场景下不够用，为什么需要图增强检索，为什么多智能体必须具备闭环核验与回退机制。

平台是验证载体，图增强混合检索和多智能体闭环仲裁是两项核心研究模块。Edge AI、端云协同与 StreamId 等内容会放到备份页，作为已有工程基础说明。
  `);
}

// Slide 2
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 2, "研究背景");
  addTitle(slide, "背景与问题", "主场景固定为研究生《学术规范与专业写作》，避免多场景并列导致研究边界失焦。");
  addBullets(slide, "问题一：多跳知识检索不足", [
    "写作辅导问题往往同时涉及任务类型、学术规范、案例片段与历史反馈",
    "纯向量检索容易只命中表层语义相似片段，缺少完整证据链",
    "结果是回答相关但不充分，引用存在缺失或错配",
  ], 0.58, 1.55, 4.0, 1.75, COLORS.paleBlue);
  addBullets(slide, "问题二：多智能体推理稳定性不足", [
    "任务拆解、检索、生成与核验若只靠单轮 prompt，容易出现不收敛",
    "没有明确的停止规则时，系统可能重复回退但无法显著提升结果质量",
    "教育场景更需要可解释失败方式，而不是继续输出不可靠结论",
  ], 4.7, 1.55, 4.0, 1.75, COLORS.paleTeal);
  addBullets(slide, "问题三：可信生成与用户体验存在权衡", [
    "严格证据约束能降低幻觉，但可能提高拒答率",
    "过于宽松又会损害 groundedness",
    "需要在引用覆盖率、任务完成率和响应成本之间寻找平衡",
  ], 8.82, 1.55, 3.95, 1.75, COLORS.paleGold);
  addCard(slide, {
    x: 0.58,
    y: 3.58,
    w: 7.05,
    h: 2.25,
    fill: COLORS.white,
    title: "为什么选择《学术规范与专业写作》作为主验证场景",
    body: "该课程天然包含规范条款、范文片段、常见错误与教师反馈等高价值语料，适合构建课程知识图与证据索引；同时，学生问题常涉及写作目标、结构、引用与语言风格的综合判断，具有典型的多跳推理特征；生成结果必须具备可追溯性，正好对应本课题对可信生成的研究目标。",
  });
  addCard(slide, {
    x: 7.82,
    y: 3.58,
    w: 4.95,
    h: 2.25,
    fill: COLORS.paleRose,
    title: "研究主线",
    body: "RQ1：如何提升多跳召回？\nRQ2：如何让协同推理稳定收敛？\nRQ3：如何在可信度与完成率之间建立平衡？\n\n对应模块：图增强混合检索 + 多智能体闭环仲裁 + 引用覆盖率治理。",
  });
  addNotes(slide, `
【演讲稿】
本课题关注的是教育场景里最容易被忽略的三个核心问题。

第一，很多写作辅导问题不是单跳问答，而是需要在课程规范、范文片段、任务目标和历史反馈之间建立关联，纯向量检索很容易丢掉关键中间证据。

第二，引入多智能体并不自动等于更可靠。如果没有明确的核验和停止规则，多代理协作可能只是把错误流程放大。

第三，教育场景不能一味追求“有证据才说”，也不能因为追求流畅回答而牺牲可靠性，因此需要研究引用覆盖率、拒答率和任务完成率之间的平衡。
  `);
}

// Slide 3
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 3, "研究框架");
  addTitle(slide, "RQ 与研究框架", "采用“研究问题 - 假设 - 方法 - 指标”一体化设计，避免开题后研究目标漂移。");

  const headers = ["RQ", "研究假设", "核心方法", "核心指标", "预期趋势"];
  const rows = [
    ["RQ1", "基于名次的 RRF 融合能比线性加权更稳定地整合向量与图扩展信号", "Dense Retrieval + Graph Expansion + RRF", "nDCG@10 / Multi-hop Recall", "RRF 优于线性融合"],
    ["RQ2", "规则 + NLI 的 Verifier 闭环可在有限回退轮次内提升事实一致性", "Planner / Reasoner / Verifier", "Faithfulness / Groundedness / P95 Latency", "闭环优于无核验流水线"],
    ["RQ3", "引用覆盖率阈值可在可信度与完成率之间形成可接受平衡区间", "τ 扫描 + 澄清/拒答/最小结论", "拒答率 / 任务完成率 / Groundedness", "存在最优阈值区间"],
  ];

  const startX = 0.58;
  const startY = 1.55;
  const colW = [0.8, 3.05, 2.55, 2.55, 2.85];
  let cursorX = startX;
  headers.forEach((header, idx) => {
    slide.addShape(pptx.ShapeType.rect, {
      x: cursorX,
      y: startY,
      w: colW[idx],
      h: 0.46,
      fill: { color: COLORS.navy },
      line: { color: COLORS.white, pt: 0.5 },
    });
    slide.addText(header, {
      x: cursorX + 0.06,
      y: startY + 0.1,
      w: colW[idx] - 0.12,
      h: 0.18,
      fontFace: "Microsoft YaHei",
      fontSize: 11,
      bold: true,
      color: COLORS.white,
      align: "center",
      margin: 0,
    });
    cursorX += colW[idx];
  });

  rows.forEach((row, rowIdx) => {
    let x = startX;
    row.forEach((cell, colIdx) => {
      slide.addShape(pptx.ShapeType.rect, {
        x,
        y: startY + 0.46 + rowIdx * 1.08,
        w: colW[colIdx],
        h: 1.08,
        fill: { color: rowIdx % 2 === 0 ? COLORS.white : COLORS.sand },
        line: { color: COLORS.line, pt: 0.5 },
      });
      slide.addText(cell, {
        x: x + 0.08,
        y: startY + 0.58 + rowIdx * 1.08,
        w: colW[colIdx] - 0.16,
        h: 0.78,
        fontFace: "Microsoft YaHei",
        fontSize: colIdx === 0 ? 12 : 10.5,
        bold: colIdx === 0,
        color: colIdx === 0 ? COLORS.navy : COLORS.ink,
        align: colIdx === 0 ? "center" : "left",
        margin: 0,
        valign: "mid",
      });
      x += colW[colIdx];
    });
  });

  addCard(slide, {
    x: 0.58,
    y: 5.4,
    w: 12.18,
    h: 1.15,
    fill: COLORS.paleGold,
    title: "设计原则",
    body: "先确定主场景与系统边界，再围绕三个 RQ 展开实验设计。平台是验证载体，核心研究只聚焦图增强混合检索与多智能体闭环仲裁两项模块，引文覆盖率属于系统治理策略，不再包装为独立原创算法。",
  });
  addNotes(slide, `
【演讲稿】
这一页是整份开题的骨架。

我将研究内容压缩成三个可测的问题。RQ1 关注检索层，RQ2 关注协同推理层，RQ3 关注生成治理层。每个问题都对应明确的假设、方法和指标，这样后续实验就不会出现“方法很多，但不知道到底在验证什么”的情况。
  `);
}

// Slide 4
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 4, "系统定位");
  addTitle(slide, "系统定位与总体架构", "平台是研究载体，算法模块是研究内核；Edge AI / StreamId 等内容降级为已有工程基础。");
  addBullets(slide, "研究边界", [
    "做的是智能教学平台设计与实现，不是纯算法论文",
    "平台层提供稳定实验载体，研究层只展开两项核心模块",
    "《电磁场与电磁波》仅作为扩展场景，不进入主评测",
  ], 0.58, 1.55, 4.0, 1.55, COLORS.paleBlue);
  addBullets(slide, "核心研究模块", [
    "图增强混合检索：解决多跳召回与异构信号融合问题",
    "多智能体闭环仲裁：解决协同推理稳定性与事实一致性问题",
    "引用覆盖率治理：作为可信生成的系统策略",
  ], 0.58, 3.35, 4.0, 1.75, COLORS.paleTeal);
  addBullets(slide, "工程支撑模块", [
    "前端、后端、AI 服务、知识库、可视化、部署能力已存在",
    "多智能体与 GraphRAG 原型已形成代码基础",
    "开题后的主要工作是方法深化与实验验证",
  ], 0.58, 5.35, 4.0, 1.45, COLORS.paleGold);
  addImageCard(
    slide,
    "总体架构复用图",
    asset("slide-images", "slide-07-architecture.png"),
    4.88,
    1.55,
    7.9,
    5.25,
    "图示强调“平台载体 + 核心研究模块”的双层结构"
  );
  addNotes(slide, `
【演讲稿】
答辩时评委通常会先问“你到底做系统还是做算法”。我的回答是：这是一个智能教学平台设计与实现课题，但研究深度集中在两个算法内核上。

左侧列出了研究边界：平台是载体，图增强混合检索和多智能体闭环仲裁是两项核心研究模块。右侧的总体架构图对应这一定位，工程支撑层已经存在，因此后续工作重心不是从零搭平台，而是把核心模块做实、做可测、做可辩护。
  `);
}

// Slide 5
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 5, "前期基础");
  addTitle(slide, "前期工作基础", "已有系统不是从零开始：当前仓库已具备平台原型、GraphRAG 原型、多智能体实验基础和训练链路。");

  const stats = [
    { title: "frontend", value: "60,268", note: "React + TypeScript + Vite" },
    { title: "backend", value: "16,327", note: "Go + Gin + GORM" },
    { title: "ai_service", value: "18,312", note: "FastAPI + GraphRAG" },
    { title: "主要代码总量", value: "199,927", note: "多语言混合" },
  ];

  stats.forEach((item, idx) => {
    const x = 0.58 + idx * 3.02;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 1.6,
      w: 2.72,
      h: 1.1,
      fill: { color: idx % 2 === 0 ? COLORS.paleBlue : COLORS.paleTeal },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(item.title, {
      x: x + 0.12,
      y: 1.76,
      w: 2.4,
      h: 0.18,
      fontFace: "Microsoft YaHei",
      fontSize: 11,
      bold: true,
      color: COLORS.navy,
      align: "center",
      margin: 0,
    });
    slide.addText(item.value, {
      x: x + 0.12,
      y: 1.98,
      w: 2.4,
      h: 0.24,
      fontFace: "Consolas",
      fontSize: 20,
      bold: true,
      color: COLORS.blue,
      align: "center",
      margin: 0,
    });
    slide.addText(item.note, {
      x: x + 0.12,
      y: 2.28,
      w: 2.4,
      h: 0.16,
      fontFace: "Microsoft YaHei",
      fontSize: 9.5,
      color: COLORS.muted,
      align: "center",
      margin: 0,
    });
  });

  addBullets(slide, "与课题直接相关的现有模块", [
    "GraphRAG 模块：build.py / ingest.py / retrieve.py / reranker.py / updater.py",
    "多智能体原型：dispatcher / researcher / synthesizer / join_findings / graph builder",
    "现有页面：WritingPage / TeacherWritingDashboard / MultiAgentChatPage",
  ], 0.58, 3.05, 5.85, 1.9, COLORS.white);

  addBullets(slide, "阶段验证与工程基础", [
    "训练、回归、文档同步链路已打通，具备继续扩展课程数据与实验的基础",
    "OpenAI-compatible Qwen 系列接口已用于工程验证",
    "GraphRAG-X 与多智能体原型可作为开题后的实验底座",
  ], 0.58, 5.2, 5.85, 1.35, COLORS.paleGold);

  addCard(slide, {
    x: 6.65,
    y: 3.05,
    w: 6.12,
    h: 3.5,
    fill: COLORS.white,
    title: "为什么这些基础能直接提升可行性",
    body: "本课题开题后的主要工作不再是从零搭建教学平台，而是聚焦完成两项研究模块的深化：\n\n1. 在已有知识库与 GraphRAG 原型上补全图扩展、RRF 融合与课程场景评测；\n2. 在已有多智能体原型上增加 Verifier、回退和停止规则；\n3. 依托现有页面、服务与文档基础组织可复现实验与系统展示。\n\n因此，开题的关键不是证明“能不能做一个平台”，而是证明“能不能在既有平台上完成两项核心研究任务”。",
  });
  addNotes(slide, `
【演讲稿】
这一页用于直接回应“你是不是还没开始做”的质疑。

从代码规模看，平台原型、后端和 AI 服务已经具备相当基础；从功能看，GraphRAG 模块、多智能体原型和写作辅导页面都已经存在；从流程看，训练、回归和文档同步链路也已经被验证过。

所以，后续 20 周的任务不是从零搭一个新平台，而是在现有系统上完成两项研究模块的深化和正式实验。
  `);
}

// Slide 6
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 6, "创新边界");
  addTitle(slide, "相关工作与创新边界", "本研究强调集成创新，不声称原创 RRF、Verifier 或多智能体范式本身。");
  addBullets(slide, "最接近的相关工作", [
    "RAG / Self-RAG：擅长检索增强，但图结构利用不足",
    "Microsoft GraphRAG / Think-on-Graph / QA-GNN：重视图推理，但生成后核验较弱",
    "CRAG / Reflexion / Multi-Agent Debate：关注纠错或协作，但缺少教育场景中的证据约束一体化设计",
  ], 0.58, 1.55, 5.95, 1.95, COLORS.white);
  addBullets(slide, "本课题的增量", [
    "将图增强混合检索与多智能体闭环仲裁组合到同一教学平台",
    "用 RRF 处理图扩展与向量召回的异构排序融合问题",
    "把引用覆盖率约束纳入生成治理，而不是只做展示层引用",
  ], 0.58, 3.75, 5.95, 1.65, COLORS.paleBlue);
  addBullets(slide, "不做的过度声称", [
    "不把基础方法包装成原创算法",
    "不使用不可证伪的极端表述",
    "不把工程堆叠包装成算法原创",
  ], 0.58, 5.65, 5.95, 1.05, COLORS.paleRose);
  addCard(slide, {
    x: 6.75,
    y: 1.55,
    w: 6.05,
    h: 5.15,
    fill: COLORS.paleGold,
    title: "答辩时的学术化表述",
    body: "更稳妥的表达应为：\n\n• “首次在该教育场景下将图扩展信号与向量检索结果通过 RRF 进行统一排序融合，用于提升课程多跳证据召回。”\n\n• “设计了基于规则与 NLI 的 Verifier 闭环，用于在有限回退轮次内提升协同推理的事实一致性。”\n\n• “本研究的创新不在于单一算法发明，而在于围绕教学场景将检索、协同与证据治理整合为可复现的系统方案。”\n\n这样既能保留研究贡献，又能避免被评委从文献层面直接反驳。",
  });
  addNotes(slide, `
【演讲稿】
这一页专门解决创新性表达问题。

我的处理方式是把创新边界说清楚：RRF 不是我发明的，Verifier 也不是我发明的，但把图增强检索、闭环核验和引用治理集成到同一个教学平台里，并在课程场景下做出可测、可复现的验证，这仍然是有价值的研究贡献。
  `);
}

// Slide 7
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 7, "核心模块一");
  addTitle(slide, "核心模块一：图增强混合检索", "目标是提升课程场景下的多跳证据召回，而不是发明新的通用检索算法。");
  addBullets(slide, "模块流程", [
    "Dense Retrieval：从课程规范、案例片段、教师反馈中做语义召回",
    "Graph Expansion：围绕命中种子在课程知识图中做受限扩展",
    "RRF 融合：用名次而非原始得分统一两类异构信号",
  ], 0.58, 1.55, 4.15, 1.65, COLORS.paleBlue);
  addCard(slide, {
    x: 0.58,
    y: 3.45,
    w: 4.15,
    h: 1.35,
    fill: COLORS.white,
    title: "关键参数与边界",
    body: "RRF 平滑常数 k 的搜索范围设为 [10, 60]，pilot 后固定默认值 40。适用边界是中等规模课程知识图谱与高可信答复场景；代价是检索链路更复杂，需同时报告 P95 延迟。",
  });
  addCard(slide, {
    x: 0.58,
    y: 5.05,
    w: 4.15,
    h: 1.55,
    fill: COLORS.paleGold,
    title: "为什么 RRF 合理",
    body: "图扩展权重与向量相似度的量纲不同，直接线性加权容易受归一化方式影响。RRF 基于排序名次融合，更适合在课程场景中稳定组合异构检索信号。",
  });
  addImageCard(
    slide,
    "检索流程示意",
    asset("slide-images", "slide-09-retrieval.png"),
    4.98,
    1.55,
    7.8,
    5.05,
    "复用现有检索流程图，强调 Dense + Graph + Fusion 三段式结构"
  );
  addNotes(slide, `
【演讲稿】
这一页回答 RQ1。我的重点不是强调“我做了一个复杂的 GraphRAG”，而是强调为什么课程场景需要同时利用语义相似与图结构扩展。

Dense Retrieval 负责找到语义相关的候选片段，Graph Expansion 负责补全推理链条，RRF 负责把两类信号稳定融合。这样做的好处是能减少多跳场景下只命中表层片段的问题。
  `);
}

// Slide 8
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 8, "核心模块二");
  addTitle(slide, "核心模块二：多智能体闭环仲裁", "目标是让协同推理具备可核验、可回退、可停机的行为约束。");
  addBullets(slide, "角色设计", [
    "Planner：任务拆解、判断是否需要检索或澄清",
    "Reasoner：基于检索证据生成候选结论与引用",
    "Verifier：执行规则检查与 NLI 判别",
  ], 0.58, 1.55, 4.1, 1.55, COLORS.paleTeal);
  addBullets(slide, "停止规则", [
    "最大回退轮次 R = 3",
    "若关键主张缺证据或 NLI 判断冲突，则触发回退",
    "若连续回退无明显提升，则转为澄清、最小结论或拒答",
  ], 0.58, 3.35, 4.1, 1.55, COLORS.white);
  addCard(slide, {
    x: 0.58,
    y: 5.15,
    w: 4.1,
    h: 1.45,
    fill: COLORS.paleGold,
    title: "与常见多智能体流程的区别",
    body: "区别不在于“用了多个代理”，而在于显式引入 Verifier、回退规则和停止条件，使系统从接力式流程变为受控闭环流程。",
  });
  addImageCard(
    slide,
    "闭环仲裁示意",
    asset("slide-images", "slide-10-agent-orchestration.png"),
    4.95,
    1.55,
    7.83,
    5.05,
    "复用现有多智能体图示，主讲时聚焦 Planner / Reasoner / Verifier 三角色"
  );
  addNotes(slide, `
【演讲稿】
这一页回答 RQ2。我的核心主张是：多智能体的价值不在于代理数量，而在于有没有明确的核验与回退机制。

因此我把流程收缩成三个关键角色：Planner、Reasoner 和 Verifier。Verifier 不是装饰性的“再问一次模型”，而是基于规则与 NLI 的双重判别器。只有这样，系统才真正具备可解释的回退和停机条件。
  `);
}

// Slide 9
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 9, "实验设计");
  addTitle(slide, "实验设计与评估指标", "主数据集只使用《学术规范与专业写作》课程材料；HotpotQA 仅作泛化验证，不作主评测。");
  addBullets(slide, "数据集与样本规模", [
    "开题阶段：20 条 pilot case，用于快速验证链路是否跑通",
    "可行性评测：100 条课程样本，作为正式对照与消融实验基础",
    "论文阶段：扩展到 300 条样本；HotpotQA 子集只做泛化验证",
  ], 0.58, 1.55, 4.05, 1.6, COLORS.paleBlue);
  addBullets(slide, "对照与消融", [
    "检索组：Dense RAG / 图扩展 + 线性融合 / 图扩展 + RRF",
    "仲裁组：无 Verifier / 规则 Verifier / 规则 + NLI Verifier",
    "阈值扫描：τ ∈ [0.4, 0.8]，步长 0.1",
  ], 0.58, 3.45, 4.05, 1.6, COLORS.paleTeal);
  addBullets(slide, "评价指标", [
    "nDCG@10、Multi-hop Recall",
    "Faithfulness、Groundedness",
    "P95 Latency、拒答率、任务完成率",
  ], 0.58, 5.35, 4.05, 1.25, COLORS.paleGold);
  addCard(slide, {
    x: 4.9,
    y: 1.55,
    w: 7.88,
    h: 5.05,
    fill: COLORS.white,
    title: "实验逻辑闭环",
    body: "RQ1 对应检索对照实验：重点看 RRF 是否比线性融合更稳地提升课程多跳召回。\n\nRQ2 对应仲裁消融实验：重点看 Verifier 是否能在可控时延下提升事实一致性，以及 NLI 相对纯规则判别的增量价值。\n\nRQ3 对应阈值扫描实验：重点看引用覆盖率约束在提升 groundedness 的同时，是否将任务完成率维持在可接受区间。\n\n当前原型使用 Qwen 系列 OpenAI-compatible 接口做工程验证，开题阶段固定一套主 backbone，优先验证方法有效性而非模型排行榜表现。",
  });
  addNotes(slide, `
【演讲稿】
实验设计我做了两项收缩。

第一，只保留一个主场景，也就是《学术规范与专业写作》课程。这样数据、指标和问题定义都更集中。

第二，把实验分成三类：检索对照、仲裁消融和阈值扫描。这样每个 RQ 都有明确的验证路径，实验量也更符合 20 周周期内的可执行范围。
  `);
}

// Slide 10
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 10, "可行性");
  addTitle(slide, "可行性、风险与降级方案", "把“做得完”作为一项显式设计目标，而不是事后解释。");
  addBullets(slide, "为什么这次范围可控", [
    "核心研究内容缩减为两个模块：图增强混合检索 + 多智能体闭环仲裁",
    "平台原型、知识库原型和多智能体原型已经存在",
    "Edge AI / StreamId / 端云协同退出主讲，只保留为工程基础",
  ], 0.58, 1.55, 4.25, 1.7, COLORS.paleBlue);
  addBullets(slide, "主要风险", [
    "范围失控：若继续并行推进端云协同与桌面端协议，将明显超载",
    "时间不足：数据清洗、实验和论文撰写可能挤压",
    "NLI 不稳定：教育写作场景下可能误判",
  ], 0.58, 3.55, 4.25, 1.7, COLORS.paleRose);
  addBullets(slide, "降级方案", [
    "若时间不足，优先保证图增强检索与 Verifier 闭环跑通",
    "若 NLI 效果不稳定，退化到规则 Verifier",
    "若人工评测资源不足，以自动指标为主、人工抽样为辅",
  ], 0.58, 5.55, 4.25, 1.15, COLORS.paleGold);
  addCard(slide, {
    x: 5.1,
    y: 1.55,
    w: 7.68,
    h: 5.15,
    fill: COLORS.white,
    title: "20 周内的最小可完成闭环",
    body: "第 1-2 周：确定课程语料、整理 20 条 pilot case、完成知识图初版。\n\n第 3-6 周：完成图扩展与 RRF 融合，跑出检索对照结果。\n\n第 7-10 周：完成 Planner / Reasoner / Verifier 闭环实现与阈值校准。\n\n第 11-14 周：构建 100 条可行性样本，完成主实验与消融实验。\n\n第 15-20 周：做阈值扫描、误差分析、论文整理与答辩材料准备。\n\n这一路线的关键在于：任何时候都优先保证“系统能跑 + 结果可测 + 结论可答辩”。",
  });
  addNotes(slide, `
【演讲稿】
这一页的重点是主动承认风险，并给出降级策略。

我把最重要的风险明确写成了两项：范围失控和时间不足。对应的解决思路是主动收窄主线，只保留两个研究模块，把其他工程内容降级为备份材料。这样一来，20 周周期就变成“紧凑但可完成”，而不是“全面铺开但很难收口”。
  `);
}

// Slide 11
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 11, "计划安排");
  addTitle(slide, "进度安排与预期成果", "报告与 PPT 统一采用 20 周周制时间轴。");

  const phases = [
    { week: "1-2", task: "课程语料筛选\npilot 样本设计\n知识图初版", color: COLORS.paleBlue },
    { week: "3-6", task: "图扩展与 RRF 融合\n检索对照实验", color: COLORS.paleTeal },
    { week: "7-10", task: "闭环仲裁实现\nVerifier 与阈值校准", color: COLORS.paleGold },
    { week: "11-14", task: "100 条可行性验证集\n主实验与消融实验", color: COLORS.paleRose },
    { week: "15-20", task: "阈值扫描\n误差分析\n论文与答辩材料", color: COLORS.sand },
  ];

  phases.forEach((phase, idx) => {
    const x = 0.62 + idx * 2.5;
    slide.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 2.0,
      w: 2.2,
      h: 2.15,
      fill: { color: phase.color },
      line: { color: COLORS.line, pt: 1 },
    });
    slide.addText(`周次 ${phase.week}`, {
      x: x + 0.12,
      y: 2.18,
      w: 1.96,
      h: 0.2,
      fontFace: "Consolas",
      fontSize: 12,
      bold: true,
      color: COLORS.blue,
      align: "center",
      margin: 0,
    });
    slide.addText(phase.task, {
      x: x + 0.12,
      y: 2.55,
      w: 1.96,
      h: 1.3,
      fontFace: "Microsoft YaHei",
      fontSize: 13,
      color: COLORS.ink,
      align: "center",
      valign: "mid",
      margin: 0,
    });
  });

  addBullets(slide, "预期成果", [
    "智能教学平台原型：聚焦《学术规范与专业写作》课程辅导",
    "图增强混合检索模块：完成对照与消融实验",
    "多智能体闭环仲裁模块：完成规则与 NLI 双判别验证",
    "毕业论文、答辩 PPT 与复现实验说明",
  ], 0.62, 4.55, 7.15, 1.75, COLORS.white);

  addCard(slide, {
    x: 8.0,
    y: 4.55,
    w: 4.78,
    h: 1.75,
    fill: COLORS.paleGold,
    title: "最终交付标准",
    body: "能清楚回答“做了什么系统”“研究了哪两个核心模块”“实验如何验证”“若被问到创新与可行性时如何自洽”。",
  });
  addNotes(slide, `
【演讲稿】
这一页只做两件事：明确时间表，明确交付物。

我把任务拆成五段，前半段做方法实现，后半段做正式实验和论文整理。最终交付标准不是“功能越多越好”，而是让系统、实验和答辩口径形成闭环。
  `);
}

// Slide 12
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 12, "结束页");
  addTitle(slide, "总结与 Q&A", "统一结论：这是一个以教学平台为载体、以图增强检索和多智能体闭环仲裁为核心的毕业设计课题。");
  addCard(slide, {
    x: 0.85,
    y: 1.65,
    w: 3.78,
    h: 3.9,
    fill: COLORS.paleBlue,
    title: "结论一：选题聚焦",
    body: "主验证场景固定为《学术规范与专业写作》，不再同时展开多个主场景。\n\n平台是载体，算法是研究重点。",
  });
  addCard(slide, {
    x: 4.78,
    y: 1.65,
    w: 3.78,
    h: 3.9,
    fill: COLORS.paleTeal,
    title: "结论二：方法清晰",
    body: "图增强混合检索解决多跳证据召回问题；\n多智能体闭环仲裁解决协同稳定性与事实一致性问题；\n引用覆盖率治理解决可信生成边界问题。",
  });
  addCard(slide, {
    x: 8.71,
    y: 1.65,
    w: 3.78,
    h: 3.9,
    fill: COLORS.paleGold,
    title: "结论三：可行性可辩护",
    body: "已有平台原型、GraphRAG 原型、多智能体原型与训练链路基础；\n20 周范围收窄后，工作量紧凑但可完成。",
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.15,
    y: 6.05,
    w: 11.05,
    h: 0.62,
    fill: { color: COLORS.navy },
    line: { color: COLORS.navy },
  });
  slide.addText("欢迎各位老师批评指正", {
    x: 1.2,
    y: 6.18,
    w: 10.95,
    h: 0.22,
    fontFace: "Microsoft YaHei",
    fontSize: 20,
    bold: true,
    color: COLORS.white,
    align: "center",
    margin: 0,
  });
  addNotes(slide, `
【演讲稿】
最后我用三句话收束整个开题。

第一，这是一个聚焦单主场景的智能教学平台课题。
第二，研究重点明确落在图增强混合检索和多智能体闭环仲裁两项核心模块上。
第三，项目已经有较强的工程基础，因此后续 20 周的关键是做实实验和结论，而不是继续扩大功能范围。

我的汇报结束，请各位老师批评指正。
  `);
}

// Slide 13 backup
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 13, "备份页");
  addTitle(slide, "备份页 A：已有工程基础（非本次核心研究内容）", "Edge AI / StreamId / 端云协同属于既有工程探索，可作为答辩追问时的补充说明。");
  addBullets(slide, "保留这些内容的原因", [
    "说明平台不是纸面构想，而是有较完整工程积累",
    "解释为何已有桌面端、路由和流式交互相关技术储备",
    "但它们不进入本次开题的主研究问题与主实验设计",
  ], 0.58, 1.55, 4.05, 1.6, COLORS.paleBlue);
  addBullets(slide, "当前角色定位", [
    "作为平台工程基础，支撑未来扩展到更多终端形态",
    "用于说明已有跨端能力与流式交互经验",
    "不作为“创新点一/二/三”在本次主讲中展开",
  ], 0.58, 3.45, 4.05, 1.6, COLORS.paleGold);
  addCard(slide, {
    x: 4.9,
    y: 1.55,
    w: 7.88,
    h: 5.05,
    fill: COLORS.white,
    title: "答辩时的表述方式",
    body: "如果老师问到端云协同、Edge AI 或 StreamId，可以统一回答：\n\n“这些内容属于我在平台工程上的既有探索，证明系统载体与流式交互能力已经具备。但为了保证开题范围可控，我将本次核心研究内容收敛为图增强混合检索与多智能体闭环仲裁两项模块。也就是说，它们是工程基础，而不是本次答辩的主线研究问题。”",
  });
}

// Slide 14 backup
{
  const slide = pptx.addSlide();
  addPageFrame(slide, 14, "备份页");
  addTitle(slide, "备份页 B：高频追问与建议答法", "用于处理创新性、场景选择与可行性方面的高概率追问。");
  addCard(slide, {
    x: 0.58,
    y: 1.55,
    w: 6.0,
    h: 2.05,
    fill: COLORS.paleBlue,
    title: "Q1：RRF 不是原创，为什么还能算贡献？",
    body: "答：RRF 算法本身不是我的贡献。我的贡献在于将它用于课程场景中的图-向量异构检索融合，解决向量相似度与图扩展权重量纲不一致的问题，并通过实验验证这一选择在多跳证据召回上的合理性。",
  });
  addCard(slide, {
    x: 6.78,
    y: 1.55,
    w: 6.0,
    h: 2.05,
    fill: COLORS.paleTeal,
    title: "Q2：你和 CRAG 的区别是什么？",
    body: "答：CRAG 更强调检索阶段的纠错与补检索；我的工作重点是生成后的证据核验与受限回退。两者都关注可靠性，但作用点不同：CRAG 更像检索质量控制，我的 Verifier 更像面向教学场景的生成后仲裁机制。",
  });
  addCard(slide, {
    x: 0.58,
    y: 4.0,
    w: 6.0,
    h: 2.05,
    fill: COLORS.paleGold,
    title: "Q3：为什么选择教育场景，而不是通用问答？",
    body: "答：教育场景对证据可追溯性、答案边界和解释性要求更高，更能放大检索与核验机制的价值。《学术规范与专业写作》课程又天然包含规范、范文和反馈数据，适合做系统化验证。",
  });
  addCard(slide, {
    x: 6.78,
    y: 4.0,
    w: 6.0,
    h: 2.05,
    fill: COLORS.paleRose,
    title: "Q4：20 周真的能做完吗？",
    body: "答：如果把平台所有工程方向都算进核心任务，肯定做不完；但现在我已经明确收窄为两个研究模块，并且已有平台、GraphRAG 原型和多智能体原型作为基础，所以 20 周的重点是方法深化与实验验证，工作量是可控的。",
  });
}

pptx.writeFile({ fileName: asset("proposal-defense-presentation.pptx") })
  .then(() => {
    console.log("Generated proposal-defense-presentation.pptx");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

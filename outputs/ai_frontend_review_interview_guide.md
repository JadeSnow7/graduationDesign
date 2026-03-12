# AI 前端复习、速查与面试模拟手册

面向岗位：`AI前端开发工程师`

候选人项目主线：
- 剪映客户端 AI 视频生成系统：端到端生成链路、长任务编排、暂停/恢复/重试、实时预览
- GraphRAG + Multi-Agent AI 教学平台：React + Vite + Tauri/Electron + Go/Gin + Docker
- 跨层能力：前端 UI、SSE 流式输出、状态管理、Electron/Tauri 本地模型桥接、共享 TypeScript 类型

---

## 仓库分析摘要

本仓库里和 AI 前端最相关的模块主要有：

- `code/frontend`
  - React 19 + TypeScript + Vite + Tailwind + Ant Design
  - React Router 路由管理
  - Zustand 持久化聊天与 AI 配置
  - 本地/云端协同推理、流式输出、AI 设置面板
- `code/shared`
  - 共享 SDK 与类型定义
  - AI 消息、编排请求、推理元数据、SSE 事件模型
- `code/frontend/electron`
  - Electron IPC 桥接本地模型
  - 渲染进程和主进程的本地推理通信
- `code/desktop-tauri`
  - Tauri 桌面壳，前端构建产物复用到桌面端
- `code/mobile`
  - React Native / Expo 跨平台移动端
  - 导航、状态持久化、企业微信免登
- `graphrag-x/ui`
  - GraphRAG 调试工作台
  - SSE 解析、Reducer 状态流、流式回答缓冲

仓库里提取出的高频面试技术点：

- HTML 入口页主题预注入、`textarea`/`input`/`button`/`form` 等表单元素
- CSS 变量主题系统、深浅色模式、Flex 布局、动画、响应式布局
- JavaScript 异步流处理、`AbortController`、`localStorage`、`navigator.onLine`
- TypeScript 联合类型、接口、类型别名、`keyof`、泛型风格 API、严格事件建模
- React Hooks、Reducer、Context、Zustand、Router、Error Boundary
- SSE 流式输出、多 Agent thought 事件、Electron IPC、本地模型桥接

可直接拿来举例的仓库文件：

- `code/frontend/index.html`
- `code/frontend/src/app/router.tsx`
- `code/frontend/src/pages/ChatPage.tsx`
- `code/frontend/src/pages/MultiAgentChatPage.tsx`
- `code/frontend/src/hooks/useOrchestratedChat.ts`
- `code/frontend/src/hooks/useInferenceRouter.ts`
- `code/frontend/src/hooks/useLocalInference.ts`
- `code/frontend/src/lib/ai-stream.ts`
- `code/frontend/src/domains/chat/useChatStore.ts`
- `code/frontend/src/pages/AISettingsPage.tsx`
- `code/frontend/src/pages/LocalAIHubPage.tsx`
- `code/frontend/src/styles/theme.css`
- `graphrag-x/ui/src/api/sse.ts`
- `graphrag-x/ui/src/state/workbenchReducer.ts`
- `graphrag-x/ui/src/state/WorkbenchContext.tsx`

---

## HTML5

### 核心知识点

- 语义化标签：`header` `main` `section` `article` `nav` `aside` `footer`
- 表单元素：`form` `input` `textarea` `select` `button` `label`
- 媒体与图形：`audio` `video` `canvas` `svg`
- 入口文档结构：`<!doctype html>`、`meta charset`、`meta viewport`
- 脚本加载：`type="module"`、`async`、`defer`
- 本地存储：`localStorage`、`sessionStorage`
- 无障碍与可维护性：语义结构、可点击区域、占位文案、错误提示

### 仓库中使用实例

- `code/frontend/index.html`
  - 通过内联脚本在 React 挂载前读取 `localStorage` 中的 `theme-mode`
  - 提前设置 `document.documentElement.classList` 和 `colorScheme`
  - 解决主题闪烁问题
- `code/frontend/src/pages/ChatPage.tsx`
  - 使用 `form` + `input` + `button`
  - 提交时调用 `preventDefault()`，典型表单交互
- `code/frontend/src/pages/MultiAgentChatPage.tsx`
  - 使用 `textarea` 处理长文本 Prompt 输入
- `code/frontend/src/pages/AISettingsPage.tsx`
  - 表单项覆盖 `Input`、`Select`、`Radio.Group`、密码输入
- `code/frontend/src/components/writing/WritingPolishPanel.tsx`
  - 文本域输入、复制按钮、错误反馈、结果区域

### 常用代码示例

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Frontend App</title>
  </head>
  <body>
    <main id="root"></main>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

```tsx
function SearchForm() {
  const [query, setQuery] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        console.log(query);
      }}
    >
      <label htmlFor="query">问题</label>
      <textarea
        id="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit">发送</button>
    </form>
  );
}
```

### 高频面试题

#### 题目 1
**题目**  
HTML5 语义化标签有什么价值？你的项目里如何体现？

**仓库使用案例参考**  
可结合 `code/frontend/index.html` 的 `main` 挂载点、聊天页和工作台页面的 `header`/`section` 组织方式回答。

**AI 回答**  
语义化标签的价值主要有 3 点。第一是让页面结构更清晰，团队协作和后期维护成本更低。第二是更有利于 SEO 和无障碍，屏幕阅读器能更好理解内容层级。第三是代码可读性更强。在我的项目里，虽然主界面是 React 组件，但我仍然有意识地用 `main`、`header`、`section` 这类结构去划分聊天区、配置区和执行时间线，比如 Multi-Agent 页面左侧是输出区，右侧是时间线区，本质上就是语义化地拆分内容区域，而不是全部用无意义的 `div` 堆在一起。

**评分（9/10）**  

**标准答案**  
语义化标签的核心价值包括：
- 提升文档结构表达能力，代码更易维护
- 改善 SEO 和无障碍支持
- 降低纯 `div` 布局带来的可读性问题  
在 React 项目中，即使是组件化开发，也应优先使用表达结构意图的标签，例如页面容器用 `main`，顶部区块用 `header`，模块区块用 `section`，而不是一律使用 `div`。

**评分理由**  
答案完整，能结合项目区块结构说明实践，但如果能顺带提到屏幕阅读器和表单可访问性会更完整。

#### 题目 2
**题目**  
为什么你的前端入口页要在 React 挂载前执行主题脚本？

**仓库使用案例参考**  
`code/frontend/index.html`

**AI 回答**  
因为如果等 React 挂载后再切换主题，首屏会先按默认主题渲染，再闪到用户保存的主题，体验会差。我在入口 HTML 里先读 `localStorage` 的 `theme-mode`，再根据系统深浅色偏好给 `document.documentElement` 添加 `dark` class，同时设置 `colorScheme` 和背景色，这样浏览器第一次绘制就已经是正确主题了。

**评分（10/10）**  

**标准答案**  
在入口 HTML 提前做主题初始化，是为了避免 FOUC 或主题闪烁。流程通常是：
- 读取本地主题偏好
- 解析 `system/light/dark`
- 在首屏绘制前写入 `html` 的 class 或 data attribute
- 同步设置背景色和 `color-scheme`  
这样可以保证浏览器第一次绘制就是正确主题，而不是 React 挂载后再二次修正。

**评分理由**  
答案准确，直接命中“首屏闪烁”问题，并结合了仓库的具体实现。

#### 题目 3
**题目**  
`defer`、`async`、`type="module"` 有什么区别？

**仓库使用案例参考**  
可从 `code/frontend/index.html` 中的模块脚本引入切入。

**AI 回答**  
`async` 下载完就执行，不保证顺序，可能打断 HTML 解析。`defer` 会等 HTML 解析完成后按顺序执行，适合业务脚本。`type="module"` 默认也具备类似 `defer` 的行为，而且支持 ES Module 的导入导出。我在 Vite 项目里用的是 `type="module"` 加载 `main.tsx`，因为整个前端入口就是模块化组织的。

**评分（10/10）**  

**标准答案**  
- `async`：异步下载，下载完成立即执行，顺序不保证
- `defer`：异步下载，HTML 解析完成后按顺序执行
- `type="module"`：按 ES Module 方式加载，默认延迟执行，支持 `import/export`，且作用域是模块级  
现代 Vite/React 工程通常使用 `type="module"` 作为入口加载方式。

**评分理由**  
技术正确、实践结合强、适合面试口述。

### 通用补充

仓库里没有明显使用 `audio`、`video`、`canvas`，但面试仍可能问。你可以补一句：

“我当前仓库里主要是 AI 问答和工作台类界面，所以媒体元素不多；如果做 AI 视频生成前端，我会优先关注 `video` 播放、封面图、时间轴预览和大文件上传交互。”

---

## CSS3

### 核心知识点

- 选择器与优先级
- 盒模型与 `box-sizing`
- 布局：Flex、Grid、定位
- 主题与变量：CSS Custom Properties
- 动画：`transition`、`@keyframes`
- 响应式：媒体查询、断点、移动端适配
- 深浅色模式与设计 token

### 仓库中使用实例

- `code/frontend/src/styles/theme.css`
  - 使用大量 CSS 变量维护颜色、阴影、半径和深浅色主题
  - 通过 `.dark` 覆盖变量，实现主题切换
- `code/frontend/src/styles/index.css`
  - 自定义动画 `shimmer`、`slide-up`、`slide-down`、`slide-in-right`
  - 使用 `env(safe-area-inset-bottom)` 兼容移动端安全区域
- `code/frontend/src/layouts/AppShell.tsx`
  - 大量使用 Tailwind 原子类进行 Flex 布局、响应式布局和深浅色样式切换
- `code/frontend/src/pages/MultiAgentChatPage.tsx`
  - 使用渐变背景、双栏布局、消息气泡样式
- `code/frontend/src/pages/LocalAIHubPage.tsx`
  - 根据在线/离线/恢复状态切换 Banner 视觉反馈

### 常用代码示例

```css
:root {
  --app-bg: #ffffff;
  --app-text: #0f172a;
  --app-primary: #2563eb;
}

.dark {
  --app-bg: #0f172a;
  --app-text: #f8fafc;
}

body {
  background: var(--app-bg);
  color: var(--app-text);
}
```

```css
.chat-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.message-row {
  display: flex;
  justify-content: flex-end;
}

.message-row.assistant {
  justify-content: flex-start;
}
```

### 高频面试题

#### 题目 1
**题目**  
为什么你的项目里会选择 CSS 变量做主题系统，而不是只靠类名切换？

**仓库使用案例参考**  
`code/frontend/src/styles/theme.css`

**AI 回答**  
因为类名切换更适合局部样式，但对于全局主题系统，CSS 变量更适合统一管理设计 token。我的项目里不仅有背景色和文字色，还有 Workspace、Local AI、状态色、图表色、阴影、半径等设计语义。如果只靠类名切换，维护会很重。用 CSS 变量后，组件只消费语义变量，比如 `--app-bg`、`--app-primary`，切换主题时只覆盖变量本身，组件不用大面积改动。

**评分（10/10）**  

**标准答案**  
CSS 变量适合主题系统的原因：
- 可以抽象设计 token，提升复用性
- 主题切换时只需覆盖变量值
- 组件与具体色值解耦
- 对深浅色、品牌色、多模块视觉隔离更友好  
如果系统既有普通业务界面，又有 Local AI / Workspace 之类的独立视觉域，变量化更容易管理。

**评分理由**  
回答完整，能体现体系化设计思路，并结合了仓库中多主题 token 的实际场景。

#### 题目 2
**题目**  
说一下 Flex 和 Grid 的适用场景。

**仓库使用案例参考**  
`code/frontend/src/layouts/AppShell.tsx`、`code/frontend/src/pages/MultiAgentChatPage.tsx`

**AI 回答**  
Flex 更适合一维布局，比如横向导航、消息气泡对齐、按钮组、侧栏与主内容区这种主轴分布。Grid 更适合二维布局，比如仪表盘、卡片矩阵、配置面板。我的项目里聊天区和壳层布局主要用 Flex，因为重点是横向或纵向分布；Multi-Agent 页面用了 `lg:grid-cols-[1.2fr_0.8fr]` 这种两栏结构，更适合用 Grid 控制左右面板比例。

**评分（10/10）**  

**标准答案**  
- Flex：一维布局，关注主轴和交叉轴分布
- Grid：二维布局，适合同时控制行和列  
聊天消息流、导航、按钮组一般优先 Flex；仪表盘、卡片网格、复杂控制面板一般优先 Grid。

**评分理由**  
答案准确，能把概念和项目里的布局选择对应起来。

#### 题目 3
**题目**  
你在移动端适配里做了哪些 CSS/样式层面的考虑？

**仓库使用案例参考**  
`code/frontend/src/layouts/AppShell.tsx`、`code/frontend/src/styles/index.css`

**AI 回答**  
我主要做了三件事。第一是根据移动端和桌面端切换壳层布局，比如移动端顶部 Header + 底部 Tab，桌面端是左侧 Sidebar。第二是处理安全区域，比如 `safe-area-inset-bottom`，避免 iPhone 底部手势区遮挡操作。第三是控制内容滚动区和固定操作区，像聊天页底部输入框、移动端导航都要避免覆盖主体内容。

**评分（9/10）**  

**标准答案**  
移动端样式适配至少要考虑：
- 布局模式切换：桌面侧栏 -> 移动端顶部/底部导航
- 安全区域适配：`env(safe-area-inset-bottom)`
- 触控面积、滚动区和固定区冲突
- 文本输入、弹层和键盘弹起的空间关系  
AI 类产品尤其要注意聊天输入框、底部操作栏和长内容滚动区域的协调。

**评分理由**  
回答基本完整，若补充“触控尺寸”和“键盘弹起对视口的影响”会更好。

### 通用补充

仓库中 Grid 的使用比 Flex 少，但面试里你可以主动说：

“我在业务项目里更常用 Flex 解决实际问题，但 Grid 在控制台类、工作台类、可视化面板里更适合二维布局，这也是我在 GraphRAG Workbench 里会优先考虑的方式。”

---

## JavaScript

### 核心知识点

- 变量、作用域、闭包
- 原型链、`this`、对象与数组方法
- DOM/BOM：`window`、`document`、`navigator`
- 事件机制：冒泡、默认行为、监听与清理
- 异步编程：Promise、`async/await`、事件循环
- 流式处理：`ReadableStream`、`TextDecoder`
- 中断控制：`AbortController`
- 本地存储：`localStorage`
- 网络状态：`navigator.onLine`

### 仓库中使用实例

- `code/frontend/src/lib/ai-stream.ts`
  - 使用 `for await...of` 消费异步流
  - 在 `signal.aborted` 时静默退出
- `code/frontend/src/hooks/useOrchestratedChat.ts`
  - 用 `AbortController` 中止流式请求
  - 流式拼接最终答案
- `code/frontend/src/domains/chat/useChatStore.ts`
  - 使用 Zustand 存 conversation，支持持久化
  - 切换会话时中断旧流
- `graphrag-x/ui/src/api/sse.ts`
  - 直接操作 `response.body.getReader()` 和 `TextDecoder`
  - 手动按 SSE 分帧
- `code/frontend/index.html`
  - 通过 `localStorage` 读取主题
- `code/frontend/src/layouts/AppShell.tsx`、`LocalAIHubPage.tsx`
  - 监听 `online/offline` 事件更新前端状态

### 常用代码示例

```ts
const controller = new AbortController();

try {
  const response = await fetch('/api/chat', { signal: controller.signal });
} catch (error) {
  if (error instanceof Error && error.name === 'AbortError') {
    console.log('request aborted');
  }
}
```

```ts
async function* parseStream(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    yield buffer;
  }
}
```

### 高频面试题

#### 题目 1
**题目**  
为什么 AI 前端里 `AbortController` 很重要？

**仓库使用案例参考**  
`code/frontend/src/hooks/useOrchestratedChat.ts`、`code/frontend/src/domains/chat/useChatStore.ts`

**AI 回答**  
因为 AI 前端经常有长耗时和流式请求，如果用户切换会话、重新提问或者点击停止，不中止旧请求就会出现状态串流、资源浪费和 UI 污染。我的项目里无论是普通聊天还是 Multi-Agent 聊天，都会在发起新请求前先中止上一个 `AbortController`，这样能避免旧响应继续往当前会话写 token。

**评分（10/10）**  

**标准答案**  
`AbortController` 在 AI 前端里至少有 3 个作用：
- 用户主动停止生成
- 用户切换会话或重复提交时取消旧请求
- 防止旧流继续更新当前 UI，避免竞态和脏状态  
对于流式输出场景，它不只是“取消网络请求”，更是前端状态一致性的一部分。

**评分理由**  
回答既讲了用户体验，也讲了状态一致性，是高质量答案。

#### 题目 2
**题目**  
你是怎么处理 SSE 或流式输出的？

**仓库使用案例参考**  
`code/frontend/src/lib/ai-stream.ts`、`graphrag-x/ui/src/api/sse.ts`

**AI 回答**  
我做过两种层次。第一种是 SDK 层直接把 SSE 封装成异步生成器，前端通过 `for await...of` 逐 token 消费。第二种是在 GraphRAG Workbench 里直接读取 `ReadableStream`，用 `TextDecoder` 把二进制流转成文本，再按 `\n\n` 切块，提取每个 `data:` 帧并解析成 JSON。这样前端可以同时处理 `start`、`thought`、`message`、`done` 这类不同事件，而不是只处理纯文本 token。

**评分（10/10）**  

**标准答案**  
SSE/流式输出的典型处理流程是：
- 发起 `fetch`，`Accept: text/event-stream`
- 从 `response.body.getReader()` 持续读取字节流
- 用 `TextDecoder` 按流模式解码
- 维护 buffer，按 SSE 分隔符分帧
- 解析事件类型，更新不同 UI 区块  
AI 场景下通常不止有文本 token，还可能有 `start`、`source`、`thought`、`error`、`done` 等结构化事件。

**评分理由**  
实践结合非常强，而且明确区分了“纯 token 流”和“结构化事件流”。

#### 题目 3
**题目**  
解释一下事件循环，以及为什么流式聊天场景要注意主线程压力。

**仓库使用案例参考**  
`graphrag-x/ui/src/state/WorkbenchContext.tsx`

**AI 回答**  
JavaScript 是单线程，任务会在调用栈、宏任务和微任务之间调度。流式聊天如果每个 delta 都立即触发 React 更新，主线程会被频繁重渲染占满，表现就是卡顿、掉帧或者输入不流畅。所以我在 GraphRAG Workbench 里做了一个 buffer，把 delta 先写进 `ref`，然后用一个很短的 timer 批量 flush，同时用 `startTransition` 降低更新优先级，这样 UI 更平滑。

**评分（10/10）**  

**标准答案**  
事件循环核心是：
- 同步任务先执行
- 每轮从宏任务队列中取任务
- 执行后清空微任务  
在流式 AI 场景中，若每个 token/delta 都触发高优先级渲染，会放大主线程压力。优化方式包括：
- 使用缓冲区批量更新
- 降低渲染优先级
- 分离数据状态和可见状态
- 尽量减少重复计算

**评分理由**  
答案把 JS 基础和 AI 前端性能优化打通了，这是淘天 AI 前端岗位很喜欢的答法。

### 通用补充

仓库里没有典型的原型链高级手写题，但面试仍可能问。建议你的答法是：

“业务开发里我更关注异步、事件、状态一致性和性能，但 JS 底层如闭包、原型链、事件循环和 this 绑定我也有系统复习，因为这些会直接影响 Hook、回调和工程代码质量。”

---

## TypeScript

### 核心知识点

- 基础类型与类型推导
- 接口 `interface`
- 类型别名 `type`
- 联合类型、字面量类型
- 泛型
- `keyof`、索引访问类型
- 函数参数与返回值约束
- 严格事件模型
- 前后端共享类型

### 仓库中使用实例

- `code/shared/src/types/ai.ts`
  - 定义 `ChatMessage`、`OrchestratedChatRequest`、`ThoughtEvent` 等共享类型
  - 使用字面量联合类型约束 `phase`、`status`、`source`
- `code/shared/src/types/inference.ts`
  - 定义本地/云端协同推理的元数据结构
- `code/frontend/src/hooks/useOrchestratedChat.ts`
  - 本地状态接口 `UseOrchestratedChatState`
  - `SendPayload` 限制请求结构
- `graphrag-x/ui/src/state/workbenchReducer.ts`
  - 用联合 Action 约束 Reducer 分支
- `graphrag-x/ui/src/state/WorkbenchContext.tsx`
  - Context 值的类型定义
- `code/mobile/src/navigation/AppNavigator.tsx`
  - React Navigation 参数类型约束
- `code/frontend/src/pages/AISettingsPage.tsx`
  - 映射前端模式与服务端模式，体现类型转换边界

### 常用代码示例

```ts
type ThoughtStatus = 'running' | 'done' | 'error';

interface ThoughtEvent {
  type: 'thought';
  phase: 'dispatch' | 'code' | 'research';
  status: ThoughtStatus;
  label: string;
}
```

```ts
interface ApiResult<T> {
  data: T;
  success: boolean;
}

function wrapResult<T>(data: T): ApiResult<T> {
  return { data, success: true };
}
```

### 高频面试题

#### 题目 1
**题目**  
`interface` 和 `type` 有什么区别？你在项目里怎么选？

**仓库使用案例参考**  
`code/shared/src/types/ai.ts`、`code/shared/src/types/inference.ts`

**AI 回答**  
两者都能描述对象结构，但 `type` 更灵活，适合联合类型、字面量类型、组合类型；`interface` 更适合描述对象契约，尤其是组件 props、状态对象这类结构化对象。我的项目里像 `ThoughtPhase`、`ThoughtStatus` 这种字面量联合我会用 `type`，而像 `InferenceRequest`、`LocalLlmStatus` 这种对象结构我更倾向用 `interface`。本质上是按表达能力选，而不是机械偏好某一个。

**评分（10/10）**  

**标准答案**  
- `type`：更适合联合、交叉、字面量别名、复杂组合
- `interface`：更适合对象结构、可实现契约、可扩展 API  
实际项目里通常是混合使用：对象结构偏 `interface`，状态枚举和联合约束偏 `type`。

**评分理由**  
非常适合面试，既讲概念，也讲了仓库里的实际选择依据。

#### 题目 2
**题目**  
为什么前后端共享类型对 AI 前端尤其重要？

**仓库使用案例参考**  
`code/shared/src/types/ai.ts`、`code/shared/src/sdk/ai.ts`

**AI 回答**  
因为 AI 场景不是单一字符串接口，而是包含消息列表、流式事件、thought 阶段、推理来源、附件、workspace context 等复杂结构。如果前后端不共享类型，很容易出现字段名漂移、事件类型不一致和解析错误。我的项目里把 `ChatMessage`、`OrchestratedChatRequest`、`AiStreamEvent` 等都放进 shared 包，这样 Web、Electron、本地 SDK 和服务端协议能保持一致，重构也更安全。

**评分（10/10）**  

**标准答案**  
AI 前端接口往往具有：
- 多事件类型
- 流式增量数据
- 多来源路由信息
- 多模态/附件结构  
共享类型可以降低协议漂移、减少魔法字符串、提升重构安全性，也更利于 SDK 化和跨端复用。

**评分理由**  
准确抓住了 AI 场景比普通 CRUD 更依赖类型系统的特点。

#### 题目 3
**题目**  
Reducer 为什么适合复杂前端状态？

**仓库使用案例参考**  
`graphrag-x/ui/src/state/workbenchReducer.ts`

**AI 回答**  
因为复杂状态往往不是一个布尔值，而是多个子状态联动，比如请求草稿、响应快照、选中节点、流式状态、错误状态、布局状态。Reducer 的好处是把状态变化显式化，通过 action 类型约束所有更新入口。我的 GraphRAG Workbench 里就把 `start_stream`、`stream_frame`、`stream_done`、`set_response`、`select_node` 这些都建成 action，这样状态机更清晰，也更方便测试。

**评分（10/10）**  

**标准答案**  
Reducer 适合复杂状态的原因：
- 状态转移显式
- 更新入口统一
- 易于测试
- 更接近状态机思维  
在流式 AI 前端、图谱工作台、多面板交互里，Reducer 通常比零散 `useState` 更稳定。

**评分理由**  
答案非常贴仓库，也体现了“状态机意识”。

### 通用补充

仓库里泛型不是最重的部分，但面试会问。你可以答：

“我在业务代码里更常用的是共享类型、联合类型和 action 建模；泛型更多出现在 SDK、HTTP 封装和通用工具函数里，用来把响应结构和业务数据解耦。”

---

## 常考知识速背

### HTML 标签与属性速查

| 项目 | 速记 |
| --- | --- |
| 页面入口 | `<!doctype html>` + `meta charset` + `meta viewport` |
| 语义化 | `header/main/section/article/footer` |
| 表单 | `form/input/textarea/select/button/label` |
| 脚本 | `async` 无序，`defer` 有序延后，`type="module"` 支持模块 |
| 存储 | `localStorage` 持久，`sessionStorage` 会话级，`cookie` 可随请求发送 |

### CSS 布局与样式速查

| 项目 | 速记 |
| --- | --- |
| 盒模型 | 默认内容盒，`border-box` 更利于布局 |
| Flex | 一维布局，主轴 `justify-content`，交叉轴 `align-items` |
| Grid | 二维布局，适合工作台/仪表盘 |
| 主题 | CSS 变量 + `.dark` 覆盖变量 |
| 响应式 | 断点切布局，移动端关注安全区和固定底栏 |

### JS 语法与函数速查

| 项目 | 速记 |
| --- | --- |
| 闭包 | 函数记住词法作用域 |
| 事件循环 | 同步 -> 宏任务 -> 清空微任务 |
| Promise | `pending/fulfilled/rejected` |
| 流式处理 | `response.body.getReader()` + `TextDecoder` |
| 中断 | `AbortController` 管理长请求 |

### TS 类型与接口速查

| 项目 | 速记 |
| --- | --- |
| `type` | 联合、字面量、别名更灵活 |
| `interface` | 对象结构更常用 |
| 联合类型 | `A \| B` |
| `keyof` | 获取对象键的联合 |
| 共享类型 | 跨 Web / Electron / Tauri / 后端协议统一 |

---

## 面试总策略：怎么把知识点讲成你的项目能力

你在淘天 AI 前端面试里不要把自己讲成“只会页面”的人，而要强调：

- 我做的是 AI 产品前端，不是普通管理后台
- 我不仅做 UI，还做流式输出、状态一致性、端云协同和协议设计
- 我能把前端、服务端和模型交互链路串起来理解
- 我做过 Web、桌面壳、移动端和本地模型桥接，迁移能力强

建议你固定使用下面这套答题句式：

`背景 -> 问题 -> 方案 -> 为什么这么选 -> 实现细节 -> 结果 -> 可以继续优化的点`

例如回答“如何做 AI 聊天流式输出”时，不要只说“我用了 SSE”，而要说：

“因为 AI 响应是长耗时且增量返回的，我把接口层封装成 async generator，支持普通 token 流和多 Agent 结构化事件流；在 UI 层区分普通回答区和 thought 时间线；在状态层用 AbortController 和 reducer/zustand 管理中止、切会话和脏数据问题。”

---

## 最后 12 题，建议你优先背熟

1. 为什么入口页要在 React 挂载前做主题初始化？
2. `defer`、`async`、`type="module"` 的区别是什么？
3. 为什么主题系统要用 CSS 变量？
4. Flex 和 Grid 什么时候分别用？
5. 为什么 AI 前端必须重视 `AbortController`？
6. SSE 流式输出在前端怎么解析？
7. 为什么流式聊天要做批量刷新而不是每 token 直接 setState？
8. `interface` 和 `type` 的区别是什么？
9. 为什么前后端共享类型对 AI 产品更重要？
10. Zustand 和 Reducer 各适合什么场景？
11. 本地推理和云端推理前端如何路由？
12. 你如何保证跨 Web / Electron / Tauri / Mobile 的前端协议一致性？

---

## 一句话版本自我定位

“我不是只会接接口的前端，我更擅长做 AI 产品前端里的复杂交互和工程链路，包括流式输出、状态管理、端云协同、本地模型桥接和跨端交付。”

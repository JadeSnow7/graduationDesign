# 代码规范

本文档定义项目统一代码规范。目标是让不同语言与模块在风格、质量与可维护性上保持一致。

## 1. 通用规范

- 优先可读性：命名清晰、函数职责单一、避免过度抽象。
- 保持最小改动：只改与需求直接相关的文件与逻辑。
- 边界显式：配置、权限、超时、错误码都应可追踪。
- 不提交敏感信息：密钥、Token、隐私数据必须通过环境变量管理。
- 所有对外行为变更必须配套文档与测试。

---

## 2. 提交前检查

在提交代码前，必须在对应目录执行以下检查：

```bash
# Frontend
cd code/frontend && npm run lint && npm run test -- --run

# Backend
cd code/backend && go test ./...

# AI Service
cd code/ai_service && pytest -q

# 文档站点
npm run docs:build   # 从仓库根目录执行
```

---

## 3. 多端提交规范（Conventional Commits）

所有提交遵循 [Conventional Commits](https://conventionalcommits.org/) 规范。格式：

```
<type>(<scope>): <subject>
```

### 类型（type）

| type | 含义 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 仅文档变更 |
| `refactor` | 重构（无功能变更） |
| `perf` | 性能优化 |
| `test` | 新增或修改测试 |
| `chore` | 构建/工具链变动 |
| `ci` | CI/CD 配置变更 |

### 作用域（scope）

使用以下预定义的 scope 标注影响范围：

| scope | 对应代码路径 |
|-------|-------------|
| `frontend` | `code/frontend/` |
| `mobile` | `code/mobile/` |
| `desktop` | `code/desktop-tauri/` |
| `backend` | `code/backend/` |
| `ai` | `code/ai_service/` |
| `sim` | `code/simulation/` |
| `shared` | `code/shared/` |
| `docs` | `docs/` |
| `infra` | `code/docker-compose.yml`、部署配置 |

### 示例

```bash
feat(frontend): 新增引导式学习进度条组件
fix(backend): 修复学习画像并发写入竞态条件
docs(ai): 补充模型路由策略决策树
refactor(shared): 将 ChatMessage 类型迁移到 shared SDK
perf(ai): 优化 GraphRAG 向量检索批处理性能
test(backend): 为 assignment_service 添加覆盖率测试
```

::: warning 涉及多端的变更
若单次提交同时修改多个 scope（如 `shared` 类型变更影响 `frontend` + `mobile`），优先使用影响最大的 scope，正文中说明其他受影响模块。
:::

---

## 4. Python（AI Service / Simulation）

- 遵循 PEP 8，函数与变量使用 `snake_case`，类名使用 `PascalCase`。
- 公开函数必须有类型注解，复杂结构使用 `TypedDict`/`dataclass`/Pydantic 模型。
- 异步场景避免阻塞事件循环；外部 I/O 使用异步客户端或线程池包装。
- 错误处理禁止吞异常；API 层返回统一、可定位的错误码。
- 模块结构建议：常量 → 数据模型 → 纯函数 → I/O 逻辑。

---

## 5. Go（Backend）

- 必须通过 `go test ./...`，并保持 handler/service/repository 分层职责清晰。
- 错误处理使用 `fmt.Errorf("...: %w", err)` 传递上下文。
- 结构体字段命名与 JSON tag 必须稳定，避免无兼容策略的字段重命名。
- 中间件统一处理请求日志、request_id、鉴权与限流。
- 对外 API 变更必须同步更新 OpenAPI 与文档。

---

## 6. Frontend（React）— 含 Design Token 规范

### 6.1 组件架构

- 组件拆分遵循"容器/展示"职责分离，避免超大组件（单文件建议 < 300 行）。
- 状态管理优先局部状态，跨页面状态使用 Zustand store（`src/domains/*/` 目录）。
- 接口类型优先复用 `@classplatform/shared` 共享类型，禁止手写重复类型。
- 不直接在组件中硬编码 API 地址与密钥，统一通过 `src/lib/api-client.ts` 注入。

### 6.2 Design Token 规范

项目使用 **Tailwind CSS v4 + Ant Design 5** 双体系，Token 分两个层次管理：

#### 颜色 Token（CSS 变量 + Tailwind）

在 `src/styles/theme.css` 中定义语义化 CSS 变量，严禁在组件中直接使用硬编码颜色值：

```css
/* src/styles/theme.css */
:root {
  /* 应用主色 */
  --app-bg: #ffffff;
  --app-panel: #f8fafc;
  --app-border: #e2e8f0;
  --app-text: #0f172a;
  --app-text-muted: #64748b;
  --app-primary: #2563eb;
  --app-primary-strong: #1d4ed8;

  /* 语义色 */
  --app-success: #16a34a;
  --app-warning: #f59e0b;
  --app-danger: #ef4444;

  /* 兼容性映射（旧页面使用） */
  --surface-bg: var(--app-bg);
  --surface-panel: var(--app-panel);
  --surface-border: var(--app-border);
  --text-main: var(--app-text);
  --text-muted: var(--app-text-muted);
}

.dark {
  --app-bg: #0f172a;
  --app-panel: #020617;
  --app-text: #f8fafc;
  --app-text-muted: #94a3b8;
  /* ... */
}
```

**使用规范：**
- ✅ 推荐：`bg-[var(--app-bg)]` 或 `text-[var(--app-text)]`
- ❌ 禁止：`bg-white`、`text-gray-900`（硬编码颜色）
- ⚠️ 兼容：`--surface-*` 和 `--text-*` 前缀仅用于旧页面迁移，新代码统一使用 `--app-*`

#### 间距与排版 Token

| Token | 值 | 用途 |
|-------|----|------|
| `--spacing-xs` | 4px | 组件内紧凑间距 |
| `--spacing-sm` | 8px | 标准内间距 |
| `--spacing-md` | 16px | 区块间距 |
| `--spacing-lg` | 24px | 页面内容间距 |
| `--spacing-xl` | 32px | 大区块分隔 |
| `--font-size-sm` | 12px | 辅助说明文本 |
| `--font-size-base` | 14px | 正文 |
| `--font-size-lg` | 16px | 标题 |

#### Ant Design Token 覆盖

通过 `<ConfigProvider>` 统一覆盖，禁止在单个组件的 `style` prop 中覆盖：

```tsx
// src/ThemeProvider.tsx
import { ConfigProvider } from 'antd';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
          fontFamily: '"PingFang SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Button: { borderRadiusLG: 8 },
          Card:   { borderRadius: 12 },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
```

::: info Ant Token 与 CSS 变量的协同规则
`ConfigProvider.token` 中的值（如 `colorPrimary: '#1677ff'`）允许使用**语义对齐的十六进制常量**，这是 Ant Design 设计系统的正规用法，不属于"硬编码颜色"违规。

**判断标准：**

| 场景 | 是否允许 | 说明 |
|------|---------|------|
| `ConfigProvider.token` 中的主题色 | ✅ 允许 | 须与同名 CSS 变量（如 `--color-primary`）语义一致 |
| 组件 `.tsx` / `.css` 中的内联颜色 | ❌ 禁止 | 必须使用 `var(--*)` |
| 全局 `ThemeProvider` 以外的 `ConfigProvider` | ❌ 禁止 | 主题入口保持唯一 |

**保持同步原则**：修改 `ThemeProvider.tsx` 中的 token 值时，须同步更新 `src/styles/tokens.css` 中对应的 CSS 变量值，确保两套系统语义一致。
:::

#### 组件样式优先级

```
Tailwind 工具类 > Ant Design Token（ConfigProvider）> CSS 变量 > 内联 style
```

::: warning 禁止项
- ❌ 在组件内使用 `style={inlineColorObject}` 等内联颜色
- ❌ 直接 `import 'antd/dist/reset.css'` 与 Tailwind 冲突
- ❌ 在非 `ThemeProvider` 处创建额外的 `<ConfigProvider>`
:::

### 6.3 桌面端（Tauri）开发规范

#### 窗口拖拽区域

桌面端标题栏需要添加 `data-tauri-drag-region` 属性以支持窗口拖拽，但该属性会**吞没所有鼠标事件**（包括点击）。

**正确用法：**

```tsx
// ✅ 正确：拖拽区域与交互元素分离
<div className="titlebar" data-tauri-drag-region>
  <div className="title">应用标题</div>
  {/* 按钮区域不添加 drag-region */}
  <div className="actions">
    <button onClick={handleMinimize}>最小化</button>
    <button onClick={handleClose}>关闭</button>
  </div>
</div>

// ❌ 错误：整个标题栏添加 drag-region，导致按钮无法点击
<div className="titlebar" data-tauri-drag-region>
  <button onClick={handleClose}>关闭</button>  {/* 点击无效！ */}
</div>
```

**CSS 配合：**

```css
/* 全局禁用文本选择，避免拖拽时选中文本 */
body {
  user-select: none;
}

/* 对可编辑区域豁免 */
input, textarea, [contenteditable] {
  user-select: text;
}
```

### 6.4 文件命名规范

| 类型 | 命名风格 | 示例 |
|------|---------|------|
| 组件/页面 | PascalCase | `CoursesHubPage.tsx` |
| Hooks | camelCase + `use` 前缀 | `useChat.ts` |
| API 模块 | camelCase | `aiConfig.ts` |
| 类型文件 | camelCase | `workspace.ts` |
| 样式文件 | kebab-case | `chat-bubble.css` |

---

## 7. Mobile（Expo React Native）

- 复用 `@classplatform/shared` SDK 和类型，与 Web 端共享业务逻辑层。
- 样式使用 NativeWind（Tailwind for React Native），避免混用 `StyleSheet.create`。
- 网络请求的 `baseURL` 通过 `EXPO_PUBLIC_API_BASE_URL` 环境变量注入，本地调试设为 `http://<本机IP>:8080/api/v1`。
- 平台差异隔离在 `*.native.ts` / `*.web.ts` 扩展名文件中。

---

## 8. API 与契约规范

- **对外契约唯一源**：`docs/04-reference/api/openapi.yaml`
- `/api/v1/*` 语义变更必须**先更新 OpenAPI**，再修改代码
- `/v1/*`（AI Service 内部）须保持与对外契约一致
- `@classplatform/shared` 类型变更后需重新 `npm run build:shared`，所有端需更新依赖

---

## 9. 文档同步规范

- 新增功能：至少更新一处 How-to 或 Explanation 文档
- 接口变更：必须更新 `04-reference/api` 下对应页面
- 运行/部署相关变更：必须更新 `03-how-to-guides` 对应页面
- **跨模块或架构变更**：需使用 [Plan 模式](./plan-mode-workflow.md) 输出实施计划文档

---

## 10. 相关文档

- [Plan 模式协作流程](./plan-mode-workflow.md)
- [Plan 模式计划模板](./plan-mode-template.md)
- [文档规范](./doc-style.md)
- [测试指南](./testing-guide.md)
- [API 契约锁定策略](/04-reference/versioning/api-lock-policy)

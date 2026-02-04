# 代码规范

本项目包含 Go / TypeScript(React) / Python 多语言代码。以下规范用于保持一致性与可维护性。

## 1. 通用规范

- 统一使用 UTF-8 编码与 LF 换行
- 文件/目录命名遵循各子项目约定（kebab-case 或 snake_case，避免混用）
- 重要的接口变更必须同步更新 `docs/` 与测试

## 2. TypeScript / React

- 组件职责单一，优先函数组件 + Hooks
- 复杂逻辑抽取为 hooks 或 services，避免在页面组件中堆叠
- 路由使用 React Router，状态管理推荐 Zustand（或按模块封装）
- 组件/页面命名建议 PascalCase，hooks 使用 `useXxx`

## 3. Go（后端）

- 统一 `gofmt` 格式化
- 分层结构（Handler/Service/Repository）保持边界清晰
- 统一错误返回结构与错误码，避免在 handler 里堆业务逻辑

## 4. Python（AI/仿真）

- 使用类型标注（尽量）
- 结构化返回（schema/JSON），便于工具调用与前端渲染
- 对外接口保持兼容（OpenAI-compatible / 业务 API）


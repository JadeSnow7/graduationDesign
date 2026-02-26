# 本地 LLM Runtime 架构说明

> 本文档说明 Web 前端的本地推理路径（`code/frontend/src/runtime/local-ai/`），涵盖队列机制、Runtime 选择逻辑、运行前提，以及与云端 AI Service 链路的职责边界。

---

## 1. 模块定位

本地 LLM Runtime 是 **Desktop 壳层（Electron/Tauri）专属**的推理入口，允许前端直接调用本机 LLM 进行推理，**绕过后端网关和 AI Service**：

```
┌─────────────────────────────────────────────────────┐
│  云端链路（常规路径）                                  │
│  前端 → 后端 Go 网关 → AI Service → vLLM/云端 API    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  本地 Runtime 链路（Desktop 专属）                    │
│  前端 → LocalAiRuntime → electronAPI.localLlm        │
│         → 本机 LLM 进程（node-llama-cpp 等）          │
└─────────────────────────────────────────────────────┘
```

入口文件：`code/frontend/src/runtime/local-ai/index.ts`
页面入口：`code/frontend/src/pages/LocalAIHubPage.tsx`

---

## 2. Runtime 选择逻辑

`getLocalAiRuntime()` 在模块加载时根据宿主环境自动选择实现：

```typescript
export function getLocalAiRuntime(): LocalAiRuntime {
    if (window.electronAPI?.isElectron) {
        return createDesktopRuntime(window.electronAPI);  // Desktop 壳层
    }
    return webLocalAiRuntime;  // 浏览器回退（能力受限）
}
```

| 环境 | Runtime 类型 | 说明 |
|------|-------------|------|
| Electron Desktop | `desktop` | 通过 `electronAPI.localLlm` IPC 与本机模型通信 |
| 普通浏览器 | `web` | `webLocalAiRuntime`（能力受限，见 `webRuntime.ts`） |

---

## 3. 队列机制（Desktop Runtime）

Desktop Runtime 的 `streamChat()` 是一个 `AsyncGenerator<string>`，内部使用**字符串队列 + 轮询等待**桥接 Electron IPC 事件回调与 `async/await` 世界：

```
electronAPI.localLlm.chat(requestId, messages, callback)
        │
        │  IPC 事件回调（非 async）
        ▼
  ┌─────────────┐        ┌──────────────────────────┐
  │  chunk 事件  │──push──▶  queue: string[]          │
  │  error 事件  │──set───▶  caught: Error | null     │
  │  done  事件  │──set───▶  done: boolean            │
  └─────────────┘        └──────────┬───────────────┘
                                     │ waitForChunk()
                                     │ 每 10ms 检查一次
                                     ▼
                          AsyncGenerator yield queue.shift()
```

**关键实现细节：**

- `waitForChunk()`：每 **10ms** `setInterval` 检查 `queue.length > 0 || done`，避免忙等
- `abort()`：通过 `electronAPI.localLlm.abort(requestId)` 取消本机推理，`activeRequestId` 置 `null`
- 异常处理：IPC 回调中的 `error` 事件或 `.catch()` 均将错误存入 `caught`，在 generator 末尾抛出

---

## 4. 运行前提

| 前提条件 | 说明 |
|---------|------|
| Electron 壳层 | `window.electronAPI?.isElectron === true` |
| 本机 LLM 进程 | `electronAPI.localLlm.getStatus()` 返回 `{ initialized: true }` |
| 模型文件 | 已下载并配置至 Desktop 壳层指定路径 |

若 `getStatus()` 返回 `not_ready`，`LocalAIHubPage` 应提示用户初始化模型，**不应降级到云端**（本地 Runtime 专为离线/隐私场景设计）。

---

## 5. 与云端链路的职责边界

| 维度 | 本地 Runtime | 云端 AI Service |
|------|------------|----------------|
| 调用路径 | 前端 → IPC → 本机模型 | 前端 → 后端 → AI Service → vLLM/云端 |
| 鉴权 | 无（本机信任） | JWT + `AI_GATEWAY_SHARED_TOKEN` |
| 学习档案更新 | ❌ 不更新 `student_profile` | ✅ 引导模式自动更新 |
| 流式协议 | IPC 事件 → queue bridge | SSE → AsyncGenerator |
| 隐私级别 | 最高（数据不离本机） | 依 `privacy` 字段和路由策略 |
| 适用场景 | 离线推理、隐私敏感内容 | 在线对话、引导学习、写作分析 |

---

## 6. 相关文档

- [系统设计总览](/05-explanation/system-design)
- [模型路由策略](/05-explanation/ai/model-routing-policy)
- [ai-stream.ts 接入契约](/04-reference/api/ai#前端流式接入契约-ai-streamts)

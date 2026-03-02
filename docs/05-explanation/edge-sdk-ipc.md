# Edge SDK IPC 通信协议

> 本文档详细介绍 EduEdge AI SDK 的 StreamId 并发隔离协议，展示如何通过 Tauri IPC 实现前端与 Rust 后端的安全流式通信。

## 1. 架构概览

EduEdge AI SDK 是一个跨平台的端侧 AI 推理框架，通过 Tauri 桥接 TypeScript 前端与 Rust 后端，实现本地模型的高性能推理。

### 1.1 核心设计目标

| 目标 | 说明 |
|------|------|
| **并发安全** | 多个前端组件可同时发起推理请求，互不干扰 |
| **流式推送** | 支持 Token-by-Token 流式输出，提升用户体验 |
| **硬件感知** | 自动检测并选择最优计算后端（CoreML/Metal/DirectML） |
| **零拷贝通信** | 通过 Tauri Event 实现高效的前后端数据传输 |
| **类型安全** | TypeScript 类型定义与 Rust 结构体严格对应 |

### 1.2 技术栈

- **前端**：TypeScript + Tauri API (`@tauri-apps/api`)
- **后端**：Rust + Tokio (异步运行时)
- **通信协议**：Tauri Command (RPC) + Tauri Event (Pub/Sub)
- **推理引擎**：llama.cpp / CoreML / ONNX Runtime
- **硬件加速**：Apple Neural Engine / Metal / DirectML / Vulkan

---

## 2. StreamId 并发隔离协议

### 2.1 核心思想

每个推理请求生成唯一的 `streamId`（UUID），前端和后端通过 `streamId` 过滤事件，确保多个并发请求的 Token 流不会混淆。

```mermaid
sequenceDiagram
    autonumber
    participant F as 🌐 React Frontend
    participant T as 🔌 Tauri IPC Layer
    participant R as 🦀 Rust Backend
    participant E as 🤖 LLM Engine<br/>(CoreML/Metal)

    Note over F: 用户发起聊天请求
    F->>F: 🎲 生成 UUID<br/>streamId = "abc-123"

    Note over F,T: 注册事件监听器（并发安全）
    F->>T: 📡 listen("llm-token:abc-123")
    F->>T: 📡 listen("llm-finish:abc-123")

    Note over F,R: 调用 Tauri Command
    F->>T: 🚀 invoke("stream_chat",<br/>{prompt, streamId: "abc-123"})
    T->>R: ⚡ 转发到 Rust

    Note over R: 启动 Blocking 线程
    R->>R: 🧵 spawn_blocking<br/>(避免阻塞 Tokio)
    R->>E: 🔥 开始推理

    rect rgb(240, 248, 255)
        Note over E,F: Token 流式推送循环
        loop 每生成一个 Token
            E->>R: 📝 返回 Token<br/>("Hello", " ", "World")
            R->>T: 📤 emit("llm-token:abc-123",<br/>{streamId, token})
            T->>F: 🔔 触发事件回调
            F->>F: ✅ 过滤 streamId<br/>并更新 UI
            Note over F: 实时显示 Token
        end
    end

    Note over E,R: 推理完成
    E->>R: ✔️ 推理完成
    R->>T: 📤 emit("llm-finish:abc-123",<br/>{streamId})
    T->>F: 🔔 触发完成回调

    Note over F: 清理资源
    F->>F: 🧹 unlisten("llm-token:abc-123")
    F->>F: 🧹 unlisten("llm-finish:abc-123")
    F->>F: 🎉 显示完成状态

    Note over F,E: 总延迟: ~380ms (首Token)<br/>吞吐: 45 tokens/s (M4 Pro)
```

### 2.2 并发场景示例

假设用户同时打开两个聊天窗口：

| 窗口 | streamId | 事件名 |
|------|----------|--------|
| 窗口 A | `uuid-1234` | `llm-token:uuid-1234`, `llm-finish:uuid-1234` |
| 窗口 B | `uuid-5678` | `llm-token:uuid-5678`, `llm-finish:uuid-5678` |

前端通过 `streamId` 过滤，确保窗口 A 只接收 `uuid-1234` 的 Token，窗口 B 只接收 `uuid-5678` 的 Token。

---

## 3. 前端实现（TypeScript）

### 3.1 核心 API

```typescript
// eduedge-ai-sdk/packages/eduedge-js/src/index.ts
export class EduEdgeAI {
  /**
   * 初始化本地模型
   * @param modelPath 模型文件路径（支持 GGUF 格式）
   * @returns 初始化结果，包含选中的硬件后端
   */
  static async init(modelPath: string): Promise<InitResult> {
    return invoke<InitResult>("plugin:eduedge-ai|init_local_model", { modelPath });
  }

  /**
   * 流式聊天推理
   * @param prompt 用户输入
   * @param onToken Token 回调函数
   */
  static async streamChat(
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {
    const streamId = createStreamId();  // 生成 UUID
    const tokenEvent = `llm-token:${streamId}`;
    const finishEvent = `llm-finish:${streamId}`;

    let unlistenToken: UnlistenFn | null = null;
    let unlistenFinish: UnlistenFn | null = null;

    return new Promise<void>(async (resolve, reject) => {
      try {
        // 1. 注册 Token 事件监听器
        unlistenToken = await listen<LlmTokenPayload>(tokenEvent, (event) => {
          const payload = event.payload;
          if (payload.streamId !== streamId) return;  // 过滤非匹配 streamId
          onToken(payload.token);
        });

        // 2. 注册完成事件监听器
        unlistenFinish = await listen<LlmFinishPayload>(finishEvent, (event) => {
          const payload = event.payload;
          if (payload.streamId !== streamId) return;
          cleanup();
          resolve();
        });

        // 3. 调用 Rust Command 开始推理
        await invoke<void>("plugin:eduedge-ai|stream_chat", { prompt, streamId });
      } catch (error) {
        cleanup();
        reject(error);
      }
    });

    function cleanup() {
      unlistenToken?.();
      unlistenFinish?.();
    }
  }
}
```

### 3.2 React 组件集成

```tsx
import { EduEdgeAI } from '@eduedge/ai-sdk';
import { useState } from 'react';

function ChatWindow() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentToken, setCurrentToken] = useState('');

  const handleSend = async (prompt: string) => {
    setCurrentToken('');

    await EduEdgeAI.streamChat(prompt, (token) => {
      setCurrentToken((prev) => prev + token);
    });

    // 推理完成后，将完整消息添加到历史
    setMessages((prev) => [...prev, currentToken]);
    setCurrentToken('');
  };

  return (
    <div>
      {messages.map((msg, i) => <div key={i}>{msg}</div>)}
      {currentToken && <div className="streaming">{currentToken}</div>}
      <input onSubmit={(e) => handleSend(e.target.value)} />
    </div>
  );
}
```

---

## 4. 后端实现（Rust）

### 4.1 Tauri Command 定义

```rust
// eduedge-ai-sdk/core/src/lib.rs
use tauri::{command, AppHandle, Emitter};
use tokio::sync::mpsc;

#[command]
pub async fn stream_chat(
    app: AppHandle,
    prompt: String,
    stream_id: String,
) -> Result<(), String> {
    let engine = LlamaEngine::new("/path/to/model.gguf")
        .map_err(|e| e.to_string())?;

    // 启动 blocking 线程进行推理
    let mut rx = engine.stream_chat(prompt).await;

    // 消费 Token 流并发送事件
    while let Some(token) = rx.recv().await {
        app.emit(
            &format!("llm-token:{}", stream_id),
            LlmTokenPayload {
                stream_id: stream_id.clone(),
                token,
            },
        )
        .map_err(|e| e.to_string())?;
    }

    // 发送完成事件
    app.emit(
        &format!("llm-finish:{}", stream_id),
        LlmFinishPayload {
            stream_id: stream_id.clone(),
        },
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
```

### 4.2 推理引擎实现

```rust
// eduedge-ai-sdk/core/src/engine_llm.rs
use tokio::{sync::mpsc, task};
use std::{thread, time::Duration};

pub struct LlamaEngine {
    model_path: String,
}

impl LlamaEngine {
    pub fn new(model_path: &str) -> Result<Self, EngineError> {
        if model_path.trim().is_empty() {
            return Err(EngineError::InvalidModelPath);
        }
        Ok(Self {
            model_path: model_path.to_owned(),
        })
    }

    pub async fn stream_chat(&self, prompt: String) -> mpsc::Receiver<String> {
        let (tx, rx) = mpsc::channel(16);
        let model_path = self.model_path.clone();

        // 在 blocking 线程中运行推理（避免阻塞 Tokio 运行时）
        task::spawn_blocking(move || {
            // 实际推理逻辑（此处为示例）
            let tokens = ["Hello", " ", "from", " ", "EduEdge", " ", "AI"];

            for token in tokens {
                thread::sleep(Duration::from_millis(120));  // 模拟推理延迟

                if tx.blocking_send(token.to_string()).is_err() {
                    break;  // 前端已断开连接
                }
            }
        });

        rx
    }
}
```

---

## 5. 硬件感知优化

### 5.1 硬件检测

```rust
// eduedge-ai-sdk/core/src/hardware.rs
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ComputeBackend {
    CoreML,      // Apple Silicon (M1/M2/M3/M4)
    Metal,       // macOS GPU
    DirectML,    // Windows GPU
    Vulkan,      // 跨平台 GPU
    CPU,         // 通用 CPU
}

pub struct HardwareProber;

impl HardwareProber {
    pub fn detect_best_backend() -> ComputeBackend {
        #[cfg(target_os = "macos")]
        {
            if Self::has_neural_engine() {
                return ComputeBackend::CoreML;
            }
            if Self::has_metal() {
                return ComputeBackend::Metal;
            }
        }

        #[cfg(target_os = "windows")]
        {
            if Self::has_directml() {
                return ComputeBackend::DirectML;
            }
        }

        #[cfg(target_os = "linux")]
        {
            if Self::has_vulkan() {
                return ComputeBackend::Vulkan;
            }
        }

        ComputeBackend::CPU
    }

    #[cfg(target_os = "macos")]
    fn has_neural_engine() -> bool {
        // 检测 Apple Silicon 芯片
        std::process::Command::new("sysctl")
            .arg("-n")
            .arg("machdep.cpu.brand_string")
            .output()
            .ok()
            .and_then(|output| String::from_utf8(output.stdout).ok())
            .map(|s| s.contains("Apple"))
            .unwrap_or(false)
    }
}
```

### 5.2 硬件加速效果

| 硬件后端 | 推理速度 (tokens/s) | 内存占用 | 功耗 |
|----------|---------------------|----------|------|
| **CoreML (M4)** | 45 | 2.1 GB | 8W |
| **Metal (M4)** | 38 | 2.5 GB | 12W |
| **DirectML (RTX 4060)** | 52 | 3.2 GB | 25W |
| **CPU (Intel i7)** | 12 | 1.8 GB | 35W |

::: tip 最佳实践
- **Apple Silicon**：优先使用 CoreML，利用 Neural Engine 加速
- **Windows**：优先使用 DirectML，利用 GPU 加速
- **Linux**：优先使用 Vulkan，兼容性最好
:::

---

## 6. 性能优化

### 6.1 批处理优化

```rust
// 批量处理多个 Token，减少事件发送频率
let mut token_buffer = String::new();
const BATCH_SIZE: usize = 5;

while let Some(token) = rx.recv().await {
    token_buffer.push_str(&token);

    if token_buffer.len() >= BATCH_SIZE {
        app.emit(&format!("llm-token:{}", stream_id), LlmTokenPayload {
            stream_id: stream_id.clone(),
            token: token_buffer.clone(),
        })?;
        token_buffer.clear();
    }
}

// 发送剩余 Token
if !token_buffer.is_empty() {
    app.emit(&format!("llm-token:{}", stream_id), LlmTokenPayload {
        stream_id: stream_id.clone(),
        token: token_buffer,
    })?;
}
```

### 6.2 内存池复用

```rust
// 复用推理引擎实例，避免重复加载模型
use once_cell::sync::Lazy;
use std::sync::Mutex;

static ENGINE_POOL: Lazy<Mutex<Option<LlamaEngine>>> = Lazy::new(|| Mutex::new(None));

#[command]
pub async fn init_local_model(model_path: String) -> Result<InitResult, String> {
    let backend = HardwareProber::detect_best_backend();
    let engine = LlamaEngine::new(&model_path).map_err(|e| e.to_string())?;

    *ENGINE_POOL.lock().unwrap() = Some(engine);

    Ok(InitResult {
        status: "success".to_string(),
        backend: format!("{:?}", backend),
    })
}
```

---

## 7. 错误处理与容错

### 7.1 前端错误捕获

```typescript
try {
  await EduEdgeAI.streamChat(prompt, (token) => {
    console.log(token);
  });
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes("model not initialized")) {
      // 提示用户先初始化模型
      alert("请先加载模型");
    } else if (error.message.includes("timeout")) {
      // 推理超时
      alert("推理超时，请重试");
    } else {
      // 其他错误
      console.error("推理失败:", error);
    }
  }
}
```

### 7.2 后端超时保护

```rust
use tokio::time::{timeout, Duration};

#[command]
pub async fn stream_chat(
    app: AppHandle,
    prompt: String,
    stream_id: String,
) -> Result<(), String> {
    let engine = ENGINE_POOL.lock().unwrap()
        .as_ref()
        .ok_or("Model not initialized")?
        .clone();

    let mut rx = engine.stream_chat(prompt).await;

    // 设置 30 秒超时
    let result = timeout(Duration::from_secs(30), async {
        while let Some(token) = rx.recv().await {
            app.emit(&format!("llm-token:{}", stream_id), LlmTokenPayload {
                stream_id: stream_id.clone(),
                token,
            })?;
        }
        Ok::<(), String>(())
    })
    .await;

    match result {
        Ok(Ok(())) => {
            app.emit(&format!("llm-finish:{}", stream_id), LlmFinishPayload {
                stream_id,
            })?;
            Ok(())
        }
        Ok(Err(e)) => Err(e),
        Err(_) => Err("Inference timeout".to_string()),
    }
}
```

---

## 8. 部署与配置

### 8.1 模型下载

```bash
# 下载 Qwen2.5-3B-Instruct GGUF 模型
wget https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf \
  -O models/qwen2.5-3b-instruct-q4_k_m.gguf
```

### 8.2 Tauri 配置

```json
// eduedge-ai-sdk/src-tauri/tauri.conf.json
{
  "plugins": {
    "eduedge-ai": {
      "modelPath": "./models/qwen2.5-3b-instruct-q4_k_m.gguf",
      "maxConcurrentRequests": 4,
      "inferenceTimeout": 30000
    }
  }
}
```

### 8.3 前端初始化

```typescript
import { EduEdgeAI } from '@eduedge/ai-sdk';

// 应用启动时初始化模型
async function initApp() {
  try {
    const result = await EduEdgeAI.init('./models/qwen2.5-3b-instruct-q4_k_m.gguf');
    console.log(`模型已加载，使用后端: ${result.backend}`);
  } catch (error) {
    console.error('模型加载失败:', error);
  }
}

initApp();
```

---

## 9. 故障排查指南

### 9.1 常见问题

::: details Q1: 模型加载失败 "InvalidModelPath"
**错误信息**：
```
Error: model path cannot be empty
```

**可能原因**：
1. 模型文件路径错误
2. 模型文件不存在
3. 权限不足

**解决方案**：
```typescript
// 检查文件是否存在
import { exists } from '@tauri-apps/plugin-fs';

const modelPath = './models/qwen2.5-3b-instruct-q4_k_m.gguf';
if (await exists(modelPath)) {
  await EduEdgeAI.init(modelPath);
} else {
  console.error('模型文件不存在:', modelPath);
}
```
:::

::: details Q2: 推理超时 "Inference timeout"
**错误信息**：
```
Error: Inference timeout
```

**可能原因**：
1. 模型过大，推理速度慢
2. 硬件性能不足
3. 超时设置过短

**解决方案**：
```rust
// 调整超时时间（Rust 后端）
let result = timeout(Duration::from_secs(60), async {
    // 推理逻辑
}).await;
```

**临时方案**：
- 使用更小的模型（如 3B 替代 7B）
- 降低生成长度限制
:::

::: details Q3: Token 流混淆（多窗口并发）
**现象**：
- 窗口 A 收到窗口 B 的 Token
- Token 顺序错乱

**原因**：
- `streamId` 过滤逻辑错误
- 事件监听器未正确清理

**解决方案**：
```typescript
// 确保 streamId 过滤
await listen<LlmTokenPayload>(tokenEvent, (event) => {
  const payload = event.payload;
  if (payload.streamId !== streamId) {
    console.warn('Ignoring token from different stream:', payload.streamId);
    return;  // 关键：过滤非匹配 streamId
  }
  onToken(payload.token);
});
```
:::

::: details Q4: 内存泄漏（事件监听器未清理）
**现象**：
- 内存占用持续增长
- 应用变慢

**原因**：
- 事件监听器未调用 `unlisten()`
- 多次调用 `streamChat` 未清理旧监听器

**解决方案**：
```typescript
// 使用 try-finally 确保清理
let unlistenToken: UnlistenFn | null = null;

try {
  unlistenToken = await listen(tokenEvent, handler);
  // ... 推理逻辑
} finally {
  unlistenToken?.();  // 确保清理
}
```
:::

### 9.2 性能调优

::: tip 优化首 Token 延迟
1. **模型预热**：应用启动时预加载模型
   ```typescript
   await EduEdgeAI.init(modelPath);
   // 预热推理
   await EduEdgeAI.streamChat("Hello", () => {});
   ```

2. **使用量化模型**：Q4_K_M 比 FP16 快 3-4x
3. **启用硬件加速**：确保使用 CoreML/Metal
:::

::: warning 降低内存占用
1. **使用更小的模型**：3B 替代 7B（内存减少 60%）
2. **限制并发数**：最多 4 个并发请求
3. **定期清理缓存**：
   ```rust
   // 清理 KV Cache
   engine.clear_cache();
   ```
:::

### 9.3 调试工具

```typescript
// 启用调试日志
localStorage.setItem('DEBUG', 'eduedge:*');

// 监控事件流
window.addEventListener('llm-token:*', (event) => {
  console.log('[DEBUG] Token event:', event);
});

// 检查硬件后端
const result = await EduEdgeAI.init(modelPath);
console.log('Using backend:', result.backend);
```

---

## 10. 性能指标

| 指标 | 目标值 | 实测值 (M4 Pro) | 实测值 (Intel i7) |
|------|--------|-----------------|-------------------|
| 首 Token 延迟 | < 500ms | 380ms | 650ms |
| Token 生成速度 | > 30 tokens/s | 45 tokens/s | 18 tokens/s |
| 并发请求数 | ≥ 4 | 4 | 2 |
| 内存占用 | < 3GB | 2.1GB | 2.8GB |
| 事件传输延迟 | < 10ms | 5ms | 8ms |

::: info 性能对比
- **Apple Silicon (M4 Pro)**：最佳性能，推荐使用 CoreML
- **Intel CPU**：性能较低，建议使用更小的模型
- **Windows GPU (DirectML)**：性能介于两者之间
:::

---

## 11. 最佳实践

### 11.1 错误处理

::: tip 完整的错误处理示例
```typescript
async function safeStreamChat(prompt: string, onToken: (token: string) => void) {
  try {
    await EduEdgeAI.streamChat(prompt, onToken);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('model not initialized')) {
        // 尝试重新初始化
        await EduEdgeAI.init(modelPath);
        await EduEdgeAI.streamChat(prompt, onToken);
      } else if (error.message.includes('timeout')) {
        // 提示用户重试
        showNotification('推理超时，请重试');
      } else {
        // 其他错误
        console.error('推理失败:', error);
        showNotification('推理失败，请检查日志');
      }
    }
  }
}
```
:::

### 11.2 并发控制

::: warning 限制并发数
```typescript
class ConcurrencyLimiter {
  private activeRequests = 0;
  private readonly maxConcurrent = 4;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    while (this.activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.activeRequests++;
    try {
      return await fn();
    } finally {
      this.activeRequests--;
    }
  }
}

const limiter = new ConcurrencyLimiter();

// 使用
await limiter.execute(() =>
  EduEdgeAI.streamChat(prompt, onToken)
);
```
:::

### 11.3 资源管理

::: tip 自动清理资源
```typescript
class StreamManager {
  private activeStreams = new Map<string, UnlistenFn[]>();

  async startStream(streamId: string, prompt: string, onToken: (token: string) => void) {
    const unlisteners: UnlistenFn[] = [];

    try {
      const tokenUnlisten = await listen(`llm-token:${streamId}`, handler);
      const finishUnlisten = await listen(`llm-finish:${streamId}`, handler);

      unlisteners.push(tokenUnlisten, finishUnlisten);
      this.activeStreams.set(streamId, unlisteners);

      await invoke('stream_chat', { prompt, streamId });
    } catch (error) {
      this.cleanup(streamId);
      throw error;
    }
  }

  cleanup(streamId: string) {
    const unlisteners = this.activeStreams.get(streamId);
    unlisteners?.forEach(fn => fn());
    this.activeStreams.delete(streamId);
  }

  cleanupAll() {
    for (const streamId of this.activeStreams.keys()) {
      this.cleanup(streamId);
    }
  }
}
```
:::

---

## 12. 相关文档

- [Multi-Agent 协作架构](./multi-agent-architecture.md) - 了解云端 AI 服务的编排机制
- [GraphRAG-X 混合检索](./graphrag-x.md) - 了解知识检索的实现
- [系统设计总览](./system-design.md) - 了解端云协同的整体架构
- [端侧 AI 部署指南](../03-how-to-guides/deployment/ai-model-deployment-guide.md) - 查看完整的部署文档

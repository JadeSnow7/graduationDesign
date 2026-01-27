# AI 服务接口

## 概述

AI 服务提供智能答疑、作业批改辅助、多模式对话等功能。支持多种对话模式和可选的 GraphRAG 知识检索增强。

## 权限要求

- `ai:use` - 使用 AI 服务

## 对话模式

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `tutor` | 智能导师模式 | 概念解释、知识答疑 |
| `grader` | 批改助手模式 | 作业批改、错误分析 |
| `sim_explain` | 仿真解释模式 | 仿真结果解读 |
| `formula_verify` | 公式验证模式 | 公式推导验证 |
| `sim_tutor` | 仿真导师模式 | 仿真参数指导 |
| `problem_solver` | 问题求解模式 | 习题解答指导 |

### GraphRAG 增强

在任何模式后添加 `_rag` 后缀可启用知识检索增强：
- `tutor_rag` - 基于知识库的智能答疑
- `grader_rag` - 基于评分标准的批改辅助
- 其他模式类推

## 接口列表

### 1. AI 对话

与 AI 助手进行多轮对话。

**接口地址**: `POST /api/v1/ai/chat`

**权限要求**: `ai:use`

**请求参数**:
```json
{
  "mode": "tutor",
  "messages": [
    {
      "role": "user",
      "content": "什么是电场的边界条件？"
    }
  ],
  "context": {
    "course_id": "1",
    "chapter": "静电场",
    "assignment_id": "optional"
  },
  "stream": false
}
```

**参数说明**:
- `mode`: 对话模式，见上表
- `messages`: 对话历史，包含 `role`（user/assistant）和 `content`
- `context`: 上下文信息（可选）
- `stream`: 是否启用流式响应，默认 false

**响应示例**:
```json
{
  "success": true,
  "data": {
    "reply": "电场的边界条件是指在不同介质分界面上电场必须满足的条件。主要包括：\n\n1. **切向分量连续性**：电场的切向分量在分界面两侧连续\n2. **法向分量跳跃性**：电场的法向分量在有面电荷密度的分界面上不连续\n\n具体表达式为：\n- E₁ₜ = E₂ₜ\n- D₁ₙ - D₂ₙ = σ\n\n这些条件来源于麦克斯韦方程组...",
    "mode": "tutor",
    "references": [
      {
        "source": "第二章 静电场",
        "section": "2.3 边界条件",
        "confidence": 0.95
      }
    ],
    "tokens_used": {
      "prompt": 150,
      "completion": 200,
      "total": 350
    },
    "response_time": 1.2
  }
}
```

### 2. 流式对话

启用流式响应的 AI 对话。

**接口地址**: `POST /api/v1/ai/chat`

**请求参数**:
```json
{
  "mode": "tutor",
  "messages": [
    {
      "role": "user", 
      "content": "解释某课程中的核心概念"
    }
  ],
  "stream": true
}
```

**响应格式**: Server-Sent Events (SSE)

**响应示例**:
```
data: {"type": "start", "mode": "tutor"}

data: {"type": "content", "delta": "核心概念"}

data: {"type": "content", "delta": "是课程中的重要知识点"}

data: {"type": "reference", "source": "第四章 相关内容", "confidence": 0.92}

data: {"type": "end", "tokens_used": {"total": 280}, "response_time": 2.1}
```

### 3. 作业批改辅助

使用 AI 辅助批改学生作业。

**接口地址**: `POST /api/v1/ai/grade`

**权限要求**: `ai:use`

**请求参数**:
```json
{
  "assignment_id": "1",
  "submission_content": "学生提交的作业内容...",
  "rubric": {
    "criteria": [
      {
        "name": "概念理解",
        "weight": 0.4,
        "description": "对基本概念的理解程度"
      },
      {
        "name": "计算准确性", 
        "weight": 0.4,
        "description": "计算过程和结果的准确性"
      },
      {
        "name": "表达清晰度",
        "weight": 0.2,
        "description": "解答的逻辑性和清晰度"
      }
    ]
  },
  "reference_answer": "参考答案内容..."
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "overall_score": 85,
    "max_score": 100,
    "criteria_scores": [
      {
        "name": "概念理解",
        "score": 36,
        "max_score": 40,
        "feedback": "对电场概念理解正确，但对边界条件的理解略有偏差"
      },
      {
        "name": "计算准确性",
        "score": 35,
        "max_score": 40,
        "feedback": "计算过程基本正确，但在第三步有一个符号错误"
      },
      {
        "name": "表达清晰度",
        "score": 14,
        "max_score": 20,
        "feedback": "解答逻辑清晰，但部分步骤说明不够详细"
      }
    ],
    "strengths": [
      "基本概念掌握扎实",
      "计算方法正确",
      "解题思路清晰"
    ],
    "weaknesses": [
      "边界条件理解需要加强",
      "计算细节需要更加仔细",
      "解答步骤可以更详细"
    ],
    "suggestions": [
      "复习第二章边界条件相关内容",
      "注意计算过程中的符号处理",
      "在解答中增加更多的说明文字"
    ],
    "confidence": 0.88
  }
}
```

### 4. 获取对话历史

获取用户的 AI 对话历史记录。

**接口地址**: `GET /api/v1/ai/history`

**权限要求**: `ai:use`

**请求参数**:
- `page` (query): 页码，默认 1
- `limit` (query): 每页数量，默认 20
- `mode` (query): 过滤特定模式
- `course_id` (query): 过滤特定课程

**响应示例**:
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "mode": "tutor",
        "title": "关于电场边界条件的讨论",
        "course_id": "1",
        "message_count": 6,
        "created_at": "2025-12-23T09:00:00Z",
        "updated_at": "2025-12-23T09:15:00Z",
        "last_message": "谢谢老师的解释，我明白了！"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20
  }
}
```

### 5. 获取对话详情

获取特定对话的完整消息记录。

**接口地址**: `GET /api/v1/ai/conversations/{conversation_id}`

**权限要求**: `ai:use`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "mode": "tutor",
    "title": "关于电场边界条件的讨论",
    "course_id": "1",
    "messages": [
      {
        "id": "msg_1",
        "role": "user",
        "content": "什么是电场的边界条件？",
        "timestamp": "2025-12-23T09:00:00Z"
      },
      {
        "id": "msg_2", 
        "role": "assistant",
        "content": "电场的边界条件是指...",
        "references": [
          {
            "source": "第二章 静电场",
            "section": "2.3 边界条件"
          }
        ],
        "timestamp": "2025-12-23T09:00:05Z"
      }
    ],
    "created_at": "2025-12-23T09:00:00Z",
    "updated_at": "2025-12-23T09:15:00Z"
  }
}
```

### 6. 删除对话

删除指定的对话记录。

**接口地址**: `DELETE /api/v1/ai/conversations/{conversation_id}`

**权限要求**: `ai:use`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "message": "对话删除成功"
  }
}
```

## GraphRAG 知识检索

### 7. 搜索知识库

直接搜索知识库内容。

**接口地址**: `POST /api/v1/ai/search`

**权限要求**: `ai:use`

**请求参数**:
```json
{
  "query": "边界条件",
  "course_id": "1",
  "limit": 5,
  "threshold": 0.7
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "content": "电场的边界条件描述了电场在不同介质分界面上的行为...",
        "source": "第二章 静电场",
        "section": "2.3 边界条件",
        "page": 45,
        "score": 0.95,
        "metadata": {
          "chapter": 2,
          "topic": "静电场",
          "keywords": ["边界条件", "电场", "介质"]
        }
      }
    ],
    "total": 3,
    "query_time": 0.15
  }
}
```

### 8. 更新知识库

更新或重建知识库索引（管理员功能）。

**接口地址**: `POST /api/v1/ai/knowledge/rebuild`

**权限要求**: `admin`

**请求参数**:
```json
{
  "course_id": "1",
  "source_files": [
    "textbook_chapter1.md",
    "textbook_chapter2.md"
  ],
  "chunk_size": 1000,
  "overlap": 200
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "task_id": "rebuild_123",
    "status": "processing",
    "estimated_time": 300
  }
}
```

## 使用限制

### 速率限制
- 普通对话：30 次/分钟
- 流式对话：20 次/分钟  
- 批改辅助：10 次/分钟
- 知识库搜索：60 次/分钟

### 内容限制
- 单次对话最大 token 数：4000
- 对话历史最大轮数：20
- 文件上传最大大小：10MB

### 安全过滤
- 输入内容敏感词过滤
- 输出内容安全检查
- Prompt 注入攻击防护

## 错误处理

### 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| AI_SERVICE_UNAVAILABLE | AI 服务不可用 | 稍后重试或联系管理员 |
| INVALID_MODE | 无效的对话模式 | 检查模式参数是否正确 |
| TOKEN_LIMIT_EXCEEDED | Token 数量超限 | 减少输入内容长度 |
| RATE_LIMIT_EXCEEDED | 请求频率超限 | 降低请求频率 |
| CONTENT_FILTERED | 内容被过滤 | 检查输入内容是否合规 |
| KNOWLEDGE_BASE_ERROR | 知识库错误 | 联系管理员检查知识库状态 |

## 示例代码

### JavaScript/TypeScript
```typescript
// AI 对话
const chatWithAI = async (mode: string, messages: any[], stream = false) => {
  const response = await fetch('/api/v1/ai/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mode, messages, stream }),
  });
  
  if (stream) {
    // 处理流式响应
    const reader = response.body?.getReader();
    // ... 处理 SSE 流
  } else {
    const result = await response.json();
    if (!result.success) {
      throw new Error(result?.error?.message || 'AI 请求失败');
    }
    return result.data;
  }
};

// 作业批改
const gradeAssignment = async (assignmentId: string, content: string) => {
  const response = await fetch('/api/v1/ai/grade', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assignment_id: assignmentId,
      submission_content: content,
    }),
  });
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result?.error?.message || 'AI 批改失败');
  }
  return result.data;
};
```

### Python
```python
import requests

def chat_with_ai(token: str, mode: str, messages: list):
    response = requests.post('/api/v1/ai/chat', 
        headers={'Authorization': f'Bearer {token}'},
        json={
            'mode': mode,
            'messages': messages
        }
    )
    result = response.json()
    if not result.get('success'):
        raise Exception(result.get('error', {}).get('message', 'AI 请求失败'))
    return result.get('data')

def search_knowledge(token: str, query: str, course_id: str):
    response = requests.post('/api/v1/ai/search',
        headers={'Authorization': f'Bearer {token}'},
        json={
            'query': query,
            'course_id': course_id
        }
    )
    result = response.json()
    if not result.get('success'):
        raise Exception(result.get('error', {}).get('message', '检索失败'))
    return result.get('data')
```

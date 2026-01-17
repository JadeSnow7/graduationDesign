# 智能教学平台测试计划

> **版本**：1.1  
> **更新日期**：2026-01-12  
> **覆盖范围**：AI 服务、Go 后端、React 前端

---

## 〇、前置条件

### 系统依赖

| 依赖 | 版本要求 | 安装命令 |
|------|----------|----------|
| Python | ≥ 3.10 | - |
| Go | ≥ 1.21 | - |
| Node.js | ≥ 18 | - |
| jq | ≥ 1.6 | `brew install jq` / `apt install jq` |
| curl | 任意 | 系统自带 |

### 测试用户初始化

```sql
-- 在 MySQL/SQLite 中创建测试用户
INSERT INTO users (username, password_hash, role, created_at) VALUES
('test_student', '$2a$10$...', 'student', NOW()),
('test_teacher', '$2a$10$...', 'teacher', NOW());
-- 密码: test123

-- 或使用 API 注册
curl -X POST http://localhost:8080/api/v1/auth/register \
  -d '{"username":"test_student","password":"test123","role":"student"}'
```

### 服务启动顺序

```bash
# 1. 启动数据库
docker compose -f deploy/docker-compose.dev.yml up -d mysql

# 2. 启动 AI 服务
cd code/ai_service && uvicorn app.main:app --port 8001

# 3. 启动 Go 后端
cd code/backend && go run ./cmd/server

# 4. （可选）启动前端
cd code/frontend-react && npm run dev
```

### 环境变量

```bash
# AI 服务
export LLM_BASE_URL=http://localhost:11434
export LLM_MODEL=qwen3:8b

# Go 后端
export AI_SERVICE_URL=http://localhost:8001
export JWT_SECRET=test-secret-key
export DB_DSN="file:test.db?mode=memory"
```

---

## 一、测试层次概览

```
┌──────────────────────────────────────────────────────────────────────┐
│                         端到端测试 (E2E)                              │
│   用户视角完整流程验证：登录→引导学习→薄弱点检测→档案同步            │
├──────────────────────────────────────────────────────────────────────┤
│                         集成测试 (Integration)                        │
│   跨服务调用：Go→AI, AI→GraphRAG, 前端→Go                           │
├──────────────────────────────────────────────────────────────────────┤
│                         单元测试 (Unit)                               │
│   AI: weak_point_detector, coaching_strategy, session                 │
│   Go: handlers, clients, service                                      │
│   Frontend: store, orchestrator, API                                  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 二、AI 服务测试

### 2.1 单元测试

#### 薄弱点检测器 (`weak_point_detector.py`)

| 测试用例 | 输入 | 期望输出 |
|----------|------|----------|
| 正面反馈不触发 | "你的回答正确！高斯定律理解很到位" | `[]` |
| 负面反馈触发 | "还需要注意高斯定律的适用范围" | `["高斯定律"]` |
| 多概念检测 | "边界条件和麦克斯韦方程都有问题" | `["边界条件", "麦克斯韦方程"]` |
| 空输入 | `""` | `[]` |
| 英文概念 | "Maxwell equations 理解有误" | `["麦克斯韦方程"]` |

```bash
cd code/ai_service
pytest tests/test_weak_point_detector.py -v
```

#### 辅导策略技能 (`coaching_strategy.py`)

| 测试用例 | 验证点 |
|----------|--------|
| prompt 填充 | 学生 ID、薄弱点正确替换 |
| 空档案处理 | 无薄弱点时输出"暂无" |
| JSON 格式 | 输出结构符合预期 schema |

#### 会话管理 (`session.py`)

| 测试用例 | 验证点 |
|----------|--------|
| 创建会话 | 返回有效 session_id |
| 添加薄弱点 | weak_points 列表更新 |
| 步骤推进 | current_step 递增 |
| TTL 过期 | 超时会话自动清理 |

---

### 2.2 集成测试

#### `/v1/chat/guided` 端点

```bash
# 测试脚本
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -d '{"username":"test","password":"test123"}' | jq -r '.data.token')

# 1. 创建新会话
curl -X POST http://localhost:8080/api/v1/ai/chat/guided \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "高斯定律",
    "messages": [{"role": "user", "content": "我想学习高斯定律"}]
  }'
# 期望：返回 session_id, learning_path, current_step=0

# 2. 继续会话（正确回答）
curl -X POST http://localhost:8080/api/v1/ai/chat/guided \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "<SESSION_ID>",
    "messages": [{"role": "user", "content": "高斯定律说的是通过封闭曲面的电通量等于内部电荷除以ε₀"}]
  }'
# 期望：current_step 递增

# 3. 继续会话（错误回答）
curl -X POST http://localhost:8080/api/v1/ai/chat/guided \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "<SESSION_ID>",
    "messages": [{"role": "user", "content": "电场线从负电荷出发"}]
  }'
# 期望：weak_points 包含相关概念
```

---

## 三、Go 后端测试

### 3.1 单元测试

```bash
cd code/backend
go test ./internal/... -v -cover
```

#### 学习档案 Handler

| 测试用例 | 验证点 |
|----------|--------|
| GetProfile 成功 | 返回正确档案 |
| GetProfile 不存在 | 返回 null + 200 |
| SaveProfile 新建 | 返回 201 |
| SaveProfile 更新 | 返回 200 |
| 权限检查 | 学生只能看自己 |

#### AI 代理 Handler

| 测试用例 | 验证点 |
|----------|--------|
| ChatGuided 转发 | 请求体正确拼接 user_id |
| AI 服务超时 | 返回 502 |
| 无 JWT | 返回 401 |

### 3.2 数据库测试

```sql
-- 验证 StudentLearningProfile 表结构
DESCRIBE student_learning_profiles;

-- 验证唯一索引
INSERT INTO student_learning_profiles (student_id, course_id, weak_points)
VALUES (1, 1, '{}'), (1, 1, '{}');
-- 期望：唯一约束冲突
```

---

## 四、前端测试

### 4.1 组件测试

```typescript
// useChatStore.test.ts
describe('useChatStore', () => {
  it('should initialize guidedSession as null', () => {
    const { guidedSession } = useChatStore.getState();
    expect(guidedSession).toBeNull();
  });

  it('should update guidedSession on guided response', () => {
    useChatStore.setState({
      guidedSession: {
        sessionId: 'test-123',
        currentStep: 1,
        totalSteps: 5,
        progressPercentage: 20,
        weakPoints: ['高斯定律'],
        learningPath: [],
      },
    });
    const { guidedSession } = useChatStore.getState();
    expect(guidedSession?.progressPercentage).toBe(20);
  });
});
```

### 4.2 API Mock 测试

```typescript
// chatGuided.test.ts
describe('chatGuided API', () => {
  it('should call correct endpoint with auth header', async () => {
    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ session_id: 'abc', reply: 'Hello' }),
    });

    await chatGuided({ topic: '测试', messages: [{ role: 'user', content: 'hi' }] });

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/ai/chat/guided',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('Bearer'),
        }),
      })
    );
  });
});
```

---

## 五、端到端测试

### 5.1 核心用户流程

| 流程 | 步骤 | 验收标准 |
|------|------|----------|
| 引导学习完整流程 | 登录→选课→开始学习→多轮对话→查看进度 | 进度正确更新 |
| 薄弱点持久化 | 错误回答→检测薄弱点→关闭会话→重新打开 | 薄弱点仍存在 |
| 教师查看学情 | 教师登录→查看课程学情→导出报告 | 数据完整 |

### 5.2 自动化 E2E 脚本

```bash
#!/bin/bash
# e2e_guided_learning.sh

set -e

API_BASE="http://localhost:8080/api/v1"

# 1. 登录
echo "Step 1: Login..."
TOKEN=$(curl -sf -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"password123"}' | jq -r '.data.token')

if [ -z "$TOKEN" ]; then
  echo "FAIL: Login failed"
  exit 1
fi
echo "PASS: Login successful"

# 2. 开始引导学习
echo "Step 2: Start guided learning..."
RESP=$(curl -sf -X POST "$API_BASE/ai/chat/guided" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topic":"高斯定律","messages":[{"role":"user","content":"我想学习高斯定律"}]}')

SESSION_ID=$(echo "$RESP" | jq -r '.session_id')
if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "null" ]; then
  echo "FAIL: No session_id returned"
  exit 1
fi
echo "PASS: Session created: $SESSION_ID"

# 3. 验证学习路径
TOTAL_STEPS=$(echo "$RESP" | jq '.total_steps')
if [ "$TOTAL_STEPS" -lt 1 ]; then
  echo "FAIL: No learning path generated"
  exit 1
fi
echo "PASS: Learning path has $TOTAL_STEPS steps"

# 4. 继续对话（触发薄弱点检测）
echo "Step 4: Trigger weak point detection..."
RESP2=$(curl -sf -X POST "$API_BASE/ai/chat/guided" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"session_id\":\"$SESSION_ID\",\"messages\":[{\"role\":\"user\",\"content\":\"电场线从负电荷出发吧\"}]}")

# 注意：薄弱点检测取决于 AI 回复，可能不稳定
echo "Response: $(echo "$RESP2" | jq -c '.weak_points')"

echo "===== E2E TEST COMPLETE ====="
```

---

## 六、性能测试

### 6.1 响应时间基准

| 接口 | 目标 | 测量方式 |
|------|------|----------|
| `/v1/chat/guided` 首次 | < 5s | 包含 LLM 调用 |
| `/v1/chat/guided` 续聊 | < 3s | 有 session 缓存 |
| `/learning-profiles` GET | < 200ms | 数据库查询 |
| `/learning-profiles` POST | < 300ms | 数据库写入 |

### 6.2 并发测试

```bash
# 使用 ab 进行压力测试
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  -T application/json \
  -p request.json \
  http://localhost:8080/api/v1/learning-profiles/1/1
```

---

## 七、指标与报告

### 7.1 代码覆盖率目标

| 模块 | 目标覆盖率 |
|------|:----------:|
| AI 服务核心模块 | ≥ 80% |
| Go Handler 层 | ≥ 70% |
| Go Service 层 | ≥ 80% |
| Frontend 状态管理 | ≥ 60% |

### 7.2 质量门禁

- [ ] 所有单元测试通过
- [ ] 集成测试通过
- [ ] 无 P0/P1 级别 Bug
- [ ] 响应时间达标
- [ ] 代码覆盖率达标

### 7.3 测试报告格式

```markdown
# 测试报告 - YYYY-MM-DD

## 概要
- 执行测试: XX 个
- 通过: XX 个
- 失败: XX 个
- 跳过: XX 个

## 覆盖率
- AI 服务: XX%
- Go 后端: XX%
- 前端: XX%

## 失败用例
| 用例 | 模块 | 原因 |
|------|------|------|
| ... | ... | ... |

## 性能数据
| 接口 | P50 | P95 | P99 |
|------|-----|-----|-----|
| ... | ... | ... | ... |
```

---

## 八、测试环境

### 8.1 本地开发环境

```bash
# AI 服务
cd code/ai_service
export LLM_BASE_URL=http://localhost:11434
export LLM_MODEL=qwen3:8b
uvicorn app.main:app --port 8001

# Go 后端
cd code/backend
export AI_SERVICE_URL=http://localhost:8001
go run ./cmd/server

# 前端
cd code/frontend-react
npm run dev
```

### 8.2 CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  ai-service:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: |
          cd code/ai_service
          pip install -r requirements.txt
          pip install pytest pytest-cov
          pytest tests/ -v --cov=app --cov-report=xml

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.22'
      - run: |
          cd code/backend
          go test ./... -v -coverprofile=coverage.out

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: |
          cd code/frontend-react
          npm ci
          npm run test -- --coverage
```

---

## 九、执行检查清单

### 阶段一：准备
- [ ] 安装测试依赖（pytest, go test, jest）
- [ ] 配置测试数据库
- [ ] 准备测试账号

### 阶段二：单元测试
- [ ] AI 服务单元测试通过
- [ ] Go 后端单元测试通过
- [ ] 前端单元测试通过

### 阶段三：集成测试
- [ ] AI 服务端点测试通过
- [ ] Go 代理测试通过
- [ ] 前后端联调测试通过

### 阶段四：E2E 测试
- [ ] 核心流程 E2E 测试通过
- [ ] 性能基准测试通过

### 阶段五：报告
- [ ] 生成测试报告
- [ ] 更新测试覆盖率徽章

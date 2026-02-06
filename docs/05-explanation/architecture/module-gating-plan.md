# 课程模块配置与后端门控方案（细化草案）

本方案用于在后端实现“课程专属模块”开关校验，并与前端菜单/路由联动。

## 1. 目标

- 支持课程级模块配置（按课程启用/关闭功能）。
- 后端统一校验模块开关，避免仅靠前端隐藏。
- 与现有 RBAC 权限校验叠加，不影响通用能力。
- 具备可回滚/可灰度的发布策略。

## 2. 模块标识与分类

### 2.1 模块标识规范

```
core.ai
core.analytics
core.code_editor
course.simulation
course.writing
course.domain_pack.physics
course.domain_pack.academic_writing
```

### 2.2 模块分类建议

| 模块 | 类型 | 默认状态 | 说明 |
|------|------|----------|------|
| core.ai | 通用 | ON | AI 答疑能力，所有课程可用 |
| core.analytics | 通用 | ON | 学情分析与学习事件 |
| core.code_editor | 通用 | OFF | 需平台层统一开关 |
| course.simulation | 课程专属 | OFF | 仿真/数值计算类课程工具 |
| course.writing | 课程专属 | OFF | 写作提交/分析/润色 |
| course.domain_pack.* | 课程专属 | OFF | 课程知识包（RAG/术语） |

> 课程专属模块仅对已选修该课程的用户开放。

## 3. 数据模型方案

### 3.1 方案 A：课程表扩展字段（优先）

在 `courses` 表新增：
- `enabled_modules` (JSON)
- `module_settings` (JSON)

示例：
```json
{
  "enabled_modules": ["core.ai", "core.analytics", "course.simulation"],
  "module_settings": {
    "course.simulation": { "max_runtime_sec": 5 },
    "course.writing": { "min_word_count": 50 }
  }
}
```

**GORM 建议结构**：
```go
// Course
EnabledModules datatypes.JSON `gorm:"type:json" json:"enabled_modules"` // JSON array
ModuleSettings datatypes.JSON `gorm:"type:json" json:"module_settings"` // JSON object
```

**优点**：读取简单、与课程详情一次返回。  
**缺点**：字段扩展过多时可读性下降。

### 3.2 方案 B：独立配置表（可选）

新增 `course_modules`：
```
id, course_id, module_key, enabled, settings_json, updated_at
```

**优点**：可细粒度管理、便于审计。  
**缺点**：查询更复杂，需要额外 join 或缓存。

## 4. API 变更建议

### 4.1 课程详情包含模块配置

- `GET /api/v1/courses/:id` 追加：
  - `enabled_modules: string[]`
  - `module_settings: Record<string, any>`

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "课程示例",
    "enabled_modules": ["core.ai", "core.analytics", "course.simulation"],
    "module_settings": {
      "course.simulation": { "max_runtime_sec": 5 }
    }
  }
}
```

### 4.2 新增模块配置接口（教师/管理员）

- `GET /api/v1/courses/:id/modules`
- `PUT /api/v1/courses/:id/modules`

**PUT 请求示例**：
```json
{
  "enabled_modules": ["core.ai", "core.analytics", "course.writing"],
  "module_settings": {
    "course.writing": { "min_word_count": 80 }
  }
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "enabled_modules": ["core.ai", "core.analytics", "course.writing"],
    "module_settings": {"course.writing": {"min_word_count": 80}}
  }
}
```

### 4.3 创建课程时预置模块（可选）

**POST /api/v1/courses** 请求示例：
```json
{
  "name": "课程示例",
  "code": "COURSE101",
  "semester": "2026-2027-1",
  "enabled_modules": ["core.ai", "core.analytics", "course.writing"],
  "module_settings": {
    "course.writing": { "min_word_count": 80 }
  }
}
```

## 5. 后端门控中间件

### 5.1 中间件职责

新增中间件 `RequireCourseModule(moduleKey)`：

- **输入**：`moduleKey` + `courseId`（从 path/query/body/context 获取）
- **流程**：
  1. 校验用户已加入课程（已有逻辑复用）
  2. 读取课程模块配置
  3. 若 `moduleKey` 未启用 → 返回 403 + `MODULE_DISABLED`

### 5.2 CourseId 提取规则（推荐）

优先级从高到低：
1. Path param：`/courses/:courseId/...`
2. Query param：`?course_id=`
3. Request body：`{"course_id": ...}`
4. Header：`X-Course-Id`

> 对于 `/sim/*` 与 `/calc/*` 建议统一在请求体中加入 `course_id`。若缺失则返回 400 + `COURSE_ID_REQUIRED`。

**仿真请求示例**：
```json
{
  "course_id": 1,
  "charges": [
    { "x": 0.0, "y": 0.0, "q": 1e-9 }
  ]
}
```

**替代方案**（Header）：
```
X-Course-Id: 1
```

### 5.3 缓存策略

- 缓存 Key：`course_id -> enabled_modules`
- TTL：60~300 秒
- 更新模块配置后主动失效缓存

## 6. 路由绑定建议

| 模块 | 示例接口 | 门控 |
|------|----------|------|
| course.simulation | `/sim/*`, `/calc/*` | ✅ |
| course.writing | `/courses/:courseId/writing` | ✅ |
| course.domain_pack.* | `/ai/chat` 里启用 rag/领域包时 | ✅（软校验） |
| core.ai | `/ai/*` | ❌（通用能力） |
| core.analytics | `/learning-profiles/*` | ❌（通用能力） |

> 说明：`course.domain_pack.*` 可在 AI 服务层做“软校验”，若未启用则忽略知识包，不阻断对话。

## 7. 前端协作点

### 7.1 课程配置获取

- 在课程进入时加载 `enabled_modules`，写入 CourseContext。

### 7.2 菜单与路由渲染

- 侧边栏按 `enabled_modules` 渲染。
- 未启用模块访问时跳转到“未开通”提示页。

### 7.3 课程工具入口

- 课程工具（仿真/写作等）仅在启用时出现。
- 对通用能力入口不做限制。

## 8. 迁移与默认策略

### 8.1 默认值建议
- 新课程默认开启：`core.ai`, `core.analytics`
- 老课程：若字段为空，视为“仅通用能力”

### 8.2 迁移步骤
1. 增加字段或新表
2. 后端中间件与接口校验接入
3. 前端菜单联动
4. 文档同步

## 9. 错误码建议

```
400 COURSE_ID_REQUIRED  缺少课程 ID
403 MODULE_DISABLED     该课程未开通此功能
```

**错误响应示例**：
```json
{
  "success": false,
  "error": {
    "code": "MODULE_DISABLED",
    "message": "module disabled for this course"
  }
}
```

## 10. 可观测性建议

- 记录模块拦截日志：`course_id`, `module_key`, `user_id`
- 统计模块使用次数与拦截次数

## 11. 测试建议

- **单元测试**：中间件对不同 `course_id` 配置返回正确状态
- **集成测试**：
  - 启用/禁用模块后接口访问是否被正确拦截
  - 前端菜单与路由是否正确隐藏/提示

## 12. 开放问题

- 是否需要“课程管理员”角色来配置模块？
- 是否允许助教修改模块配置？
- `course.domain_pack.*` 的启用是否仅影响 RAG，不影响普通对话？

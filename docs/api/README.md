# API 文档

本目录包含项目的所有 API 接口文档。

## API 概览

### 基础信息
- **基地址**: `/api/v1`
- **协议**: HTTP/HTTPS
- **数据格式**: JSON
- **认证方式**: JWT Bearer Token

### API 分类

#### 🔐 [认证接口](./authentication.md)
- 用户登录
- 企业微信 OAuth
- Token 刷新
- 用户信息获取

#### 📚 [课程管理接口](./course-management.md)
- 课程 CRUD 操作
- 课程成员管理
- 作业管理
- 资源管理

#### 🤖 [AI 服务接口](./ai-services.md)
- 智能答疑
- 作业批改辅助
- 多模式对话
- GraphRAG 检索

#### 🔬 [仿真服务接口](./simulation-services.md)
- 课程专属仿真模块（示例实现）
- 数值计算（积分、微分、矢量运算）
- 可视化生成
- 参数验证

## 通用规范

### 请求格式
```http
POST /api/v1/endpoint
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "param1": "value1",
  "param2": "value2"
}
```

### 响应格式
```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": "详细错误信息"
  }
}
```

## 状态码说明

| 状态码 | 说明 | 示例场景 |
|--------|------|----------|
| 200 | 成功 | 请求处理成功 |
| 201 | 创建成功 | 资源创建成功 |
| 400 | 请求错误 | 参数格式错误 |
| 401 | 未认证 | Token 无效或过期 |
| 403 | 无权限 | 权限不足 |
| 404 | 资源不存在 | 请求的资源未找到 |
| 429 | 请求过频 | 超出速率限制 |
| 500 | 服务器错误 | 内部服务器错误 |

## 权限系统

### 角色定义
- **admin**: 系统管理员，拥有所有权限
- **teacher**: 教师，拥有课程管理和教学相关权限
- **assistant**: 助教，拥有辅助教学权限
- **student**: 学生，拥有学习相关权限

### 权限列表
- `course:read` - 查看课程
- `course:write` - 管理课程
- `ai:use` - 使用 AI 服务
- `sim:use` - 使用仿真服务
- `user:manage` - 用户管理

## 速率限制

| 接口类型 | 限制规则 | 说明 |
|----------|----------|------|
| 认证接口 | 10 次/分钟 | 防止暴力破解 |
| AI 接口 | 30 次/分钟 | 控制 AI 服务调用 |
| 仿真接口 | 20 次/分钟 | 控制计算资源使用 |
| 其他接口 | 100 次/分钟 | 常规业务接口 |

## 开发工具

### API 测试
- **Postman Collection**: [下载链接](./postman-collection.json)
- **OpenAPI Spec**: [swagger.yaml](./swagger.yaml)
- **在线文档**: http://localhost:8080/swagger/

### SDK 支持
- **JavaScript/TypeScript**: 前端 API 客户端
- **Python**: AI 服务开发工具
- **Go**: 后端服务开发工具

## 版本管理

### 当前版本
- **API 版本**: v1
- **文档版本**: 1.0.0
- **最后更新**: 2025-12-23

### 版本策略
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

## 相关资源

- [架构文档](../architecture/)
- [部署文档](../deployment/)
- [开发文档](../development/)

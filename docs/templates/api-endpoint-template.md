# [HTTP方法] /api/v1/[路径]

> 接口功能一句话描述

## 权限要求

- 权限: `permission:name`

## 请求

### 路径参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | number | 是 | 资源 ID |

### 请求体

```json
{
  "field": "value"
}
```

## 响应

### 成功响应 (200)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "示例"
  }
}
```

### 错误响应

| 状态码 | 错误码 | 说明 |
|--------|--------|------|
| 400 | INVALID_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未授权 |
| 404 | NOT_FOUND | 资源不存在 |

## 示例

```bash
curl -X GET "http://localhost:8080/api/v1/resource/1" \
  -H "Authorization: Bearer <token>"
```

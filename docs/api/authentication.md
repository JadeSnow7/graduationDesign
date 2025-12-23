# 认证接口

## 概述

认证系统支持两种登录方式：
1. 用户名密码登录
2. 企业微信 OAuth 登录

所有认证接口都返回 JWT Token，用于后续 API 调用的身份验证。

## 接口列表

### 1. 健康检查

检查服务状态。

**接口地址**: `GET /healthz`

**请求参数**: 无

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2025-12-23T10:00:00Z"
}
```

### 2. 用户名密码登录

使用用户名和密码进行登录认证。

**接口地址**: `POST /api/v1/auth/login`

**请求参数**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user_id": "1",
    "username": "admin",
    "role": "admin"
  },
  "message": "登录成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "用户名或密码错误"
  }
}
```

### 3. 获取当前用户信息

获取当前登录用户的详细信息。

**接口地址**: `GET /api/v1/auth/me`

**请求头**:
```
Authorization: Bearer <jwt_token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "1",
    "username": "admin",
    "name": "系统管理员",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": [
      "course:read",
      "course:write",
      "ai:use",
      "sim:use",
      "user:manage"
    ],
    "created_at": "2025-01-01T00:00:00Z",
    "last_login": "2025-12-23T09:30:00Z"
  }
}
```

## 企业微信 OAuth 登录

### 4. 获取企业微信授权 URL

生成企业微信授权登录的 URL。

**接口地址**: `GET /api/v1/auth/wecom/oauth-url`

**请求参数**:
- `redirect_uri` (query): 授权回调地址

**响应示例**:
```json
{
  "success": true,
  "data": {
    "oauth_url": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=...&redirect_uri=...&response_type=code&scope=snsapi_base&state=..."
  }
}
```

### 5. 企业微信 OAuth 登录

使用企业微信授权码进行登录。

**接口地址**: `POST /api/v1/auth/wecom`

**请求参数**:
```json
{
  "code": "xxxxxx"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user_id": "2",
    "name": "张三",
    "wecom_user_id": "zhangsan",
    "role": "student"
  },
  "message": "登录成功"
}
```

### 6. 企业微信 JS-SDK 配置

获取企业微信 JS-SDK 的配置信息。

**接口地址**: `POST /api/v1/auth/wecom/jsconfig`

**请求参数**:
```json
{
  "url": "https://example.com/current-page"
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "appId": "wx1234567890abcdef",
    "timestamp": 1640000000,
    "nonceStr": "randomstring",
    "signature": "signature_string"
  }
}
```

## JWT Token 说明

### Token 结构
JWT Token 包含以下信息：
- `user_id`: 用户 ID
- `username`: 用户名
- `role`: 用户角色
- `permissions`: 用户权限列表
- `exp`: 过期时间
- `iat`: 签发时间

### Token 使用
在需要认证的接口请求中，需要在请求头中包含 JWT Token：

```http
Authorization: Bearer <jwt_token>
```

### Token 过期处理
- Token 默认有效期为 24 小时
- Token 过期后需要重新登录获取新的 Token
- 前端应监听 401 状态码，自动跳转到登录页面

## 权限验证

### 权限检查流程
1. 验证 JWT Token 的有效性
2. 提取用户角色和权限信息
3. 检查当前接口所需的权限
4. 返回权限验证结果

### 权限不足处理
当用户权限不足时，返回 403 状态码：

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "权限不足，无法访问该资源",
    "required_permission": "course:write"
  }
}
```

## 安全注意事项

### 密码安全
- 密码使用 bcrypt 进行哈希存储
- 支持密码复杂度验证
- 登录失败次数限制

### Token 安全
- JWT 使用 HMAC SHA256 签名
- Token 包含过期时间验证
- 支持 Token 黑名单机制

### 企业微信安全
- 验证企业微信回调的合法性
- 使用 HTTPS 进行数据传输
- 定期更新企业微信应用密钥

## 示例代码

### JavaScript/TypeScript
```typescript
// 登录
const login = async (username: string, password: string) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  const result = await response.json();
  if (result.success) {
    localStorage.setItem('token', result.data.access_token);
    return result.data;
  } else {
    throw new Error(result.error.message);
  }
};

// 获取用户信息
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/v1/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
};
```

### Python
```python
import requests

# 登录
def login(username: str, password: str):
    response = requests.post('/api/v1/auth/login', json={
        'username': username,
        'password': password
    })
    
    result = response.json()
    if result['success']:
        return result['data']['access_token']
    else:
        raise Exception(result['error']['message'])

# 获取用户信息
def get_current_user(token: str):
    response = requests.get('/api/v1/auth/me', headers={
        'Authorization': f'Bearer {token}'
    })
    
    return response.json()
```
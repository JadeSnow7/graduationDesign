# API（原型）

后端基地址：`/api/v1`

## 1. 健康检查
- `GET /healthz`

## 2. 登录
- `POST /auth/login`

请求：
```json
{"username":"admin","password":"admin123"}
```

响应：
```json
{"access_token":"...","token_type":"Bearer","expires_in":86400}
```

## 3. 当前用户
- `GET /auth/me`（Header：`Authorization: Bearer <token>`）

## 4. 课程
- `GET /courses`（需要 `course:read`）
- `POST /courses`（需要 `course:write`）

创建课程请求：
```json
{"name":"电磁场","code":"EMF101","semester":"2025-2026-1"}
```

## 5. AI 对话
- `POST /ai/chat`（需要 `ai:use`）

请求：
```json
{
  "mode": "tutor",
  "messages": [{"role":"user","content":"什么是边界条件？"}]
}
```

## 6. 仿真（Laplace 2D）
- `POST /sim/laplace2d`（需要 `sim:use`）

请求：
```json
{"nx":60,"ny":40,"v_top":1,"v_bottom":0,"v_left":0,"v_right":0}
```

响应包含 `png_base64`，前端可用 `data:image/png;base64,` 直接展示。


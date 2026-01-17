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

### 2.1 企业微信 OAuth 登录（可选）
需要后端配置环境变量：`WECOM_CORPID` / `WECOM_AGENTID` / `WECOM_SECRET`。

- `GET /auth/wecom/oauth-url?redirect_uri=...`：生成企业微信授权地址（前端跳转用）
- `POST /auth/wecom`：用 `code` 换取 JWT
- `POST /auth/wecom/jsconfig`：企业微信 JS-SDK 签名（可选）

`POST /auth/wecom` 请求：
```json
{"code":"xxxxxx"}
```

响应（同账号密码登录）：
```json
{"access_token":"...","token_type":"Bearer","expires_in":86400,"user_id":"...","name":"..."}
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

支持模式：`tutor`, `grader`, `sim_explain`, `formula_verify`, `sim_tutor`, `problem_solver`

如启用 GraphRAG（知识库检索增强），可在模式后追加 `_rag` 后缀，例如：`tutor_rag`、`grader_rag`。

请求：
```json
{
  "mode": "tutor",
  "messages": [{"role":"user","content":"什么是边界条件？"}]
}
```

## 6. 仿真服务（需要 `sim:use`）

### 6.1 Laplace 2D
- `POST /sim/laplace2d`

请求：
```json
{"nx":60,"ny":40,"v_top":1,"v_bottom":0,"v_left":0,"v_right":0}
```

响应包含 `png_base64`，前端可用 `data:image/png;base64,` 直接展示。

### 6.2 点电荷电场
- `POST /sim/point_charges`

请求：
```json
{
  "charges": [
    {"x": 0.3, "y": 0, "q": 1e-9},
    {"x": -0.3, "y": 0, "q": -1e-9}
  ],
  "x_min": -1, "x_max": 1,
  "y_min": -1, "y_max": 1,
  "grid_size": 50,
  "show_potential": true,
  "show_field_lines": true
}
```

### 6.3 高斯定理验证
- `POST /sim/gauss_flux`

请求：
```json
{
  "charges": [{"x": 0, "y": 0, "q": 1e-9}],
  "center_x": 0, "center_y": 0,
  "radius": 0.5
}
```

### 6.4 导线磁场
- `POST /sim/wire_field`

请求：
```json
{
  "wires": [{"x": 0, "y": 0, "current": 1.0}],
  "x_min": -0.1, "x_max": 0.1,
  "y_min": -0.1, "y_max": 0.1,
  "grid_size": 50
}
```

### 6.5 螺线管磁场
- `POST /sim/solenoid`

请求：
```json
{"n_turns": 100, "length": 0.1, "radius": 0.02, "current": 1.0}
```

### 6.6 安培环路定律
- `POST /sim/ampere_loop`

### 6.7 一维波动方程
- `POST /sim/wave_1d`

请求：
```json
{
  "length": 1.0,
  "nx": 200,
  "total_time": 1e-8,
  "source_type": "gaussian",
  "boundary_condition": "absorbing",
  "output_type": "spacetime"
}
```

### 6.8 菲涅尔系数
- `POST /sim/fresnel`

请求：
```json
{"n1": 1.0, "n2": 1.5, "theta_i": 30, "polarization": "s"}
```

## 7. 数值计算服务（需要 `sim:use`）

### 7.1 积分
- `POST /calc/integrate`

请求：
```json
{
  "expression": "x**2 + sin(x)",
  "variable": "x",
  "lower": 0,
  "upper": 3.14159,
  "method": "numerical"
}
```

### 7.2 微分
- `POST /calc/differentiate`

请求：
```json
{"expression": "x**3 + sin(x)", "variable": "x", "order": 1}
```

### 7.3 公式求值
- `POST /calc/evaluate`

请求：
```json
{
  "formula": "k*q/r**2",
  "variables": {"k": 9e9, "q": 1e-9, "r": 0.1}
}
```

### 7.4 矢量运算
- `POST /calc/vector_op`

支持操作：`divergence`, `curl`, `gradient`, `laplacian`

请求（散度）：
```json
{
  "operation": "divergence",
  "fx": "x**2",
  "fy": "y**2",
  "fz": "z**2"
}
```

请求（梯度）：
```json
{
  "operation": "gradient",
  "scalar": "x**2 + y**2 + z**2"
}
```

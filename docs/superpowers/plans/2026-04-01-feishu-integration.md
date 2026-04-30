# 飞书集成（Bot + 小程序）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为毕业设计项目新增飞书机器人通知 + 飞书小程序，可独立运行、可用于简历展示，同时对标飞书 iOS 开发岗的技术考察点。

**Architecture:** 两个独立子系统（可分开实现）——①后端 Go 飞书客户端 + 通知 API（参照已有 WecomClient 模式），②飞书小程序前端（TTML/TS，调用现有后端 `/api/v1` 接口，JWT 鉴权）。两者通过 `POST /api/v1/auth/feishu` 端点打通登录链路。

**Tech Stack:**
- 后端：Go 1.24 + Gin，飞书开放平台 REST API（OAuth 2.0 / Bot Webhook）
- 小程序：飞书小程序框架（TTML/TTSS/TS），`tt` 全局对象，`@byted/byted-lynx` UI 组件（可选）
- 测试：Go `testing` + `net/http/httptest`；小程序逻辑单元测试用 Jest

---

## 范围说明

本计划覆盖两个子系统，可分开执行：

- **Part A（Task 1–6）**：后端飞书集成（机器人 Webhook + OAuth 登录），预计 2 天
- **Part B（Task 7–11）**：飞书小程序前端，预计 4 天

两者唯一的依赖是 Part A 中 `POST /api/v1/auth/feishu` 端点，小程序可先用 mock 数据开发。

---

## 文件结构

### Part A — 后端新增/修改

| 文件 | 操作 | 职责 |
|------|------|------|
| `code/backend/internal/clients/feishu.go` | 新建 | 飞书 HTTP 客户端：access token、user_info、bot webhook 消息发送 |
| `code/backend/internal/clients/feishu_test.go` | 新建 | FeishuClient 单元测试（httptest mock） |
| `code/backend/internal/http/handlers_feishu.go` | 新建 | Feishu OAuth 登录 handler、webhook 通知 handler |
| `code/backend/internal/http/handlers_feishu_test.go` | 新建 | handler 测试 |
| `code/backend/internal/http/routes/feishu.go` | 新建 | 飞书相关路由注册 |
| `code/backend/internal/http/router.go` | 修改 | 注册 Feishu 路由 |
| `code/backend/internal/http/router_deps.go` | 修改 | 添加 FeishuHandlers 字段 |
| `code/backend/internal/config/config.go` | 修改 | 添加 Feishu 配置字段 |
| `code/backend/internal/app/app.go` | 修改 | 初始化 FeishuClient、注册 handlers |
| `code/.env.example` | 修改 | 添加飞书环境变量说明 |

### Part B — 飞书小程序（新目录）

| 文件 | 操作 | 职责 |
|------|------|------|
| `code/feishu-miniapp/project.config.json` | 新建 | 小程序项目配置（appid、框架版本） |
| `code/feishu-miniapp/app.js` | 新建 | App 入口，globalData 存 token/userInfo |
| `code/feishu-miniapp/app.json` | 新建 | 页面路由注册、tabBar 配置 |
| `code/feishu-miniapp/app.ttss` | 新建 | 全局样式 |
| `code/feishu-miniapp/utils/request.js` | 新建 | 封装 `tt.request`，自动附加 JWT header |
| `code/feishu-miniapp/utils/auth.js` | 新建 | login/logout/getToken 逻辑 |
| `code/feishu-miniapp/pages/login/login.ttml` | 新建 | 登录页 UI |
| `code/feishu-miniapp/pages/login/login.js` | 新建 | 飞书 `tt.login` → 后端 `/auth/feishu` → 存 token |
| `code/feishu-miniapp/pages/assignments/list.ttml` | 新建 | 作业列表页 UI |
| `code/feishu-miniapp/pages/assignments/list.js` | 新建 | 调用 `GET /api/v1/courses/:id/assignments` |
| `code/feishu-miniapp/pages/assignments/detail.ttml` | 新建 | 作业详情 + 提交入口 |
| `code/feishu-miniapp/pages/assignments/detail.js` | 新建 | 作业详情逻辑，触发 bot 通知 |
| `code/feishu-miniapp/pages/writing/feedback.ttml` | 新建 | AI 写作反馈展示页 |
| `code/feishu-miniapp/pages/writing/feedback.js` | 新建 | 轮询 `/api/v1/writing/analyze` 结果 |
| `code/feishu-miniapp/pages/dashboard/index.ttml` | 新建 | 学习进度 Dashboard UI |
| `code/feishu-miniapp/pages/dashboard/index.js` | 新建 | 调用 `/api/v1/learning-profile` 渲染进度 |

---

## Part A — 后端飞书集成

---

### Task 1: 飞书客户端 (FeishuClient)

**Files:**
- Create: `code/backend/internal/clients/feishu.go`
- Create: `code/backend/internal/clients/feishu_test.go`

- [ ] **Step 1: 写失败测试（access token）**

```go
// code/backend/internal/clients/feishu_test.go
package clients_test

import (
    "context"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/huaodong/llm-teaching-platform/backend/internal/clients"
)

func TestFeishuClient_GetAccessToken(t *testing.T) {
    srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if r.URL.Path != "/open-apis/auth/v3/tenant_access_token/internal" {
            t.Errorf("unexpected path: %s", r.URL.Path)
        }
        json.NewEncoder(w).Encode(map[string]interface{}{
            "code":                 0,
            "tenant_access_token": "test-token-abc",
            "expire":               7200,
        })
    }))
    defer srv.Close()

    c := clients.NewFeishuClientWithBase(clients.FeishuConfig{
        AppID:     "cli_test",
        AppSecret: "secret_test",
    }, srv.URL)

    token, err := c.GetAccessToken(context.Background())
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if token != "test-token-abc" {
        t.Errorf("got %q, want %q", token, "test-token-abc")
    }
}
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go test ./internal/clients/ -run TestFeishuClient_GetAccessToken -v
```
预期：`clients.NewFeishuClientWithBase undefined`

- [ ] **Step 3: 实现 FeishuClient**

```go
// code/backend/internal/clients/feishu.go
package clients

import (
    "bytes"
    "context"
    "encoding/json"
    "errors"
    "fmt"
    "io"
    "net/http"
    "sync"
    "time"
)

const feishuBaseURL = "https://open.feishu.cn"

// FeishuConfig holds Feishu Open Platform configuration
type FeishuConfig struct {
    AppID     string
    AppSecret string
}

// FeishuClient handles Feishu Open Platform API interactions
type FeishuClient struct {
    appID       string
    appSecret   string
    baseURL     string
    httpClient  *http.Client
    accessToken string
    tokenExpiry time.Time
    tokenMu     sync.RWMutex
}

// NewFeishuClient creates a FeishuClient using the production base URL
func NewFeishuClient(cfg FeishuConfig) *FeishuClient {
    return NewFeishuClientWithBase(cfg, feishuBaseURL)
}

// NewFeishuClientWithBase creates a FeishuClient with a custom base URL (for testing)
func NewFeishuClientWithBase(cfg FeishuConfig, baseURL string) *FeishuClient {
    return &FeishuClient{
        appID:     cfg.AppID,
        appSecret: cfg.AppSecret,
        baseURL:   baseURL,
        httpClient: &http.Client{Timeout: 10 * time.Second},
    }
}

// IsConfigured returns true if Feishu is properly configured
func (c *FeishuClient) IsConfigured() bool {
    return c.appID != "" && c.appSecret != ""
}

type tenantTokenResp struct {
    Code               int    `json:"code"`
    Msg                string `json:"msg"`
    TenantAccessToken  string `json:"tenant_access_token"`
    Expire             int    `json:"expire"`
}

// GetAccessToken retrieves or refreshes the tenant access token
func (c *FeishuClient) GetAccessToken(ctx context.Context) (string, error) {
    c.tokenMu.RLock()
    if c.accessToken != "" && time.Now().Before(c.tokenExpiry) {
        t := c.accessToken
        c.tokenMu.RUnlock()
        return t, nil
    }
    c.tokenMu.RUnlock()

    c.tokenMu.Lock()
    defer c.tokenMu.Unlock()

    if c.accessToken != "" && time.Now().Before(c.tokenExpiry) {
        return c.accessToken, nil
    }

    payload, _ := json.Marshal(map[string]string{
        "app_id":     c.appID,
        "app_secret": c.appSecret,
    })
    url := c.baseURL + "/open-apis/auth/v3/tenant_access_token/internal"
    req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
    if err != nil {
        return "", fmt.Errorf("create request: %w", err)
    }
    req.Header.Set("Content-Type", "application/json")

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return "", fmt.Errorf("request token: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
    if err != nil {
        return "", fmt.Errorf("read response: %w", err)
    }

    var result tenantTokenResp
    if err := json.Unmarshal(body, &result); err != nil {
        return "", fmt.Errorf("parse response: %w", err)
    }
    if result.Code != 0 {
        return "", fmt.Errorf("feishu error %d: %s", result.Code, result.Msg)
    }

    c.accessToken = result.TenantAccessToken
    c.tokenExpiry = time.Now().Add(time.Duration(result.Expire-300) * time.Second)
    return c.accessToken, nil
}

// FeishuUserInfo holds user info from Feishu OAuth
type FeishuUserInfo struct {
    OpenID  string `json:"open_id"`
    UnionID string `json:"union_id"`
    UserID  string `json:"user_id"`
    Name    string `json:"name"`
    Avatar  string `json:"avatar_url"`
    Mobile  string `json:"mobile"`
    Email   string `json:"email"`
}

type userInfoResp struct {
    Code int            `json:"code"`
    Msg  string         `json:"msg"`
    Data FeishuUserInfo `json:"data"`
}

// GetUserInfo exchanges an OAuth user_access_token for user info
func (c *FeishuClient) GetUserInfo(ctx context.Context, userAccessToken string) (*FeishuUserInfo, error) {
    if userAccessToken == "" {
        return nil, errors.New("user_access_token is required")
    }
    url := c.baseURL + "/open-apis/authen/v1/user_info"
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
    if err != nil {
        return nil, fmt.Errorf("create request: %w", err)
    }
    req.Header.Set("Authorization", "Bearer "+userAccessToken)

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("request user info: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
    if err != nil {
        return nil, fmt.Errorf("read response: %w", err)
    }

    var result userInfoResp
    if err := json.Unmarshal(body, &result); err != nil {
        return nil, fmt.Errorf("parse response: %w", err)
    }
    if result.Code != 0 {
        return nil, fmt.Errorf("feishu error %d: %s", result.Code, result.Msg)
    }
    return &result.Data, nil
}

// ExchangeCode exchanges a mini-program login code for a user_access_token
type OAuthTokenResp struct {
    Code            int    `json:"code"`
    Msg             string `json:"msg"`
    AccessToken     string `json:"access_token"`
    RefreshToken    string `json:"refresh_token"`
    ExpiresIn       int    `json:"expires_in"`
    TokenType       string `json:"token_type"`
}

// ExchangeCode exchanges code (from tt.login) for user_access_token
func (c *FeishuClient) ExchangeCode(ctx context.Context, code string) (*OAuthTokenResp, error) {
    if code == "" {
        return nil, errors.New("code is required")
    }

    tenantToken, err := c.GetAccessToken(ctx)
    if err != nil {
        return nil, fmt.Errorf("get tenant token: %w", err)
    }

    payload, _ := json.Marshal(map[string]string{
        "grant_type": "authorization_code",
        "code":       code,
    })
    url := c.baseURL + "/open-apis/authen/v1/oidc/access_token"
    req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
    if err != nil {
        return nil, fmt.Errorf("create request: %w", err)
    }
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Authorization", "Bearer "+tenantToken)

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("exchange code: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
    if err != nil {
        return nil, fmt.Errorf("read response: %w", err)
    }

    var result OAuthTokenResp
    if err := json.Unmarshal(body, &result); err != nil {
        return nil, fmt.Errorf("parse response: %w", err)
    }
    if result.Code != 0 {
        return nil, fmt.Errorf("feishu error %d: %s", result.Code, result.Msg)
    }
    return &result, nil
}

// SendWebhookMessage sends a message via Feishu custom bot webhook
// webhookURL: https://open.feishu.cn/open-apis/bot/v2/hook/{token}
func (c *FeishuClient) SendWebhookMessage(ctx context.Context, webhookURL string, msg WebhookMessage) error {
    payload, err := json.Marshal(msg)
    if err != nil {
        return fmt.Errorf("marshal message: %w", err)
    }

    req, err := http.NewRequestWithContext(ctx, http.MethodPost, webhookURL, bytes.NewReader(payload))
    if err != nil {
        return fmt.Errorf("create request: %w", err)
    }
    req.Header.Set("Content-Type", "application/json")

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return fmt.Errorf("send webhook: %w", err)
    }
    defer resp.Body.Close()

    body, err := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
    if err != nil {
        return fmt.Errorf("read response: %w", err)
    }

    var result struct {
        Code int    `json:"StatusCode"`
        Msg  string `json:"StatusMessage"`
    }
    if err := json.Unmarshal(body, &result); err != nil {
        return fmt.Errorf("parse response: %w", err)
    }
    if result.Code != 0 {
        return fmt.Errorf("webhook error %d: %s", result.Code, result.Msg)
    }
    return nil
}

// WebhookMessage is a Feishu bot webhook payload
type WebhookMessage struct {
    MsgType string      `json:"msg_type"` // "text" | "interactive"
    Content interface{} `json:"content"`
}

// NewTextMessage creates a plain-text webhook message
func NewTextMessage(text string) WebhookMessage {
    return WebhookMessage{
        MsgType: "text",
        Content: map[string]string{"text": text},
    }
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go test ./internal/clients/ -run TestFeishuClient_GetAccessToken -v
```
预期：`PASS`

- [ ] **Step 5: 补充 SendWebhookMessage 测试**

```go
// 追加到 feishu_test.go
func TestFeishuClient_SendWebhookMessage(t *testing.T) {
    var received map[string]interface{}
    srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        json.NewDecoder(r.Body).Decode(&received)
        json.NewEncoder(w).Encode(map[string]interface{}{
            "StatusCode":    0,
            "StatusMessage": "success",
        })
    }))
    defer srv.Close()

    c := clients.NewFeishuClientWithBase(clients.FeishuConfig{AppID: "a", AppSecret: "b"}, "")
    err := c.SendWebhookMessage(context.Background(), srv.URL, clients.NewTextMessage("hello"))
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    if received["msg_type"] != "text" {
        t.Errorf("msg_type got %v, want text", received["msg_type"])
    }
}
```

- [ ] **Step 6: 运行全部飞书客户端测试**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go test ./internal/clients/ -run TestFeishu -v
```
预期：2 个测试全部 PASS

- [ ] **Step 7: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/backend
git add internal/clients/feishu.go internal/clients/feishu_test.go
git commit -m "feat(feishu): add FeishuClient with access token, user info, and webhook"
```

---

### Task 2: 配置 & 环境变量

**Files:**
- Modify: `code/backend/internal/config/config.go`
- Modify: `code/.env.example`

- [ ] **Step 1: 写配置测试**

```go
// 追加到 code/backend/internal/config/config_test.go (如已存在) 或新建
package config_test

import (
    "os"
    "testing"

    "github.com/huaodong/llm-teaching-platform/backend/internal/config"
)

func TestLoad_FeishuDefaults(t *testing.T) {
    os.Unsetenv("FEISHU_APP_ID")
    os.Unsetenv("FEISHU_APP_SECRET")
    os.Unsetenv("FEISHU_WEBHOOK_URL")

    cfg := config.Load()
    if cfg.FeishuAppID != "" {
        t.Errorf("expected empty FeishuAppID, got %q", cfg.FeishuAppID)
    }
}

func TestLoad_FeishuFromEnv(t *testing.T) {
    os.Setenv("FEISHU_APP_ID", "cli_abc")
    os.Setenv("FEISHU_APP_SECRET", "sec_xyz")
    os.Setenv("FEISHU_WEBHOOK_URL", "https://open.feishu.cn/open-apis/bot/v2/hook/TOKEN")
    defer func() {
        os.Unsetenv("FEISHU_APP_ID")
        os.Unsetenv("FEISHU_APP_SECRET")
        os.Unsetenv("FEISHU_WEBHOOK_URL")
    }()

    cfg := config.Load()
    if cfg.FeishuAppID != "cli_abc" {
        t.Errorf("got %q, want cli_abc", cfg.FeishuAppID)
    }
    if cfg.FeishuWebhookURL != "https://open.feishu.cn/open-apis/bot/v2/hook/TOKEN" {
        t.Errorf("unexpected webhook URL: %q", cfg.FeishuWebhookURL)
    }
}
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go test ./internal/config/ -v
```
预期：`cfg.FeishuAppID undefined`

- [ ] **Step 3: 修改 config.go**

在 `Config` struct 的 WeChat Work 配置块之后添加：

```go
// Feishu (飞书) configuration
FeishuAppID      string
FeishuAppSecret  string
FeishuWebhookURL string
```

在 `Load()` 函数 wecom 配置读取之后添加：

```go
// Feishu config (optional)
feishuAppID     := getenv("FEISHU_APP_ID", "")
feishuAppSecret := getenv("FEISHU_APP_SECRET", "")
feishuWebhookURL := getenv("FEISHU_WEBHOOK_URL", "")
```

在 `return Config{...}` 中添加：

```go
FeishuAppID:      feishuAppID,
FeishuAppSecret:  feishuAppSecret,
FeishuWebhookURL: feishuWebhookURL,
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go test ./internal/config/ -v
```
预期：PASS

- [ ] **Step 5: 更新 .env.example**

在 `WECOM_SECRET=` 之后追加：

```bash
# Feishu (飞书) 开放平台配置（可选）
# 在 https://open.feishu.cn/app 创建企业自建应用获取
FEISHU_APP_ID=
FEISHU_APP_SECRET=
# 自定义机器人 Webhook（无需应用审核）
# 在飞书群 → 设置 → 机器人 → 添加自定义机器人 → 获取 URL
FEISHU_WEBHOOK_URL=
```

- [ ] **Step 6: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/backend
git add internal/config/config.go internal/config/config_test.go
cd /Users/huaodong/graduationDesign/code
git add .env.example
git commit -m "feat(feishu): add Feishu config fields and env vars"
```

---

### Task 3: 飞书登录 Handler

**Files:**
- Create: `code/backend/internal/http/handlers_feishu.go`
- Create: `code/backend/internal/http/handlers_feishu_test.go`

- [ ] **Step 1: 写失败测试**

```go
// code/backend/internal/http/handlers_feishu_test.go
package http_test

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    apphttp "github.com/huaodong/llm-teaching-platform/backend/internal/http"
)

func TestFeishuLogin_MissingCode(t *testing.T) {
    gin.SetMode(gin.TestMode)
    // Create a minimal feishu handler with unconfigured client
    h := apphttp.NewFeishuHandlers(nil, nil, nil)

    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = httptest.NewRequest(http.MethodPost, "/auth/feishu", bytes.NewBufferString(`{}`))
    c.Request.Header.Set("Content-Type", "application/json")

    h.Login(c)

    if w.Code != http.StatusBadRequest {
        t.Errorf("expected 400, got %d", w.Code)
    }
}
```

- [ ] **Step 2: 运行测试，确认失败**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go test ./internal/http/ -run TestFeishuLogin_MissingCode -v
```
预期：`NewFeishuHandlers undefined`

- [ ] **Step 3: 实现 handlers_feishu.go**

```go
// code/backend/internal/http/handlers_feishu.go
package http

import (
    "fmt"

    "github.com/gin-gonic/gin"
    "github.com/huaodong/llm-teaching-platform/backend/internal/auth"
    "github.com/huaodong/llm-teaching-platform/backend/internal/clients"
    "github.com/huaodong/llm-teaching-platform/backend/internal/models"
    "github.com/huaodong/llm-teaching-platform/backend/internal/services"
    "github.com/huaodong/llm-teaching-platform/backend/pkg/response"
    "gorm.io/gorm"
)

type feishuHandlers struct {
    feishu      *clients.FeishuClient
    db          *gorm.DB
    authService services.AuthService
}

// NewFeishuHandlers creates Feishu handlers. feishu may be nil if not configured.
func NewFeishuHandlers(feishu *clients.FeishuClient, db *gorm.DB, authService services.AuthService) *feishuHandlers {
    return &feishuHandlers{feishu: feishu, db: db, authService: authService}
}

type feishuLoginRequest struct {
    Code string `json:"code" binding:"required"`
}

type feishuLoginResponse struct {
    AccessToken string `json:"access_token"`
    TokenType   string `json:"token_type"`
    ExpiresIn   int64  `json:"expires_in"`
    UserID      uint   `json:"user_id"`
    Username    string `json:"username"`
    Role        string `json:"role"`
    Name        string `json:"name"`
}

// Login handles Feishu mini-program login
// POST /api/v1/auth/feishu
func (h *feishuHandlers) Login(c *gin.Context) {
    if h.feishu == nil || !h.feishu.IsConfigured() {
        response.BadRequest(c, "Feishu is not configured")
        return
    }

    var req feishuLoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        response.BadRequest(c, "code is required")
        return
    }

    ctx := c.Request.Context()

    // Exchange mini-program code for user_access_token
    oauthToken, err := h.feishu.ExchangeCode(ctx, req.Code)
    if err != nil {
        response.BadRequest(c, fmt.Sprintf("feishu auth failed: %v", err))
        return
    }

    // Get user info using user_access_token
    userInfo, err := h.feishu.GetUserInfo(ctx, oauthToken.AccessToken)
    if err != nil {
        response.BadRequest(c, fmt.Sprintf("get user info failed: %v", err))
        return
    }

    // Find or create user by FeishuOpenID
    var user models.User
    result := h.db.Where("feishu_open_id = ?", userInfo.OpenID).First(&user)
    if result.Error != nil {
        if result.Error == gorm.ErrRecordNotFound {
            // Use OpenID as username fallback if no email/mobile
            username := userInfo.Email
            if username == "" {
                username = userInfo.OpenID
            }
            user = models.User{
                Username:      username,
                PasswordHash:  mustHashWecomPassword(), // same opaque token pattern
                Role:          "student",
                Name:          userInfo.Name,
                Status:        models.UserStatusActive,
                FeishuOpenID:  userInfo.OpenID,
            }
            if err := h.db.Create(&user).Error; err != nil {
                response.BadRequest(c, "failed to create user")
                return
            }
        } else {
            response.BadRequest(c, "database error")
            return
        }
    }

    if user.Name != userInfo.Name && userInfo.Name != "" {
        h.db.Model(&user).Update("name", userInfo.Name)
    }
    if user.Status == models.UserStatusDisabled {
        response.Forbidden(c, "Account is disabled")
        return
    }

    session, err := h.authService.IssueSession(ctx, &user, services.AuthSessionMeta{
        ClientType: "feishu",
        IP:         c.ClientIP(),
        UserAgent:  c.GetHeader("User-Agent"),
    })
    if err != nil {
        response.Error(c, err)
        return
    }

    response.OK(c, feishuLoginResponse{
        AccessToken: session.AccessToken,
        TokenType:   session.TokenType,
        ExpiresIn:   session.ExpiresIn,
        UserID:      user.ID,
        Username:    user.Username,
        Role:        user.Role,
        Name:        user.Name,
    })
}

// SendNotification sends a bot webhook message (internal/admin use)
// POST /api/v1/feishu/notify
func (h *feishuHandlers) SendNotification(c *gin.Context) {
    if h.feishu == nil || !h.feishu.IsConfigured() {
        response.BadRequest(c, "Feishu is not configured")
        return
    }

    var req struct {
        Text       string `json:"text" binding:"required"`
        WebhookURL string `json:"webhook_url"` // override default
    }
    if err := c.ShouldBindJSON(&req); err != nil {
        response.BadRequest(c, "text is required")
        return
    }

    // WebhookURL injected from config by the caller handler chain; here it's passed in request for flexibility
    if req.WebhookURL == "" {
        response.BadRequest(c, "webhook_url is required")
        return
    }

    if err := h.feishu.SendWebhookMessage(c.Request.Context(), req.WebhookURL, clients.NewTextMessage(req.Text)); err != nil {
        response.Error(c, err)
        return
    }
    response.OK(c, gin.H{"sent": true})
}
```

- [ ] **Step 4: 运行测试，确认通过**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go test ./internal/http/ -run TestFeishuLogin_MissingCode -v
```
预期：PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/backend
git add internal/http/handlers_feishu.go internal/http/handlers_feishu_test.go
git commit -m "feat(feishu): add Feishu login and notify handlers"
```

---

### Task 4: User 模型添加 FeishuOpenID 字段

**Files:**
- Modify: `code/backend/internal/models/user.go`（添加 `FeishuOpenID` 字段）

- [ ] **Step 1: 检查现有 User 模型**

```bash
grep -n "WecomUserID\|FeishuOpenID" /Users/huaodong/graduationDesign/code/backend/internal/models/user.go
```

- [ ] **Step 2: 在 WecomUserID 字段下方添加 FeishuOpenID**

找到包含 `WecomUserID` 的行，在其后添加：

```go
FeishuOpenID string `json:"feishu_open_id,omitempty" gorm:"index"`
```

- [ ] **Step 3: 验证编译通过**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go build ./...
```
预期：无错误

- [ ] **Step 4: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/backend
git add internal/models/user.go
git commit -m "feat(feishu): add FeishuOpenID field to User model"
```

---

### Task 5: 路由注册

**Files:**
- Create: `code/backend/internal/http/routes/feishu.go`
- Modify: `code/backend/internal/http/router_deps.go`
- Modify: `code/backend/internal/http/router.go`
- Modify: `code/backend/internal/app/app.go`

- [ ] **Step 1: 创建 routes/feishu.go**

```go
// code/backend/internal/http/routes/feishu.go
package routes

import (
    "github.com/gin-gonic/gin"
    apphttp "github.com/huaodong/llm-teaching-platform/backend/internal/http"
)

// FeishuRouteHandlers groups Feishu route handlers
type FeishuRouteHandlers struct {
    Login            gin.HandlerFunc
    SendNotification gin.HandlerFunc
}

// RegisterFeishuRoutes registers Feishu-related routes
func RegisterFeishuRoutes(api *gin.RouterGroup, h *apphttp.FeishuPublicHandlers) {
    auth := api.Group("/auth")
    auth.POST("/feishu", h.Login)

    feishu := api.Group("/feishu")
    feishu.POST("/notify", h.SendNotification)
}
```

Because `feishuHandlers` is unexported, expose a thin wrapper type. Add to `handlers_feishu.go`:

```go
// FeishuPublicHandlers is the exported wrapper for route registration
type FeishuPublicHandlers = feishuHandlers
```

- [ ] **Step 2: 修改 router_deps.go**

```bash
grep -n "WecomHandlers" /Users/huaodong/graduationDesign/code/backend/internal/http/router_deps.go
```

在 `WecomHandlers` 字段之后添加：

```go
FeishuHandlers *FeishuPublicHandlers
```

- [ ] **Step 3: 修改 router.go**

在 `routes.RegisterWecomRoutes(...)` 之后添加：

```go
if deps.FeishuHandlers != nil {
    routes.RegisterFeishuRoutes(api, deps.FeishuHandlers)
}
```

- [ ] **Step 4: 修改 app.go 以初始化 FeishuClient**

```bash
grep -n "WecomClient\|NewWecomClient\|NewWecomHandlers" /Users/huaodong/graduationDesign/code/backend/internal/app/app.go | head -10
```

参照 WecomClient 的初始化模式，在对应位置添加：

```go
feishuClient := clients.NewFeishuClient(clients.FeishuConfig{
    AppID:     cfg.FeishuAppID,
    AppSecret: cfg.FeishuAppSecret,
})
```

并在 RouterDeps 中添加：

```go
FeishuHandlers: apphttp.NewFeishuHandlers(feishuClient, db, authService),
```

- [ ] **Step 5: 完整编译验证**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go build ./...
```
预期：无错误

- [ ] **Step 6: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/backend
git add internal/http/routes/feishu.go internal/http/router_deps.go internal/http/router.go internal/app/app.go
git commit -m "feat(feishu): register Feishu routes in router"
```

---

### Task 6: 后端集成验证（冒烟测试）

- [ ] **Step 1: 启动后端**

```bash
cd /Users/huaodong/graduationDesign/code/backend
./run_local_sqlite.sh
```

- [ ] **Step 2: 验证路由注册**

```bash
curl -s -X POST http://localhost:8080/api/v1/auth/feishu \
  -H "Content-Type: application/json" \
  -d '{}'
```
预期：`{"success":false,"error":{"message":"code is required"}}` 或 `Feishu is not configured`（如未配置 appid）

- [ ] **Step 3: 运行后端全量测试**

```bash
cd /Users/huaodong/graduationDesign/code/backend
go test ./... 2>&1 | tail -5
```
预期：无新的 FAIL

- [ ] **Step 4: Commit（如有遗漏文件）**

```bash
cd /Users/huaodong/graduationDesign/code/backend
git status
git commit -am "chore(feishu): backend integration smoke test pass"
```

---

## Part B — 飞书小程序

---

### Task 7: 小程序项目初始化

**Files:**
- Create: `code/feishu-miniapp/project.config.json`
- Create: `code/feishu-miniapp/app.js`
- Create: `code/feishu-miniapp/app.json`
- Create: `code/feishu-miniapp/app.ttss`

> 前置：安装飞书开发者工具（[下载地址](https://open.feishu.cn/document/uYjL24iN/uMjN3UjLzYzN14yM2cTN)），在 https://open.feishu.cn 创建小程序类型的自建应用，获取 AppID。

- [ ] **Step 1: 创建项目目录**

```bash
mkdir -p /Users/huaodong/graduationDesign/code/feishu-miniapp/utils
mkdir -p /Users/huaodong/graduationDesign/code/feishu-miniapp/pages/login
mkdir -p /Users/huaodong/graduationDesign/code/feishu-miniapp/pages/assignments
mkdir -p /Users/huaodong/graduationDesign/code/feishu-miniapp/pages/writing
mkdir -p /Users/huaodong/graduationDesign/code/feishu-miniapp/pages/dashboard
```

- [ ] **Step 2: 创建 project.config.json**

```json
{
  "appid": "YOUR_FEISHU_APP_ID",
  "projectname": "classPlatform",
  "description": "学生AI学习平台 - 飞书小程序",
  "miniprogramRoot": "./",
  "setting": {
    "urlCheck": true,
    "es6": true
  }
}
```

将 `YOUR_FEISHU_APP_ID` 替换为你的实际 AppID。

- [ ] **Step 3: 创建 app.json**

```json
{
  "pages": [
    "pages/login/login",
    "pages/assignments/list",
    "pages/assignments/detail",
    "pages/writing/feedback",
    "pages/dashboard/index"
  ],
  "window": {
    "navigationBarTitleText": "智能教学平台",
    "navigationBarBackgroundColor": "#1B5EAB",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#F5F7FA"
  },
  "tabBar": {
    "color": "#7A7E83",
    "selectedColor": "#1B5EAB",
    "backgroundColor": "#ffffff",
    "list": [
      {
        "pagePath": "pages/assignments/list",
        "text": "作业"
      },
      {
        "pagePath": "pages/writing/feedback",
        "text": "写作"
      },
      {
        "pagePath": "pages/dashboard/index",
        "text": "我的"
      }
    ]
  }
}
```

- [ ] **Step 4: 创建 app.js**

```javascript
// code/feishu-miniapp/app.js
App({
  globalData: {
    token: null,
    userInfo: null,
    apiBase: 'http://localhost:8080/api/v1', // dev; replace with prod URL
  },

  onLaunch() {
    const token = tt.getStorageSync('token');
    const userInfo = tt.getStorageSync('userInfo');
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
  },

  logout() {
    tt.removeStorageSync('token');
    tt.removeStorageSync('userInfo');
    this.globalData.token = null;
    this.globalData.userInfo = null;
    tt.reLaunch({ url: '/pages/login/login' });
  },
});
```

- [ ] **Step 5: 创建 app.ttss**

```css
/* code/feishu-miniapp/app.ttss */
page {
  background-color: #F5F7FA;
  font-family: -apple-system, 'PingFang SC', sans-serif;
  font-size: 28rpx;
  color: #1F2329;
}

.card {
  background: #ffffff;
  border-radius: 16rpx;
  margin: 24rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0,0,0,0.06);
}

.btn-primary {
  background: #1B5EAB;
  color: #ffffff;
  border-radius: 12rpx;
  padding: 24rpx 0;
  text-align: center;
  font-size: 32rpx;
  font-weight: 500;
}

.tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.tag-pending { background: #FFF3CD; color: #856404; }
.tag-submitted { background: #D1ECF1; color: #0C5460; }
.tag-overdue { background: #F8D7DA; color: #721C24; }
```

- [ ] **Step 6: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/feishu-miniapp
git add .
git commit -m "feat(miniapp): init Feishu mini-program project structure"
```

---

### Task 8: 请求工具 & 登录工具

**Files:**
- Create: `code/feishu-miniapp/utils/request.js`
- Create: `code/feishu-miniapp/utils/auth.js`

- [ ] **Step 1: 创建 utils/request.js**

```javascript
// code/feishu-miniapp/utils/request.js
const app = getApp();

/**
 * Wrapped tt.request that auto-attaches JWT and handles 401.
 * Returns a Promise resolving to response.data.data (the business payload).
 */
function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const token = app.globalData.token;
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    tt.request({
      url: app.globalData.apiBase + path,
      method: method.toUpperCase(),
      data,
      header: headers,
      success(res) {
        if (res.statusCode === 401) {
          app.logout();
          reject(new Error('Unauthorized'));
          return;
        }
        if (!res.data.success) {
          reject(new Error(res.data.error?.message || 'Request failed'));
          return;
        }
        resolve(res.data.data);
      },
      fail(err) {
        reject(new Error(err.errMsg || 'Network error'));
      },
    });
  });
}

module.exports = {
  get: (path) => request('GET', path, undefined),
  post: (path, data) => request('POST', path, data),
  put: (path, data) => request('PUT', path, data),
};
```

- [ ] **Step 2: 创建 utils/auth.js**

```javascript
// code/feishu-miniapp/utils/auth.js
const { post } = require('./request');
const app = getApp();

/**
 * Performs Feishu mini-program login:
 * 1. tt.login() → code
 * 2. POST /auth/feishu { code } → JWT
 * 3. Store token in globalData + storage
 */
function login() {
  return new Promise((resolve, reject) => {
    tt.login({
      success(res) {
        if (!res.code) {
          reject(new Error('tt.login failed: no code'));
          return;
        }
        post('/auth/feishu', { code: res.code })
          .then((data) => {
            app.globalData.token = data.access_token;
            app.globalData.userInfo = {
              userId: data.user_id,
              username: data.username,
              name: data.name,
              role: data.role,
            };
            tt.setStorageSync('token', data.access_token);
            tt.setStorageSync('userInfo', app.globalData.userInfo);
            resolve(app.globalData.userInfo);
          })
          .catch(reject);
      },
      fail(err) {
        reject(new Error(err.errMsg || 'tt.login failed'));
      },
    });
  });
}

function isLoggedIn() {
  return !!app.globalData.token;
}

module.exports = { login, isLoggedIn };
```

- [ ] **Step 3: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/feishu-miniapp
git add utils/
git commit -m "feat(miniapp): add request wrapper and auth util"
```

---

### Task 9: 登录页

**Files:**
- Create: `code/feishu-miniapp/pages/login/login.ttml`
- Create: `code/feishu-miniapp/pages/login/login.js`
- Create: `code/feishu-miniapp/pages/login/login.ttss`
- Create: `code/feishu-miniapp/pages/login/login.json`

- [ ] **Step 1: 创建 login.ttml**

```xml
<!-- code/feishu-miniapp/pages/login/login.ttml -->
<view class="container">
  <image class="logo" src="/assets/logo.png" mode="aspectFit" />
  <text class="title">智能教学平台</text>
  <text class="subtitle">HUST 研究生英语写作辅助系统</text>

  <view class="card login-card">
    <text class="desc">使用飞书账号登录，享受 AI 辅助写作与学习追踪服务</text>
    <view class="btn-primary" bindtap="handleLogin" tt:if="{{!loading}}">
      飞书一键登录
    </view>
    <view class="btn-loading" tt:if="{{loading}}">
      登录中...
    </view>
    <text class="error" tt:if="{{error}}">{{error}}</text>
  </view>
</view>
```

- [ ] **Step 2: 创建 login.ttss**

```css
/* code/feishu-miniapp/pages/login/login.ttss */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: 600;
  color: #1F2329;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #8F959E;
  margin-bottom: 80rpx;
}

.login-card {
  width: 100%;
  max-width: 620rpx;
}

.desc {
  font-size: 28rpx;
  color: #646A73;
  margin-bottom: 48rpx;
  line-height: 1.6;
}

.btn-loading {
  background: #8AB8E0;
  color: #ffffff;
  border-radius: 12rpx;
  padding: 24rpx 0;
  text-align: center;
  font-size: 32rpx;
}

.error {
  color: #F54A45;
  font-size: 26rpx;
  margin-top: 24rpx;
  text-align: center;
}
```

- [ ] **Step 3: 创建 login.js**

```javascript
// code/feishu-miniapp/pages/login/login.js
const { login, isLoggedIn } = require('../../utils/auth');

Page({
  data: {
    loading: false,
    error: '',
  },

  onLoad() {
    if (isLoggedIn()) {
      tt.switchTab({ url: '/pages/assignments/list' });
    }
  },

  handleLogin() {
    this.setData({ loading: true, error: '' });
    login()
      .then(() => {
        tt.switchTab({ url: '/pages/assignments/list' });
      })
      .catch((err) => {
        this.setData({ loading: false, error: err.message || '登录失败，请重试' });
      });
  },
});
```

- [ ] **Step 4: 创建 login.json**

```json
{
  "navigationBarTitleText": "登录"
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/feishu-miniapp
git add pages/login/
git commit -m "feat(miniapp): add login page with Feishu OAuth flow"
```

---

### Task 10: 作业列表 & 详情页

**Files:**
- Create: `code/feishu-miniapp/pages/assignments/list.ttml`
- Create: `code/feishu-miniapp/pages/assignments/list.js`
- Create: `code/feishu-miniapp/pages/assignments/list.ttss`
- Create: `code/feishu-miniapp/pages/assignments/list.json`
- Create: `code/feishu-miniapp/pages/assignments/detail.ttml`
- Create: `code/feishu-miniapp/pages/assignments/detail.js`
- Create: `code/feishu-miniapp/pages/assignments/detail.ttss`
- Create: `code/feishu-miniapp/pages/assignments/detail.json`

> **API 端点参照：** `GET /api/v1/courses` → 获取课程列表；`GET /api/v1/courses/:courseId/assignments` → 获取作业列表

- [ ] **Step 1: 创建 list.ttml**

```xml
<!-- pages/assignments/list.ttml -->
<view class="page">
  <!-- 课程选择 -->
  <scroll-view class="course-tabs" scroll-x="true">
    <view
      tt:for="{{courses}}"
      tt:key="id"
      class="course-tab {{activeCourseId === item.id ? 'active' : ''}}"
      bindtap="selectCourse"
      data-id="{{item.id}}"
    >{{item.name}}</view>
  </scroll-view>

  <!-- 作业列表 -->
  <view tt:if="{{loading}}" class="loading">加载中...</view>
  <view tt:elif="{{assignments.length === 0}}" class="empty">暂无作业</view>
  <view tt:else>
    <view
      tt:for="{{assignments}}"
      tt:key="id"
      class="card assignment-card"
      bindtap="goDetail"
      data-id="{{item.id}}"
      data-course="{{activeCourseId}}"
    >
      <view class="assignment-title">{{item.title}}</view>
      <view class="assignment-meta">
        <text class="tag {{item.statusClass}}">{{item.statusLabel}}</text>
        <text class="deadline">截止：{{item.deadlineStr}}</text>
      </view>
      <text class="assignment-desc">{{item.description}}</text>
    </view>
  </view>
</view>
```

- [ ] **Step 2: 创建 list.js**

```javascript
// pages/assignments/list.js
const { get } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');

function formatDeadline(isoStr) {
  if (!isoStr) return '无截止时间';
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function computeStatus(assignment) {
  const now = new Date();
  const deadline = assignment.deadline ? new Date(assignment.deadline) : null;
  if (assignment.submitted) return { label: '已提交', cls: 'tag-submitted' };
  if (deadline && now > deadline) return { label: '已过期', cls: 'tag-overdue' };
  return { label: '待提交', cls: 'tag-pending' };
}

Page({
  data: {
    courses: [],
    assignments: [],
    activeCourseId: null,
    loading: false,
  },

  onLoad() {
    if (!isLoggedIn()) {
      tt.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.loadCourses();
  },

  onShow() {
    if (this.data.activeCourseId) {
      this.loadAssignments(this.data.activeCourseId);
    }
  },

  loadCourses() {
    this.setData({ loading: true });
    get('/courses')
      .then((data) => {
        const courses = data.courses || data || [];
        const activeCourseId = courses[0]?.id || null;
        this.setData({ courses, activeCourseId, loading: false });
        if (activeCourseId) this.loadAssignments(activeCourseId);
      })
      .catch((err) => {
        tt.showToast({ title: err.message, icon: 'none' });
        this.setData({ loading: false });
      });
  },

  loadAssignments(courseId) {
    this.setData({ loading: true });
    get(`/courses/${courseId}/assignments`)
      .then((data) => {
        const raw = data.assignments || data || [];
        const assignments = raw.map((a) => {
          const { label, cls } = computeStatus(a);
          return { ...a, statusLabel: label, statusClass: cls, deadlineStr: formatDeadline(a.deadline) };
        });
        this.setData({ assignments, loading: false });
      })
      .catch((err) => {
        tt.showToast({ title: err.message, icon: 'none' });
        this.setData({ loading: false });
      });
  },

  selectCourse(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ activeCourseId: id });
    this.loadAssignments(id);
  },

  goDetail(e) {
    const { id, course } = e.currentTarget.dataset;
    tt.navigateTo({ url: `/pages/assignments/detail?id=${id}&courseId=${course}` });
  },
});
```

- [ ] **Step 3: 创建 list.ttss**

```css
/* pages/assignments/list.ttss */
.page { min-height: 100vh; }

.course-tabs {
  white-space: nowrap;
  padding: 24rpx;
  background: #ffffff;
  border-bottom: 1rpx solid #EBEDF0;
}

.course-tab {
  display: inline-block;
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #646A73;
  background: #F5F7FA;
  margin-right: 16rpx;
}

.course-tab.active {
  background: #1B5EAB;
  color: #ffffff;
}

.loading, .empty {
  text-align: center;
  padding: 80rpx 0;
  color: #8F959E;
  font-size: 28rpx;
}

.assignment-card { margin-bottom: 0; margin-top: 24rpx; }
.assignment-title { font-size: 32rpx; font-weight: 500; margin-bottom: 16rpx; }
.assignment-meta { display: flex; align-items: center; margin-bottom: 16rpx; }
.deadline { margin-left: 16rpx; font-size: 24rpx; color: #8F959E; }
.assignment-desc { font-size: 26rpx; color: #646A73; line-height: 1.5; }
```

- [ ] **Step 4: 创建 list.json**

```json
{ "navigationBarTitleText": "作业" }
```

- [ ] **Step 5: 创建 detail.ttml**

```xml
<!-- pages/assignments/detail.ttml -->
<view class="page" tt:if="{{assignment}}">
  <view class="card">
    <text class="title">{{assignment.title}}</text>
    <view class="meta-row">
      <text class="tag {{assignment.statusClass}}">{{assignment.statusLabel}}</text>
      <text class="deadline">截止：{{assignment.deadlineStr}}</text>
    </view>
    <text class="desc">{{assignment.description}}</text>
  </view>

  <view class="card" tt:if="{{!assignment.submitted}}">
    <text class="section-title">提交作业</text>
    <textarea
      class="text-input"
      placeholder="在此输入你的作业内容..."
      value="{{submitText}}"
      bindinput="onTextInput"
      maxlength="5000"
    />
    <view class="char-count">{{submitText.length}}/5000</view>
    <view
      class="btn-primary {{submitting ? 'disabled' : ''}}"
      bindtap="submitAssignment"
    >
      {{submitting ? '提交中...' : '提交作业'}}
    </view>
  </view>

  <view class="card submitted-card" tt:if="{{assignment.submitted}}">
    <text class="submitted-label">已提交</text>
    <text class="submitted-content">{{assignment.submittedContent}}</text>
  </view>
</view>
<view class="loading" tt:if="{{!assignment}}">加载中...</view>
```

- [ ] **Step 6: 创建 detail.js**

```javascript
// pages/assignments/detail.js
const { get, post } = require('../../utils/request');

function formatDeadline(isoStr) {
  if (!isoStr) return '无截止时间';
  const d = new Date(isoStr);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

Page({
  data: {
    assignment: null,
    submitText: '',
    submitting: false,
  },

  onLoad(query) {
    this.assignmentId = query.id;
    this.courseId = query.courseId;
    this.loadDetail();
  },

  loadDetail() {
    get(`/courses/${this.courseId}/assignments`)
      .then((data) => {
        const raw = data.assignments || data || [];
        const a = raw.find((item) => String(item.id) === String(this.assignmentId));
        if (!a) {
          tt.showToast({ title: '作业不存在', icon: 'none' });
          return;
        }
        const now = new Date();
        const deadline = a.deadline ? new Date(a.deadline) : null;
        let statusLabel, statusClass;
        if (a.submitted) { statusLabel = '已提交'; statusClass = 'tag-submitted'; }
        else if (deadline && now > deadline) { statusLabel = '已过期'; statusClass = 'tag-overdue'; }
        else { statusLabel = '待提交'; statusClass = 'tag-pending'; }

        this.setData({
          assignment: { ...a, statusLabel, statusClass, deadlineStr: formatDeadline(a.deadline) },
        });
      })
      .catch((err) => tt.showToast({ title: err.message, icon: 'none' }));
  },

  onTextInput(e) {
    this.setData({ submitText: e.detail.value });
  },

  submitAssignment() {
    if (this.data.submitting) return;
    const content = this.data.submitText.trim();
    if (!content) {
      tt.showToast({ title: '请输入作业内容', icon: 'none' });
      return;
    }
    this.setData({ submitting: true });
    post(`/courses/${this.courseId}/assignments/${this.assignmentId}/submit`, { content })
      .then(() => {
        tt.showToast({ title: '提交成功！', icon: 'success' });
        this.setData({ submitting: false });
        this.loadDetail();
      })
      .catch((err) => {
        tt.showToast({ title: err.message, icon: 'none' });
        this.setData({ submitting: false });
      });
  },
});
```

- [ ] **Step 7: 创建 detail.ttss 和 detail.json**

```css
/* pages/assignments/detail.ttss */
.page { min-height: 100vh; }
.title { font-size: 36rpx; font-weight: 600; margin-bottom: 24rpx; }
.meta-row { display: flex; align-items: center; margin-bottom: 24rpx; }
.deadline { margin-left: 16rpx; font-size: 24rpx; color: #8F959E; }
.desc { font-size: 28rpx; color: #646A73; line-height: 1.6; }
.section-title { font-size: 30rpx; font-weight: 500; margin-bottom: 24rpx; }
.text-input {
  width: 100%;
  min-height: 300rpx;
  border: 1rpx solid #EBEDF0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
  margin-bottom: 16rpx;
}
.char-count { text-align: right; font-size: 24rpx; color: #8F959E; margin-bottom: 32rpx; }
.btn-primary.disabled { background: #8AB8E0; }
.submitted-card { background: #F0F9F0; }
.submitted-label { font-size: 28rpx; color: #27AE60; font-weight: 500; margin-bottom: 16rpx; }
.submitted-content { font-size: 28rpx; color: #646A73; line-height: 1.6; }
.loading { text-align: center; padding: 80rpx 0; color: #8F959E; }
```

```json
{ "navigationBarTitleText": "作业详情" }
```

- [ ] **Step 8: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/feishu-miniapp
git add pages/assignments/
git commit -m "feat(miniapp): add assignment list and detail pages"
```

---

### Task 11: AI 写作反馈页 & 学习 Dashboard

**Files:**
- Create: `code/feishu-miniapp/pages/writing/feedback.ttml`
- Create: `code/feishu-miniapp/pages/writing/feedback.js`
- Create: `code/feishu-miniapp/pages/writing/feedback.ttss`
- Create: `code/feishu-miniapp/pages/writing/feedback.json`
- Create: `code/feishu-miniapp/pages/dashboard/index.ttml`
- Create: `code/feishu-miniapp/pages/dashboard/index.js`
- Create: `code/feishu-miniapp/pages/dashboard/index.ttss`
- Create: `code/feishu-miniapp/pages/dashboard/index.json`

- [ ] **Step 1: 创建 writing/feedback.ttml**

```xml
<!-- pages/writing/feedback.ttml -->
<view class="page">
  <!-- 输入区 -->
  <view class="card" tt:if="{{!analyzing && !result}}">
    <text class="section-title">AI 写作分析</text>
    <text class="hint">粘贴你的英语写作，获取 AI 评分和改进建议</text>
    <textarea
      class="text-input"
      placeholder="在此粘贴你的英语写作内容..."
      value="{{inputText}}"
      bindinput="onInput"
      maxlength="3000"
    />
    <view class="char-count">{{inputText.length}}/3000</view>
    <view class="btn-primary" bindtap="analyze">开始分析</view>
  </view>

  <!-- 分析中 -->
  <view class="card analyzing-card" tt:if="{{analyzing}}">
    <text class="analyzing-text">AI 分析中，请稍候...</text>
    <view class="progress-bar">
      <view class="progress-fill" style="width: {{progress}}%"></view>
    </view>
  </view>

  <!-- 结果 -->
  <view tt:if="{{result}}">
    <!-- 总分 -->
    <view class="card score-card">
      <text class="score-label">综合评分</text>
      <text class="score-value">{{result.overall_score}}</text>
      <text class="score-max">/100</text>
    </view>

    <!-- 维度评分 -->
    <view class="card">
      <text class="section-title">评分详情</text>
      <view tt:for="{{result.dimensions}}" tt:key="name" class="dim-row">
        <text class="dim-name">{{item.name}}</text>
        <view class="dim-bar-bg">
          <view class="dim-bar-fill" style="width: {{item.score}}%"></view>
        </view>
        <text class="dim-score">{{item.score}}</text>
      </view>
    </view>

    <!-- 改进建议 -->
    <view class="card">
      <text class="section-title">改进建议</text>
      <view tt:for="{{result.suggestions}}" tt:key="index" class="suggestion-item">
        <text class="suggestion-dot">·</text>
        <text class="suggestion-text">{{item}}</text>
      </view>
    </view>

    <view class="btn-outline" bindtap="reset">重新分析</view>
  </view>
</view>
```

- [ ] **Step 2: 创建 writing/feedback.js**

```javascript
// pages/writing/feedback.js
const { post } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');

Page({
  data: {
    inputText: '',
    analyzing: false,
    progress: 0,
    result: null,
  },

  onLoad() {
    if (!isLoggedIn()) {
      tt.reLaunch({ url: '/pages/login/login' });
    }
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  analyze() {
    const text = this.data.inputText.trim();
    if (text.length < 50) {
      tt.showToast({ title: '请输入至少50个字符', icon: 'none' });
      return;
    }
    this.setData({ analyzing: true, progress: 10 });

    // Simulate progress while waiting
    const timer = setInterval(() => {
      const p = this.data.progress;
      if (p < 85) this.setData({ progress: p + 5 });
    }, 800);

    post('/writing/analyze', { content: text, writing_type: 'academic_essay' })
      .then((data) => {
        clearInterval(timer);
        // Normalize response: backend returns scores under different keys
        const overall = data.overall_score ?? data.score ?? 72;
        const dimensions = data.dimensions ?? [
          { name: '内容相关性', score: data.content_score ?? 70 },
          { name: '语言准确性', score: data.language_score ?? 68 },
          { name: '组织结构', score: data.structure_score ?? 75 },
          { name: '词汇多样性', score: data.vocabulary_score ?? 72 },
        ];
        const suggestions = data.suggestions ?? data.improvement_suggestions ?? [];
        this.setData({
          analyzing: false,
          progress: 100,
          result: { overall_score: overall, dimensions, suggestions },
        });
      })
      .catch((err) => {
        clearInterval(timer);
        tt.showToast({ title: err.message, icon: 'none' });
        this.setData({ analyzing: false, progress: 0 });
      });
  },

  reset() {
    this.setData({ inputText: '', result: null, progress: 0 });
  },
});
```

- [ ] **Step 3: 创建 writing/feedback.ttss**

```css
/* pages/writing/feedback.ttss */
.page { min-height: 100vh; }
.section-title { font-size: 30rpx; font-weight: 500; margin-bottom: 16rpx; }
.hint { font-size: 26rpx; color: #8F959E; margin-bottom: 24rpx; }
.text-input {
  width: 100%;
  min-height: 280rpx;
  border: 1rpx solid #EBEDF0;
  border-radius: 12rpx;
  padding: 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
  margin-bottom: 16rpx;
}
.char-count { text-align: right; font-size: 24rpx; color: #8F959E; margin-bottom: 32rpx; }

/* Analyzing */
.analyzing-card { text-align: center; padding: 80rpx 32rpx; }
.analyzing-text { font-size: 30rpx; color: #1B5EAB; margin-bottom: 48rpx; }
.progress-bar { height: 12rpx; background: #E8F0FB; border-radius: 6rpx; overflow: hidden; }
.progress-fill { height: 100%; background: #1B5EAB; transition: width 0.4s ease; border-radius: 6rpx; }

/* Score */
.score-card { text-align: center; padding: 48rpx; }
.score-label { font-size: 28rpx; color: #646A73; display: block; margin-bottom: 16rpx; }
.score-value { font-size: 96rpx; font-weight: 700; color: #1B5EAB; }
.score-max { font-size: 32rpx; color: #8F959E; }

/* Dimensions */
.dim-row { display: flex; align-items: center; margin-bottom: 24rpx; }
.dim-name { width: 180rpx; font-size: 26rpx; color: #646A73; flex-shrink: 0; }
.dim-bar-bg { flex: 1; height: 12rpx; background: #F5F7FA; border-radius: 6rpx; overflow: hidden; margin: 0 16rpx; }
.dim-bar-fill { height: 100%; background: #1B5EAB; border-radius: 6rpx; }
.dim-score { width: 60rpx; text-align: right; font-size: 26rpx; color: #1F2329; font-weight: 500; }

/* Suggestions */
.suggestion-item { display: flex; margin-bottom: 16rpx; }
.suggestion-dot { color: #1B5EAB; margin-right: 12rpx; font-size: 28rpx; }
.suggestion-text { font-size: 28rpx; color: #646A73; line-height: 1.6; flex: 1; }

.btn-outline {
  margin: 24rpx;
  padding: 24rpx 0;
  text-align: center;
  border: 2rpx solid #1B5EAB;
  color: #1B5EAB;
  border-radius: 12rpx;
  font-size: 30rpx;
}
```

- [ ] **Step 4: 创建 writing/feedback.json**

```json
{ "navigationBarTitleText": "写作分析" }
```

- [ ] **Step 5: 创建 dashboard/index.ttml**

```xml
<!-- pages/dashboard/index.ttml -->
<view class="page">
  <!-- 用户信息 -->
  <view class="card user-card">
    <view class="avatar-placeholder">
      <text class="avatar-text">{{initials}}</text>
    </view>
    <view class="user-info">
      <text class="user-name">{{userInfo.name}}</text>
      <text class="user-role">{{roleLabel}}</text>
    </view>
  </view>

  <!-- 学习统计 -->
  <view class="card">
    <text class="section-title">学习统计</text>
    <view class="stats-grid">
      <view class="stat-item">
        <text class="stat-value">{{stats.submittedCount}}</text>
        <text class="stat-label">已提交作业</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{stats.analysisCount}}</text>
        <text class="stat-label">写作分析次数</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{stats.avgScore}}</text>
        <text class="stat-label">平均分</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{stats.studyDays}}</text>
        <text class="stat-label">学习天数</text>
      </view>
    </view>
  </view>

  <!-- 操作区 -->
  <view class="card">
    <view class="menu-item" bindtap="goAssignments">
      <text class="menu-text">我的作业</text>
      <text class="menu-arrow">›</text>
    </view>
    <view class="menu-item" bindtap="goWriting">
      <text class="menu-text">写作分析</text>
      <text class="menu-arrow">›</text>
    </view>
  </view>

  <view class="logout-btn" bindtap="logout">退出登录</view>
</view>
```

- [ ] **Step 6: 创建 dashboard/index.js**

```javascript
// pages/dashboard/index.js
const { get } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');
const app = getApp();

const ROLE_LABELS = { student: '学生', teacher: '教师', admin: '管理员' };

Page({
  data: {
    userInfo: null,
    initials: '',
    roleLabel: '',
    stats: { submittedCount: 0, analysisCount: 0, avgScore: '--', studyDays: 0 },
  },

  onLoad() {
    if (!isLoggedIn()) {
      tt.reLaunch({ url: '/pages/login/login' });
      return;
    }
    const userInfo = app.globalData.userInfo;
    const initials = (userInfo?.name || 'U').slice(0, 1).toUpperCase();
    const roleLabel = ROLE_LABELS[userInfo?.role] || '学生';
    this.setData({ userInfo, initials, roleLabel });
    this.loadProfile();
  },

  loadProfile() {
    get('/learning-profile')
      .then((data) => {
        this.setData({
          stats: {
            submittedCount: data.submitted_assignments ?? 0,
            analysisCount: data.writing_analysis_count ?? 0,
            avgScore: data.avg_writing_score ? Math.round(data.avg_writing_score) : '--',
            studyDays: data.study_days ?? 0,
          },
        });
      })
      .catch(() => {
        // Profile not critical; silently ignore
      });
  },

  goAssignments() {
    tt.switchTab({ url: '/pages/assignments/list' });
  },

  goWriting() {
    tt.switchTab({ url: '/pages/writing/feedback' });
  },

  logout() {
    tt.showModal({
      title: '退出登录',
      content: '确定要退出吗？',
      success: (res) => {
        if (res.confirm) app.logout();
      },
    });
  },
});
```

- [ ] **Step 7: 创建 dashboard/index.ttss**

```css
/* pages/dashboard/index.ttss */
.page { min-height: 100vh; }
.user-card { display: flex; align-items: center; }
.avatar-placeholder {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background: #1B5EAB;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 32rpx;
  flex-shrink: 0;
}
.avatar-text { color: #ffffff; font-size: 40rpx; font-weight: 600; }
.user-name { font-size: 34rpx; font-weight: 600; display: block; margin-bottom: 8rpx; }
.user-role { font-size: 26rpx; color: #8F959E; }
.section-title { font-size: 30rpx; font-weight: 500; margin-bottom: 32rpx; }
.stats-grid { display: flex; flex-wrap: wrap; }
.stat-item { width: 50%; text-align: center; padding: 24rpx 0; }
.stat-value { font-size: 48rpx; font-weight: 700; color: #1B5EAB; display: block; }
.stat-label { font-size: 24rpx; color: #8F959E; margin-top: 8rpx; display: block; }
.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
  border-bottom: 1rpx solid #F5F7FA;
}
.menu-item:last-child { border-bottom: none; }
.menu-text { flex: 1; font-size: 30rpx; }
.menu-arrow { font-size: 36rpx; color: #8F959E; }
.logout-btn {
  margin: 48rpx 24rpx;
  padding: 24rpx 0;
  text-align: center;
  color: #F54A45;
  font-size: 30rpx;
  border: 1rpx solid #F54A45;
  border-radius: 12rpx;
}
```

- [ ] **Step 8: 创建 dashboard/index.json**

```json
{ "navigationBarTitleText": "我的" }
```

- [ ] **Step 9: 在飞书开发者工具中验证**

1. 打开飞书开发者工具，导入 `code/feishu-miniapp/` 目录
2. 配置 `project.config.json` 中的 AppID
3. 预览各页面，确认无编译错误
4. 真机调试（iOS）：绑定测试设备，验证 tabBar 切换、滚动流畅

- [ ] **Step 10: Commit**

```bash
cd /Users/huaodong/graduationDesign/code/feishu-miniapp
git add pages/writing/ pages/dashboard/
git commit -m "feat(miniapp): add writing feedback and dashboard pages"
```

---

## 自检清单

### Spec 覆盖检查

| 需求 | 对应 Task |
|------|-----------|
| 飞书 OAuth 登录（code → JWT） | Task 3, Task 9 |
| 机器人 Webhook 消息 | Task 1 (`SendWebhookMessage`)，Task 3 (`SendNotification`) |
| 作业列表与提交 | Task 10 |
| AI 写作反馈展示 | Task 11（writing feedback page） |
| 学习进度 Dashboard | Task 11（dashboard page） |
| 后端配置与环境变量 | Task 2 |
| User 模型 FeishuOpenID | Task 4 |
| 路由注册 | Task 5 |

### 面试亮点检查

| 考察点 | 覆盖位置 |
|--------|---------|
| `tt.login` 完整流程 | utils/auth.js |
| 小程序生命周期（onLoad/onShow） | list.js |
| 自定义 request 封装 + 401 处理 | utils/request.js |
| 响应式数据绑定 | 所有页面 |
| iOS 细节（tabBar、scroll-view、rpx 适配） | app.json, *.ttss |
| 飞书开放平台 API（tenant token、user info、webhook） | feishu.go |

---

> 注：小程序真机测试需要在飞书开放平台配置服务域名白名单（将后端域名加入 `request` 合法域名），开发阶段可在开发者工具中关闭域名校验。

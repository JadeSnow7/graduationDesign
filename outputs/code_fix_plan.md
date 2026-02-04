# 代码问题修复详细计划

**制定日期**: 2026-02-04  
**预计完成时间**: 2026-05-04 (3个月)  
**负责人**: 待指定  
**审核状态**: 待审核

---

## 📊 执行摘要

基于代码审核报告发现的10个关键问题，本计划将修复工作分为3个阶段：

- **Phase 1 (高优先级)**: 1-2周，修复4个严重问题
- **Phase 2 (中优先级)**: 1个月，完成4个重要改进
- **Phase 3 (低优先级)**: 2个月，完成2个优化任务

**总投入时间估算**: 180-220 工时 (约3个月)

---

## 🔴 Phase 1: 高优先级修复 (1-2周)

### 问题1: 测试覆盖率严重不足 ⭐⭐⭐⭐⭐

**当前状态**: 
- Backend: <5% (仅1个测试文件)
- Frontend: <10% (2个测试文件)
- Mobile: 0% (无测试)
- AI Service: ~15%

**目标**: 将核心模块测试覆盖率提升至 **60%+**

#### 1.1 后端Go测试补充

**时间估算**: 40 工时

##### 任务清单

1. **认证模块测试** (8h)
   ```bash
   创建: backend/internal/http/handlers_auth_test.go
   ```
   
   测试用例:
   - ✅ `TestLogin_Success` - 正确的用户名密码
   - ✅ `TestLogin_WrongPassword` - 错误密码返回401
   - ✅ `TestLogin_UserNotFound` - 用户不存在返回401
   - ✅ `TestRegister_Success` - 注册新用户
   - ✅ `TestRegister_DuplicateUsername` - 用户名重复返回409
   - ✅ `TestGetCurrentUser_ValidToken` - 有效token获取用户信息
   - ✅ `TestGetCurrentUser_InvalidToken` - 无效token返回401

   实现方式:
   ```go
   package http_test

   import (
       "bytes"
       "encoding/json"
       "net/http"
       "net/http/httptest"
       "testing"
       
       "github.com/stretchr/testify/assert"
       "gorm.io/driver/sqlite"
       "gorm.io/gorm"
   )

   func setupTestDB(t *testing.T) *gorm.DB {
       db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
       assert.NoError(t, err)
       
       // 迁移测试表
       db.AutoMigrate(&models.User{})
       return db
   }

   func TestLogin_Success(t *testing.T) {
       db := setupTestDB(t)
       router := NewRouter(Config{JWTSecret: "test-secret"}, db, ...)
       
       // 创建测试用户
       user := &models.User{Username: "test", Password: hashPassword("123456")}
       db.Create(user)
       
       // 发送登录请求
       body := `{"username":"test","password":"123456"}`
       req := httptest.NewRequest("POST", "/api/v1/auth/login", bytes.NewBufferString(body))
       req.Header.Set("Content-Type", "application/json")
       w := httptest.NewRecorder()
       
       router.ServeHTTP(w, req)
       
       // 断言
       assert.Equal(t, http.StatusOK, w.Code)
       var resp map[string]interface{}
       json.Unmarshal(w.Body.Bytes(), &resp)
       assert.True(t, resp["success"].(bool))
       assert.NotEmpty(t, resp["data"].(map[string]interface{})["token"])
   }
   ```

2. **课程管理测试** (8h)
   ```bash
   创建: backend/internal/http/handlers_course_test.go
   ```
   
   测试用例:
   - ✅ `TestListCourses_AsTeacher` - 教师查看课程列表
   - ✅ `TestListCourses_AsStudent` - 学生查看已选课程
   - ✅ `TestCreateCourse_Success` - 创建课程(仅教师)
   - ✅ `TestCreateCourse_Forbidden` - 学生创建课程返回403
   - ✅ `TestGetCourse_Success` - 获取课程详情
   - ✅ `TestUpdateCourse_Success` - 更新课程信息
   - ✅ `TestDeleteCourse_Success` - 删除课程
   - ✅ `TestEnrollCourse_Success` - 学生选课

3. **作业系统测试** (8h)
   ```bash
   创建: backend/internal/http/handlers_assignment_test.go
   ```
   
   测试用例:
   - ✅ `TestListAssignments_ByCourse` - 按课程查看作业
   - ✅ `TestCreateAssignment_Success` - 教师创建作业
   - ✅ `TestSubmitAssignment_Success` - 学生提交作业
   - ✅ `TestSubmitAssignment_AfterDeadline` - 逾期提交
   - ✅ `TestGradeAssignment_Success` - 教师评分
   - ✅ `TestUpdateSubmission_Success` - 更新提交

4. **测验系统测试** (8h)
   ```bash
   创建: backend/internal/http/handlers_quiz_test.go
   ```
   
   测试用例:
   - ✅ `TestCreateQuiz_Success` - 创建测验
   - ✅ `TestStartQuizAttempt_Success` - 开始答题
   - ✅ `TestSubmitAnswer_Success` - 提交答案
   - ✅ `TestFinishQuizAttempt_Success` - 完成测验
   - ✅ `TestGetQuizResults_Success` - 查看成绩

5. **中间件测试** (4h)
   ```bash
   创建: backend/internal/http/middleware_test.go
   ```
   
   测试用例:
   - ✅ `TestAuthRequired_ValidToken`
   - ✅ `TestAuthRequired_MissingToken`
   - ✅ `TestAuthRequired_ExpiredToken`
   - ✅ `TestRequirePermission_HasPermission`
   - ✅ `TestRequirePermission_NoPermission`

6. **集成测试** (4h)
   ```bash
   创建: backend/tests/integration_test.go
   ```
   
   完整流程测试:
   - ✅ 用户注册 → 登录 → 创建课程 → 发布作业 → 学生提交 → 教师评分

#### 1.2 前端React测试补充

**时间估算**: 30 工时

##### 任务清单

1. **认证Hooks测试** (4h)
   ```bash
   创建: frontend-react/src/domains/auth/__tests__/useAuth.test.ts
   ```
   
   测试用例:
   ```typescript
   import { renderHook, act } from '@testing-library/react';
   import { useAuth } from '../useAuth';

   describe('useAuth', () => {
     it('should login successfully', async () => {
       const { result } = renderHook(() => useAuth());
       
       await act(async () => {
         await result.current.login('test', 'password');
       });
       
       expect(result.current.isAuthenticated).toBe(true);
       expect(result.current.user).toBeDefined();
     });

     it('should handle login failure', async () => {
       const { result } = renderHook(() => useAuth());
       
       await act(async () => {
         try {
           await result.current.login('test', 'wrong');
         } catch (e) {
           expect(e.message).toContain('Invalid credentials');
         }
       });
       
       expect(result.current.isAuthenticated).toBe(false);
     });
   });
   ```

2. **API客户端测试** (6h)
   ```bash
   创建: frontend-react/src/lib/__tests__/api-client.test.ts
   ```
   
   测试用例:
   - ✅ HTTP请求成功
   - ✅ 401自动跳转登录
   - ✅ 网络超时处理
   - ✅ 错误响应处理

3. **课程组件测试** (8h)
   ```bash
   创建: frontend-react/src/domains/course/__tests__/CourseList.test.tsx
   创建: frontend-react/src/domains/course/__tests__/CourseDetail.test.tsx
   ```

4. **表单验证测试** (6h)
   ```bash
   创建: frontend-react/src/components/__tests__/forms.test.tsx
   ```

5. **E2E测试 (Playwright)** (6h)
   ```bash
   创建: tests/e2e/user-flows.spec.ts
   ```
   
   流程:
   - ✅ 用户登录流程
   - ✅ 课程浏览和选课流程
   - ✅ 作业提交流程

#### 1.3 移动端测试补充

**时间估算**: 20 工时

##### 任务清单

1. **核心组件测试** (8h)
   ```bash
   创建: mobile/src/__tests__/screens/HomeScreen.test.tsx
   创建: mobile/src/__tests__/screens/CourseScreen.test.tsx
   ```

2. **导航测试** (4h)
   ```bash
   创建: mobile/src/__tests__/navigation.test.tsx
   ```

3. **API集成测试** (8h)
   ```bash
   创建: mobile/src/__tests__/api-integration.test.ts
   ```

#### 1.4 CI集成

**时间估算**: 8 工时

##### 任务清单

1. **创建GitHub Actions工作流** (4h)
   ```yaml
   # 创建: .github/workflows/test.yml
   name: Test

   on: [push, pull_request]

   jobs:
     backend-test:
       runs-on: ubuntu-latest
       services:
         mysql:
           image: mysql:8.4
           env:
             MYSQL_ROOT_PASSWORD: test
             MYSQL_DATABASE: testdb
           ports:
             - 3306:3306
       
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-go@v5
           with:
             go-version: '1.24'
         
         - name: Run tests
           run: |
             cd code/backend
             go test -v -race -coverprofile=coverage.out ./...
         
         - name: Upload coverage
           uses: codecov/codecov-action@v4
           with:
             file: ./coverage.out

     frontend-test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
         
         - name: Install dependencies
           run: npm ci
         
         - name: Run tests
           run: npm test -- --coverage
         
         - name: Upload coverage
           uses: codecov/codecov-action@v4
   ```

2. **配置测试报告** (2h)
   - 集成 Codecov
   - 配置徽章

3. **Pre-commit Hooks** (2h)
   ```yaml
   # 创建: .pre-commit-config.yaml
   repos:
     - repo: https://github.com/pre-commit/mirrors-gofmt
       rev: v1.3.0
       hooks:
         - id: gofmt
     
     - repo: https://github.com/golangci/golangci-lint
       rev: v1.55.0
       hooks:
         - id: golangci-lint
     
     - repo: https://github.com/psf/black
       rev: 23.12.0
       hooks:
         - id: black
     
     - repo: https://github.com/pre-commit/mirrors-eslint
       rev: v8.56.0
       hooks:
         - id: eslint
           files: \.(js|ts|tsx)$
           args: ['--fix']
   ```

**Phase 1 总计**: 98 工时 (~2周,双人并行)

---

### 问题2: Python服务缺少依赖锁定 ⭐⭐⭐⭐⭐

**当前状态**: 
- `ai_service/requirements.txt` - 仅列出包名,无版本锁定
- `simulation/requirements.txt` - 仅列出包名,无版本锁定

**影响**: 
- 不同环境依赖版本不一致
- 可能出现兼容性问题
- 无法回滚到已知稳定版本

**目标**: 使用 `poetry` 实现依赖锁定和版本管理

#### 2.1 AI Service迁移到Poetry

**时间估算**: 4 工时

##### 任务清单

1. **安装Poetry** (0.5h)
   ```bash
   curl -sSL https://install.python-poetry.org | python3 -
   ```

2. **初始化项目** (1h)
   ```bash
   cd code/ai_service
   poetry init --no-interaction
   ```
   
   编辑 `pyproject.toml`:
   ```toml
   [tool.poetry]
   name = "ai-service"
   version = "0.1.0"
   description = "AI教学服务"
   authors = ["Your Name <your.email@example.com>"]
   readme = "README.md"
   python = "^3.9"

   [tool.poetry.dependencies]
   python = "^3.9"
   fastapi = "^0.115.0"
   uvicorn = {extras = ["standard"], version = "^0.32.0"}
   httpx = "^0.27.0"
   pydantic = "^2.0"
   numpy = "^1.24.0"
   python-dotenv = "^1.0.0"

   [tool.poetry.group.dev.dependencies]
   pytest = "^8.0.0"
   pytest-asyncio = "^0.23.0"
   black = "^24.0.0"
   flake8 = "^7.0.0"
   mypy = "^1.8.0"

   [build-system]
   requires = ["poetry-core"]
   build-backend = "poetry.core.masonry.api"
   ```

3. **安装依赖并生成锁文件** (1h)
   ```bash
   poetry install
   # 自动生成 poetry.lock
   ```

4. **更新Dockerfile** (1h)
   ```dockerfile
   # 修改: code/ai_service/Dockerfile
   FROM python:3.9-slim

   WORKDIR /app

   # 安装poetry
   RUN pip install poetry==1.7.0

   # 复制依赖文件
   COPY pyproject.toml poetry.lock ./

   # 安装依赖 (不创建虚拟环境)
   RUN poetry config virtualenvs.create false \
       && poetry install --no-dev --no-interaction --no-ansi

   COPY . .

   CMD ["poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
   ```

5. **更新CI配置** (0.5h)
   ```yaml
   # 更新: .github/workflows/test.yml
   ai-service-test:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: actions/setup-python@v5
         with:
           python-version: '3.9'
       
       - name: Install Poetry
         run: curl -sSL https://install.python-poetry.org | python3 -
       
       - name: Install dependencies
         run: |
           cd code/ai_service
           poetry install
       
       - name: Run tests
         run: poetry run pytest
   ```

#### 2.2 Simulation Service迁移到Poetry

**时间估算**: 3 工时

重复上述步骤,时间更短因为依赖更少。

**Phase 1 总计 (问题2)**: 7 工时

---

### 问题3: JWT密钥配置安全性 ⭐⭐⭐⭐☆

**当前状态**: JWT密钥通过环境变量 `JWT_SECRET` 配置

**风险**:
- 环境变量可能被日志记录
- 容器环境下易泄露
- 缺少密钥轮换机制

**目标**: 实现安全的密钥管理方案

#### 3.1 短期方案: 文件存储 + 权限控制

**时间估算**: 6 工时

##### 任务清单

1. **创建密钥管理模块** (3h)
   ```go
   // 创建: backend/internal/config/secrets.go
   package config

   import (
       "crypto/rand"
       "encoding/base64"
       "os"
       "path/filepath"
   )

   type SecretManager struct {
       secretsDir string
   }

   func NewSecretManager(dir string) (*SecretManager, error) {
       // 确保目录存在且权限为700
       if err := os.MkdirAll(dir, 0700); err != nil {
           return nil, err
       }
       return &SecretManager{secretsDir: dir}, nil
   }

   func (sm *SecretManager) GetJWTSecret() ([]byte, error) {
       secretPath := filepath.Join(sm.secretsDir, "jwt.key")
       
       // 如果文件存在,读取
       if data, err := os.ReadFile(secretPath); err == nil {
           return data, nil
       }
       
       // 否则生成新密钥
       secret := make([]byte, 32)
       if _, err := rand.Read(secret); err != nil {
           return nil, err
       }
       
       // 保存到文件 (权限600)
       if err := os.WriteFile(secretPath, secret, 0600); err != nil {
           return nil, err
       }
       
       return secret, nil
   }

   func (sm *SecretManager) RotateJWTSecret() error {
       // 实现密钥轮换逻辑
       // 保留旧密钥用于验证现有token
       oldKey := filepath.Join(sm.secretsDir, "jwt.key")
       backupKey := filepath.Join(sm.secretsDir, "jwt.key.old")
       
       if err := os.Rename(oldKey, backupKey); err != nil {
           return err
       }
       
       // 生成新密钥
       _, err := sm.GetJWTSecret()
       return err
   }
   ```

2. **更新配置加载逻辑** (2h)
   ```go
   // 修改: backend/internal/config/config.go
   type Config struct {
       SecretManager *SecretManager
       // ... 其他配置
   }

   func Load() (*Config, error) {
       secretsDir := os.Getenv("SECRETS_DIR")
       if secretsDir == "" {
           secretsDir = "/var/secrets" // 默认路径
       }
       
       sm, err := NewSecretManager(secretsDir)
       if err != nil {
           return nil, err
       }
       
       jwtSecret, err := sm.GetJWTSecret()
       if err != nil {
           return nil, err
       }
       
       return &Config{
           SecretManager: sm,
           JWTSecretBytes: jwtSecret,
           JWTSecret: base64.StdEncoding.EncodeToString(jwtSecret),
       }, nil
   }
   ```

3. **更新Docker配置** (1h)
   ```yaml
   # 修改: code/docker-compose.yml
   services:
     backend:
       volumes:
         - ./secrets:/var/secrets:ro  # 只读挂载
       environment:
         - SECRETS_DIR=/var/secrets
   ```
   
   ```bash
   # 创建: deployment/setup_secrets.sh
   #!/bin/bash
   
   mkdir -p ./secrets
   chmod 700 ./secrets
   
   # 生成JWT密钥
   if [ ! -f ./secrets/jwt.key ]; then
       openssl rand -base64 32 > ./secrets/jwt.key
       chmod 600 ./secrets/jwt.key
   fi
   
   echo "Secrets initialized successfully"
   ```

#### 3.2 长期方案: 集成Vault (可选,不计入Phase 1)

后续可考虑集成 HashiCorp Vault 或 AWS Secrets Manager

**Phase 1 总计 (问题3)**: 6 工时

---

### 问题4: 缺少API请求频率限制 ⭐⭐⭐⭐☆

**当前状态**: 无任何限流保护

**风险**:
- 容易被DDoS攻击
- 恶意用户暴力破解
- 资源耗尽

**目标**: 实现多层次限流策略

#### 4.1 实现限流中间件

**时间估算**: 8 工时

##### 任务清单

1. **安装依赖** (0.5h)
   ```bash
   cd code/backend
   go get github.com/ulule/limiter/v3
   go get github.com/ulule/limiter/v3/drivers/middleware/gin
   go get github.com/ulule/limiter/v3/drivers/store/redis
   ```

2. **创建限流配置** (2h)
   ```go
   // 创建: backend/internal/http/middleware/ratelimit.go
   package middleware

   import (
       "time"
       
       "github.com/gin-gonic/gin"
       limiter "github.com/ulule/limiter/v3"
       mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
       "github.com/ulule/limiter/v3/drivers/store/memory"
       "github.com/ulule/limiter/v3/drivers/store/redis"
   )

   type RateLimitConfig struct {
       RedisAddr string
       UseRedis  bool
   }

   // 创建全局限流器 (每IP每秒最多10个请求)
   func GlobalRateLimit(cfg RateLimitConfig) gin.HandlerFunc {
       var store limiter.Store
       
       if cfg.UseRedis && cfg.RedisAddr != "" {
           store = redis.NewStore(cfg.RedisAddr)
       } else {
           store = memory.NewStore()
       }
       
       rate := limiter.Rate{
           Period: 1 * time.Second,
           Limit:  10,
       }
       
       middleware := mgin.NewMiddleware(limiter.New(store, rate))
       return middleware
   }

   // 登录接口限流 (每IP每分钟最多5次)
   func AuthRateLimit(cfg RateLimitConfig) gin.HandlerFunc {
       var store limiter.Store
       
       if cfg.UseRedis && cfg.RedisAddr != "" {
           store = redis.NewStore(cfg.RedisAddr)
       } else {
           store = memory.NewStore()
       }
       
       rate := limiter.Rate{
           Period: 1 * time.Minute,
           Limit:  5,
       }
       
       middleware := mgin.NewMiddleware(limiter.New(store, rate))
       return middleware
   }

   // AI接口限流 (每用户每分钟最多20次)
   func AIRateLimit(cfg RateLimitConfig) gin.HandlerFunc {
       var store limiter.Store
       
       if cfg.UseRedis && cfg.RedisAddr != "" {
           store = redis.NewStore(cfg.RedisAddr)
       } else {
           store = memory.NewStore()
       }
       
       rate := limiter.Rate{
           Period: 1 * time.Minute,
           Limit:  20,
       }
       
       instance := limiter.New(store, rate)
       
       return func(c *gin.Context) {
           // 使用用户ID作为限流键
           userID := c.GetString("userID")
           if userID == "" {
               userID = c.ClientIP()
           }
           
           ctx := limiter.NewContext(c.Request.Context(), userID)
           context, err := instance.Get(ctx, userID)
           
           if err != nil {
               c.JSON(500, gin.H{"error": "rate limiter error"})
               c.Abort()
               return
           }
           
           c.Header("X-RateLimit-Limit", strconv.FormatInt(context.Limit, 10))
           c.Header("X-RateLimit-Remaining", strconv.FormatInt(context.Remaining, 10))
           c.Header("X-RateLimit-Reset", strconv.FormatInt(context.Reset, 10))
           
           if context.Reached {
               c.JSON(429, gin.H{
                   "success": false,
                   "error": "Rate limit exceeded. Please try again later.",
               })
               c.Abort()
               return
           }
           
           c.Next()
       }
   }
   ```

3. **应用到路由** (2h)
   ```go
   // 修改: backend/internal/http/router.go
   func NewRouter(cfg Config, db *gorm.DB, ...) *gin.Engine {
       r := gin.Default()
       
       // 全局限流
       rateLimitCfg := middleware.RateLimitConfig{
           RedisAddr: cfg.RedisAddr,
           UseRedis:  cfg.RedisAddr != "",
       }
       r.Use(middleware.GlobalRateLimit(rateLimitCfg))
       
       api := r.Group("/api/v1")
       
       // 登录接口特殊限流
       auth := api.Group("/auth")
       auth.Use(middleware.AuthRateLimit(rateLimitCfg))
       {
           auth.POST("/login", handlers.Login)
           auth.POST("/register", handlers.Register)
       }
       
       // AI接口限流
       ai := api.Group("/ai")
       ai.Use(
           middleware.AuthRequired(cfg.JWTSecret),
           middleware.AIRateLimit(rateLimitCfg),
       )
       {
           ai.POST("/chat", handlers.Chat)
           ai.POST("/chat/guided", handlers.GuidedChat)
       }
       
       // ... 其他路由
   }
   ```

4. **添加Redis支持** (2h)
   ```yaml
   # 修改: code/docker-compose.yml
   services:
     redis:
       image: redis:7-alpine
       ports:
         - "6379:6379"
       volumes:
         - redis-data:/data
       command: redis-server --appendonly yes

     backend:
       depends_on:
         - redis
       environment:
         - REDIS_ADDR=redis:6379

   volumes:
     redis-data:
   ```

5. **配置和测试** (1.5h)
   ```go
   // 创建: backend/internal/http/middleware/ratelimit_test.go
   package middleware_test

   import (
       "net/http"
       "net/http/httptest"
       "testing"
       
       "github.com/gin-gonic/gin"
       "github.com/stretchr/testify/assert"
   )

   func TestGlobalRateLimit(t *testing.T) {
       gin.SetMode(gin.TestMode)
       
       r := gin.New()
       r.Use(middleware.GlobalRateLimit(middleware.RateLimitConfig{}))
       r.GET("/test", func(c *gin.Context) {
           c.String(200, "OK")
       })
       
       // 发送11个请求,第11个应该被限流
       for i := 1; i <= 11; i++ {
           req := httptest.NewRequest("GET", "/test", nil)
           req.RemoteAddr = "192.168.1.1:12345"
           w := httptest.NewRecorder()
           
           r.ServeHTTP(w, req)
           
           if i <= 10 {
               assert.Equal(t, 200, w.Code, "Request %d should succeed", i)
           } else {
               assert.Equal(t, 429, w.Code, "Request %d should be rate limited", i)
           }
       }
   }
   ```

**Phase 1 总计 (问题4)**: 8 工时

---

## 🟡 Phase 2: 中优先级改进 (1个月)

### 问题5: 后端Handler文件过长 ⭐⭐⭐⭐☆

**当前状态**:
- `handlers_quiz.go`: 833行
- `handlers_chapter.go`: 540行
- `handlers_assignment.go`: 545行

**问题**: 业务逻辑和HTTP层耦合,违反单一职责原则

**目标**: 引入Service层,实现分层架构

#### 5.1 设计Service层架构

**时间估算**: 40 工时

##### 架构设计

```
HTTP层 (handlers/)
  ├─→ Service层 (services/)
       ├─→ Repository层 (repositories/)
            └─→ 数据模型 (models/)
```

##### 任务清单

1. **创建Service接口定义** (4h)
   ```go
   // 创建: backend/internal/services/interfaces.go
   package services

   import (
       "context"
       "github.com/yourusername/classplatform/internal/models"
   )

   // CourseService 课程业务逻辑
   type CourseService interface {
       ListCourses(ctx context.Context, userID uint, role string) ([]models.Course, error)
       GetCourse(ctx context.Context, courseID uint) (*models.Course, error)
       CreateCourse(ctx context.Context, req CreateCourseRequest) (*models.Course, error)
       UpdateCourse(ctx context.Context, courseID uint, req UpdateCourseRequest) (*models.Course, error)
       DeleteCourse(ctx context.Context, courseID uint) error
       EnrollStudent(ctx context.Context, courseID uint, studentID uint) error
   }

   // AssignmentService 作业业务逻辑
   type AssignmentService interface {
       ListAssignments(ctx context.Context, courseID uint) ([]models.Assignment, error)
       GetAssignment(ctx context.Context, assignmentID uint) (*models.Assignment, error)
       CreateAssignment(ctx context.Context, req CreateAssignmentRequest) (*models.Assignment, error)
       SubmitAssignment(ctx context.Context, req SubmitAssignmentRequest) (*models.Submission, error)
       GradeSubmission(ctx context.Context, submissionID uint, score float64, feedback string) error
   }

   // QuizService 测验业务逻辑
   type QuizService interface {
       CreateQuiz(ctx context.Context, req CreateQuizRequest) (*models.Quiz, error)
       StartAttempt(ctx context.Context, quizID uint, studentID uint) (*models.QuizAttempt, error)
       SubmitAnswer(ctx context.Context, attemptID uint, questionID uint, answer string) error
       FinishAttempt(ctx context.Context, attemptID uint) (*models.QuizAttempt, error)
       GetResults(ctx context.Context, attemptID uint) (*QuizResults, error)
   }
   ```

2. **实现CourseService** (8h)
   ```go
   // 创建: backend/internal/services/course_service.go
   package services

   import (
       "context"
       "errors"
       "gorm.io/gorm"
       "github.com/yourusername/classplatform/internal/models"
       "github.com/yourusername/classplatform/internal/repositories"
   )

   type courseService struct {
       repo repositories.CourseRepository
       db   *gorm.DB
   }

   func NewCourseService(db *gorm.DB) CourseService {
       return &courseService{
           repo: repositories.NewCourseRepository(db),
           db:   db,
       }
   }

   func (s *courseService) ListCourses(ctx context.Context, userID uint, role string) ([]models.Course, error) {
       switch role {
       case "teacher":
           return s.repo.FindByTeacherID(ctx, userID)
       case "student":
           return s.repo.FindByStudentID(ctx, userID)
       case "admin":
           return s.repo.FindAll(ctx)
       default:
           return nil, errors.New("invalid role")
       }
   }

   func (s *courseService) CreateCourse(ctx context.Context, req CreateCourseRequest) (*models.Course, error) {
       // 验证输入
       if req.Title == "" {
           return nil, errors.New("course title is required")
       }
       
       // 创建课程
       course := &models.Course{
           Title:          req.Title,
           Description:    req.Description,
           TeacherID:      req.TeacherID,
           EnabledModules: req.EnabledModules,
       }
       
       if err := s.repo.Create(ctx, course); err != nil {
           return nil, err
       }
       
       return course, nil
   }

   // ... 其他方法
   ```

3. **创建Repository层** (8h)
   ```go
   // 创建: backend/internal/repositories/course_repository.go
   package repositories

   import (
       "context"
       "gorm.io/gorm"
       "github.com/yourusername/classplatform/internal/models"
   )

   type CourseRepository interface {
       FindAll(ctx context.Context) ([]models.Course, error)
       FindByID(ctx context.Context, id uint) (*models.Course, error)
       FindByTeacherID(ctx context.Context, teacherID uint) ([]models.Course, error)
       FindByStudentID(ctx context.Context, studentID uint) ([]models.Course, error)
       Create(ctx context.Context, course *models.Course) error
       Update(ctx context.Context, course *models.Course) error
       Delete(ctx context.Context, id uint) error
   }

   type courseRepository struct {
       db *gorm.DB
   }

   func NewCourseRepository(db *gorm.DB) CourseRepository {
       return &courseRepository{db: db}
   }

   func (r *courseRepository) FindByID(ctx context.Context, id uint) (*models.Course, error) {
       var course models.Course
       err := r.db.WithContext(ctx).
           Preload("Teacher").
           Preload("Students").
           First(&course, id).Error
       
       if err != nil {
           return nil, err
       }
       return &course, nil
   }

   // ... 其他方法
   ```

4. **重构Handlers使用Service** (12h)
   ```go
   // 修改: backend/internal/http/handlers_course.go
   package http

   import (
       "net/http"
       "github.com/gin-gonic/gin"
       "github.com/yourusername/classplatform/internal/services"
   )

   type courseHandlers struct {
       service services.CourseService
   }

   func newCourseHandlers(service services.CourseService) *courseHandlers {
       return &courseHandlers{service: service}
   }

   func (h *courseHandlers) ListCourses(c *gin.Context) {
       userID := c.GetUint("userID")
       role := c.GetString("role")
       
       courses, err := h.service.ListCourses(c.Request.Context(), userID, role)
       if err != nil {
           respondError(c, http.StatusInternalServerError, err.Error())
           return
       }
       
       respondSuccess(c, courses)
   }

   func (h *courseHandlers) CreateCourse(c *gin.Context) {
       var req services.CreateCourseRequest
       if err := c.ShouldBindJSON(&req); err != nil {
           respondError(c, http.StatusBadRequest, "Invalid request body")
           return
       }
       
       req.TeacherID = c.GetUint("userID")
       
       course, err := h.service.CreateCourse(c.Request.Context(), req)
       if err != nil {
           respondError(c, http.StatusInternalServerError, err.Error())
           return
       }
       
       respondSuccess(c, course)
   }

   // Handler文件从540行减少到约100行
   ```

5. **实现AssignmentService和QuizService** (8h)

   按照相同模式重构作业和测验模块。

**Phase 2 总计 (问题5)**: 40 工时

---

### 问题6: 前端组件缺少Storybook ⭐⭐⭐⭐☆

**目标**: 搭建组件文档和可视化开发环境

#### 6.1 集成Storybook

**时间估算**: 16 工时

##### 任务清单

1. **安装Storybook** (2h)
   ```bash
   cd code/frontend-react
   npx storybook@latest init
   ```
   
   自动生成:
   - `.storybook/main.ts`
   - `.storybook/preview.ts`
   - `src/stories/` 示例文件

2. **配置Storybook** (2h)
   ```typescript
   // 修改: frontend-react/.storybook/main.ts
   import type { StorybookConfig } from '@storybook/react-vite';
   import path from 'path';

   const config: StorybookConfig = {
     stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
     addons: [
       '@storybook/addon-links',
       '@storybook/addon-essentials',
       '@storybook/addon-interactions',
       '@storybook/addon-a11y', // 可访问性检查
     ],
     framework: {
       name: '@storybook/react-vite',
       options: {},
     },
     async viteFinal(config) {
       // 添加路径别名
       config.resolve!.alias = {
         ...config.resolve!.alias,
         '@': path.resolve(__dirname, '../src'),
       };
       return config;
     },
   };

   export default config;
   ```

3. **编写组件Stories** (8h)
   ```typescript
   // 创建: frontend-react/src/components/Button/Button.stories.tsx
   import type { Meta, StoryObj } from '@storybook/react';
   import { Button } from './Button';

   const meta = {
     title: 'Components/Button',
     component: Button,
     parameters: {
       layout: 'centered',
     },
     tags: ['autodocs'],
     argTypes: {
       variant: {
         control: 'select',
         options: ['primary', 'secondary', 'outline'],
       },
       size: {
         control: 'select',
         options: ['sm', 'md', 'lg'],
       },
     },
   } satisfies Meta<typeof Button>;

   export default meta;
   type Story = StoryObj<typeof meta>;

   export const Primary: Story = {
     args: {
       variant: 'primary',
       children: 'Primary Button',
     },
   };

   export const Secondary: Story = {
     args: {
       variant: 'secondary',
       children: 'Secondary Button',
     },
   };

   export const Large: Story = {
     args: {
       size: 'lg',
       children: 'Large Button',
     },
   };
   ```
   
   为以下组件编写Stories:
   - ✅ Button
   - ✅ Input / TextArea
   - ✅ Card
   - ✅ Modal
   - ✅ Dropdown
   - ✅ CourseCard
   - ✅ AssignmentCard
   - ✅ QuizQuestion

4. **配置部署** (2h)
   ```yaml
   # 修改: .github/workflows/storybook.yml
   name: Deploy Storybook

   on:
     push:
       branches: [main]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
         
         - name: Install dependencies
           run: |
             cd code/frontend-react
             npm ci
         
         - name: Build Storybook
           run: npm run build-storybook
         
         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./storybook-static
   ```

5. **文档完善** (2h)
   ```markdown
   # 创建: docs/development/storybook-guide.md
   
   # Storybook 使用指南
   
   ## 本地开发
   
   \`\`\`bash
   cd code/frontend-react
   npm run storybook
   \`\`\`
   
   访问: http://localhost:6006
   
   ## 编写Stories
   
   为每个可复用组件编写至少3个Story:
   1. Default - 默认状态
   2. With Props - 不同props组合
   3. Interactive - 交互状态
   
   ## 最佳实践
   
   - 使用 `args` 定义可配置属性
   - 使用 `argTypes` 提供控制面板
   - 使用 `play` 函数测试交互
   - 添加可访问性检查
   ```

**Phase 2 总计 (问题6)**: 16 工时

---

### 问题7: 日志系统不统一 ⭐⭐⭐⭐☆

**当前状态**: 
- 后端: `fmt.Println()` 和 `log.Println()` 混用
- 前端: `console.log()` 无结构化
- Python: `print()` 调试日志

**目标**: 统一日志格式,支持结构化查询

#### 7.1 后端日志改造

**时间估算**: 12 工时

##### 任务清单

1. **集成zap日志库** (4h)
   ```bash
   cd code/backend
   go get go.uber.org/zap
   ```
   
   ```go
   // 创建: backend/internal/logger/logger.go
   package logger

   import (
       "go.uber.org/zap"
       "go.uber.org/zap/zapcore"
   )

   var Log *zap.Logger

   func Init(env string) error {
       var config zap.Config
       
       if env == "production" {
           config = zap.NewProductionConfig()
           config.EncoderConfig.TimeKey = "timestamp"
           config.EncoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
       } else {
           config = zap.NewDevelopmentConfig()
           config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
       }
       
       var err error
       Log, err = config.Build(zap.AddCallerSkip(1))
       if err != nil {
           return err
       }
       
       return nil
   }

   // 便捷方法
   func Info(msg string, fields ...zap.Field) {
       Log.Info(msg, fields...)
   }

   func Error(msg string, fields ...zap.Field) {
       Log.Error(msg, fields...)
   }

   func Debug(msg string, fields ...zap.Field) {
       Log.Debug(msg, fields...)
   }

   func Warn(msg string, fields ...zap.Field) {
       Log.Warn(msg, fields...)
   }

   func Fatal(msg string, fields ...zap.Field) {
       Log.Fatal(msg, fields...)
   }
   ```

2. **添加请求日志中间件** (3h)
   ```go
   // 创建: backend/internal/http/middleware/logging.go
   package middleware

   import (
       "time"
       "github.com/gin-gonic/gin"
       "go.uber.org/zap"
       "github.com/yourusername/classplatform/internal/logger"
   )

   func RequestLogger() gin.HandlerFunc {
       return func(c *gin.Context) {
           start := time.Now()
           path := c.Request.URL.Path
           query := c.Request.URL.RawQuery
           
           c.Next()
           
           end := time.Now()
           latency := end.Sub(start)
           
           logger.Info("HTTP Request",
               zap.String("method", c.Request.Method),
               zap.String("path", path),
               zap.String("query", query),
               zap.Int("status", c.Writer.Status()),
               zap.Duration("latency", latency),
               zap.String("ip", c.ClientIP()),
               zap.String("user_agent", c.Request.UserAgent()),
               zap.String("error", c.Errors.ByType(gin.ErrorTypePrivate).String()),
           )
       }
   }
   ```

3. **替换现有日志调用** (5h)
   ```go
   // 替换所有文件中的:
   
   // 之前:
   fmt.Println("User logged in:", username)
   log.Printf("Error: %v", err)
   
   // 之后:
   logger.Info("User logged in", zap.String("username", username))
   logger.Error("Operation failed", zap.Error(err))
   ```
   
   使用脚本批量替换:
   ```bash
   # 创建: scripts/migrate_logs.sh
   #!/bin/bash
   
   find backend/internal -name "*.go" -exec sed -i '' \
     's/fmt\.Println/logger.Info/g' {} \;
   
   find backend/internal -name "*.go" -exec sed -i '' \
     's/log\.Printf/logger.Info/g' {} \;
   ```

#### 7.2 前端日志改造

**时间估算**: 6 工时

##### 任务清单

1. **创建日志工具** (3h)
   ```typescript
   // 创建: frontend-react/src/lib/logger.ts
   
   enum LogLevel {
     DEBUG = 0,
     INFO = 1,
     WARN = 2,
     ERROR = 3,
   }

   interface LogContext {
     [key: string]: any;
   }

   class Logger {
     private level: LogLevel;
     private environment: string;

     constructor() {
       this.environment = import.meta.env.MODE;
       this.level = this.environment === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
     }

     private log(level: LogLevel, message: string, context?: LogContext) {
       if (level < this.level) return;

       const timestamp = new Date().toISOString();
       const logData = {
         timestamp,
         level: LogLevel[level],
         message,
         ...context,
       };

       // 开发环境: console输出
       if (this.environment !== 'production') {
         const color = this.getColor(level);
         console.log(
           `%c${timestamp} [${LogLevel[level]}]`,
           `color: ${color}`,
           message,
           context || ''
         );
       }

       // 生产环境: 发送到日志服务
       if (this.environment === 'production' && level >= LogLevel.WARN) {
         this.sendToServer(logData);
       }
     }

     private getColor(level: LogLevel): string {
       switch (level) {
         case LogLevel.DEBUG: return '#888';
         case LogLevel.INFO: return '#0066cc';
         case LogLevel.WARN: return '#ff9900';
         case LogLevel.ERROR: return '#cc0000';
       }
     }

     private async sendToServer(logData: any) {
       try {
         await fetch('/api/v1/logs', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(logData),
         });
       } catch (e) {
         // 静默失败,避免日志系统影响主功能
       }
     }

     debug(message: string, context?: LogContext) {
       this.log(LogLevel.DEBUG, message, context);
     }

     info(message: string, context?: LogContext) {
       this.log(LogLevel.INFO, message, context);
     }

     warn(message: string, context?: LogContext) {
       this.log(LogLevel.WARN, message, context);
     }

     error(message: string, context?: LogContext) {
       this.log(LogLevel.ERROR, message, context);
     }
   }

   export const logger = new Logger();
   ```

2. **替换console调用** (3h)
   ```typescript
   // 之前:
   console.log('User logged in', user);
   console.error('API call failed', error);
   
   // 之后:
   import { logger } from '@/lib/logger';
   
   logger.info('User logged in', { userId: user.id, username: user.username });
   logger.error('API call failed', { error: error.message, endpoint: '/api/courses' });
   ```

#### 7.3 Python日志改造

**时间估算**: 4 工时

##### 任务清单

1. **配置structlog** (2h)
   ```python
   # 修改: ai_service/app/logger.py
   
   import structlog
   import logging
   import sys

   def configure_logger():
       logging.basicConfig(
           format="%(message)s",
           stream=sys.stdout,
           level=logging.INFO,
       )

       structlog.configure(
           processors=[
               structlog.contextvars.merge_contextvars,
               structlog.processors.add_log_level,
               structlog.processors.StackInfoRenderer(),
               structlog.dev.set_exc_info,
               structlog.processors.TimeStamper(fmt="iso"),
               structlog.dev.ConsoleRenderer() if sys.stdout.isatty() 
                   else structlog.processors.JSONRenderer(),
           ],
           wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
           context_class=dict,
           logger_factory=structlog.PrintLoggerFactory(),
           cache_logger_on_first_use=False,
       )

   logger = structlog.get_logger()
   ```

2. **替换print语句** (2h)
   ```python
   # 之前:
   print(f"Processing request: {request_id}")
   
   # 之后:
   from app.logger import logger
   
   logger.info("processing_request", request_id=request_id)
   ```

**Phase 2 总计 (问题7)**: 22 工时

---

### 问题8: 缺少CI/CD管道配置 ⭐⭐⭐⭐☆

**目标**: 实现完整的CI/CD流程

#### 8.1 创建CI Pipeline

**时间估算**: 12 工时

##### 任务清单

1. **完善测试工作流** (4h)
   ```yaml
   # 扩展: .github/workflows/ci.yml
   name: CI

   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]

   jobs:
     backend-test:
       runs-on: ubuntu-latest
       services:
         mysql:
           image: mysql:8.4
           env:
             MYSQL_ROOT_PASSWORD: test
             MYSQL_DATABASE: testdb
           ports:
             - 3306:3306
           options: >-
             --health-cmd="mysqladmin ping"
             --health-interval=10s
             --health-timeout=5s
             --health-retries=3
       
       steps:
         - uses: actions/checkout@v4
         
         - uses: actions/setup-go@v5
           with:
             go-version: '1.24'
         
         - name: Cache Go modules
           uses: actions/cache@v4
           with:
             path: ~/go/pkg/mod
             key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
         
         - name: Install dependencies
           run: |
             cd code/backend
             go mod download
         
         - name: Lint
           run: |
             cd code/backend
             go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
             golangci-lint run
         
         - name: Run tests
           run: |
             cd code/backend
             go test -v -race -coverprofile=coverage.out -covermode=atomic ./...
           env:
             MYSQL_DSN: root:test@tcp(localhost:3306)/testdb?parseTime=true
         
         - name: Upload coverage
           uses: codecov/codecov-action@v4
           with:
             file: ./code/backend/coverage.out
             flags: backend

     frontend-test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
             cache: 'npm'
             cache-dependency-path: code/package-lock.json
         
         - name: Install dependencies
           run: |
             cd code
             npm ci
         
         - name: Lint
           run: |
             cd code/frontend-react
             npm run lint
         
         - name: Type check
           run: |
             cd code/frontend-react
             npm run type-check
         
         - name: Run tests
           run: |
             cd code/frontend-react
             npm test -- --coverage --watchAll=false
         
         - name: Upload coverage
           uses: codecov/codecov-action@v4
           with:
             file: ./code/frontend-react/coverage/coverage-final.json
             flags: frontend

     ai-service-test:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - uses: actions/setup-python@v5
           with:
             python-version: '3.9'
         
         - name: Install Poetry
           run: curl -sSL https://install.python-poetry.org | python3 -
         
         - name: Install dependencies
           run: |
             cd code/ai_service
             poetry install
         
         - name: Lint
           run: |
             cd code/ai_service
             poetry run black --check .
             poetry run flake8
         
         - name: Run tests
           run: |
             cd code/ai_service
             poetry run pytest --cov=app --cov-report=xml
         
         - name: Upload coverage
           uses: codecov/codecov-action@v4
           with:
             file: ./code/ai_service/coverage.xml
             flags: ai-service

     docker-build:
       runs-on: ubuntu-latest
       needs: [backend-test, frontend-test, ai-service-test]
       steps:
         - uses: actions/checkout@v4
         
         - name: Set up Docker Buildx
           uses: docker/setup-buildx-action@v3
         
         - name: Build backend
           run: |
             cd code/backend
             docker build -t classplatform-backend:test .
         
         - name: Build frontend
           run: |
             cd code/frontend-react
             docker build -t classplatform-frontend:test .
         
         - name: Build AI service
           run: |
             cd code/ai_service
             docker build -t classplatform-ai:test .
   ```

2. **创建CD Pipeline** (4h)
   ```yaml
   # 创建: .github/workflows/cd.yml
   name: CD

   on:
     push:
       tags:
         - 'v*'

   jobs:
     build-and-push:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Set up Docker Buildx
           uses: docker/setup-buildx-action@v3
         
         - name: Login to Docker Hub
           uses: docker/login-action@v3
           with:
             username: ${{ secrets.DOCKERHUB_USERNAME }}
             password: ${{ secrets.DOCKERHUB_TOKEN }}
         
         - name: Extract version
           id: version
           run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
         
         - name: Build and push backend
           uses: docker/build-push-action@v5
           with:
             context: ./code/backend
             push: true
             tags: |
               yourorg/classplatform-backend:latest
               yourorg/classplatform-backend:${{ steps.version.outputs.VERSION }}
             cache-from: type=gha
             cache-to: type=gha,mode=max
         
         - name: Build and push frontend
           uses: docker/build-push-action@v5
           with:
             context: ./code/frontend-react
             push: true
             tags: |
               yourorg/classplatform-frontend:latest
               yourorg/classplatform-frontend:${{ steps.version.outputs.VERSION }}
         
         - name: Build and push AI service
           uses: docker/build-push-action@v5
           with:
             context: ./code/ai_service
             push: true
             tags: |
               yourorg/classplatform-ai:latest
               yourorg/classplatform-ai:${{ steps.version.outputs.VERSION }}

     deploy:
       runs-on: ubuntu-latest
       needs: build-and-push
       steps:
         - name: Deploy to production
           uses: appleboy/ssh-action@v1.0.0
           with:
             host: ${{ secrets.PROD_HOST }}
             username: ${{ secrets.PROD_USER }}
             key: ${{ secrets.PROD_SSH_KEY }}
             script: |
               cd /opt/classplatform
               docker-compose pull
               docker-compose up -d
               docker-compose exec backend ./migrate
   ```

3. **添加代码质量检查** (2h)
   ```yaml
   # 创建: .github/workflows/code-quality.yml
   name: Code Quality

   on:
     pull_request:
       branches: [main]

   jobs:
     sonarcloud:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 0
         
         - name: SonarCloud Scan
           uses: SonarSource/sonarcloud-github-action@master
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
             SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

     dependency-review:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Dependency Review
           uses: actions/dependency-review-action@v4
           with:
             fail-on-severity: moderate
   ```

4. **配置自动发布** (2h)
   ```yaml
   # 创建: .github/workflows/release.yml
   name: Release

   on:
     push:
       tags:
         - 'v*'

   jobs:
     create-release:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 0
         
         - name: Generate changelog
           id: changelog
           run: |
             # 生成CHANGELOG
             git log $(git describe --tags --abbrev=0 HEAD^)..HEAD --pretty=format:"- %s (%h)" > CHANGELOG.md
         
         - name: Create Release
           uses: actions/create-release@v1
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
           with:
             tag_name: ${{ github.ref }}
             release_name: Release ${{ github.ref }}
             body_path: CHANGELOG.md
             draft: false
             prerelease: false
   ```

**Phase 2 总计 (问题8)**: 12 工时

---

## 🟢 Phase 3: 低优先级优化 (2个月)

### 问题9: 代码注释不足 ⭐⭐⭐☆☆

**目标**: 为关键函数和模块添加完整文档

#### 9.1 补充GoDoc注释

**时间估算**: 20 工时

##### 任务清单

1. **公共API注释** (8h)
   ```go
   // 修改: backend/internal/http/handlers_course.go
   
   // ListCourses 返回用户可访问的课程列表。
   //
   // 根据用户角色返回不同范围的课程:
   //   - 教师: 返回自己创建的课程
   //   - 学生: 返回已选课程
   //   - 管理员: 返回所有课程
   //
   // HTTP Method: GET
   // Path: /api/v1/courses
   //
   // Query Parameters:
   //   - page: 页码 (可选,默认1)
   //   - limit: 每页数量 (可选,默认20)
   //
   // Response:
   //   200: 成功返回课程列表
   //   401: 未授权
   //   500: 服务器错误
   func (h *courseHandlers) ListCourses(c *gin.Context) {
       // ...
   }
   ```

2. **数据模型注释** (6h)
   ```go
   // 修改: backend/internal/models/course.go
   
   // Course 表示系统中的课程实体。
   //
   // 课程是教学的基本单位,包含章节、作业、测验等子资源。
   // 每个课程由一名教师创建和管理,可以被多名学生选修。
   //
   // 数据库表: courses
   type Course struct {
       ID          uint      `gorm:"primarykey" json:"id"`
       Title       string    `gorm:"type:varchar(200);not null" json:"title"`
       Description string    `gorm:"type:text" json:"description"`
       TeacherID   uint      `gorm:"not null;index" json:"teacher_id"`
       
       // EnabledModules 控制课程启用的功能模块
       //
       // 可选值: "assignments", "quizzes", "ai_chat", "simulations"
       // 示例: ["assignments", "quizzes"]
       EnabledModules pq.StringArray `gorm:"type:text[]" json:"enabled_modules"`
       
       CreatedAt time.Time `json:"created_at"`
       UpdatedAt time.Time `json:"updated_at"`
       
       // 关联关系
       Teacher  User   `gorm:"foreignKey:TeacherID" json:"teacher,omitempty"`
       Students []User `gorm:"many2many:course_students;" json:"students,omitempty"`
   }
   ```

3. **工具函数注释** (6h)
   为 `internal/` 下的工具函数添加注释

#### 9.2 补充Python Docstring

**时间估算**: 16 工时

##### 任务清单

1. **API端点注释** (8h)
   ```python
   # 修改: ai_service/app/main.py
   
   @app.post("/v1/chat/guided", response_model=GuidedChatResponse)
   async def chat_guided(req: GuidedChatRequest) -> GuidedChatResponse:
       """引导式AI对话接口。
       
       根据学生的学习状态和知识薄弱点,提供个性化的教学引导。
       
       Args:
           req: 对话请求,包含对话历史和学生档案ID
       
       Returns:
           GuidedChatResponse: AI回复消息和更新的学习事件
       
       Raises:
           HTTPException: 
               - 400: 请求参数无效
               - 404: 学生档案不存在
               - 500: AI服务调用失败
       
       Examples:
           >>> req = GuidedChatRequest(
           ...     student_profile_id=123,
           ...     messages=[
           ...         ChatMessage(role="user", content="我不理解递归")
           ...     ]
           ... )
           >>> response = await chat_guided(req)
           >>> print(response.reply.content)
           "让我用一个简单的例子帮你理解递归..."
       """
       # ...
   ```

2. **算法函数注释** (8h)
   ```python
   # 修改: ai_service/app/weak_point_detector.py
   
   def detect_weak_points(
       events: list[LearningEvent],
       threshold: float = 0.6
   ) -> list[WeakPoint]:
       """检测学生的知识薄弱点。
       
       通过分析学习事件(测验错题、作业扣分、对话内容),
       识别学生在各知识点上的掌握程度,标记薄弱环节。
       
       算法流程:
           1. 提取所有涉及的知识点
           2. 计算每个知识点的正确率
           3. 对比阈值标记薄弱点
           4. 按严重程度排序
       
       Args:
           events: 学习事件列表,必须包含knowledge_point字段
           threshold: 正确率阈值,低于此值视为薄弱点 (默认0.6)
       
       Returns:
           薄弱点列表,按严重程度降序排列
       
       Time Complexity:
           O(n), n为事件数量
       
       References:
           - Zhang et al. (2020). Knowledge Tracing in MOOCs.
       """
       # ...
   ```

**Phase 3 总计 (问题9)**: 36 工时

---

### 问题10: Docker镜像未优化 ⭐⭐⭐☆☆

**目标**: 减小镜像体积,加快构建速度

#### 10.1 优化后端Dockerfile

**时间估算**: 8 工时

##### 任务清单

1. **多阶段构建** (4h)
   ```dockerfile
   # 修改: code/backend/Dockerfile
   
   # 阶段1: 构建
   FROM golang:1.24-alpine AS builder

   # 安装构建依赖
   RUN apk add --no-cache git gcc musl-dev

   WORKDIR /build

   # 复制依赖文件并下载 (利用缓存)
   COPY go.mod go.sum ./
   RUN go mod download

   # 复制源代码
   COPY . .

   # 编译 (启用优化)
   RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
       go build -ldflags="-s -w" -o backend ./cmd/server

   # 阶段2: 运行
   FROM alpine:3.19

   # 添加ca证书和时区数据
   RUN apk --no-cache add ca-certificates tzdata

   # 创建非root用户
   RUN addgroup -g 1000 app && \
       adduser -D -u 1000 -G app app

   WORKDIR /app

   # 从构建阶段复制二进制文件
   COPY --from=builder /build/backend .

   # 切换到非root用户
   USER app

   EXPOSE 8080

   CMD ["./backend"]
   ```
   
   优化效果:
   - 之前: ~800MB (包含Go编译器)
   - 之后: ~20MB (仅运行时)

2. **优化前端Dockerfile** (2h)
   ```dockerfile
   # 修改: code/frontend-react/Dockerfile
   
   # 阶段1: 构建
   FROM node:20-alpine AS builder

   WORKDIR /build

   # 复制依赖文件 (利用缓存)
   COPY package*.json ./
   COPY ../shared/package.json ../shared/
   RUN npm ci

   # 复制源代码
   COPY . .
   COPY ../shared ../shared

   # 构建
   ENV NODE_ENV=production
   RUN npm run build

   # 阶段2: 运行
   FROM nginx:1.25-alpine

   # 复制自定义nginx配置
   COPY nginx.conf /etc/nginx/conf.d/default.conf

   # 复制构建产物
   COPY --from=builder /build/dist /usr/share/nginx/html

   # 添加健康检查
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
       CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

   EXPOSE 80

   CMD ["nginx", "-g", "daemon off;"]
   ```
   
   优化效果:
   - 之前: ~1.2GB (包含Node.js)
   - 之后: ~40MB (仅nginx+静态文件)

3. **优化Python Dockerfile** (2h)
   ```dockerfile
   # 修改: code/ai_service/Dockerfile
   
   # 阶段1: 构建依赖
   FROM python:3.9-slim AS builder

   RUN pip install poetry==1.7.0

   WORKDIR /build

   COPY pyproject.toml poetry.lock ./
   RUN poetry export -f requirements.txt --output requirements.txt --without-hashes

   # 阶段2: 运行
   FROM python:3.9-slim

   # 安装运行时依赖
   RUN apt-get update && \
       apt-get install -y --no-install-recommends \
       libgomp1 && \
       rm -rf /var/lib/apt/lists/*

   WORKDIR /app

   # 复制并安装Python包
   COPY --from=builder /build/requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt

   # 复制应用代码
   COPY . .

   # 创建非root用户
   RUN useradd -m -u 1000 app && chown -R app:app /app
   USER app

   EXPOSE 8001

   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
   ```
   
   优化效果:
   - 之前: ~1.5GB
   - 之后: ~400MB

#### 10.2 添加.dockerignore

**时间估算**: 2 工时

```bash
# 创建: code/backend/.dockerignore
.git
.gitignore
*.md
.env
tmp/
*.test
coverage.out

# 创建: code/frontend-react/.dockerignore
node_modules
.git
*.md
.env
dist
storybook-static
coverage

# 创建: code/ai_service/.dockerignore
__pycache__
.git
*.md
.env
.pytest_cache
tests
```

**Phase 3 总计 (问题10)**: 10 工时

---

## 📊 总体时间和资源估算

### 时间汇总

| 阶段 | 任务数 | 总工时 | 周期 | 人力 |
|------|--------|--------|------|------|
| **Phase 1** | 4个问题 | 119h | 2周 | 2-3人 |
| **Phase 2** | 4个问题 | 90h | 4周 | 2人 |
| **Phase 3** | 2个问题 | 46h | 4周 | 1人 |
| **总计** | 10个问题 | **255h** | **10周** | 2-3人 |

### 优先级排序

#### 必须立即完成 (阻塞生产)
1. ⭐⭐⭐⭐⭐ 补充测试 (问题1) - **风险最高**
2. ⭐⭐⭐⭐⭐ 依赖锁定 (问题2) - **部署风险**
3. ⭐⭐⭐⭐☆ API限流 (问题4) - **安全风险**

#### 短期内完成 (提升质量)
4. ⭐⭐⭐⭐☆ Service层重构 (问题5) - **可维护性**
5. ⭐⭐⭐⭐☆ 统一日志 (问题7) - **可观测性**
6. ⭐⭐⭐⭐☆ CI/CD (问题8) - **开发效率**

#### 长期优化 (锦上添花)
7. ⭐⭐⭐☆☆ 密钥管理 (问题3) - **安全增强**
8. ⭐⭐⭐☆☆ Storybook (问题6) - **文档**
9. ⭐⭐⭐☆☆ 代码注释 (问题9) - **可读性**
10. ⭐⭐⭐☆☆ Docker优化 (问题10) - **性能**

### 里程碑

#### Milestone 1: 基础稳定 (Week 2)
- ✅ 核心业务逻辑测试覆盖率 >50%
- ✅ Python依赖锁定完成
- ✅ API限流部署上线
- ✅ 密钥管理改造完成

**交付物**:
- 测试报告 + 覆盖率徽章
- 更新的部署文档

#### Milestone 2: 架构优化 (Week 6)
- ✅ Service层重构完成
- ✅ 日志系统统一
- ✅ CI/CD流程上线
- ✅ Storybook文档发布

**交付物**:
- 重构后的架构文档
- CI/CD配置文件
- Storybook站点

#### Milestone 3: 全面提升 (Week 10)
- ✅ API文档完善
- ✅ Docker镜像优化
- ✅ 代码注释补充

**交付物**:
- 完整的开发者文档
- 优化后的部署配置

---

## 🎯 成功指标

### 量化指标

| 指标 | 当前值 | 目标值 | 测量方式 |
|------|--------|--------|----------|
| **测试覆盖率** | <10% | >60% | Codecov报告 |
| **构建时间** | ~8min | <5min | CI pipeline时间 |
| **镜像体积** | 3.5GB | <500MB | docker images |
| **API响应时间** | 200ms | <100ms | 监控面板 |
| **代码复杂度** | 15 | <10 | SonarQube |
| **技术债务** | 30天 | <10天 | SonarQube |

### 质量门禁

**Phase 1完成标准**:
- [ ] 所有核心API有单元测试
- [ ] CI测试通过率100%
- [ ] 无高危安全漏洞
- [ ] 依赖版本全部锁定

**Phase 2完成标准**:
- [ ] Service层重构完成,Handler文件<200行
- [ ] 所有日志使用结构化格式
- [ ] CI/CD流程自动化
- [ ] Storybook组件文档>20个

**Phase 3完成标准**:
- [ ] 公共API 100%有文档注释
- [ ] Docker镜像总体积<500MB
- [ ] 代码质量评分 >8.0/10

---

## 🚧 风险和依赖

### 风险识别

1. **测试补充风险** (高)
   - 问题: 补充测试需要深入理解业务逻辑
   - 缓解: 优先测试核心功能,分阶段覆盖

2. **重构影响** (中)
   - 问题: Service层重构可能引入新bug
   - 缓解: 
     - 先完善测试再重构
     - 分模块逐步重构
     - 保留旧代码备份

3. **CI/CD配置复杂度** (中)
   - 问题: 多服务部署协调困难
   - 缓解: 使用docker-compose统一编排

4. **时间延期** (低)
   - 问题: 估算可能偏乐观
   - 缓解: 预留20%缓冲时间

### 外部依赖

- [ ] Docker Hub账号 (镜像推送)
- [ ] Codecov账号 (测试报告)
- [ ] SonarCloud账号 (代码质量)
- [ ] 生产服务器SSH访问权限

---

## 📝 验收标准

### Phase 1验收

**测试覆盖率**:
```bash
# 后端
cd code/backend
go test -cover ./... | tee coverage.txt
# 要求: 核心包覆盖率 >60%

# 前端
cd code/frontend-react
npm test -- --coverage
# 要求: src/domains/ 覆盖率 >50%
```

**依赖锁定**:
```bash
# 检查Python lock文件存在
ls code/ai_service/poetry.lock
ls code/simulation/poetry.lock
```

**API限流**:
```bash
# 测试限流生效
for i in {1..15}; do
  curl http://localhost:8080/api/v1/courses
done
# 预期: 第11-15个请求返回429
```

### Phase 2验收

**Service层**:
```bash
# 检查Handler文件行数
wc -l code/backend/internal/http/handlers_*.go
# 要求: 所有文件 <300行
```

**日志系统**:
```bash
# 检查日志格式
docker-compose logs backend | head -10
# 要求: JSON格式,包含timestamp/level/message字段
```

**CI/CD**:
```bash
# 检查工作流运行
gh workflow list
gh run list --workflow=ci.yml
# 要求: 最近5次运行全部成功
```

### Phase 3验收

**文档注释**:
```bash
# 检查GoDoc覆盖率
godoc -http=:6060 &
# 人工审查公共API文档完整性

# 检查Python docstring
cd code/ai_service
pydocstyle app/
# 要求: 0个docstring错误
```

**Docker优化**:
```bash
# 检查镜像体积
docker images | grep classplatform
# 要求: 总体积 <500MB
```

---

## 🔄 后续维护计划

### 每周任务
- [ ] 审查新增代码的测试覆盖率
- [ ] 检查CI/CD运行状态
- [ ] 更新依赖版本(安全补丁)

### 每月任务
- [ ] 运行SonarQube扫描
- [ ] 审查技术债务积累
- [ ] 更新Storybook组件文档

### 每季度任务
- [ ] 全面代码审计
- [ ] 性能压测
- [ ] 安全渗透测试
- [ ] 依赖升级(大版本)

---

## 📞 联系方式

**项目负责人**: [待指定]  
**技术负责人**: [待指定]  
**审核人**: [待指定]

**进度跟踪**: 
- GitHub Projects: [待创建]
- Jira Board: [待创建]
- 每周例会: 周五下午2:00

---

## ✅ 审核检查清单

请审核人员逐项检查:

### 计划完整性
- [ ] 所有10个问题都有对应的修复方案
- [ ] 每个方案都有明确的任务清单
- [ ] 时间估算合理 (考虑了复杂度和依赖)
- [ ] 优先级划分清晰

### 技术可行性
- [ ] 技术方案符合项目技术栈
- [ ] 没有引入不必要的新技术
- [ ] 考虑了向后兼容性
- [ ] 有回滚方案

### 资源合理性
- [ ] 人力投入符合团队规模
- [ ] 时间周期现实可行
- [ ] 外部依赖可获得

### 风险评估
- [ ] 识别了主要风险
- [ ] 提供了缓解措施
- [ ] 有应急预案

### 验收标准
- [ ] 每个阶段有明确的完成标准
- [ ] 标准可量化测量
- [ ] 有自动化验证方式

---

**审核意见**:

```
[请在此填写审核意见]

同意 / 需修改 / 拒绝

签名: ___________
日期: ___________
```

---

**文档版本**: v1.0  
**最后更新**: 2026-02-04  
**下次审核**: 2026-02-11

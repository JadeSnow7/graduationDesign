# 贡献指南

感谢您对本项目的关注！我们欢迎各种形式的贡献，包括但不限于代码、文档、问题报告和功能建议。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境搭建](#开发环境搭建)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题报告](#问题报告)
- [功能建议](#功能建议)

## 行为准则

本项目采用 [Contributor Covenant](https://www.contributor-covenant.org/) 行为准则。参与本项目即表示您同意遵守其条款。

### 我们的承诺

- 营造开放、友好、多元、包容的环境
- 尊重不同观点和经验
- 接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

### 贡献类型

1. **代码贡献**
   - 修复 bug
   - 实现新功能
   - 性能优化
   - 重构代码

2. **文档贡献**
   - 改进现有文档
   - 添加缺失的文档
   - 翻译文档
   - 修复文档中的错误

3. **测试贡献**
   - 编写单元测试
   - 编写集成测试
   - 改进测试覆盖率
   - 性能测试

4. **其他贡献**
   - 报告 bug
   - 提出功能建议
   - 参与讨论
   - 代码审查

## 开发环境搭建

### 前置要求

- Node.js 18+ 和 npm/yarn
- Go 1.21+
- Python 3.9+
- Docker 和 Docker Compose
- Git

### 快速开始

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd education-project
   ```

2. **环境配置**
   ```bash
   # 复制环境变量模板
   cp code/.env.example code/.env
   
   # 运行环境配置脚本
   ./code/scripts/setup-env.sh
   ```

3. **启动开发环境**
   ```bash
   # 启动所有服务
   ./code/scripts/dev-up.sh
   
   # 或者使用 Docker Compose
   cd code
   docker-compose up -d
   ```

4. **验证安装**
   - 前端：http://localhost:5173
   - 后端 API：http://localhost:8080
   - AI 服务：http://localhost:8001
   - 仿真服务：http://localhost:8002

### 项目结构

```
education-project/
├── code/                    # 代码库
│   ├── frontend-react/     # Web 前端（React + Vite）
│   ├── backend/            # Go 后端
│   ├── ai_service/         # Python AI 服务
│   ├── simulation/         # Python 仿真服务
│   ├── mobile/             # 移动端（Expo，可选）
│   ├── shared/             # 共享资源
│   ├── deployment/         # 部署配置
│   └── scripts/            # 构建脚本
├── academic/               # 学术材料
├── docs/                   # 技术文档
└── assets/                 # 静态资源
```

## 代码规范

### 通用规范

- 使用 UTF-8 编码
- 使用 Unix 风格的换行符 (LF)
- 文件末尾保留一个空行
- 移除行尾空格
- 使用有意义的变量和函数名
- 添加必要的注释

### 前端规范 (React + TypeScript)

- 遵循 React 社区最佳实践（组件职责单一、hooks 管理副作用、避免过度状态提升）
- 使用 TypeScript 严格模式
- 组件名使用 PascalCase，hooks 使用 `useXxx` 命名
- 文件名与目录名保持一致的工程风格（组件/页面 PascalCase，工具与 hooks camelCase/kebab-case 均可，但需统一）
- 使用 ESLint 和 Prettier

```typescript
// 好的示例
interface UserProfile {
  id: number;
  name: string;
  email: string;
}

const fetchUserProfile = async (userId: number): Promise<UserProfile> => {
  // 实现逻辑
};
```

### 后端规范 (Go)

- 遵循 [Go 代码规范](https://golang.org/doc/effective_go.html)
- 使用 `gofmt` 格式化代码
- 使用 `golint` 检查代码
- 包名使用小写单词
- 导出的函数和变量使用 PascalCase

```go
// 好的示例
type UserService struct {
    repo UserRepository
}

func (s *UserService) GetUserByID(ctx context.Context, id int64) (*User, error) {
    // 实现逻辑
}
```

### Python 规范

- 遵循 [PEP 8](https://www.python.org/dev/peps/pep-0008/)
- 使用 `black` 格式化代码
- 使用 `flake8` 检查代码
- 使用类型提示
- 函数和变量使用 snake_case

```python
# 好的示例
from typing import Optional

def get_user_profile(user_id: int) -> Optional[dict]:
    """获取用户配置文件"""
    # 实现逻辑
    pass
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交消息格式

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式变更（不影响代码运行）
- `refactor`: 重构（既不是新增功能，也不是修复 bug）
- `perf`: 性能优化
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

### 示例

```bash
feat(auth): 添加用户登录功能

实现了基于 JWT 的用户认证系统，包括：
- 用户注册和登录接口
- JWT token 生成和验证
- 中间件保护需要认证的路由

Closes #123
```

## Pull Request 流程

1. **Fork 仓库**
   - 点击 GitHub 上的 "Fork" 按钮

2. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **开发和测试**
   - 编写代码
   - 添加测试
   - 确保所有测试通过
   - 更新文档

4. **提交变更**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待代码审查

6. **代码审查**
   - 响应审查意见
   - 进行必要的修改
   - 保持 PR 更新

7. **合并**
   - PR 被批准后将被合并
   - 删除功能分支

### PR 检查清单

- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 所有测试通过
- [ ] 更新了相关文档
- [ ] 提交消息符合规范
- [ ] 没有合并冲突

## 问题报告

### 报告 Bug

使用 GitHub Issues 报告 bug，请包含：

1. **Bug 描述**
   - 清晰简洁的描述

2. **重现步骤**
   - 详细的重现步骤
   - 预期行为
   - 实际行为

3. **环境信息**
   - 操作系统
   - 浏览器版本
   - Node.js/Go/Python 版本

4. **附加信息**
   - 截图或录屏
   - 错误日志
   - 相关配置

### Bug 报告模板

```markdown
## Bug 描述
简要描述遇到的问题

## 重现步骤
1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 预期行为
描述你期望发生的情况

## 实际行为
描述实际发生的情况

## 环境信息
- OS: [例如 macOS 12.0]
- Browser: [例如 Chrome 95.0]
- Version: [例如 1.0.0]

## 附加信息
添加任何其他有助于解释问题的信息
```

## 功能建议

### 提出新功能

使用 GitHub Issues 提出功能建议，请包含：

1. **功能描述**
   - 清晰的功能描述
   - 使用场景

2. **解决的问题**
   - 这个功能解决什么问题
   - 为什么需要这个功能

3. **建议的解决方案**
   - 你认为应该如何实现
   - 可能的替代方案

4. **附加信息**
   - 相关资料或参考
   - 实现的优先级

## 社区

### 沟通渠道

- GitHub Issues: 问题报告和功能建议
- GitHub Discussions: 一般讨论和问答
- Email: [维护者邮箱]

### 获得帮助

如果你需要帮助：

1. 查看现有文档
2. 搜索已有的 Issues
3. 在 GitHub Discussions 提问
4. 联系维护者

## 许可证

通过贡献代码，您同意您的贡献将在与项目相同的许可证下授权。

## 致谢

感谢所有为本项目做出贡献的开发者！

---

再次感谢您的贡献！🎉

# 前端代码 (Frontend)

基于 Vue.js 的前端应用，提供电磁场教学平台的用户界面。

## 技术栈

- Vue.js 3 + TypeScript
- Vite (构建工具)
- Vue Router (路由管理)
- Pinia (状态管理)
- Element Plus (UI组件库)

## 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── components/     # 可复用组件
├── views/         # 页面组件
├── router/        # 路由配置
├── stores/        # 状态管理
├── api/          # API接口
├── assets/       # 静态资源
└── utils/        # 工具函数
```

## 主要功能

- 用户认证和授权
- 课程管理界面
- 电磁场仿真可视化
- AI助手聊天界面
- 企业微信集成

## 相关文档

- [API文档](../../docs/api/)
- [部署指南](../../docs/deployment/)
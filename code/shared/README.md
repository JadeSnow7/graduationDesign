# 共享资源 (Shared Resources)

包含各服务间共享的配置文件、数据模式和通用资源。

## 目录结构

```
shared/
├── configs/          # 配置文件
│   ├── database.yml  # 数据库配置
│   ├── redis.yml     # Redis配置
│   └── logging.yml   # 日志配置
├── schemas/          # 数据模式
│   ├── api.json      # API数据模式
│   ├── database.sql  # 数据库模式
│   └── events.json   # 事件模式
└── docs/            # 内部文档
    ├── conventions.md # 编码规范
    └── protocols.md   # 通信协议
```

## 配置管理

- 使用 YAML 格式的配置文件
- 支持环境变量覆盖
- 提供开发和生产环境配置

## 数据模式

- JSON Schema 定义API数据格式
- SQL Schema 定义数据库结构
- 事件模式定义服务间通信格式

## 使用指南

1. 各服务通过相对路径引用共享配置
2. 数据模式用于验证和文档生成
3. 修改共享资源需要通知相关服务团队

## 版本控制

- 配置文件变更需要版本标记
- 向后兼容性检查
- 变更通知和迁移指南
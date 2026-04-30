import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "智能教学平台",
    description: "基于 AI 的以学生为中心的智能教学系统",
    base: '/graduationDesign/',
    // srcDir removed, default is root of where vitepress is run (which is docs/ based on script)

    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: '首页', link: '/' },
            { text: '入门', link: '/01-getting-started/' },
            { text: '教程', link: '/02-tutorials/' },
            { text: '操作指南', link: '/03-how-to-guides/' },
            { text: '参考', link: '/04-reference/' },
            { text: '解释', link: '/05-explanation/' },
            { text: '贡献', link: '/06-contributing/' },
            { text: '发版说明', link: '/07-release-notes/' }
        ],

        sidebar: {
            '/01-getting-started/': [
                {
                    text: '入门指南',
                    items: [
                        { text: '总览', link: '/01-getting-started/' },
                        { text: '项目简介', link: '/01-getting-started/intro' },
                        { text: '环境要求', link: '/01-getting-started/prerequisites' },
                        { text: '快速开始', link: '/01-getting-started/quick-start' },
                        { text: '用户指南', link: '/01-getting-started/USER_GUIDE' }
                    ]
                }
            ],
            '/02-tutorials/': [
                {
                    text: '教程',
                    items: [
                        { text: '总览', link: '/02-tutorials/' },
                        { text: '创建课程', link: '/02-tutorials/create-course' },
                        { text: '服务器部署', link: '/02-tutorials/deploy-to-server' }
                    ]
                }
            ],
            '/03-how-to-guides/': [
                {
                    text: '操作指南',
                    items: [
                        { text: '总览', link: '/03-how-to-guides/' },
                        { text: 'CI/CD 配置', link: '/03-how-to-guides/ci-cd-setup' },
                        { text: 'CI/CD 架构', link: '/03-how-to-guides/ci-cd-workflow-architecture' },
                        { text: '部署指南总览', link: '/03-how-to-guides/deployment/' }
                    ]
                },
                {
                    text: '部署指南',
                    items: [
                        { text: '环境准备', link: '/03-how-to-guides/deployment/environment-setup' },
                        { text: '配置说明', link: '/03-how-to-guides/deployment/configuration' },
                        { text: 'AI 模型部署', link: '/03-how-to-guides/deployment/ai-model-deployment-guide' },
                        { text: 'NPU 分层部署', link: '/03-how-to-guides/deployment/npu-tiered-deployment' },
                        { text: 'Docker 部署', link: '/03-how-to-guides/deployment/docker-deployment' },
                        { text: '生产部署', link: '/03-how-to-guides/deployment/production-deployment' },
                        { text: '故障排查', link: '/03-how-to-guides/deployment/troubleshooting' },
                        { text: '监控运维', link: '/03-how-to-guides/deployment/monitoring' },
                        { text: '备份与恢复', link: '/03-how-to-guides/deployment/backup-recovery' },
                        { text: '企业微信配置', link: '/03-how-to-guides/deployment/wechat_work_guide' },
                        { text: '飞书配置与部署', link: '/03-how-to-guides/deployment/feishu-guide' }
                    ]
                }
            ],
            '/04-reference/': [
                {
                    text: '参考文档',
                    items: [
                        { text: '总览', link: '/04-reference/' },
                        { text: 'API 总览', link: '/04-reference/api/' },
                        { text: '认证接口', link: '/04-reference/api/auth' },
                        { text: '课程管理', link: '/04-reference/api/course' },
                        { text: 'AI 服务', link: '/04-reference/api/ai' },
                        { text: '仿真服务', link: '/04-reference/api/simulation' },
                        { text: '工作台接口', link: '/04-reference/api/workspace' },
                        { text: 'OpenAPI 定义', link: '/04-reference/api/openapi' },
                        { text: '版本治理', link: '/04-reference/versioning/' },
                        { text: '契约锁定策略', link: '/04-reference/versioning/api-lock-policy' }
                    ]
                },
                {
                    text: 'CLI 工具',
                    items: [
                        { text: '命令参考', link: '/04-reference/cli/' }
                    ]
                },
                {
                    text: '配置手册',
                    items: [
                        { text: '环境变量', link: '/04-reference/config/' }
                    ]
                }
            ],
            '/05-explanation/': [
                {
                    text: '概念解释',
                    items: [
                        { text: '总览', link: '/05-explanation/' },
                        { text: '系统设计', link: '/05-explanation/system-design' },
                        { text: '权限模型', link: '/05-explanation/rbac-model' },
                        { text: 'AI 流程', link: '/05-explanation/ai-pipeline' },
                        { text: '需求文档', link: '/05-explanation/requirements' },
                        { text: '功能模块', link: '/05-explanation/feature-modules' },
                        { text: '前端交互架构', link: '/05-explanation/frontend-api-architecture-interaction' },
                        { text: '前端页面设计', link: '/05-explanation/frontend-page-design' },
                        { text: '跨平台迁移', link: '/05-explanation/cross-platform-migration-plan' }
                    ]
                },
                {
                    text: '前端 API 规范',
                    items: [
                        { text: 'API 契约设计规范', link: '/05-explanation/frontend-api-refactor-list' },
                        { text: 'API 重构 RFC', link: '/05-explanation/frontend-api-refactor-rfc' },
                        { text: 'API 对齐提示词', link: '/05-explanation/frontend-api-alignment-prompt' }
                    ]
                },
                {
                    text: '核心架构',
                    items: [
                        { text: 'Multi-Agent 协作架构', link: '/05-explanation/multi-agent-architecture' },
                        { text: 'GraphRAG-X 混合检索', link: '/05-explanation/graphrag-x' },
                        { text: 'Edge SDK IPC 通信', link: '/05-explanation/edge-sdk-ipc' }
                    ]
                },
                {
                    text: '架构落地',
                    items: [
                        { text: '前端 API 实现状态', link: '/05-explanation/architecture/frontend-api-implementation-status' },
                        { text: '项目设计文档', link: '/05-explanation/architecture/project-design-document' },
                        { text: '组件设计', link: '/05-explanation/architecture/component-design' },
                        { text: 'React 分层架构', link: '/05-explanation/architecture/react-layered-architecture' },
                        { text: '解耦架构规范', link: '/05-explanation/architecture/decoupled-architecture-spec' },
                        { text: 'Shared SDK 结构', link: '/05-explanation/architecture/shared-sdk-structure' },
                        { text: '本地 AI 运行时', link: '/05-explanation/architecture/local-ai-runtime' },
                        { text: '小程序选型', link: '/05-explanation/architecture/mini-app-selection' },
                        { text: '模块门控计划', link: '/05-explanation/architecture/module-gating-plan' },
                        { text: 'API 对齐计划', link: '/05-explanation/architecture/api-alignment-plan' },
                        { text: 'Rust 增强 POC', link: '/05-explanation/architecture/rust-enhancement-poc-plan-2026-02-11' },
                        { text: '遗留开发记录', link: '/05-explanation/architecture/legacy-dev' }
                    ]
                },
                {
                    text: 'AI 机制',
                    items: [
                        { text: 'AI 文档总览', link: '/05-explanation/ai/' },
                        { text: '模型路由策略', link: '/05-explanation/ai/model-routing-policy' },
                        { text: 'Qwen3-VL 迁移基线', link: '/05-explanation/ai/qwen3-vl-migration-baseline-2026-02-09' },
                        { text: 'GraphRAG', link: '/05-explanation/ai/graph-rag' },
                        { text: '引导式学习', link: '/05-explanation/ai/guided-learning' },
                        { text: '工具调用', link: '/05-explanation/ai/tool-calling' },
                        { text: '学习分析', link: '/05-explanation/ai/learning-analytics' },
                        { text: '知识蒸馏', link: '/05-explanation/ai/distillation' },
                        { text: '后训练微调计划', link: '/05-explanation/ai/post-training-finetuning-plan' },
                        { text: '训练数据规范', link: '/05-explanation/ai/training-data-spec' },
                        { text: '训练环境配置', link: '/05-explanation/ai/training-environment' },
                        { text: '参考论文', link: '/05-explanation/ai/papers' },
                        { text: '首次训练记录（2026-02-08）', link: '/05-explanation/ai/training-runs/2026-02-08-first-train' }
                    ]
                }
            ],
            '/06-contributing/': [
                {
                    text: '贡献指南',
                    items: [
                        { text: '总览', link: '/06-contributing/' },
                        { text: '文档规范', link: '/06-contributing/doc-style' },
                        { text: '代码规范', link: '/06-contributing/code-style' },
                        { text: '项目规范', link: '/06-contributing/项目规范指南' },
                        { text: '测试指南', link: '/06-contributing/testing-guide' },
                        { text: '模块设计模板', link: '/06-contributing/模块设计文档模板' }
                    ]
                },
                {
                    text: '协作流程',
                    items: [
                        { text: 'Plan 模式协作流程', link: '/06-contributing/plan-mode-workflow' },
                        { text: 'Plan 模式计划模板', link: '/06-contributing/plan-mode-template' }
                    ]
                },
                {
                    text: '文档模板',
                    items: [
                        { text: 'API 端点模板', link: '/templates/api-endpoint-template' },
                        { text: 'How-To 模板', link: '/templates/how-to-template' }
                    ]
                }
            ],
            '/07-release-notes/': [
                {
                    text: '发布说明',
                    items: [
                        { text: '总览', link: '/07-release-notes/' },
                        { text: '合规性审查（2026-02-26）', link: '/07-release-notes/compliance-audit-2026-02-26' },
                        { text: '后端重构（2026-02-11）', link: '/07-release-notes/backend-refactoring-2026-02-11' },
                        { text: '文档体系完善（2026-02-09）', link: '/07-release-notes/doc-update-2026-02-09' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/JadeSnow7/graduationDesign' }
        ],

        // search: {
        //     provider: 'local'
        // },

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2026 Student-Centric Intelligent Teaching Platform'
        }
    }
})

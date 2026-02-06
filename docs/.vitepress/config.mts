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
            { text: '参考', link: '/04-reference/' },
            { text: '解释', link: '/05-explanation/' },
            { text: '贡献', link: '/06-contributing/' }
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
                        { text: 'AI 文档总览', link: '/05-explanation/ai/' },
                        { text: '需求文档', link: '/05-explanation/requirements' },
                        { text: '功能模块', link: '/05-explanation/feature-modules' },
                        { text: '前端交互', link: '/05-explanation/frontend-api-architecture-interaction' },
                        { text: '跨平台迁移', link: '/05-explanation/cross-platform-migration-plan' }
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
                }
            ],
            '/07-release-notes/': [
                {
                    text: '发布说明',
                    items: [
                        { text: '总览', link: '/07-release-notes/' }
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

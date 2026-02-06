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
            { text: '入门', link: '/01-getting-started/quick-start' },
            { text: '参考', link: '/04-reference/api/' },
            { text: '关于', link: '/06-contributing/项目规范指南' }
        ],

        sidebar: {
            '/01-getting-started/': [
                {
                    text: '入门指南',
                    items: [
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
                        { text: '创建课程', link: '/02-tutorials/create-course' },
                        { text: '服务器部署', link: '/02-tutorials/deploy-to-server' }
                    ]
                }
            ],
            '/03-how-to-guides/': [
                {
                    text: '操作指南',
                    items: [
                        { text: 'CI/CD 配置', link: '/03-how-to-guides/ci-cd-setup' }
                    ]
                }
            ],
            '/04-reference/': [
                {
                    text: 'API 参考',
                    items: [
                        { text: '概览', link: '/04-reference/api/' },
                        { text: '认证接口', link: '/04-reference/api/auth' },
                        { text: '课程管理', link: '/04-reference/api/course' },
                        { text: 'AI 服务', link: '/04-reference/api/ai' },
                        { text: '仿真服务', link: '/04-reference/api/simulation' },
                        { text: 'OpenAPI 定义', link: '/04-reference/api/openapi' }
                    ]
                }
            ],
            '/05-explanation/': [
                {
                    text: '概念解释',
                    items: [
                        { text: '系统设计', link: '/05-explanation/system-design' },
                        { text: '权限模型', link: '/05-explanation/rbac-model' },
                        { text: 'AI 流程', link: '/05-explanation/ai-pipeline' },
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
                        { text: '文档规范', link: '/06-contributing/doc-style' },
                        { text: '项目规范', link: '/06-contributing/项目规范指南' },
                        { text: '测试流程', link: '/06-contributing/标准化测试流程' },
                        { text: '模块设计模板', link: '/06-contributing/模块设计文档模板' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/JadeSnow7/graduationDesign' }
        ],

        // search: {
        //     provider: 'local' // Disabled due to duplicate ID error with intro.md
        // },

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2026 Student-Centric Intelligent Teaching Platform'
        }
    }
})

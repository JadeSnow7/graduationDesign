/**
 * Unit tests to verify README content completeness
 * Tests README file contains necessary sections and valid navigation links
 * Requirements: 3.1, 3.2
 */

import { describe, test, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = join(process.cwd(), '..')

describe('README Content Completeness', () => {
  test('Main README contains required sections', () => {
    const readmePath = join(PROJECT_ROOT, 'README.md')
    expect(existsSync(readmePath), 'Main README.md should exist').toBe(true)
    
    const readmeContent = readFileSync(readmePath, 'utf-8')
    
    // Test for required sections based on requirements 3.1, 3.2
    const requiredSections = [
      '项目概览',           // Project overview
      '核心特性',           // Core features  
      '项目架构',           // Project architecture
      '技术栈',             // Technology stack
      '项目结构',           // Project structure
      '快速开始',           // Quick start
      '环境要求',           // Environment requirements
      '一键部署',           // One-click deployment
      '开发环境搭建',       // Development environment setup
      '配置说明',           // Configuration instructions
      '文档导航',           // Documentation navigation
      '贡献指南',           // Contributing guide
      '许可证'              // License
    ]
    
    for (const section of requiredSections) {
      expect(readmeContent, `README should contain ${section} section`).toContain(section)
    }
  })

  test('README contains project architecture description and technology stack', () => {
    const readmePath = join(PROJECT_ROOT, 'README.md')
    const readmeContent = readFileSync(readmePath, 'utf-8')
    
    // Verify architecture description exists
    expect(readmeContent, 'README should contain system architecture diagram').toContain('系统架构图')
    
    // Verify technology stack table exists
    const techStackKeywords = ['Vue.js', 'Go', 'Python', 'FastAPI', 'MySQL', 'Docker']
    for (const tech of techStackKeywords) {
      expect(readmeContent, `README should mention ${tech} in technology stack`).toContain(tech)
    }
  })

  test('README contains deployment guide and development environment setup', () => {
    const readmePath = join(PROJECT_ROOT, 'README.md')
    const readmeContent = readFileSync(readmePath, 'utf-8')
    
    // Verify deployment instructions exist
    const deploymentKeywords = [
      'docker-compose up',
      '环境变量',
      '.env',
      'healthz'
    ]
    
    for (const keyword of deploymentKeywords) {
      expect(readmeContent, `README should contain deployment keyword: ${keyword}`).toContain(keyword)
    }
    
    // Verify development environment setup exists
    const devSetupKeywords = [
      'go run',
      'npm install',
      'pip install',
      'uvicorn'
    ]
    
    for (const keyword of devSetupKeywords) {
      expect(readmeContent, `README should contain development setup keyword: ${keyword}`).toContain(keyword)
    }
  })

  test('README contains contributing guide and license information', () => {
    const readmePath = join(PROJECT_ROOT, 'README.md')
    const readmeContent = readFileSync(readmePath, 'utf-8')
    
    // Verify contributing guide reference exists
    expect(readmeContent, 'README should reference CONTRIBUTING.md').toContain('CONTRIBUTING.md')
    expect(readmeContent, 'README should contain development workflow').toContain('开发流程')
    expect(readmeContent, 'README should contain code standards').toContain('代码规范')
    
    // Verify license information exists
    expect(readmeContent, 'README should contain license information').toContain('许可证')
    expect(readmeContent, 'README should reference LICENSE file').toContain('LICENSE')
  })

  test('README navigation links point to existing files and directories', () => {
    const readmePath = join(PROJECT_ROOT, 'README.md')
    const readmeContent = readFileSync(readmePath, 'utf-8')
    
    // Extract markdown links and verify they point to existing paths
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    const links = []
    let match
    
    while ((match = linkRegex.exec(readmeContent)) !== null) {
      const linkText = match[1]
      const linkPath = match[2]
      
      // Skip external links (http/https)
      if (linkPath.startsWith('http')) {
        continue
      }
      
      // Skip anchor links
      if (linkPath.startsWith('#')) {
        continue
      }
      
      links.push({ text: linkText, path: linkPath })
    }
    
    // Verify key navigation links exist
    const expectedLinks = [
      { text: '代码库', path: 'code/' },
      { text: '学术材料', path: 'academic/' },
      { text: '技术文档', path: 'docs/' },
      { text: '静态资源', path: 'assets/' },
      { text: '更新日志', path: 'CHANGELOG.md' }
    ]
    
    for (const expectedLink of expectedLinks) {
      const foundLink = links.find(link => 
        link.text.includes(expectedLink.text) || link.path === expectedLink.path
      )
      expect(foundLink, `README should contain navigation link to ${expectedLink.path}`).toBeDefined()
      
      // Verify the linked path exists
      const fullPath = join(PROJECT_ROOT, expectedLink.path)
      expect(existsSync(fullPath), `Navigation link target should exist: ${expectedLink.path}`).toBe(true)
    }
  })

  test('README contains categorized index and direct navigation links', () => {
    const readmePath = join(PROJECT_ROOT, 'README.md')
    const readmeContent = readFileSync(readmePath, 'utf-8')
    
    // Verify categorized documentation navigation exists
    const docCategories = [
      '架构文档',
      'API 文档', 
      '部署文档',
      '开发文档'
    ]
    
    for (const category of docCategories) {
      expect(readmeContent, `README should contain ${category} category`).toContain(category)
    }
    
    // Verify direct links to key documentation files
    const keyDocLinks = [
      'docs/architecture/system-overview.md',
      'docs/api/authentication.md',
      'docs/deployment/quick-start.md',
      'CONTRIBUTING.md'
    ]
    
    for (const docLink of keyDocLinks) {
      expect(readmeContent, `README should link to ${docLink}`).toContain(docLink)
      
      // Verify the linked file exists
      const fullPath = join(PROJECT_ROOT, docLink)
      expect(existsSync(fullPath), `Documentation link target should exist: ${docLink}`).toBe(true)
    }
  })

  test('README provides clear project structure visualization', () => {
    const readmePath = join(PROJECT_ROOT, 'README.md')
    const readmeContent = readFileSync(readmePath, 'utf-8')
    
    // Verify project structure section exists with directory tree
    expect(readmeContent, 'README should contain project structure section').toContain('项目结构')
    
    // Verify main directories are shown in structure
    const mainDirectories = ['code/', 'academic/', 'docs/', 'assets/']
    for (const dir of mainDirectories) {
      expect(readmeContent, `Project structure should show ${dir}`).toContain(dir)
    }
    
    // Verify key subdirectories are shown
    const keySubdirectories = [
      'frontend/',
      'backend/', 
      'ai_service/',
      'simulation/',
      'thesis/',
      'architecture/',
      'api/'
    ]
    
    for (const subdir of keySubdirectories) {
      expect(readmeContent, `Project structure should show ${subdir}`).toContain(subdir)
    }
  })
})
/**
 * **Feature: repository-organization, Property 3: 文档系统完整性**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * Property-based test to verify that the documentation system
 * meets the completeness requirements specified in the design document.
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { existsSync, statSync, readFileSync } from 'fs'
import { join } from 'path'

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = join(process.cwd(), '..')

describe('Documentation System Completeness', () => {
  test('Property 3: Documentation system completeness', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Verify docs/ directory exists and is properly structured
        const docsPath = join(projectRoot, 'docs')
        expect(existsSync(docsPath), 'docs/ directory should exist').toBe(true)
        expect(statSync(docsPath).isDirectory(), 'docs/ should be a directory').toBe(true)

        // Verify required documentation subdirectories exist
        const requiredDocsSubdirs = ['architecture', 'api', 'deployment', 'development']
        for (const subdir of requiredDocsSubdirs) {
          const subdirPath = join(docsPath, subdir)
          expect(existsSync(subdirPath), `docs/${subdir}/ should exist`).toBe(true)
          expect(statSync(subdirPath).isDirectory(), `docs/${subdir}/ should be a directory`).toBe(true)
        }

        // Verify each documentation directory has a README index
        const docsDirectories = ['', ...requiredDocsSubdirs]
        for (const dir of docsDirectories) {
          const readmePath = join(docsPath, dir, 'README.md')
          expect(existsSync(readmePath), `README.md should exist in docs/${dir || 'root'}/`).toBe(true)
          expect(statSync(readmePath).isFile(), `README.md should be a file in docs/${dir || 'root'}/`).toBe(true)
          
          // Verify README is not empty
          const readmeStats = statSync(readmePath)
          expect(readmeStats.size, `README.md in docs/${dir || 'root'}/ should not be empty`).toBeGreaterThan(0)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 3 Extension: Architecture documentation provides system design', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        const architecturePath = join(projectRoot, 'docs', 'architecture')
        
        // Verify architecture directory contains system design documents
        const requiredArchDocs = ['README.md', 'system-overview.md']
        for (const doc of requiredArchDocs) {
          const docPath = join(architecturePath, doc)
          expect(existsSync(docPath), `docs/architecture/${doc} should exist`).toBe(true)
          expect(statSync(docPath).isFile(), `docs/architecture/${doc} should be a file`).toBe(true)
          
          // Verify document has meaningful content
          const docStats = statSync(docPath)
          expect(docStats.size, `docs/architecture/${doc} should have meaningful content`).toBeGreaterThan(100)
        }

        // Verify architecture README contains navigation and overview
        const archReadmePath = join(architecturePath, 'README.md')
        const archReadmeContent = readFileSync(archReadmePath, 'utf-8')
        
        // Check for key architecture documentation elements
        expect(archReadmeContent.toLowerCase()).toContain('架构')
        expect(archReadmeContent.toLowerCase()).toContain('系统')
        expect(archReadmeContent.toLowerCase()).toContain('设计')

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 3 Extension: API documentation provides interface specifications', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        const apiPath = join(projectRoot, 'docs', 'api')
        
        // Verify API directory contains interface documentation
        const requiredApiDocs = ['README.md', 'authentication.md']
        for (const doc of requiredApiDocs) {
          const docPath = join(apiPath, doc)
          expect(existsSync(docPath), `docs/api/${doc} should exist`).toBe(true)
          expect(statSync(docPath).isFile(), `docs/api/${doc} should be a file`).toBe(true)
          
          // Verify document has meaningful content
          const docStats = statSync(docPath)
          expect(docStats.size, `docs/api/${doc} should have meaningful content`).toBeGreaterThan(100)
        }

        // Verify API README contains interface overview
        const apiReadmePath = join(apiPath, 'README.md')
        const apiReadmeContent = readFileSync(apiReadmePath, 'utf-8')
        
        // Check for key API documentation elements
        expect(apiReadmeContent.toLowerCase()).toContain('api')
        expect(apiReadmeContent.toLowerCase()).toContain('接口')
        expect(apiReadmeContent.toLowerCase()).toContain('文档')

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 3 Extension: Deployment documentation provides setup guides', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        const deploymentPath = join(projectRoot, 'docs', 'deployment')
        
        // Verify deployment directory contains setup documentation
        const requiredDeployDocs = ['README.md', 'quick-start.md']
        for (const doc of requiredDeployDocs) {
          const docPath = join(deploymentPath, doc)
          expect(existsSync(docPath), `docs/deployment/${doc} should exist`).toBe(true)
          expect(statSync(docPath).isFile(), `docs/deployment/${doc} should be a file`).toBe(true)
          
          // Verify document has meaningful content
          const docStats = statSync(docPath)
          expect(docStats.size, `docs/deployment/${doc} should have meaningful content`).toBeGreaterThan(100)
        }

        // Verify deployment README contains setup guidance
        const deployReadmePath = join(deploymentPath, 'README.md')
        const deployReadmeContent = readFileSync(deployReadmePath, 'utf-8')
        
        // Check for key deployment documentation elements
        expect(deployReadmeContent.toLowerCase()).toContain('部署')
        expect(deployReadmeContent.toLowerCase()).toContain('配置')
        expect(deployReadmeContent.toLowerCase()).toContain('环境')

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 3 Extension: Development documentation provides coding guidelines', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        const developmentPath = join(projectRoot, 'docs', 'development')
        
        // Verify development directory contains coding documentation
        const requiredDevDocs = ['README.md']
        for (const doc of requiredDevDocs) {
          const docPath = join(developmentPath, doc)
          expect(existsSync(docPath), `docs/development/${doc} should exist`).toBe(true)
          expect(statSync(docPath).isFile(), `docs/development/${doc} should be a file`).toBe(true)
          
          // Verify document has meaningful content
          const docStats = statSync(docPath)
          expect(docStats.size, `docs/development/${doc} should have meaningful content`).toBeGreaterThan(100)
        }

        // Verify development README contains development guidance
        const devReadmePath = join(developmentPath, 'README.md')
        const devReadmeContent = readFileSync(devReadmePath, 'utf-8')
        
        // Check for key development documentation elements
        expect(devReadmeContent.toLowerCase()).toContain('开发')
        expect(devReadmeContent.toLowerCase()).toContain('代码')
        expect(devReadmeContent.toLowerCase()).toContain('规范')

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 3 Extension: Documentation provides categorized navigation', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Verify main docs README provides categorized index
        const mainDocsReadmePath = join(projectRoot, 'docs', 'README.md')
        expect(existsSync(mainDocsReadmePath), 'docs/README.md should exist as main navigation').toBe(true)
        
        const mainDocsContent = readFileSync(mainDocsReadmePath, 'utf-8')
        
        // Check for navigation to all required documentation categories
        const requiredCategories = ['architecture', 'api', 'deployment', 'development']
        for (const category of requiredCategories) {
          expect(mainDocsContent.toLowerCase()).toContain(category)
        }

        // Check for direct navigation links
        expect(mainDocsContent).toContain('](./architecture/)')
        expect(mainDocsContent).toContain('](./api/)')
        expect(mainDocsContent).toContain('](./deployment/)')
        expect(mainDocsContent).toContain('](./development/)')

        return true
      }),
      { numRuns: 100 }
    )
  })
})
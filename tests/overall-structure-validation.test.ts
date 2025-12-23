/**
 * Overall Structure Validation Tests
 * Comprehensive tests for task 10: 验证和测试整体结构
 * 
 * This test suite validates:
 * - All property tests run successfully
 * - One-click environment setup scripts work
 * - Navigation links are valid
 * - Cross-platform compatibility
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { existsSync, statSync, readFileSync, readdirSync } from 'fs'
import { join, dirname, resolve } from 'path'
import { execSync } from 'child_process'

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = join(process.cwd(), '..')

describe('Overall Structure Validation', () => {
  test('All property tests should pass when run together', async () => {
    // This test ensures all property tests are working correctly
    try {
      const testResult = execSync('npm test', { 
        cwd: join(PROJECT_ROOT, 'tests'),
        encoding: 'utf-8',
        timeout: 30000
      })
      
      // Check that all tests passed
      expect(testResult).toContain('Test Files')
      expect(testResult).toContain('passed')
      expect(testResult).not.toContain('failed')
      
    } catch (error) {
      // If tests fail, we should still be able to analyze the output
      console.error('Test execution failed:', error)
      throw error
    }
  })

  test('One-click environment setup script should be executable and functional', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        const setupScript = join(projectRoot, 'code', 'scripts', 'setup-env.sh')
        
        // Verify script exists and is executable
        expect(existsSync(setupScript)).toBe(true)
        expect(statSync(setupScript).isFile()).toBe(true)
        
        // Check if script has execute permissions
        const stats = statSync(setupScript)
        expect(stats.mode & 0o111).toBeGreaterThan(0)
        
        // Verify script contains essential functions
        const scriptContent = readFileSync(setupScript, 'utf-8')
        const requiredFunctions = [
          'check_os',
          'check_prerequisites', 
          'setup_env_file',
          'create_directories',
          'setup_docker_networks',
          'test_environment'
        ]
        
        requiredFunctions.forEach(func => {
          expect(scriptContent).toContain(func)
        })
        
        // Verify script handles different operating systems
        expect(scriptContent).toContain('linux-gnu')
        expect(scriptContent).toContain('darwin')
        expect(scriptContent).toContain('msys')
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('All navigation links in README files should be valid', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Find all README.md files
        const readmeFiles: string[] = []
        
        function findReadmeFiles(dir: string, relativePath = '') {
          try {
            const entries = readdirSync(dir, { withFileTypes: true })
            
            for (const entry of entries) {
              const fullPath = join(dir, entry.name)
              const relativeEntryPath = join(relativePath, entry.name)
              
              if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                findReadmeFiles(fullPath, relativeEntryPath)
              } else if (entry.isFile() && entry.name === 'README.md') {
                readmeFiles.push(join(relativePath, entry.name))
              }
            }
          } catch (error) {
            // Skip directories we can't read
          }
        }
        
        findReadmeFiles(projectRoot)
        
        // Validate links in each README file
        const linkValidationResults = readmeFiles.map(readmeFile => {
          const fullPath = join(projectRoot, readmeFile)
          const content = readFileSync(fullPath, 'utf-8')
          const baseDir = dirname(fullPath)
          
          // Extract markdown links
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
          let match
          let allLinksValid = true
          
          while ((match = linkRegex.exec(content)) !== null) {
            const linkPath = match[2]
            
            // Skip external links (http/https)
            if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
              continue
            }
            
            // Skip anchor links
            if (linkPath.startsWith('#')) {
              continue
            }
            
            // Check relative links
            if (linkPath.startsWith('./') || linkPath.startsWith('../') || !linkPath.includes('://')) {
              let resolvedPath: string
              
              if (linkPath.startsWith('./')) {
                resolvedPath = resolve(baseDir, linkPath.substring(2))
              } else if (linkPath.startsWith('../')) {
                resolvedPath = resolve(baseDir, linkPath)
              } else {
                resolvedPath = resolve(baseDir, linkPath)
              }
              
              // Check if target exists (file or directory)
              if (!existsSync(resolvedPath)) {
                console.warn(`Broken link found: ${linkPath} in ${readmeFile}`)
                console.warn(`Resolved to: ${resolvedPath}`)
                allLinksValid = false
              }
            }
          }
          
          return { file: readmeFile, valid: allLinksValid }
        })
        
        // All README files should have valid links
        const invalidFiles = linkValidationResults.filter(result => !result.valid)
        if (invalidFiles.length > 0) {
          console.error('Files with invalid links:', invalidFiles.map(f => f.file))
        }
        
        expect(linkValidationResults.every(result => result.valid)).toBe(true)
        
        return true
      }),
      { numRuns: 10 }
    )
  })

  test('Cross-platform compatibility - file paths and scripts should work across platforms', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Test path handling across platforms
        const testPaths = [
          'code/frontend/src',
          'code/backend/cmd/server',
          'academic/thesis/src',
          'docs/architecture',
          'assets/images'
        ]
        
        testPaths.forEach(testPath => {
          const fullPath = join(projectRoot, testPath)
          expect(existsSync(fullPath)).toBe(true)
          expect(statSync(fullPath).isDirectory()).toBe(true)
        })
        
        // Test script files have proper line endings and permissions
        const scriptFiles = [
          'code/scripts/setup-env.sh',
          'code/scripts/dev-up.sh',
          'code/scripts/dev-down.sh',
          'code/scripts/prod-up.sh',
          'code/scripts/prod-down.sh',
          'code/scripts/backup.sh',
          'code/scripts/restore.sh'
        ]
        
        scriptFiles.forEach(scriptFile => {
          const fullPath = join(projectRoot, scriptFile)
          if (existsSync(fullPath)) {
            expect(statSync(fullPath).isFile()).toBe(true)
            
            // Check if script is executable
            const stats = statSync(fullPath)
            expect(stats.mode & 0o111).toBeGreaterThan(0)
            
            // Check script content for cross-platform compatibility
            const content = readFileSync(fullPath, 'utf-8')
            
            // Should have proper shebang
            expect(content.startsWith('#!/bin/bash')).toBe(true)
            
            // Should handle different OS types
            if (content.includes('OSTYPE')) {
              expect(content).toContain('linux-gnu')
              expect(content).toContain('darwin')
            }
          }
        })
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Configuration files should be valid and complete', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Test Docker Compose files
        const composeFiles = [
          'code/deployment/docker/docker-compose.dev.yml',
          'code/deployment/docker/docker-compose.prod.yml',
          'code/deployment/docker/monitoring/docker-compose.monitoring.yml'
        ]
        
        composeFiles.forEach(composeFile => {
          const fullPath = join(projectRoot, composeFile)
          expect(existsSync(fullPath)).toBe(true)
          expect(statSync(fullPath).isFile()).toBe(true)
          
          const content = readFileSync(fullPath, 'utf-8')
          
          // Should be valid YAML with version and services
          expect(content).toContain('version:')
          expect(content).toContain('services:')
          
          // Should contain health checks for production
          if (composeFile.includes('prod')) {
            expect(content).toContain('healthcheck')
            expect(content).toContain('restart:')
          }
        })
        
        // Test environment template
        const envExample = join(projectRoot, 'code', '.env.example')
        expect(existsSync(envExample)).toBe(true)
        
        const envContent = readFileSync(envExample, 'utf-8')
        const requiredEnvSections = [
          'MYSQL_ROOT_PASSWORD',
          'MYSQL_DATABASE', 
          'BACKEND_JWT_SECRET',
          'LLM_BASE_URL',
          'LLM_API_KEY'
        ]
        
        requiredEnvSections.forEach(section => {
          expect(envContent).toContain(section)
        })
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Directory structure completeness across all requirements', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Comprehensive directory structure check
        const requiredStructure = [
          // Code structure (Requirement 1)
          'code',
          'code/frontend',
          'code/backend', 
          'code/ai_service',
          'code/simulation',
          'code/shared',
          'code/deployment',
          'code/scripts',
          
          // Academic structure (Requirement 2)
          'academic',
          'academic/thesis',
          'academic/thesis/src',
          'academic/thesis/build',
          'academic/thesis/proposal',
          'academic/reports',
          'academic/literature',
          'academic/literature/papers',
          'academic/literature/translations',
          'academic/presentations',
          
          // Documentation structure (Requirement 3)
          'docs',
          'docs/architecture',
          'docs/api',
          'docs/deployment',
          'docs/development',
          
          // Assets structure
          'assets',
          'assets/images',
          'assets/diagrams',
          'assets/templates'
        ]
        
        requiredStructure.forEach(dir => {
          const fullPath = join(projectRoot, dir)
          expect(existsSync(fullPath)).toBe(true)
          expect(statSync(fullPath).isDirectory()).toBe(true)
        })
        
        // Check for required README files
        const requiredReadmes = [
          'README.md',
          'code/README.md',
          'academic/README.md',
          'docs/README.md',
          'assets/README.md'
        ]
        
        requiredReadmes.forEach(readme => {
          const fullPath = join(projectRoot, readme)
          expect(existsSync(fullPath)).toBe(true)
          expect(statSync(fullPath).isFile()).toBe(true)
          
          // README should not be empty
          const stats = statSync(fullPath)
          expect(stats.size).toBeGreaterThan(0)
        })
        
        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Quality assurance files should be present and valid', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Check for quality assurance files (Requirement 5)
        const qaFiles = [
          '.gitignore',
          'CHANGELOG.md',
          'CONTRIBUTING.md',
          'TECHNICAL_DEBT.md',
          'code/.eslintrc.js',
          'code/.prettierrc',
          'code/.golangci.yml',
          'code/pyproject.toml',
          'code/Makefile'
        ]
        
        qaFiles.forEach(qaFile => {
          const fullPath = join(projectRoot, qaFile)
          expect(existsSync(fullPath)).toBe(true)
          expect(statSync(fullPath).isFile()).toBe(true)
          
          // Files should not be empty
          const stats = statSync(fullPath)
          expect(stats.size).toBeGreaterThan(0)
        })
        
        // Verify CHANGELOG structure
        const changelogPath = join(projectRoot, 'CHANGELOG.md')
        const changelogContent = readFileSync(changelogPath, 'utf-8')
        expect(changelogContent).toContain('未发布')
        expect(changelogContent).toContain('新增')
        expect(changelogContent).toContain('变更')
        expect(changelogContent).toContain('修复')
        
        // Verify TECHNICAL_DEBT structure
        const techDebtPath = join(projectRoot, 'TECHNICAL_DEBT.md')
        const techDebtContent = readFileSync(techDebtPath, 'utf-8')
        expect(techDebtContent).toContain('高优先级债务')
        expect(techDebtContent).toContain('中优先级债务')
        expect(techDebtContent).toContain('低优先级债务')
        
        return true
      }),
      { numRuns: 100 }
    )
  })
})
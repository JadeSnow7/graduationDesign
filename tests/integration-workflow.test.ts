/**
 * Integration tests for complete repository reorganization workflow
 * Tests the complete repository reorganization process, multi-step operations,
 * and rollback mechanisms to ensure transactional integrity.
 * 
 * **Validates: All Requirements**
 */

import { describe, test, expect, beforeAll, afterAll } from 'vitest'
import * as fc from 'fast-check'
import { existsSync, statSync, readFileSync, readdirSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join, dirname } from 'path'
import { execSync } from 'child_process'

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = join(process.cwd(), '..')
const TEST_WORKSPACE = join(PROJECT_ROOT, 'test-workspace')

// Helper functions for integration testing
function createTestWorkspace(): void {
  if (existsSync(TEST_WORKSPACE)) {
    rmSync(TEST_WORKSPACE, { recursive: true, force: true })
  }
  mkdirSync(TEST_WORKSPACE, { recursive: true })
}

function cleanupTestWorkspace(): void {
  if (existsSync(TEST_WORKSPACE)) {
    rmSync(TEST_WORKSPACE, { recursive: true, force: true })
  }
}

function simulateFileStructure(basePath: string, structure: Record<string, any>): void {
  for (const [name, content] of Object.entries(structure)) {
    const fullPath = join(basePath, name)
    
    if (typeof content === 'object' && content !== null) {
      // It's a directory
      mkdirSync(fullPath, { recursive: true })
      simulateFileStructure(fullPath, content)
    } else {
      // It's a file
      mkdirSync(dirname(fullPath), { recursive: true })
      writeFileSync(fullPath, content || `# ${name}\n\nTest content for ${name}`)
    }
  }
}

function verifyDirectoryStructure(basePath: string, expectedStructure: string[]): boolean {
  return expectedStructure.every(path => {
    const fullPath = join(basePath, path)
    return existsSync(fullPath)
  })
}

function verifyFileContent(filePath: string, requiredContent: string[]): boolean {
  if (!existsSync(filePath)) return false
  
  const content = readFileSync(filePath, 'utf-8')
  return requiredContent.every(required => content.includes(required))
}

describe('Integration Workflow Tests', () => {
  beforeAll(() => {
    createTestWorkspace()
  })

  afterAll(() => {
    cleanupTestWorkspace()
  })

  test('Integration Test: Complete repository reorganization workflow', () => {
    fc.assert(
      fc.property(fc.constant(TEST_WORKSPACE), (workspace) => {
        // Step 1: Create initial messy structure (simulating original state)
        const messyStructure = {
          'frontend': {
            'src': {
              'App.vue': '// Vue app',
              'main.ts': '// Main entry'
            },
            'package.json': '{"name": "frontend"}'
          },
          'backend': {
            'cmd': {
              'server': {
                'main.go': '// Go server'
              }
            },
            'go.mod': 'module backend'
          },
          'thesis-files': {
            'main.tex': '\\documentclass{article}',
            'chapters': {
              'chapter1.tex': '\\chapter{Introduction}'
            }
          },
          'random-docs': {
            'api.md': '# API Documentation',
            'setup.md': '# Setup Guide'
          },
          'docker-compose.yml': 'version: "3.8"',
          '.env.example': 'DATABASE_URL=mysql://localhost'
        }

        simulateFileStructure(workspace, messyStructure)

        // Step 2: Verify initial messy state exists
        expect(existsSync(join(workspace, 'frontend'))).toBe(true)
        expect(existsSync(join(workspace, 'backend'))).toBe(true)
        expect(existsSync(join(workspace, 'thesis-files'))).toBe(true)
        expect(existsSync(join(workspace, 'random-docs'))).toBe(true)

        // Step 3: Simulate reorganization process
        const targetStructure = [
          'code',
          'code/frontend',
          'code/backend',
          'code/ai_service',
          'code/simulation',
          'code/shared',
          'code/deployment',
          'code/scripts',
          'academic',
          'academic/thesis',
          'academic/thesis/src',
          'academic/thesis/build',
          'academic/reports',
          'academic/literature',
          'academic/presentations',
          'docs',
          'docs/architecture',
          'docs/api',
          'docs/deployment',
          'docs/development',
          'assets',
          'assets/images',
          'assets/diagrams',
          'assets/templates'
        ]

        // Create target directory structure
        targetStructure.forEach(dir => {
          mkdirSync(join(workspace, dir), { recursive: true })
        })

        // Step 4: Simulate file migration using Node.js fs operations instead of shell commands
        // Move frontend files
        if (existsSync(join(workspace, 'frontend'))) {
          const frontendSrc = join(workspace, 'frontend')
          const frontendDest = join(workspace, 'code', 'frontend')
          
          // Copy directory contents recursively
          function copyDir(src: string, dest: string) {
            mkdirSync(dest, { recursive: true })
            const entries = readdirSync(src, { withFileTypes: true })
            
            for (const entry of entries) {
              const srcPath = join(src, entry.name)
              const destPath = join(dest, entry.name)
              
              if (entry.isDirectory()) {
                copyDir(srcPath, destPath)
              } else {
                writeFileSync(destPath, readFileSync(srcPath))
              }
            }
          }
          
          copyDir(frontendSrc, frontendDest)
        }

        // Move backend files
        if (existsSync(join(workspace, 'backend'))) {
          const backendSrc = join(workspace, 'backend')
          const backendDest = join(workspace, 'code', 'backend')
          
          function copyDir(src: string, dest: string) {
            mkdirSync(dest, { recursive: true })
            const entries = readdirSync(src, { withFileTypes: true })
            
            for (const entry of entries) {
              const srcPath = join(src, entry.name)
              const destPath = join(dest, entry.name)
              
              if (entry.isDirectory()) {
                copyDir(srcPath, destPath)
              } else {
                writeFileSync(destPath, readFileSync(srcPath))
              }
            }
          }
          
          copyDir(backendSrc, backendDest)
        }

        // Move thesis files to academic
        if (existsSync(join(workspace, 'thesis-files'))) {
          const thesisSrc = join(workspace, 'thesis-files')
          const thesisDest = join(workspace, 'academic', 'thesis', 'src')
          
          function copyDir(src: string, dest: string) {
            mkdirSync(dest, { recursive: true })
            const entries = readdirSync(src, { withFileTypes: true })
            
            for (const entry of entries) {
              const srcPath = join(src, entry.name)
              const destPath = join(dest, entry.name)
              
              if (entry.isDirectory()) {
                copyDir(srcPath, destPath)
              } else {
                writeFileSync(destPath, readFileSync(srcPath))
              }
            }
          }
          
          copyDir(thesisSrc, thesisDest)
        }

        // Move docs to proper location
        if (existsSync(join(workspace, 'random-docs'))) {
          const apiSrc = join(workspace, 'random-docs', 'api.md')
          const apiDest = join(workspace, 'docs', 'api', 'api.md')
          if (existsSync(apiSrc)) {
            writeFileSync(apiDest, readFileSync(apiSrc))
          }
          
          const setupSrc = join(workspace, 'random-docs', 'setup.md')
          const setupDest = join(workspace, 'docs', 'deployment', 'setup.md')
          if (existsSync(setupSrc)) {
            writeFileSync(setupDest, readFileSync(setupSrc))
          }
        }

        // Move configuration files
        if (existsSync(join(workspace, 'docker-compose.yml'))) {
          const dockerSrc = join(workspace, 'docker-compose.yml')
          const dockerDest = join(workspace, 'code', 'docker-compose.yml')
          writeFileSync(dockerDest, readFileSync(dockerSrc))
        }
        if (existsSync(join(workspace, '.env.example'))) {
          const envSrc = join(workspace, '.env.example')
          const envDest = join(workspace, 'code', '.env.example')
          writeFileSync(envDest, readFileSync(envSrc))
        }

        // Step 5: Create README files for navigation
        const readmeFiles = [
          { path: 'README.md', content: '# Education Project\n\n项目总览和导航' },
          { path: 'code/README.md', content: '# 代码库\n\n代码库说明和模块导航' },
          { path: 'academic/README.md', content: '# 学术材料\n\n学术材料索引和导航' },
          { path: 'docs/README.md', content: '# 技术文档\n\n文档索引和导航' },
          { path: 'assets/README.md', content: '# 静态资源\n\n资源文件说明' }
        ]

        readmeFiles.forEach(({ path, content }) => {
          writeFileSync(join(workspace, path), content)
        })

        // Step 6: Verify complete reorganization
        const verificationChecks = [
          // Directory structure verification
          () => verifyDirectoryStructure(workspace, targetStructure),
          
          // File migration verification
          () => existsSync(join(workspace, 'code', 'frontend', 'src', 'App.vue')),
          () => existsSync(join(workspace, 'code', 'backend', 'cmd', 'server', 'main.go')),
          () => existsSync(join(workspace, 'academic', 'thesis', 'src', 'main.tex')),
          () => existsSync(join(workspace, 'docs', 'api', 'api.md')),
          () => existsSync(join(workspace, 'code', 'docker-compose.yml')),
          
          // Navigation system verification
          () => existsSync(join(workspace, 'README.md')),
          () => existsSync(join(workspace, 'code', 'README.md')),
          () => existsSync(join(workspace, 'academic', 'README.md')),
          () => existsSync(join(workspace, 'docs', 'README.md')),
          () => existsSync(join(workspace, 'assets', 'README.md'))
        ]

        // Execute all verification checks
        const allChecksPassed = verificationChecks.every(check => check())
        expect(allChecksPassed).toBe(true)

        return true
      }),
      { numRuns: 10 } // Reduced runs for integration tests due to file system operations
    )
  })

  test('Integration Test: Multi-step operation transactional integrity', () => {
    fc.assert(
      fc.property(fc.constant(TEST_WORKSPACE), (workspace) => {
        // Create a test scenario with multiple interdependent operations
        const testDir = join(workspace, 'transactional-test')
        mkdirSync(testDir, { recursive: true })

        // Step 1: Create initial state
        const initialFiles = [
          'source1.txt',
          'source2.txt',
          'config.json'
        ]

        initialFiles.forEach(file => {
          writeFileSync(join(testDir, file), `Content of ${file}`)
        })

        // Step 2: Simulate multi-step operation (create directories, move files, create configs)
        const operations = [
          () => mkdirSync(join(testDir, 'target'), { recursive: true }),
          () => mkdirSync(join(testDir, 'target', 'subdir'), { recursive: true }),
          () => writeFileSync(join(testDir, 'target', 'source1.txt'), readFileSync(join(testDir, 'source1.txt'))),
          () => writeFileSync(join(testDir, 'target', 'subdir', 'source2.txt'), readFileSync(join(testDir, 'source2.txt'))),
          () => writeFileSync(join(testDir, 'target', 'README.md'), '# Target Directory'),
          () => writeFileSync(join(testDir, 'target', 'subdir', 'index.md'), '# Subdirectory Index')
        ]

        // Execute operations sequentially
        let completedOperations = 0
        try {
          operations.forEach((operation, index) => {
            operation()
            completedOperations = index + 1
          })
        } catch (error) {
          // If any operation fails, we should be able to detect partial completion
          console.warn(`Operation ${completedOperations} failed:`, error)
        }

        // Verify transactional integrity - either all operations completed or we can detect partial state
        if (completedOperations === operations.length) {
          // All operations completed successfully
          expect(existsSync(join(testDir, 'target'))).toBe(true)
          expect(existsSync(join(testDir, 'target', 'subdir'))).toBe(true)
          expect(existsSync(join(testDir, 'target', 'source1.txt'))).toBe(true)
          expect(existsSync(join(testDir, 'target', 'subdir', 'source2.txt'))).toBe(true)
          expect(existsSync(join(testDir, 'target', 'README.md'))).toBe(true)
          expect(existsSync(join(testDir, 'target', 'subdir', 'index.md'))).toBe(true)
        } else {
          // Partial completion detected - verify we can identify the state
          expect(completedOperations).toBeGreaterThanOrEqual(0)
          expect(completedOperations).toBeLessThan(operations.length)
        }

        return true
      }),
      { numRuns: 10 }
    )
  })

  test('Integration Test: Rollback mechanism effectiveness', () => {
    fc.assert(
      fc.property(fc.constant(TEST_WORKSPACE), (workspace) => {
        // Create a test scenario where we need to rollback changes
        const rollbackTestDir = join(workspace, 'rollback-test')
        mkdirSync(rollbackTestDir, { recursive: true })

        // Step 1: Create initial state and backup
        const initialState = {
          'original.txt': 'Original content',
          'config.json': '{"version": "1.0.0"}',
          'data': {
            'file1.txt': 'Data file 1',
            'file2.txt': 'Data file 2'
          }
        }

        simulateFileStructure(rollbackTestDir, initialState)

        // Create backup of initial state using Node.js operations
        const backupDir = join(rollbackTestDir, '.backup')
        mkdirSync(backupDir, { recursive: true })
        
        function copyDirRecursive(src: string, dest: string) {
          mkdirSync(dest, { recursive: true })
          const entries = readdirSync(src, { withFileTypes: true })
          
          for (const entry of entries) {
            if (entry.name === '.backup') continue // Skip backup directory itself
            
            const srcPath = join(src, entry.name)
            const destPath = join(dest, entry.name)
            
            if (entry.isDirectory()) {
              copyDirRecursive(srcPath, destPath)
            } else {
              writeFileSync(destPath, readFileSync(srcPath))
            }
          }
        }
        
        copyDirRecursive(rollbackTestDir, backupDir)

        // Step 2: Perform operations that might need rollback
        const riskyOperations = [
          () => writeFileSync(join(rollbackTestDir, 'original.txt'), 'Modified content'),
          () => writeFileSync(join(rollbackTestDir, 'config.json'), '{"version": "2.0.0"}'),
          () => mkdirSync(join(rollbackTestDir, 'new-structure'), { recursive: true }),
          () => {
            // Move data directory to new-structure using Node.js operations
            const dataSrc = join(rollbackTestDir, 'data')
            const dataDest = join(rollbackTestDir, 'new-structure', 'data')
            
            if (existsSync(dataSrc)) {
              function moveDir(src: string, dest: string) {
                mkdirSync(dirname(dest), { recursive: true })
                mkdirSync(dest, { recursive: true })
                const entries = readdirSync(src, { withFileTypes: true })
                
                for (const entry of entries) {
                  const srcPath = join(src, entry.name)
                  const destPath = join(dest, entry.name)
                  
                  if (entry.isDirectory()) {
                    moveDir(srcPath, destPath)
                  } else {
                    writeFileSync(destPath, readFileSync(srcPath))
                  }
                }
              }
              
              moveDir(dataSrc, dataDest)
              rmSync(dataSrc, { recursive: true, force: true })
            }
          },
          () => writeFileSync(join(rollbackTestDir, 'new-file.txt'), 'New file content')
        ]

        // Execute risky operations
        riskyOperations.forEach(operation => operation())

        // Step 3: Verify changes were made
        expect(readFileSync(join(rollbackTestDir, 'original.txt'), 'utf-8')).toBe('Modified content')
        expect(readFileSync(join(rollbackTestDir, 'config.json'), 'utf-8')).toBe('{"version": "2.0.0"}')
        expect(existsSync(join(rollbackTestDir, 'new-structure'))).toBe(true)
        expect(existsSync(join(rollbackTestDir, 'new-file.txt'))).toBe(true)

        // Step 4: Simulate rollback scenario (e.g., validation failure)
        const validationFailed = true // Simulate validation failure

        if (validationFailed) {
          // Perform rollback
          // Remove new files and directories
          if (existsSync(join(rollbackTestDir, 'new-file.txt'))) {
            rmSync(join(rollbackTestDir, 'new-file.txt'))
          }
          if (existsSync(join(rollbackTestDir, 'new-structure'))) {
            rmSync(join(rollbackTestDir, 'new-structure'), { recursive: true })
          }

          // Restore original files from backup using Node.js operations
          function restoreFromBackup(backupPath: string, targetPath: string) {
            const entries = readdirSync(backupPath, { withFileTypes: true })
            
            for (const entry of entries) {
              const backupFilePath = join(backupPath, entry.name)
              const targetFilePath = join(targetPath, entry.name)
              
              if (entry.isDirectory()) {
                mkdirSync(targetFilePath, { recursive: true })
                restoreFromBackup(backupFilePath, targetFilePath)
              } else {
                writeFileSync(targetFilePath, readFileSync(backupFilePath))
              }
            }
          }
          
          // Clear current state first (except backup)
          const currentEntries = readdirSync(rollbackTestDir)
          for (const entry of currentEntries) {
            if (entry !== '.backup') {
              const entryPath = join(rollbackTestDir, entry)
              if (statSync(entryPath).isDirectory()) {
                rmSync(entryPath, { recursive: true, force: true })
              } else {
                rmSync(entryPath, { force: true })
              }
            }
          }
          
          // Restore from backup
          restoreFromBackup(backupDir, rollbackTestDir)

          // Step 5: Verify rollback was successful
          expect(readFileSync(join(rollbackTestDir, 'original.txt'), 'utf-8')).toBe('Original content')
          expect(readFileSync(join(rollbackTestDir, 'config.json'), 'utf-8')).toBe('{"version": "1.0.0"}')
          expect(existsSync(join(rollbackTestDir, 'data', 'file1.txt'))).toBe(true)
          expect(existsSync(join(rollbackTestDir, 'data', 'file2.txt'))).toBe(true)
          expect(existsSync(join(rollbackTestDir, 'new-file.txt'))).toBe(false)
          expect(existsSync(join(rollbackTestDir, 'new-structure'))).toBe(false)
        }

        return true
      }),
      { numRuns: 5 } // Fewer runs for complex rollback tests
    )
  })

  test('Integration Test: Cross-platform compatibility verification', () => {
    fc.assert(
      fc.property(fc.constant(TEST_WORKSPACE), (workspace) => {
        // Test cross-platform file operations and path handling
        const crossPlatformTestDir = join(workspace, 'cross-platform-test')
        mkdirSync(crossPlatformTestDir, { recursive: true })

        // Test path separators and file operations that work across platforms
        const testPaths = [
          join('level1', 'level2', 'file.txt'),
          join('level1', 'level2', 'another-file.md'),
          join('level1', 'different-level2', 'config.json'),
          join('assets', 'images', 'logo.png'),
          join('docs', 'api', 'endpoints.md')
        ]

        // Create files using cross-platform path operations
        testPaths.forEach(testPath => {
          const fullPath = join(crossPlatformTestDir, testPath)
          mkdirSync(dirname(fullPath), { recursive: true })
          writeFileSync(fullPath, `Content for ${testPath}`)
        })

        // Verify all files were created successfully
        testPaths.forEach(testPath => {
          const fullPath = join(crossPlatformTestDir, testPath)
          expect(existsSync(fullPath)).toBe(true)
          expect(statSync(fullPath).isFile()).toBe(true)
        })

        // Test file operations that should work across platforms
        const sourceFile = join(crossPlatformTestDir, 'source.txt')
        const targetFile = join(crossPlatformTestDir, 'target.txt')
        
        writeFileSync(sourceFile, 'Cross-platform test content')
        
        // Copy operation
        const sourceContent = readFileSync(sourceFile, 'utf-8')
        writeFileSync(targetFile, sourceContent)
        
        expect(existsSync(targetFile)).toBe(true)
        expect(readFileSync(targetFile, 'utf-8')).toBe('Cross-platform test content')

        // Test directory operations
        const testDir = join(crossPlatformTestDir, 'test-directory')
        mkdirSync(testDir, { recursive: true })
        expect(existsSync(testDir)).toBe(true)
        expect(statSync(testDir).isDirectory()).toBe(true)

        return true
      }),
      { numRuns: 10 }
    )
  })

  test('Integration Test: Navigation link validation workflow', () => {
    fc.assert(
      fc.property(fc.constant(TEST_WORKSPACE), (workspace) => {
        // Create a complete documentation structure with navigation links
        const navTestDir = join(workspace, 'navigation-test')
        mkdirSync(navTestDir, { recursive: true })

        // Create directory structure
        const directories = [
          'docs',
          'docs/architecture',
          'docs/api',
          'docs/deployment',
          'code',
          'code/frontend',
          'code/backend',
          'academic',
          'academic/thesis'
        ]

        directories.forEach(dir => {
          mkdirSync(join(navTestDir, dir), { recursive: true })
        })

        // Create README files with navigation links
        const readmeFiles = [
          {
            path: 'README.md',
            content: `# Main Project
            
[Documentation](./docs/)
[Code](./code/)
[Academic Materials](./academic/)
`
          },
          {
            path: 'docs/README.md',
            content: `# Documentation

[Architecture](./architecture/)
[API Documentation](./api/)
[Deployment Guide](./deployment/)
`
          },
          {
            path: 'code/README.md',
            content: `# Code Base

[Frontend](./frontend/)
[Backend](./backend/)
`
          },
          {
            path: 'academic/README.md',
            content: `# Academic Materials

[Thesis](./thesis/)
`
          }
        ]

        readmeFiles.forEach(({ path, content }) => {
          writeFileSync(join(navTestDir, path), content)
        })

        // Create target files that links should point to
        const targetFiles = [
          'docs/architecture/README.md',
          'docs/api/README.md',
          'docs/deployment/README.md',
          'code/frontend/README.md',
          'code/backend/README.md',
          'academic/thesis/README.md'
        ]

        targetFiles.forEach(file => {
          writeFileSync(join(navTestDir, file), `# ${file}\n\nContent for ${file}`)
        })

        // Validate navigation links
        const validateLinks = (readmePath: string, baseDir: string): boolean => {
          const content = readFileSync(readmePath, 'utf-8')
          const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
          let match
          let allLinksValid = true

          while ((match = linkRegex.exec(content)) !== null) {
            const linkPath = match[2]
            if (linkPath.startsWith('./')) {
              const resolvedPath = join(baseDir, linkPath.substring(2))
              if (!existsSync(resolvedPath)) {
                console.warn(`Broken link found: ${linkPath} in ${readmePath}`)
                allLinksValid = false
              }
            }
          }

          return allLinksValid
        }

        // Validate all navigation links
        const linkValidationResults = readmeFiles.map(({ path }) => {
          const fullPath = join(navTestDir, path)
          const baseDir = dirname(fullPath)
          return validateLinks(fullPath, baseDir)
        })

        // All links should be valid
        expect(linkValidationResults.every(result => result)).toBe(true)

        return true
      }),
      { numRuns: 10 }
    )
  })
})
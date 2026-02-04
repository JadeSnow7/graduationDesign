/**
 * **Feature: repository-organization, Property 1: 代码目录结构完整性**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.5**
 * 
 * Property-based test to verify that the repository directory structure
 * meets the completeness requirements specified in the design document.
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { existsSync, statSync } from 'fs'
import { join } from 'path'

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = join(process.cwd(), '..')

describe('Directory Structure Completeness', () => {
  test('Property 1: Code directory structure completeness', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Verify main top-level directories exist
        const mainDirectories = ['code', 'academic', 'docs', 'assets']
        for (const dir of mainDirectories) {
          const dirPath = join(projectRoot, dir)
          expect(existsSync(dirPath), `Directory ${dir}/ should exist`).toBe(true)
          expect(statSync(dirPath).isDirectory(), `${dir}/ should be a directory`).toBe(true)
        }

        // Verify code subdirectories exist
        const codeSubdirectories = [
          'frontend-react', 'backend', 'ai_service', 'simulation', 
          'shared', 'deployment', 'scripts'
        ]
        for (const subdir of codeSubdirectories) {
          const subdirPath = join(projectRoot, 'code', subdir)
          expect(existsSync(subdirPath), `Directory code/${subdir}/ should exist`).toBe(true)
          expect(statSync(subdirPath).isDirectory(), `code/${subdir}/ should be a directory`).toBe(true)
        }

        // Verify academic subdirectories exist
        const academicSubdirectories = ['thesis', 'reports', 'literature', 'presentations']
        for (const subdir of academicSubdirectories) {
          const subdirPath = join(projectRoot, 'academic', subdir)
          expect(existsSync(subdirPath), `Directory academic/${subdir}/ should exist`).toBe(true)
          expect(statSync(subdirPath).isDirectory(), `academic/${subdir}/ should be a directory`).toBe(true)
        }

        // Verify docs subdirectories exist
        const docsSubdirectories = ['architecture', 'api', 'deployment', 'development']
        for (const subdir of docsSubdirectories) {
          const subdirPath = join(projectRoot, 'docs', subdir)
          expect(existsSync(subdirPath), `Directory docs/${subdir}/ should exist`).toBe(true)
          expect(statSync(subdirPath).isDirectory(), `docs/${subdir}/ should be a directory`).toBe(true)
        }

        // Verify assets subdirectories exist
        const assetsSubdirectories = ['images', 'diagrams', 'templates']
        for (const subdir of assetsSubdirectories) {
          const subdirPath = join(projectRoot, 'assets', subdir)
          expect(existsSync(subdirPath), `Directory assets/${subdir}/ should exist`).toBe(true)
          expect(statSync(subdirPath).isDirectory(), `assets/${subdir}/ should be a directory`).toBe(true)
        }

        // Verify README.md files exist in main directories
        const readmeDirectories = ['', 'code', 'academic', 'docs', 'assets']
        for (const dir of readmeDirectories) {
          const readmePath = join(projectRoot, dir, 'README.md')
          expect(existsSync(readmePath), `README.md should exist in ${dir || 'root'} directory`).toBe(true)
          expect(statSync(readmePath).isFile(), `README.md should be a file in ${dir || 'root'} directory`).toBe(true)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 1 Extension: Directory structure provides unified entry points', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Verify that code/ provides unified entry points for shared/, deployment/, scripts/
        const unifiedEntryPoints = ['shared', 'deployment', 'scripts']
        for (const entryPoint of unifiedEntryPoints) {
          const entryPath = join(projectRoot, 'code', entryPoint)
          expect(existsSync(entryPath), `Unified entry point code/${entryPoint}/ should exist`).toBe(true)
          expect(statSync(entryPath).isDirectory(), `code/${entryPoint}/ should be a directory`).toBe(true)
        }

        // Verify that each main directory has a README.md as navigation index
        const mainDirsWithReadme = ['code', 'academic', 'docs', 'assets']
        for (const dir of mainDirsWithReadme) {
          const readmePath = join(projectRoot, dir, 'README.md')
          expect(existsSync(readmePath), `Navigation index README.md should exist in ${dir}/`).toBe(true)
          
          // Verify README.md is not empty (basic content check)
          const readmeStats = statSync(readmePath)
          expect(readmeStats.size, `README.md in ${dir}/ should not be empty`).toBeGreaterThan(0)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })
})

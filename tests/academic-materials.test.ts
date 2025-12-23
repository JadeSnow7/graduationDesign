/**
 * **Feature: repository-organization, Property 2: 学术材料组织完整性**
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 * 
 * Property-based test to verify that academic materials are properly organized
 * with thesis, reports, literature, and presentation materials in separate
 * subdirectories, and LaTeX source code separated from build artifacts.
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { existsSync, statSync, readdirSync } from 'fs'
import { join } from 'path'

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = join(process.cwd(), '..')

describe('Academic Materials Organization Completeness', () => {
  test('Property 2: Academic materials organization completeness', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        const academicPath = join(projectRoot, 'academic')
        
        // Verify academic directory exists
        expect(existsSync(academicPath), 'academic/ directory should exist').toBe(true)
        expect(statSync(academicPath).isDirectory(), 'academic/ should be a directory').toBe(true)

        // Verify required academic subdirectories exist
        const requiredSubdirs = ['thesis', 'reports', 'literature', 'presentations']
        for (const subdir of requiredSubdirs) {
          const subdirPath = join(academicPath, subdir)
          expect(existsSync(subdirPath), `academic/${subdir}/ should exist`).toBe(true)
          expect(statSync(subdirPath).isDirectory(), `academic/${subdir}/ should be a directory`).toBe(true)
        }

        // Verify thesis subdirectory structure
        const thesisPath = join(academicPath, 'thesis')
        const thesisSubdirs = ['proposal', 'src', 'build']
        for (const subdir of thesisSubdirs) {
          const subdirPath = join(thesisPath, subdir)
          expect(existsSync(subdirPath), `academic/thesis/${subdir}/ should exist`).toBe(true)
          expect(statSync(subdirPath).isDirectory(), `academic/thesis/${subdir}/ should be a directory`).toBe(true)
        }

        // Verify literature subdirectory structure
        const literaturePath = join(academicPath, 'literature')
        const literatureSubdirs = ['papers', 'translations']
        for (const subdir of literatureSubdirs) {
          const subdirPath = join(literaturePath, subdir)
          expect(existsSync(subdirPath), `academic/literature/${subdir}/ should exist`).toBe(true)
          expect(statSync(subdirPath).isDirectory(), `academic/literature/${subdir}/ should be a directory`).toBe(true)
        }

        // Verify LaTeX source and build separation
        const thesisSrcPath = join(thesisPath, 'src')
        const thesisBuildPath = join(thesisPath, 'build')
        
        // Check that src/ and build/ are separate directories
        expect(existsSync(thesisSrcPath), 'academic/thesis/src/ should exist for LaTeX source').toBe(true)
        expect(existsSync(thesisBuildPath), 'academic/thesis/build/ should exist for build artifacts').toBe(true)
        expect(statSync(thesisSrcPath).isDirectory(), 'academic/thesis/src/ should be a directory').toBe(true)
        expect(statSync(thesisBuildPath).isDirectory(), 'academic/thesis/build/ should be a directory').toBe(true)

        // Verify each academic subdirectory has a README.md
        for (const subdir of requiredSubdirs) {
          const readmePath = join(academicPath, subdir, 'README.md')
          expect(existsSync(readmePath), `README.md should exist in academic/${subdir}/`).toBe(true)
          expect(statSync(readmePath).isFile(), `README.md should be a file in academic/${subdir}/`).toBe(true)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 2 Extension: Academic materials are properly categorized', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        const academicPath = join(projectRoot, 'academic')

        // Verify proposal materials are in thesis/proposal/
        const proposalPath = join(academicPath, 'thesis', 'proposal')
        expect(existsSync(proposalPath), 'academic/thesis/proposal/ should exist').toBe(true)

        // Verify reports are in reports/ directory
        const reportsPath = join(academicPath, 'reports')
        expect(existsSync(reportsPath), 'academic/reports/ should exist').toBe(true)

        // Verify literature is properly organized
        const literaturePath = join(academicPath, 'literature')
        const papersPath = join(literaturePath, 'papers')
        const translationsPath = join(literaturePath, 'translations')
        
        expect(existsSync(papersPath), 'academic/literature/papers/ should exist for original papers').toBe(true)
        expect(existsSync(translationsPath), 'academic/literature/translations/ should exist for translation documents').toBe(true)

        // Verify presentations directory exists
        const presentationsPath = join(academicPath, 'presentations')
        expect(existsSync(presentationsPath), 'academic/presentations/ should exist').toBe(true)

        // Verify main academic README exists and is not empty
        const academicReadmePath = join(academicPath, 'README.md')
        expect(existsSync(academicReadmePath), 'academic/README.md should exist').toBe(true)
        const readmeStats = statSync(academicReadmePath)
        expect(readmeStats.size, 'academic/README.md should not be empty').toBeGreaterThan(0)

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 2 Extension: LaTeX source and build artifacts are properly separated', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        const thesisPath = join(projectRoot, 'academic', 'thesis')
        const srcPath = join(thesisPath, 'src')
        const buildPath = join(thesisPath, 'build')

        // Both directories should exist
        expect(existsSync(srcPath), 'academic/thesis/src/ should exist').toBe(true)
        expect(existsSync(buildPath), 'academic/thesis/build/ should exist').toBe(true)

        // Verify they are separate directories
        expect(srcPath !== buildPath, 'src/ and build/ should be separate directories').toBe(true)

        // If files exist, verify typical LaTeX source files are in src/
        if (existsSync(srcPath) && readdirSync(srcPath).length > 0) {
          const srcFiles = readdirSync(srcPath)
          const hasLatexSource = srcFiles.some(file => 
            file.endsWith('.tex') || file.endsWith('.bib') || file === 'chapters'
          )
          // If there are files in src/, at least some should be LaTeX-related
          if (srcFiles.length > 0) {
            expect(hasLatexSource, 'src/ should contain LaTeX source files (.tex, .bib, or chapters/)').toBe(true)
          }
        }

        // If files exist in build/, verify they are build artifacts
        if (existsSync(buildPath) && readdirSync(buildPath).length > 0) {
          const buildFiles = readdirSync(buildPath)
          const hasBuildArtifacts = buildFiles.some(file => 
            file.endsWith('.pdf') || file.endsWith('.aux') || file.endsWith('.log')
          )
          // If there are files in build/, at least some should be build artifacts
          if (buildFiles.length > 0) {
            expect(hasBuildArtifacts, 'build/ should contain build artifacts (.pdf, .aux, .log, etc.)').toBe(true)
          }
        }

        return true
      }),
      { numRuns: 100 }
    )
  })
})
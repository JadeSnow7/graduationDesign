/**
 * Unit tests to verify code file migration correctness
 * Tests file migration operations and directory structure creation accuracy
 * Requirements: 1.2, 1.3
 */

import { describe, test, expect } from 'vitest'
import { existsSync, statSync, readdirSync } from 'fs'
import { join } from 'path'

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = join(process.cwd(), '..')

describe('Code File Migration Verification', () => {
  test('Frontend code migration - essential files exist', () => {
    const frontendPath = join(PROJECT_ROOT, 'code', 'frontend-react')
    
    // Verify directory exists
    expect(existsSync(frontendPath)).toBe(true)
    expect(statSync(frontendPath).isDirectory()).toBe(true)
    
    // Verify essential frontend files exist
    const essentialFiles = [
      'package.json',
      'index.html',
      'vite.config.ts',
      'tsconfig.json',
      'README.md'
    ]
    
    for (const file of essentialFiles) {
      const filePath = join(frontendPath, file)
      expect(existsSync(filePath), `Frontend file ${file} should exist`).toBe(true)
      expect(statSync(filePath).isFile(), `${file} should be a file`).toBe(true)
    }
    
    // Verify src directory exists
    const srcPath = join(frontendPath, 'src')
    expect(existsSync(srcPath)).toBe(true)
    expect(statSync(srcPath).isDirectory()).toBe(true)
  })

  test('Backend code migration - essential files exist', () => {
    const backendPath = join(PROJECT_ROOT, 'code', 'backend')
    
    // Verify directory exists
    expect(existsSync(backendPath)).toBe(true)
    expect(statSync(backendPath).isDirectory()).toBe(true)
    
    // Verify essential backend files exist
    const essentialFiles = [
      'go.mod',
      'go.sum',
      'Dockerfile',
      'README.md'
    ]
    
    for (const file of essentialFiles) {
      const filePath = join(backendPath, file)
      expect(existsSync(filePath), `Backend file ${file} should exist`).toBe(true)
      expect(statSync(filePath).isFile(), `${file} should be a file`).toBe(true)
    }
    
    // Verify essential directories exist
    const essentialDirs = ['cmd', 'internal']
    for (const dir of essentialDirs) {
      const dirPath = join(backendPath, dir)
      expect(existsSync(dirPath), `Backend directory ${dir} should exist`).toBe(true)
      expect(statSync(dirPath).isDirectory(), `${dir} should be a directory`).toBe(true)
    }
  })

  test('AI service code migration - essential files exist', () => {
    const aiServicePath = join(PROJECT_ROOT, 'code', 'ai_service')
    
    // Verify directory exists
    expect(existsSync(aiServicePath)).toBe(true)
    expect(statSync(aiServicePath).isDirectory()).toBe(true)
    
    // Verify essential AI service files exist
    const essentialFiles = [
      'requirements.txt',
      'Dockerfile',
      'README.md'
    ]
    
    for (const file of essentialFiles) {
      const filePath = join(aiServicePath, file)
      expect(existsSync(filePath), `AI service file ${file} should exist`).toBe(true)
      expect(statSync(filePath).isFile(), `${file} should be a file`).toBe(true)
    }
    
    // Verify app directory exists
    const appPath = join(aiServicePath, 'app')
    expect(existsSync(appPath)).toBe(true)
    expect(statSync(appPath).isDirectory()).toBe(true)
  })

  test('Simulation service code migration - essential files exist', () => {
    const simulationPath = join(PROJECT_ROOT, 'code', 'simulation')
    
    // Verify directory exists
    expect(existsSync(simulationPath)).toBe(true)
    expect(statSync(simulationPath).isDirectory()).toBe(true)
    
    // Verify essential simulation service files exist
    const essentialFiles = [
      'requirements.txt',
      'Dockerfile',
      'README.md'
    ]
    
    for (const file of essentialFiles) {
      const filePath = join(simulationPath, file)
      expect(existsSync(filePath), `Simulation service file ${file} should exist`).toBe(true)
      expect(statSync(filePath).isFile(), `${file} should be a file`).toBe(true)
    }
    
    // Verify app directory exists
    const appPath = join(simulationPath, 'app')
    expect(existsSync(appPath)).toBe(true)
    expect(statSync(appPath).isDirectory()).toBe(true)
  })

  test('Deployment configuration migration - essential files exist', () => {
    const deploymentPath = join(PROJECT_ROOT, 'code', 'deployment')
    
    // Verify directory exists
    expect(existsSync(deploymentPath)).toBe(true)
    expect(statSync(deploymentPath).isDirectory()).toBe(true)
    
    // Verify essential deployment files exist
    const essentialFiles = [
      'docker-compose.yml',
      'README.md'
    ]
    
    for (const file of essentialFiles) {
      const filePath = join(deploymentPath, file)
      expect(existsSync(filePath), `Deployment file ${file} should exist`).toBe(true)
      expect(statSync(filePath).isFile(), `${file} should be a file`).toBe(true)
    }
  })

  test('Scripts migration - essential files exist', () => {
    const scriptsPath = join(PROJECT_ROOT, 'code', 'scripts')
    
    // Verify directory exists
    expect(existsSync(scriptsPath)).toBe(true)
    expect(statSync(scriptsPath).isDirectory()).toBe(true)
    
    // Verify essential script files exist
    const essentialFiles = [
      'compose-up.sh',
      'compose-down.sh',
      'README.md'
    ]
    
    for (const file of essentialFiles) {
      const filePath = join(scriptsPath, file)
      expect(existsSync(filePath), `Script file ${file} should exist`).toBe(true)
      expect(statSync(filePath).isFile(), `${file} should be a file`).toBe(true)
    }
  })

  test('Code root configuration files - docker-compose.yml and .env.example exist', () => {
    const codePath = join(PROJECT_ROOT, 'code')
    
    // Verify docker-compose.yml exists in code root
    const dockerComposePath = join(codePath, 'docker-compose.yml')
    expect(existsSync(dockerComposePath)).toBe(true)
    expect(statSync(dockerComposePath).isFile()).toBe(true)
    
    // Verify .env.example exists in code root
    const envExamplePath = join(codePath, '.env.example')
    expect(existsSync(envExamplePath)).toBe(true)
    expect(statSync(envExamplePath).isFile()).toBe(true)
  })

  test('Shared configuration migration - gitignore exists', () => {
    const sharedPath = join(PROJECT_ROOT, 'code', 'shared')
    
    // Verify directory exists
    expect(existsSync(sharedPath)).toBe(true)
    expect(statSync(sharedPath).isDirectory()).toBe(true)
    
    // Verify gitignore file exists in shared
    const gitignorePath = join(sharedPath, '.gitignore')
    expect(existsSync(gitignorePath)).toBe(true)
    expect(statSync(gitignorePath).isFile()).toBe(true)
  })

  test('Directory structure creation accuracy - all required subdirectories exist', () => {
    const codeSubdirectories = [
      'frontend-react', 'backend', 'ai_service', 'simulation', 
      'shared', 'deployment', 'scripts'
    ]
    
    for (const subdir of codeSubdirectories) {
      const subdirPath = join(PROJECT_ROOT, 'code', subdir)
      expect(existsSync(subdirPath), `Code subdirectory ${subdir} should exist`).toBe(true)
      expect(statSync(subdirPath).isDirectory(), `${subdir} should be a directory`).toBe(true)
      
      // Verify each subdirectory has a README.md
      const readmePath = join(subdirPath, 'README.md')
      expect(existsSync(readmePath), `README.md should exist in code/${subdir}/`).toBe(true)
      expect(statSync(readmePath).isFile(), `README.md should be a file in code/${subdir}/`).toBe(true)
    }
  })

  test('Migration completeness - no empty critical directories', () => {
    const criticalDirectories = [
      join(PROJECT_ROOT, 'code', 'frontend-react'),
      join(PROJECT_ROOT, 'code', 'backend'),
      join(PROJECT_ROOT, 'code', 'ai_service'),
      join(PROJECT_ROOT, 'code', 'simulation')
    ]
    
    for (const dir of criticalDirectories) {
      expect(existsSync(dir)).toBe(true)
      const contents = readdirSync(dir)
      // Filter out hidden files starting with ._
      const visibleContents = contents.filter(item => !item.startsWith('._'))
      expect(visibleContents.length, `Directory ${dir} should not be empty`).toBeGreaterThan(0)
    }
  })
})

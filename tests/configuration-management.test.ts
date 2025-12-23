/**
 * **Feature: repository-organization, Property 4: 配置管理完整性**
 * **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**
 * 
 * Property-based test to verify that the repository configuration management
 * meets the completeness requirements specified in the design document.
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'
import { existsSync, statSync, readFileSync } from 'fs'
import { join } from 'path'

// Get the project root directory (parent of tests directory)
const PROJECT_ROOT = join(process.cwd(), '..')

describe('Configuration Management Completeness', () => {
  test('Property 4: Configuration management completeness', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Requirement 4.1: Environment configuration scripts in Scripts/
        const envScripts = [
          'setup-env.sh',
          'dev-up.sh', 
          'dev-down.sh',
          'prod-up.sh',
          'prod-down.sh'
        ]
        
        for (const script of envScripts) {
          const scriptPath = join(projectRoot, 'code', 'scripts', script)
          expect(existsSync(scriptPath), `Environment script ${script} should exist in code/scripts/`).toBe(true)
          expect(statSync(scriptPath).isFile(), `${script} should be a file`).toBe(true)
          
          // Verify script is executable (has execute permission)
          const stats = statSync(scriptPath)
          expect(stats.mode & 0o111, `${script} should be executable`).toBeGreaterThan(0)
        }

        // Requirement 4.2: Docker configurations
        const dockerConfigs = [
          'docker-compose.yml', // Main compose file
          'docker/docker-compose.dev.yml',
          'docker/docker-compose.prod.yml',
          'docker/nginx/nginx.conf',
          'docker/nginx/conf.d/default.conf'
        ]
        
        for (const config of dockerConfigs) {
          const configPath = join(projectRoot, 'code', 'deployment', config)
          expect(existsSync(configPath), `Docker config ${config} should exist in code/deployment/`).toBe(true)
          expect(statSync(configPath).isFile(), `${config} should be a file`).toBe(true)
        }

        // Requirement 4.3: Environment variable template and configuration management
        const envTemplate = join(projectRoot, 'code', '.env.example')
        expect(existsSync(envTemplate), 'Environment template .env.example should exist in code/').toBe(true)
        expect(statSync(envTemplate).isFile(), '.env.example should be a file').toBe(true)
        
        // Verify .env.example contains essential configuration sections
        const envContent = readFileSync(envTemplate, 'utf-8')
        const requiredSections = ['MYSQL', 'BACKEND', 'LLM', 'GRAPH_RAG']
        for (const section of requiredSections) {
          expect(envContent.includes(section), `.env.example should contain ${section} configuration section`).toBe(true)
        }

        // Requirement 4.4: Health check and monitoring configuration
        const monitoringConfigs = [
          'monitoring/docker-compose.monitoring.yml',
          'monitoring/prometheus/prometheus.yml'
        ]
        
        for (const config of monitoringConfigs) {
          const configPath = join(projectRoot, 'code', 'deployment', 'docker', config)
          expect(existsSync(configPath), `Monitoring config ${config} should exist`).toBe(true)
          expect(statSync(configPath).isFile(), `${config} should be a file`).toBe(true)
        }

        // Verify monitoring scripts exist
        const monitoringScripts = ['monitoring-up.sh', 'monitoring-down.sh']
        for (const script of monitoringScripts) {
          const scriptPath = join(projectRoot, 'code', 'scripts', script)
          expect(existsSync(scriptPath), `Monitoring script ${script} should exist`).toBe(true)
          expect(statSync(scriptPath).isFile(), `${script} should be a file`).toBe(true)
        }

        // Requirement 4.5: Backup and restore scripts
        const backupScripts = ['backup.sh', 'restore.sh']
        for (const script of backupScripts) {
          const scriptPath = join(projectRoot, 'code', 'scripts', script)
          expect(existsSync(scriptPath), `Backup script ${script} should exist in code/scripts/`).toBe(true)
          expect(statSync(scriptPath).isFile(), `${script} should be a file`).toBe(true)
          
          // Verify script is executable
          const stats = statSync(scriptPath)
          expect(stats.mode & 0o111, `${script} should be executable`).toBeGreaterThan(0)
        }

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 4 Extension: Clear entry points in code/scripts/ and code/deployment/', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Verify code/scripts/ provides clear entry points
        const scriptsDir = join(projectRoot, 'code', 'scripts')
        expect(existsSync(scriptsDir), 'code/scripts/ directory should exist').toBe(true)
        expect(statSync(scriptsDir).isDirectory(), 'code/scripts/ should be a directory').toBe(true)
        
        // Verify scripts directory has README for documentation
        const scriptsReadme = join(scriptsDir, 'README.md')
        expect(existsSync(scriptsReadme), 'code/scripts/README.md should exist').toBe(true)
        expect(statSync(scriptsReadme).isFile(), 'code/scripts/README.md should be a file').toBe(true)

        // Verify code/deployment/ provides clear entry points
        const deploymentDir = join(projectRoot, 'code', 'deployment')
        expect(existsSync(deploymentDir), 'code/deployment/ directory should exist').toBe(true)
        expect(statSync(deploymentDir).isDirectory(), 'code/deployment/ should be a directory').toBe(true)
        
        // Verify deployment directory has README for documentation
        const deploymentReadme = join(deploymentDir, 'README.md')
        expect(existsSync(deploymentReadme), 'code/deployment/README.md should exist').toBe(true)
        expect(statSync(deploymentReadme).isFile(), 'code/deployment/README.md should be a file').toBe(true)

        // Verify Docker subdirectory structure provides clear organization
        const dockerDir = join(deploymentDir, 'docker')
        expect(existsSync(dockerDir), 'code/deployment/docker/ directory should exist').toBe(true)
        expect(statSync(dockerDir).isDirectory(), 'code/deployment/docker/ should be a directory').toBe(true)
        
        const dockerReadme = join(dockerDir, 'README.md')
        expect(existsSync(dockerReadme), 'code/deployment/docker/README.md should exist').toBe(true)
        expect(statSync(dockerReadme).isFile(), 'code/deployment/docker/README.md should be a file').toBe(true)

        return true
      }),
      { numRuns: 100 }
    )
  })

  test('Property 4 Extension: Configuration files contain required sections', () => {
    fc.assert(
      fc.property(fc.constant(PROJECT_ROOT), (projectRoot) => {
        // Verify Docker Compose files contain required services
        const devComposeFile = join(projectRoot, 'code', 'deployment', 'docker', 'docker-compose.dev.yml')
        if (existsSync(devComposeFile)) {
          const devContent = readFileSync(devComposeFile, 'utf-8')
          const requiredServices = ['mysql', 'backend', 'ai', 'sim', 'frontend']
          for (const service of requiredServices) {
            expect(devContent.includes(service + ':'), `Dev compose should contain ${service} service`).toBe(true)
          }
          
          // Verify health checks are configured
          expect(devContent.includes('healthcheck'), 'Dev compose should contain health check configurations').toBe(true)
        }

        const prodComposeFile = join(projectRoot, 'code', 'deployment', 'docker', 'docker-compose.prod.yml')
        if (existsSync(prodComposeFile)) {
          const prodContent = readFileSync(prodComposeFile, 'utf-8')
          const requiredServices = ['mysql', 'backend', 'ai', 'sim', 'frontend', 'nginx']
          for (const service of requiredServices) {
            expect(prodContent.includes(service + ':'), `Prod compose should contain ${service} service`).toBe(true)
          }
          
          // Verify production-specific configurations
          expect(prodContent.includes('restart: always'), 'Prod compose should have restart policies').toBe(true)
          expect(prodContent.includes('networks:'), 'Prod compose should define networks').toBe(true)
        }

        // Verify Prometheus configuration contains required job configs
        const prometheusConfig = join(projectRoot, 'code', 'deployment', 'docker', 'monitoring', 'prometheus', 'prometheus.yml')
        if (existsSync(prometheusConfig)) {
          const prometheusContent = readFileSync(prometheusConfig, 'utf-8')
          const requiredJobs = ['backend', 'ai-service', 'simulation-service', 'mysql']
          for (const job of requiredJobs) {
            expect(prometheusContent.includes(job), `Prometheus config should monitor ${job}`).toBe(true)
          }
        }

        return true
      }),
      { numRuns: 100 }
    )
  })
})
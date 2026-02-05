# CI/CD Setup Guide

## SonarCloud Setup

### 1. Create SonarCloud Account

1. Go to [SonarCloud](https://sonarcloud.io/)
2. Sign in with GitHub
3. Import your repository

### 2. Add GitHub Secret

In your GitHub repository settings:

1. Go to Settings → Secrets and variables → Actions
2. Add new repository secret:
   - Name: `SONAR_TOKEN`
   - Value: (Get from SonarCloud → My Account → Security → Generate Token)

### 3. Configure Project

The `sonar-project.properties` file is already configured with:
- Organization: `jadesnow7`
- Project Key: `JadeSnow7_graduationDesign`

Update these values if needed.

## Release Workflow

### Creating a Release

```bash
# Tag a new version
git tag v1.0.0
git push origin v1.0.0
```

This will automatically:
1. Generate CHANGELOG from git commits
2. Create GitHub Release
3. Attach release notes

## E2E Testing

### Local Setup

```bash
cd code/frontend-react
npx playwright install chromium
npm run test:e2e
```

### CI Integration

E2E tests run automatically on:
- Push to main/develop
- Pull requests

## Code Quality Checks

Runs on every PR:
- SonarCloud analysis
- Dependency review
- Coverage reports

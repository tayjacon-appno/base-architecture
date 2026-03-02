import { defineConfig } from '@playwright/test';
import { createProjects } from './config/projects';
import { visualThresholds } from './config/thresholds';

/**
 * Central Playwright configuration for local and CI execution.
 */
export default defineConfig({
  testDir: './tests/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: visualThresholds.maxDiffPixelRatio,
      maxDiffPixels: visualThresholds.maxDiffPixels,
      animations: 'disabled',
      scale: 'css'
    }
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/html-report', open: 'never' }],
    ['json', { outputFile: 'artifacts/test-results/results.json' }],
    ['./reporters/performance-metrics.reporter.ts']
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1366, height: 768 }
  },
  projects: createProjects(),
  outputDir: 'artifacts/test-output',
  snapshotPathTemplate:
    '{testDir}/../snapshots/{projectName}/{testFilePath}/{arg}{ext}'
});

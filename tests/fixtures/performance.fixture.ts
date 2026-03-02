import { test as base } from '@playwright/test';
import { assertPerformanceThresholds } from '../utils/performance-assertions';
import { collectPerformanceMetrics, type PerformanceMetrics } from '../utils/performance';

/**
 * Fixture contract for performance-aware tests.
 */
type PerformanceFixtures = {
  capturePerformanceMetrics: () => Promise<PerformanceMetrics>;
  assertPerformance: (metrics: PerformanceMetrics) => void;
};

/**
 * Extended test object that provides reusable performance helpers.
 */
export const test = base.extend<PerformanceFixtures>({
  capturePerformanceMetrics: async ({ page }, use, testInfo) => {
    await use(async () => {
      const metrics = await collectPerformanceMetrics(page);

      await testInfo.attach('performance-metrics', {
        body: Buffer.from(JSON.stringify(metrics, null, 2), 'utf-8'),
        contentType: 'application/json'
      });

      return metrics;
    });
  },
  assertPerformance: async ({}, use) => {
    await use((metrics) => {
      assertPerformanceThresholds(metrics);
    });
  }
});

export const expect = test.expect;

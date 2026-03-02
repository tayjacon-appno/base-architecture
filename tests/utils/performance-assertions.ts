import { expect } from '@playwright/test';
import { performanceThresholds } from '../../config/thresholds';
import type { PerformanceMetrics } from './performance';

/**
 * Asserts collected performance metrics against configurable thresholds.
 */
export function assertPerformanceThresholds(metrics: PerformanceMetrics): void {
  expect(metrics.domContentLoadedMs).toBeLessThanOrEqual(performanceThresholds.maxDomContentLoadedMs);
  expect(metrics.loadEventMs).toBeLessThanOrEqual(performanceThresholds.maxLoadEventMs);

  if (metrics.firstContentfulPaintMs !== null) {
    expect(metrics.firstContentfulPaintMs).toBeLessThanOrEqual(performanceThresholds.maxFirstContentfulPaintMs);
  }
}

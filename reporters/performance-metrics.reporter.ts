import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { parseProjectName } from '../config/project-name';
import type { PerformanceMetrics } from '../tests/utils/performance';

/**
 * Enriched record that links browser performance metrics to test metadata.
 */
type PerformanceRecord = {
  testId: string;
  title: string;
  project: string;
  site: string;
  device: string;
  status: TestResult['status'];
  metrics: PerformanceMetrics;
};

/**
 * Reporter that collects JSON attachments named `performance-metrics` and
 * exports them to a single machine-readable file for CI dashboards.
 */
class PerformanceMetricsReporter implements Reporter {
  private readonly records: PerformanceRecord[] = [];
  private readonly outputDir = resolve('artifacts/performance');
  private readonly runId = new Date().toISOString().replace(/[:.]/g, '-');

  onTestEnd(test: TestCase, result: TestResult): void {
    for (const attachment of result.attachments) {
      if (attachment.name !== 'performance-metrics') {
        continue;
      }

      if (!attachment.body) {
        continue;
      }

      const metrics = JSON.parse(attachment.body.toString('utf-8')) as PerformanceMetrics;
      const projectName = test.parent.project()?.name ?? 'unknown::unknown';
      const parsedProject = parseProjectName(projectName);
      this.records.push({
        testId: test.id,
        title: test.titlePath().join(' > '),
        project: projectName,
        site: parsedProject.siteKey,
        device: parsedProject.deviceKey,
        status: result.status,
        metrics
      });
    }
  }

  onEnd(): void {
    const payload = {
      runId: this.runId,
      generatedAt: new Date().toISOString(),
      totalRecords: this.records.length,
      records: this.records
    };

    const latestFile = join(this.outputDir, 'performance-metrics.json');
    const runFile = join(this.outputDir, 'runs', `performance-metrics-${this.runId}.json`);

    mkdirSync(dirname(latestFile), { recursive: true });
    mkdirSync(dirname(runFile), { recursive: true });
    writeFileSync(latestFile, JSON.stringify(payload, null, 2));
    writeFileSync(runFile, JSON.stringify(payload, null, 2));
  }
}

export default PerformanceMetricsReporter;

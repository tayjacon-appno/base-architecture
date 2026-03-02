import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

type PerformanceMetrics = {
  domContentLoadedMs: number;
  loadEventMs: number;
  firstContentfulPaintMs: number | null;
  largestContentfulPaintMs: number | null;
  cumulativeLayoutShift: number;
  longTaskCount: number;
};

type PerformanceRecord = {
  site: string;
  device: string;
  metrics: PerformanceMetrics;
};

type PerformanceRun = {
  runId: string;
  generatedAt: string;
  totalRecords: number;
  records: PerformanceRecord[];
};

type MetricKey = keyof PerformanceMetrics;

type Summary = {
  domContentLoadedMs: number;
  loadEventMs: number;
  firstContentfulPaintMs: number;
  largestContentfulPaintMs: number;
  cumulativeLayoutShift: number;
  longTaskCount: number;
};

const RUNS_DIR = resolve('artifacts/performance/runs');
const DEFAULT_METRICS: MetricKey[] = [
  'domContentLoadedMs',
  'loadEventMs',
  'firstContentfulPaintMs',
  'largestContentfulPaintMs',
  'cumulativeLayoutShift',
  'longTaskCount'
];

/** Reads a performance run JSON file from disk. */
function readRun(path: string): PerformanceRun {
  const raw = readFileSync(resolve(path), 'utf-8');
  return JSON.parse(raw) as PerformanceRun;
}

/** Computes arithmetic mean of a numeric list. */
function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

/** Builds aggregate metrics for a run. */
function summarize(run: PerformanceRun): Summary {
  const metrics = run.records.map((record) => record.metrics);

  return {
    domContentLoadedMs: average(metrics.map((item) => item.domContentLoadedMs)),
    loadEventMs: average(metrics.map((item) => item.loadEventMs)),
    firstContentfulPaintMs: average(metrics.map((item) => item.firstContentfulPaintMs ?? 0)),
    largestContentfulPaintMs: average(metrics.map((item) => item.largestContentfulPaintMs ?? 0)),
    cumulativeLayoutShift: average(metrics.map((item) => item.cumulativeLayoutShift)),
    longTaskCount: average(metrics.map((item) => item.longTaskCount))
  };
}

/** Formats raw and percent delta values for terminal output. */
function formatDelta(base: number, current: number): string {
  const delta = current - base;
  const direction = delta > 0 ? 'worse' : delta < 0 ? 'better' : 'flat';
  const percent = base !== 0 ? (delta / base) * 100 : 0;
  return `${delta.toFixed(2)} (${percent.toFixed(2)}%) ${direction}`;
}

/** Prints a side-by-side comparison of key performance metrics. */
function printComparison(baseRun: PerformanceRun, currentRun: PerformanceRun): void {
  const baseSummary = summarize(baseRun);
  const currentSummary = summarize(currentRun);

  console.log(`Base run: ${baseRun.runId} (${baseRun.generatedAt})`);
  console.log(`Current run: ${currentRun.runId} (${currentRun.generatedAt})`);
  console.log('');

  for (const key of DEFAULT_METRICS) {
    const baseValue = baseSummary[key as keyof Summary];
    const currentValue = currentSummary[key as keyof Summary];

    console.log(`${key}:`);
    console.log(`  base=${baseValue.toFixed(2)}`);
    console.log(`  current=${currentValue.toFixed(2)}`);
    console.log(`  delta=${formatDelta(baseValue, currentValue)}`);
  }
}

/** Reads a CLI flag in the format `--flag=value`. */
function parseArgValue(flag: string): string | undefined {
  const pair = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  return pair?.slice(flag.length + 1);
}

/** Returns the two newest run files when explicit paths are not provided. */
function latestTwoRunPaths(): [string, string] {
  const files = readdirSync(RUNS_DIR)
    .filter((file) => file.endsWith('.json'))
    .sort();

  if (files.length < 2) {
    throw new Error('At least two performance run files are required in artifacts/performance/runs.');
  }

  return [join(RUNS_DIR, files.at(-2)!), join(RUNS_DIR, files.at(-1)!)];
}

/** Entrypoint for performance comparison execution. */
function main(): void {
  const basePath = parseArgValue('--base');
  const currentPath = parseArgValue('--current');

  const [resolvedBase, resolvedCurrent] =
    basePath && currentPath ? [basePath, currentPath] : latestTwoRunPaths();

  const baseRun = readRun(resolvedBase);
  const currentRun = readRun(resolvedCurrent);

  printComparison(baseRun, currentRun);
}

main();

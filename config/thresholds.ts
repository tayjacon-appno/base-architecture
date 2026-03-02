/**
 * Visual comparison thresholds configurable through environment variables.
 */
export type VisualThresholds = {
  maxDiffPixelRatio: number;
  maxDiffPixels: number;
};

/**
 * Performance assertion thresholds configurable through environment variables.
 */
export type PerformanceThresholds = {
  maxDomContentLoadedMs: number;
  maxLoadEventMs: number;
  maxFirstContentfulPaintMs: number;
};

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Default visual thresholds used by snapshot assertions.
 */
export const visualThresholds: VisualThresholds = {
  maxDiffPixelRatio: readNumberEnv('VISUAL_MAX_DIFF_PIXEL_RATIO', 0.02),
  maxDiffPixels: readNumberEnv('VISUAL_MAX_DIFF_PIXELS', 150)
};

/**
 * Default performance thresholds used by metric assertions.
 */
export const performanceThresholds: PerformanceThresholds = {
  maxDomContentLoadedMs: readNumberEnv('PERF_MAX_DCL_MS', 3000),
  maxLoadEventMs: readNumberEnv('PERF_MAX_LOAD_MS', 6000),
  maxFirstContentfulPaintMs: readNumberEnv('PERF_MAX_FCP_MS', 2500)
};

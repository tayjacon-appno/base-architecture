import { Page } from '@playwright/test';

/**
 * Structured performance metrics captured from the browser runtime.
 */
export type PerformanceMetrics = {
  url: string;
  timestamp: string;
  navigationType: string;
  redirectCount: number;
  domContentLoadedMs: number;
  loadEventMs: number;
  responseStartMs: number;
  domInteractiveMs: number;
  firstPaintMs: number | null;
  firstContentfulPaintMs: number | null;
  largestContentfulPaintMs: number | null;
  cumulativeLayoutShift: number;
  longTaskCount: number;
  resourceCount: number;
  transferSizeBytes: number;
  jsHeapUsedSizeBytes: number | null;
};

/**
 * Reads runtime and paint timing information from the current page.
 */
export async function collectPerformanceMetrics(page: Page): Promise<PerformanceMetrics> {
  return page.evaluate(() => {
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paintEntries = performance.getEntriesByType('paint') as PerformanceEntry[];
    const resourceEntries = performance.getEntriesByType('resource');

    let largestContentfulPaintMs: number | null = null;
    let cumulativeLayoutShift = 0;
    let longTaskCount = 0;

    if (typeof PerformanceObserver !== 'undefined') {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries.at(-1);
          if (lastEntry) {
            largestContentfulPaintMs = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        lcpObserver.disconnect();
      } catch {
        largestContentfulPaintMs = null;
      }

      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as Array<PerformanceEntry & { value?: number; hadRecentInput?: boolean }>) {
            if (!entry.hadRecentInput) {
              cumulativeLayoutShift += entry.value ?? 0;
            }
          }
        });
        layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
        layoutShiftObserver.disconnect();
      } catch {
        cumulativeLayoutShift = 0;
      }

      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          longTaskCount += list.getEntries().length;
        });
        longTaskObserver.observe({ type: 'longtask', buffered: true });
        longTaskObserver.disconnect();
      } catch {
        longTaskCount = 0;
      }
    }

    const firstPaint = paintEntries.find((entry) => entry.name === 'first-paint');
    const firstContentfulPaint = paintEntries.find((entry) => entry.name === 'first-contentful-paint');

    const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;

    return {
      url: location.href,
      timestamp: new Date().toISOString(),
      navigationType: navEntry?.type ?? 'unknown',
      redirectCount: navEntry?.redirectCount ?? 0,
      domContentLoadedMs: navEntry?.domContentLoadedEventEnd ?? 0,
      loadEventMs: navEntry?.loadEventEnd ?? 0,
      responseStartMs: navEntry?.responseStart ?? 0,
      domInteractiveMs: navEntry?.domInteractive ?? 0,
      firstPaintMs: firstPaint?.startTime ?? null,
      firstContentfulPaintMs: firstContentfulPaint?.startTime ?? null,
      largestContentfulPaintMs,
      cumulativeLayoutShift,
      longTaskCount,
      resourceCount: resourceEntries.length,
      transferSizeBytes: navEntry?.transferSize ?? 0,
      jsHeapUsedSizeBytes: memory?.usedJSHeapSize ?? null
    };
  });
}

# Playwright Production Template (TypeScript)

Scalable Playwright starter with explicit separation between visual regression and performance validation.

## Features

- Dedicated visual and performance test layers
- Reusable fixtures and utilities for stable assertions
- Configurable visual and performance thresholds via environment variables
- Masking support for dynamic elements in visual snapshots
- Multi-site + multi-device project generation
- Consolidated JSON export for performance metrics (latest + per-run history)
- Performance capture using Navigation Timing API and PerformanceObserver
- Run-to-run performance comparison script
- Baseline management script for visual baselines
- CI-ready GitHub Actions workflow

## Project Structure

```text
.
├── config/
│   ├── project-name.ts
│   ├── projects.ts
│   ├── sites.ts
│   └── thresholds.ts
├── reporters/
│   └── performance-metrics.reporter.ts
├── scripts/
│   ├── baseline.ts
│   └── compare-performance.ts
├── tests/
│   ├── fixtures/
│   │   ├── performance.fixture.ts
│   │   └── visual.fixture.ts
│   ├── pages/
│   │   └── home.page.ts
│   ├── specs/
│   │   ├── performance/
│   │   │   └── home.performance.spec.ts
│   │   └── visual/
│   │       └── home.visual.spec.ts
│   ├── snapshots/
│   └── utils/
│       ├── performance.ts
│       ├── performance-assertions.ts
│       └── visual/
│           └── masking.ts
├── artifacts/
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

## Setup

```bash
npm ci
npx playwright install --with-deps
```

## Commands

```bash
npm test                     # Full suite
npm run test:visual          # Visual tests only
npm run test:perf            # Performance tests only
npm run test:visual:update   # Update visual baselines quickly
npm run baseline:update      # Update visual baselines via script
npm run baseline:list        # List baseline files
npm run baseline:clean       # Remove baseline snapshots
npm run report:perf          # Export timestamped performance JSON copy
npm run compare:perf         # Compare latest two performance runs
npm run typecheck            # TypeScript validation
```

## Configurable Thresholds

Use environment variables:

- `VISUAL_MAX_DIFF_PIXEL_RATIO` (default: `0.02`)
- `VISUAL_MAX_DIFF_PIXELS` (default: `150`)
- `PERF_MAX_DCL_MS` (default: `3000`)
- `PERF_MAX_LOAD_MS` (default: `6000`)
- `PERF_MAX_FCP_MS` (default: `2500`)

## Multi-Site Configuration

Define `SITE_MATRIX` to run the same suite against multiple sites:

```bash
SITE_MATRIX="playwright=https://playwright.dev,example=https://example.com" npm test
```

Each site runs across all configured devices. Project names follow:

- `<siteKey>::chromium-desktop`
- `<siteKey>::firefox-desktop`
- `<siteKey>::webkit-mobile`

## Visual Masking for Dynamic Elements

The visual fixture automatically applies site-level dynamic selectors and supports per-test additions:

```ts
await assertVisualSnapshot('home-page.png', {
  additionalMaskSelectors: ['.clock', '.session-expiry']
});
```

## Performance JSON Output

The custom reporter writes:

- `artifacts/performance/performance-metrics.json`
- `artifacts/performance/runs/performance-metrics-<runId>.json` (new file per execution)

Each record includes test metadata plus `site` and `device` fields, enabling dashboard aggregation by environment.

Collected metrics include:

- Navigation Timing API values (`domContentLoadedMs`, `loadEventMs`, `responseStartMs`, `domInteractiveMs`, `transferSizeBytes`, `navigationType`, `redirectCount`)
- Paint and rendering metrics (`firstPaintMs`, `firstContentfulPaintMs`, `largestContentfulPaintMs`)
- Stability and workload metrics (`cumulativeLayoutShift`, `longTaskCount`, `resourceCount`)
- JS memory (`jsHeapUsedSizeBytes`, when available)

## Compare Runs

Compare latest two runs automatically:

```bash
npm run compare:perf
```

Compare specific run files:

```bash
npm run compare:perf -- --base=artifacts/performance/runs/performance-metrics-2026-03-02T10-00-00-000Z.json --current=artifacts/performance/runs/performance-metrics-2026-03-02T12-00-00-000Z.json
```

## CI Notes

The GitHub Actions workflow:

- Installs dependencies and Playwright browsers
- Runs tests with `CI=true`
- Uploads `artifacts/` and `tests/snapshots/` as build artifacts

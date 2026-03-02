import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const snapshotsDir = resolve('tests/snapshots');
const perfReportPath = resolve('artifacts/performance/performance-metrics.json');
const perfExportDir = resolve('artifacts/performance/exports');

/**
 * Lists all generated visual baseline files.
 */
function listBaselines(): void {
  if (!existsSync(snapshotsDir)) {
    console.log('No snapshots directory found.');
    return;
  }

  const stack = [snapshotsDir];
  const snapshotFiles: string[] = [];

  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.png')) {
        snapshotFiles.push(fullPath.replace(`${process.cwd()}/`, ''));
      }
    }
  }

  console.log(`Found ${snapshotFiles.length} baseline file(s):`);
  for (const file of snapshotFiles.sort()) {
    console.log(`- ${file}`);
  }
}

/**
 * Removes current baseline snapshots.
 */
function cleanBaselines(): void {
  if (!existsSync(snapshotsDir)) {
    console.log('No snapshots directory found. Nothing to clean.');
    return;
  }

  rmSync(snapshotsDir, { recursive: true, force: true });
  console.log('Baseline snapshots removed.');
}

/**
 * Runs Playwright in snapshot-update mode for visual tests only.
 */
function updateBaselines(siteKey?: string): void {
  const args = ['playwright', 'test', '--grep', '@visual', '--update-snapshots'];

  if (siteKey) {
    const devices = ['chromium-desktop', 'firefox-desktop', 'webkit-mobile'];
    for (const device of devices) {
      args.push('--project', `${siteKey}::${device}`);
    }
  }

  const result = spawnSync('npx', args, {
    stdio: 'inherit',
    env: process.env
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

/**
 * Writes a timestamped copy of the consolidated performance JSON artifact.
 */
function exportPerformanceReport(): void {
  if (!existsSync(perfReportPath)) {
    console.error('Performance report does not exist. Run tests first.');
    process.exit(1);
  }

  mkdirSync(perfExportDir, { recursive: true });

  const raw = readFileSync(perfReportPath, 'utf-8');
  const safeDate = new Date().toISOString().replace(/[:.]/g, '-');
  const target = join(perfExportDir, `performance-metrics-${safeDate}.json`);

  writeFileSync(target, raw);
  console.log(`Performance report exported to: ${target}`);
}

function readSiteFlag(args: string[]): string | undefined {
  const match = args.find((arg) => arg.startsWith('--site='));
  return match?.split('=')[1];
}

const command = process.argv[2];
const flags = process.argv.slice(3);

switch (command) {
  case 'list':
    listBaselines();
    break;
  case 'clean':
    cleanBaselines();
    break;
  case 'update':
    updateBaselines(readSiteFlag(flags));
    break;
  case 'export-perf':
    exportPerformanceReport();
    break;
  default:
    console.log('Usage: tsx scripts/baseline.ts [list|clean|update|export-perf] [--site=<siteKey>]');
    process.exit(1);
}

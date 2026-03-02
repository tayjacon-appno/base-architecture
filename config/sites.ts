import { parseProjectName } from './project-name';

/**
 * Site configuration used to generate test projects across multiple hosts.
 */
export type SiteConfig = {
  key: string;
  baseURL: string;
  dynamicMaskSelectors: string[];
};

const defaultSites: SiteConfig[] = [
  {
    key: 'playwright',
    baseURL: 'https://playwright.dev',
    dynamicMaskSelectors: ['[data-timestamp]', '[data-dynamic]', '[aria-live="polite"]']
  }
];

/**
 * Parses `SITE_MATRIX` environment variable.
 * Format: `key=https://url,key2=https://url2`
 */
function parseSiteMatrix(raw: string): SiteConfig[] {
  const entries = raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const sites: SiteConfig[] = [];

  for (const entry of entries) {
    const separatorIndex = entry.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = entry.slice(0, separatorIndex);
    const baseURL = entry.slice(separatorIndex + 1);

    if (!key || !baseURL) {
      continue;
    }

    sites.push({
      key,
      baseURL,
      dynamicMaskSelectors: ['[data-timestamp]', '[data-dynamic]', '[aria-live="polite"]']
    });
  }

  return sites;
}

/**
 * Returns the active site list for test execution.
 */
export function getSites(): SiteConfig[] {
  const matrix = process.env.SITE_MATRIX;
  if (!matrix) {
    return defaultSites;
  }

  const parsed = parseSiteMatrix(matrix);
  return parsed.length > 0 ? parsed : defaultSites;
}

/**
 * Resolves site configuration from a Playwright project name.
 */
export function getSiteByProjectName(projectName: string): SiteConfig {
  const siteKey = parseProjectName(projectName).siteKey;
  return getSites().find((site) => site.key === siteKey) ?? getSites()[0];
}

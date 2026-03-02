import { test as base } from '@playwright/test';
import { getSiteByProjectName } from '../../config/sites';
import { visualThresholds } from '../../config/thresholds';
import { buildMaskLocators } from '../utils/visual/masking';

/**
 * Options for visual assertions with masking support.
 */
type VisualSnapshotOptions = {
  fullPage?: boolean;
  additionalMaskSelectors?: string[];
};

/**
 * Fixture contract for visual-focused tests.
 */
type VisualFixtures = {
  assertVisualSnapshot: (name: string, options?: VisualSnapshotOptions) => Promise<void>;
};

/**
 * Extended test object exposing a reusable visual assertion helper.
 */
export const test = base.extend<VisualFixtures>({
  assertVisualSnapshot: async ({ page }, use, testInfo) => {
    await use(async (name, options) => {
      const site = getSiteByProjectName(testInfo.project.name);
      const selectors = [...site.dynamicMaskSelectors, ...(options?.additionalMaskSelectors ?? [])];
      const mask = await buildMaskLocators(page, selectors);

      await base.expect(page).toHaveScreenshot(name, {
        fullPage: options?.fullPage ?? true,
        mask,
        maxDiffPixelRatio: visualThresholds.maxDiffPixelRatio,
        maxDiffPixels: visualThresholds.maxDiffPixels,
        animations: 'disabled',
        scale: 'css'
      });
    });
  }
});

export const expect = test.expect;

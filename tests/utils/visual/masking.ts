import { type Locator, type Page } from '@playwright/test';

/**
 * Creates mask locators for dynamic selectors, skipping selectors that do not exist.
 */
export async function buildMaskLocators(page: Page, selectors: string[]): Promise<Locator[]> {
  const maskLocators: Locator[] = [];

  for (const selector of selectors) {
    const locator = page.locator(selector).first();
    const count = await locator.count();
    if (count > 0) {
      maskLocators.push(locator);
    }
  }

  return maskLocators;
}

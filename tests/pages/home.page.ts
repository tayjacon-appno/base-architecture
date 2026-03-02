import { type Page } from '@playwright/test';

/**
 * Example page object to demonstrate scalable page modeling.
 */
export class HomePage {
  constructor(private readonly page: Page) {}

  /** Opens the home route using `baseURL`. */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Returns the page heading text content. */
  async getHeading(): Promise<string | null> {
    return this.page.getByRole('heading', { level: 1 }).textContent();
  }
}

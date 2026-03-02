import { test } from '../../fixtures/visual.fixture';
import { HomePage } from '../../pages/home.page';

test.describe('Home visual experience', () => {
  test('should match full-page baseline @visual', async ({ page, assertVisualSnapshot }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await assertVisualSnapshot('home-page.png', {
      fullPage: true,
      additionalMaskSelectors: ['.clock', '.session-expiry']
    });
  });

  test('should match heading-area baseline @visual', async ({ page, assertVisualSnapshot }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    await assertVisualSnapshot('home-heading.png', {
      fullPage: false
    });
  });
});

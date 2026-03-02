import { test } from '../../fixtures/performance.fixture';
import { HomePage } from '../../pages/home.page';

test.describe('Home performance', () => {
  test('should stay within configured performance thresholds @perf', async ({
    page,
    capturePerformanceMetrics,
    assertPerformance
  }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    const metrics = await capturePerformanceMetrics();
    assertPerformance(metrics);
  });
});

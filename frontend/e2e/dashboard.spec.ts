import { test, expect } from '@playwright/test';

test.describe('My Fancy Task Dashboard', () => {
  test('loads tasks and displays To Do lane', async ({ page }) => {
    await page.goto('http://localhost:5173');
    await expect(page.getByText('To Do')).toBeVisible();
  });

  test('drag and drop task between lanes', async ({ page }) => {
  });

  test('shows error notification on failed POST', async ({ page }) => {
    // Simulate POST failure and check for notification
  });
});

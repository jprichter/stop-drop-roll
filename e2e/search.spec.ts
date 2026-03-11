import { test, expect } from '@playwright/test';

test('has title and can search', async ({ page }) => {
  await page.goto('/');

  // Expect title to contain the brand name
  await expect(page).toHaveTitle(/Stop, Drop and Roll/);

  // Find the search input
  const searchInput = page.getByPlaceholder(/Search city or address/i);
  await searchInput.fill('Austin');
  
  // Click search button
  await page.getByRole('button', { name: /Search/i }).first().click();

  // Expect the map to be present
  await expect(page.locator('.gm-style')).toBeVisible();
});

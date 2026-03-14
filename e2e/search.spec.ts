import { test, expect } from '@playwright/test';

test('has title and can search', async ({ page }) => {
  await page.goto('/');

  // Expect title to contain the brand name
  await expect(page).toHaveTitle(/Stop, Drop and Roll/);

  // Click the CTA to go to search page
  await page.getByRole('link', { name: /Find Open Mat Now/i }).click();

  // Expect to be on the search page
  await expect(page).toHaveURL(/\/search/);

  // Find the search input
  const searchInput = page.getByPlaceholder(/Search city or address/i);
  await searchInput.fill('Austin');
  
  // Click search button
  await page.getByRole('button', { name: /Search/i }).first().click();

  // Expect the map to be present
  // Note: Depending on loading time, we might need a longer timeout or wait for something specific
  await expect(page.locator('div[role="region"][aria-label="Map"]')).toBeVisible({ timeout: 10000 });
});

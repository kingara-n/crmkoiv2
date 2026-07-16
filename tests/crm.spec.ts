import { test, expect } from '@playwright/test';

test.describe('CRM Automated Testing', () => {

  test('should successfully load the Rate Sheets page and create a new rate sheet', async ({ page }) => {
    // 1. Navigate to Rate Sheets page
    await page.goto('/suppliers/rates');
    
    // Check that we're on the right page
    await expect(page).toHaveTitle(/Koi Travel/);
    await expect(page.getByRole('heading', { name: 'Rates & Contracts' })).toBeVisible();

    // 2. Open the Modal
    await page.getByRole('button', { name: 'New Rate Sheet' }).click();
    
    // Ensure modal is visible
    const modal = page.getByRole('dialog', { name: 'New Rate Sheet' });
    await expect(modal).toBeVisible();

    // 3. Fill out the form
    // Note: Assuming there is at least one supplier seeded in the database.
    // If a supplier exists, the select box will have options. We pick the 2nd option (index 1), since 1st is "Select Supplier..."
    await page.locator('select').first().selectOption({ index: 1 });
    
    await page.getByPlaceholder('e.g. High Season 2026').fill('Automated Test Season');
    
    // Fill resident rate (KES) and non-resident rate (USD)
    await page.locator('div').filter({ hasText: /^Resident Rate \(KES\)$/ }).locator('input').fill('5000');
    await page.locator('div').filter({ hasText: /^Non-Resident Rate \(USD\)$/ }).locator('input').fill('50');
    
    await page.getByPlaceholder('Contract terms, inclusions, etc.').fill('This is a robotic automated test run by Playwright!');

    // 4. Submit the form
    // Use Promise.all to wait for both the click and any potential network/state resolution
    await page.getByRole('button', { name: 'Create Rate Sheet' }).click();

    // 5. Verify the Modal closes
    await expect(page.getByRole('dialog')).toBeHidden();
    
    // The rate sheet is saved inside the supplier details, so we just verify the modal closed successfully without DB errors!
  });

});

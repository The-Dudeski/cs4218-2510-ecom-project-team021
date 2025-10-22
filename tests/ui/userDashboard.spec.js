import { test, expect } from '@playwright/test';

/**
 * UI tests for the User Dashboard page
 * (http://localhost:3000/dashboard/user)
 * These tests ensure that user details render correctly
 * after a valid login and navigation flow.
 */

test.describe('User Dashboard Page — Virtual Vault', () => {
  
  // Log in and navigate before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: /login/i }).click();

    // Perform login
    await page.getByRole('textbox', { name: /enter your email/i }).fill('safwanuser@gmail.com');
    await page.getByRole('textbox', { name: /enter your email/i }).press('Tab');
    await page.getByRole('textbox', { name: /enter your password/i }).fill('safwanuser');
    await page.getByRole('button', { name: /login/i }).click();

    // Wait for dashboard menu to appear
    await expect(page.getByRole('button', { name: /safwanusertest1/i })).toBeVisible({ timeout: 30000 });

    // Navigate to Dashboard
    await page.getByRole('button', { name: /safwanusertest1/i }).click();
    await page.getByRole('link', { name: /dashboard/i }).click();

    // Verify dashboard page loaded
    await expect(page).toHaveURL(/.*dashboard\/user/);
    await expect(page.getByRole('main')).toBeVisible();
  });

  // Dashboard renders correct user info
  test('should display correct user details', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /safwanusertest1/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /safwanuser@gmail.com/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'nus', exact: true })).toBeVisible();
  });

  // User menu links are visible
  test('should display user navigation menu items', async ({ page }) => {
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible();
  });

  // User menu navigation works
  test('should navigate correctly between menu links', async ({ page }) => {
    // Go to Orders
    await page.getByRole('link', { name: /orders/i }).click();
    await expect(page).toHaveURL(/.*dashboard\/user\/orders/);

    // Go to Profile
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL(/.*dashboard\/user\/profile/);

    // Return to Dashboard
    await page.locator('div').filter({ hasText: 'DashboardProfileOrderssafwanusertest1safwanuser@gmail.comnus' });
    await expect(page).toHaveURL(/.*dashboard\/user/);
  });

  // Footer and navigation links exist
  test('should show footer links correctly', async ({ page }) => {
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
    await expect(page.getByText(/all rights reserved/i)).toBeVisible();
  });

});

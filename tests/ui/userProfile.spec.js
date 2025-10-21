import { test, expect } from '@playwright/test';

/**
 * These are UI-only tests.
 * They verify that the Profile form validates input and displays
 * the right messages — without needing backend responses.
 */

test.describe('Profile Page UI Validation', () => {
  // Basic login, since it is a UI test
  test.beforeEach(async ({ page }) => {
    // Start at homepage
    await page.goto('http://localhost:3000/');

    // Go to login
    await page.getByRole('link', { name: /login/i }).click();

    // Fill login form 
    await page.getByRole('textbox', { name: /enter your email/i }).fill('safwanuser@gmail.com');
    await page.getByRole('textbox', { name: /enter your password/i }).fill('safwanuser');
    await page.getByRole('button', { name: /login/i }).click();

    // Navigate through UI
    await page.getByRole('button', { name: /safwanusertest1/i }).click();
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.getByRole('link', { name: /profile/i }).click();

    // Now wait for the heading to appear
    await expect(page.getByRole('heading', { name: /user profile/i })).toBeVisible({ timeout: 15000 });
  });


  // UI renders all expected fields
  test('should display all fields and sections', async ({ page }) => {
    await expect(page.getByPlaceholder('Enter Your Name')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Phone')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Address')).toBeVisible();
    await expect(page.getByPlaceholder(/current password/i)).toBeVisible();
    await expect(page.getByPlaceholder('Enter new password (optional)')).toBeVisible();
    await expect(page.getByPlaceholder('Confirm new password')).toBeVisible();
    await expect(page.getByRole('button', { name: /update/i })).toBeVisible();
  });

  // Mismatched new passwords show toast
  test('should show error when new passwords do not match', async ({ page }) => {
    await page.getByPlaceholder('Enter Your Name').fill('Changed Name');
    await page.getByPlaceholder(/current password/i).fill('safwanuser');
    await page.getByPlaceholder('Enter new password (optional)').fill('newpass123');
    await page.getByPlaceholder('Confirm new password').fill('differentpass');
    await page.getByRole('button', { name: /update/i }).click();
    await expect(page.getByText(/new passwords do not match/i)).toBeVisible();
  });

  // New password too short
  test('should show error when new password is too short', async ({ page }) => {
    await page.getByPlaceholder(/current password/i).fill('safwanuser');
    await page.getByPlaceholder('Enter new password (optional)').fill('123');
    await page.getByPlaceholder('Confirm new password').fill('123');
    await page.getByRole('button', { name: /update/i }).click();
    await expect(page.getByText(/new password must be at least 6 characters long/i)).toBeVisible();
  });

  // Attempt to change nothing
  test('should show toast when no changes were made', async ({ page }) => {
    await page.getByPlaceholder(/current password/i).fill('safwanuser');
    await page.getByRole('button', { name: /update/i }).click();
    await expect(page.getByText(/no changes detected/i)).toBeVisible();
  });

  // Missing confirm password
  test('should show error when confirm password is missing', async ({ page }) => {
    await page.getByPlaceholder(/current password/i).fill('safwanuser');
    await page.getByPlaceholder('Enter new password (optional)').fill('newpassword');
    await page.getByRole('button', { name: /update/i }).click();
    await expect(page.getByText(/please fill in all password fields/i)).toBeVisible();
  });

  // Ensure input fields can update (frontend state)
  test('should allow user to type into all input fields', async ({ page }) => {
    await page.getByPlaceholder('Enter Your Name').fill('Safwan Updated');
    await page.getByPlaceholder('Enter Your Phone').fill('98765432');
    await page.getByPlaceholder('Enter Your Address').fill('Singapore');
    await page.getByPlaceholder(/current password/i).fill('safwanuser');
    await page.getByPlaceholder('Enter new password (optional)').fill('newpassword123');
    await page.getByPlaceholder('Confirm new password').fill('newpassword123');

    await expect(page.getByPlaceholder('Enter Your Name')).toHaveValue('Safwan Updated');
    await expect(page.getByPlaceholder('Enter Your Phone')).toHaveValue('98765432');
    await expect(page.getByPlaceholder('Enter Your Address')).toHaveValue('Singapore');
  });

  // Footer visible (UI layout)
  test('should display footer links correctly', async ({ page }) => {
    await expect(page.getByText(/all rights reserved/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  });
});

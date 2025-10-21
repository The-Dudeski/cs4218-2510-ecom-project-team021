import { test, expect } from '@playwright/test';

test.describe('User Profile Page', () => {

  // Before each: login and navigate to profile page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: /login/i }).click();

    // Perform login
    await page.getByRole('textbox', { name: /enter your email/i }).fill('safwanuser@gmail.com');
    await page.getByRole('textbox', { name: /enter your password/i }).fill('safwanuser');
    await page.getByRole('button', { name: /login/i }).click();

    // Navigate to Dashboard → Profile
    await page.getByRole('button', { name: /safwan/i }).click();
    await page.getByRole('link', { name: /dashboard/i }).click();
    await page.getByRole('link', { name: /profile/i }).click();

    await expect(page).toHaveURL('http://localhost:3000/dashboard/user/profile');
  });

  // Positive Case: UI elements render
  test('should display all fields correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /user profile/i })).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Name')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Phone')).toBeVisible();
    await expect(page.getByPlaceholder('Enter Your Address')).toBeVisible();
    await expect(page.getByPlaceholder(/current password/i)).toBeVisible();
    await expect(page.getByPlaceholder('Enter new password (optional)')).toBeVisible();
    await expect(page.getByPlaceholder('Confirm new password')).toBeVisible();
    await expect(page.getByRole('button', { name: /update/i })).toBeVisible();
  });

  // Positive Case: Successful update (change phone number)
  test('should update successfully when valid details and correct password are provided', async ({ page }) => {
  // Generate a random phone number (ensures new value each run)
  const randomPhone = `9${Math.floor(10000000 + Math.random() * 89999999)}`;

  await page.getByPlaceholder('Enter Your Phone').fill(randomPhone);
  await page.getByPlaceholder('Enter your current password (required for any changes)').fill('safwanuser');
  await page.getByRole('button', { name: /update/i }).click();

  await expect(page.getByText(/profile updated successfully/i)).toBeVisible({ timeout: 5000 });
});


  // Negative Case 1: Incorrect current password
  test('should show error when current password is incorrect', async ({ page }) => {
    await page.getByPlaceholder('Enter Your Phone').fill('99999999');
    await page.getByPlaceholder(/current password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /update/i }).click();

    await expect(page.getByText(/incorrect current password/i)).toBeVisible({ timeout: 5000 });
  });

  // Negative Case 2: Mismatched new passwords
  test('should show error when new passwords do not match', async ({ page }) => {
    await page.getByPlaceholder(/current password/i).fill('safwanuser');
    await page.getByPlaceholder('Enter new password (optional)').fill('newpass123');
    await page.getByPlaceholder('Confirm new password').fill('differentpass');
    await page.getByRole('button', { name: /update/i }).click();

    await expect(page.getByText(/new passwords do not match/i)).toBeVisible({ timeout: 5000 });
  });

  // Negative Case 3: Too short new password
  test('should show error when new password is too short', async ({ page }) => {
    await page.getByPlaceholder(/current password/i).fill('safwanuser');
    await page.getByPlaceholder('Enter new password (optional)').fill('123');
    await page.getByPlaceholder('Confirm new password').fill('123');
    await page.getByRole('button', { name: /update/i }).click();

    await expect(page.getByText(/new password must be at least 6 characters/i)).toBeVisible({ timeout: 5000 });
  });

  // Negative Case 4: No changes made
  test('should show error when no changes were made', async ({ page }) => {
    await page.getByPlaceholder(/current password/i).fill('safwanuser');
    await page.getByRole('button', { name: /update/i }).click();

    await expect(page.getByText(/no changes detected/i)).toBeVisible({ timeout: 5000 });
  });
});
import { test, expect } from '@playwright/test';

test.describe('User Profile Page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();

    // Perform login
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('safwanuser@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('safwanuser');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Navigate to dashboard → profile
    await page.getByRole('button', { name: 'safwan' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Profile' }).click();

    // Optional check: confirm that we are on the profile page
    await expect(page).toHaveURL('http://localhost:3000/dashboard/user/profile');
  });

  test('should render all main elements of the User Profile page', async ({ page }) => {
    // Check the header
    await expect(page.getByRole('heading', { name: /user profile/i })).toBeVisible();

    // Check input fields
    await expect(page.getByRole('textbox', { name: /enter your name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /enter your password/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /enter your phone/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /enter your address/i })).toBeVisible();

    // Check update button
    await expect(page.getByRole('button', { name: /update/i })).toBeVisible();
  });

  test('should successfully update user name when valid name is provided', async ({ page }) => {
    await page.getByRole('textbox', { name: /enter your name/i }).fill('Safwan H');
    await page.getByRole('textbox', { name: /enter your password/i }).fill('safwanuser');
    await page.getByRole('textbox', { name: /enter your phone/i }).fill('98765432');
    await page.getByRole('textbox', { name: /enter your address/i }).fill('Singapore');

    await page.getByRole('button', { name: /update/i }).click();

    // Verify success popup or toast
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully update user phone when valid phone is provided', async ({ page }) => {
    
    await page.getByRole('textbox', { name: /enter your password/i }).fill('safwanuser');
    await page.getByRole('textbox', { name: /enter your phone/i }).fill('98765432');

    await page.getByRole('button', { name: /update/i }).click();

    // Verify success popup or toast
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully update user address when valid address is provided', async ({ page }) => {
    
    await page.getByRole('textbox', { name: /enter your password/i }).fill('safwanuser');
    await page.getByRole('textbox', { name: /enter your address/i }).fill('Singapore');

    await page.getByRole('button', { name: /update/i }).click();

    // Verify success popup or toast
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible({ timeout: 5000 });
  });

  test('should successfully update user password when new valid password is provided', async ({ page }) => {
    
    await page.getByRole('textbox', { name: /enter your password/i }).fill('safwanuser');

    await page.getByRole('button', { name: /update/i }).click();

    // Verify success popup or toast
    await expect(page.getByText(/profile updated successfully/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/profile updated successfully/i)).not.toBeVisible({ timeout: 8000 });
  });

  test('should display footer and navigation links correctly', async ({ page }) => {
    // Verify footer content
    await expect(page.getByText(/all rights reserved/i)).toBeVisible();

    // Verify navigation links
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  });

  test('should show error when name field is left empty', async ({ page }) => {
    await page.getByRole('textbox', { name: /enter your name/i }).fill('');
    await page.getByRole('button', { name: /update/i }).click();

    // Expect validation message or error toast
    await expect(page.getByText(/please fill all fields/i)).toBeVisible({ timeout: 5000 });
  });


});

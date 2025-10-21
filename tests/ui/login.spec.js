import { test, expect } from '@playwright/test';


test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login'); // adjust if your client runs elsewhere
  });

  test('should display the login form correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {

    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('safwan@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).press('Tab');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('safwan');
    await page.getByRole('button', { name: 'LOGIN' }).click();
    await expect(page).toHaveURL('http://localhost:3000/');

  });

  test('should display error pop up with invalid credentials', async ({ page }) => {

    // Fill form
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('safwan@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('saf');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Assertion: "Invalid Password" popup should appear
    await expect(page.getByText('Invalid Password')).toBeVisible();
  });

  test('error pop up should disappear within 6 seconds', async ({ page }) => {

    // Fill form
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('safwan@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('saf');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    // Verify that pop up disappaers
    await expect(page.getByText('Invalid Password')).toBeVisible();
    await expect(page.getByText('Invalid Password')).not.toBeVisible({ timeout: 5000 });
  });
});
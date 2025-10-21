import { test, expect } from '@playwright/test';

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/register');
    await page.waitForLoadState('networkidle');
  });

  test('should display the register form correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /register/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /register/i })).toBeVisible();
  });

  test('should register successfully and redirect to login page', async ({ page }) => {
    const uniqueEmail = `rena_test_${Date.now()}@gmail.com`;

    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('rena');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('12345678');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('98765432');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('123 test street');
    await page.getByPlaceholder('Enter Your DOB').fill('2025-10-31');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('badminton');

    await Promise.all([
      page.waitForURL(/\/login/, { timeout: 15000 }),
      page.getByRole('button', { name: /register/i }).click(),
    ]);

    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error when email already exists', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('rena_existing');
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('admin@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('12345678');
    await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('98765432');
    await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('123 test street');
    await page.getByPlaceholder('Enter Your DOB').fill('2025-10-31');
    await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('badminton');
    await page.getByRole('button', { name: /register/i }).click();

    await page.waitForSelector('[role="status"], .Toastify__toast-body', { timeout: 10000 });

    await expect(
      page.getByText(/email already exists|user already exists|already registered/i)
    ).toBeVisible({ timeout: 10000 });

    await expect(page).toHaveURL(/\/register$/);
  });

  test('should show error when required field is missing', async ({ page }) => {
  await page.goto('http://localhost:3000/register');

  await page.getByRole('textbox', { name: 'Enter Your Name' }).fill('testuser');
  await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('12345678');
  await page.getByRole('textbox', { name: 'Enter Your Phone' }).fill('98765432');
  await page.getByRole('textbox', { name: 'Enter Your Address' }).fill('123 test street');
  await page.getByPlaceholder('Enter Your DOB').fill('2025-10-31');
  await page.getByRole('textbox', { name: 'What is Your Favorite sports' }).fill('badminton');

  await page.getByRole('button', { name: /register/i }).click();

  await expect(page).toHaveURL(/\/register/);

  const emailInput = page.getByRole('textbox', { name: 'Enter Your Email' });
  const isValid = await emailInput.evaluate((el) => el.checkValidity());
  expect(isValid).toBe(false);

  const inlineError = page.locator('text=/required|enter email|missing/i');
  const errorVisible = await inlineError.count();
  if (errorVisible > 0) {
    await expect(inlineError.first()).toBeVisible();
  }

  await expect(page).toHaveURL(/\/register/);
});


  test('should allow selecting a date from date picker', async ({ page }) => {
    const dateInput = page.getByPlaceholder('Enter Your DOB');
    await dateInput.click();
    await dateInput.fill('2025-10-07');
    const value = await dateInput.inputValue();
    expect(value).toBe('2025-10-07');
  });
});

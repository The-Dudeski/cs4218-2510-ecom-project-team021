import { test, expect } from '@playwright/test';

test.describe('About Page UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should navigate to About page from header', async ({ page }) => {
    await page.getByRole('link', { name: /about/i }).click();
    await expect(page).toHaveURL(/about/i);
    await expect(page).toHaveTitle(/about us - ecommerce app/i);
    await expect(page.locator('.row.contactus')).toBeVisible();
  });

  test('should display company image and description text', async ({ page }) => {
    await page.goto('http://localhost:3000/about');

    const container = page.locator('.row.contactus');
    await expect(container).toBeVisible();

    // Image check
    const image = page.locator('img[alt="contactus"]');
    await expect(image).toBeVisible();
    expect(await image.getAttribute('src')).toBe('/images/about.jpeg');

    // Text check
    const paragraph = page.locator('.col-md-4 p.text-justify');
    await expect(paragraph).toBeVisible();
    await expect(paragraph).toContainText(/add text/i);
  });

  test('should have proper layout columns', async ({ page }) => {
    await page.goto('http://localhost:3000/about');

    await expect(page.locator('.col-md-6')).toBeVisible(); // image column
    await expect(page.locator('.col-md-4')).toBeVisible(); // text column
  });
});

import { test, expect } from '@playwright/test';

test.describe('Privacy Policy Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/policy');
  });

  test('should display page title and heading', async ({ page }) => {
    await expect(page).toHaveTitle(/Privacy Policy/i);
    await expect(page.getByRole('heading', { name: /privacy policy/i })).toBeVisible();
  });

  test('should display privacy policy content', async ({ page }) => {
    const textSnippets = [
      'We value your privacy',
      'Your data is used only',
      'Payments are handled securely',
      'contact us anytime',
    ];

    for (const snippet of textSnippets) {
      await expect(page.getByText(new RegExp(snippet, 'i'))).toBeVisible();
    }
  });

  test('should display the image on the page', async ({ page }) => {
    const img = page.locator('img');
    await expect(img.first()).toBeVisible();
		await expect(img).toHaveAttribute('alt', /privacy/i);
  });

});

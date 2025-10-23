import { test, expect } from '@playwright/test';

test.describe('Admin Products Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth check
    await page.route('**/api/v1/auth/admin-auth', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    // Mock product data
    await page.route('**/api/v1/product/get-product', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            { _id: '1', slug: 'p1', name: 'Product One', description: 'desc 1' },
            { _id: '2', slug: 'p2', name: 'Product Two', description: 'desc 2' },
          ],
        }),
      });
    });

    // Pretend we’re logged in as admin before the app loads
    await page.addInitScript(() => {
      localStorage.setItem(
        'auth',
        JSON.stringify({
          token: 'fake-token',
          user: {
            _id: 'abc123',
            name: 'AdminUser',
            email: 'admin@example.com',
            role: 1, // admin role
          },
        })
      );
    });
    await page.goto('http://localhost:3000/dashboard/admin/products');
  });

  test('should display heading and both product cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /all products list/i }))
      .toBeVisible({ timeout: 15000 });

    // Two product cards rendered
    const cards = page.locator('.card');
    await expect(cards).toHaveCount(2);
    await expect(page.getByText('Product One')).toBeVisible();
    await expect(page.getByText('Product Two')).toBeVisible();
  });

  test('should show correct product images', async ({ page }) => {
    const img = page.locator('img.card-img-top').first();
    await expect(img).toBeVisible();
    const src = await img.getAttribute('src');
    expect(src).toContain('/api/v1/product/product-photo/1');
  });

  test('should link to correct product detail pages', async ({ page }) => {
    await expect(page.getByRole('link', { name: /product one/i }))
      .toHaveAttribute('href', '/dashboard/admin/product/p1');
    await expect(page.getByRole('link', { name: /product two/i }))
      .toHaveAttribute('href', '/dashboard/admin/product/p2');
  });

  test('should render admin layout columns', async ({ page }) => {
    await expect(page.locator('.col-md-3')).toBeVisible();
    await expect(page.locator('.col-md-9')).toBeVisible();
  });
});

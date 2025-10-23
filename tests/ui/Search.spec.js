import { test, expect } from '@playwright/test';

test.describe('Search Page UI', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: /login/i }).click();

        await page.getByRole('textbox', { name: /enter your email/i }).fill('safwanuser@gmail.com');
        await page.getByRole('textbox', { name: /enter your password/i }).fill('safwanuser');
        await page.getByRole('button', { name: /login/i }).click();

        // Wait for Firefox
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await expect(page.getByRole('button', { name: /safwanusertest1/i })).toBeVisible({ timeout: 20000 });
    });

    test('should display search results correctly', async ({ page }) => {
        await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });

        await page.locator('input[placeholder*="Search"]').fill('phone');
        await page.getByRole('button', { name: /search/i }).click();

        await expect(page.getByRole('heading', { name: /search resuts/i })).toBeVisible({ timeout: 15000 });

        const hasResults = await page.getByText(/found/i).isVisible().catch(() => false);
        const noResults = await page.getByText(/no products found/i).isVisible().catch(() => false);

        expect(hasResults || noResults).toBeTruthy();

        if (hasResults) {
            await expect(page.locator('.card').first()).toBeVisible();
            await expect(page.getByRole('button', { name: /more details/i }).first()).toBeVisible();
            await expect(page.getByRole('button', { name: /add to cart/i }).first()).toBeVisible();
        }
    });


    test('should handle empty or invalid queries gracefully', async ({ page }) => {
        await page.locator('input[placeholder*="Search"]').fill('qwertyuiopasdfgh');
        await page.getByRole('button', { name: /search/i }).click();

        await expect(page.getByRole('heading', { name: /search resuts/i })).toBeVisible();
        await expect(page.getByText(/no products found/i)).toBeVisible();
    });

    test('should navigate to product detail page from search results', async ({ page }) => {
        await page.locator('input[placeholder*="Search"]').fill('phone');
        await page.getByRole('button', { name: /search/i }).click();

        await expect(page.getByRole('heading', { name: /search resuts/i })).toBeVisible({ timeout: 15000 });

        const moreDetailsBtn = page.getByRole('button', { name: /more details/i }).first();
        await expect(moreDetailsBtn).toBeVisible();
        await moreDetailsBtn.click();
        await expect(page).toHaveURL(/search/i);
    });

    test('should display footer links correctly', async ({ page }) => {
        await page.goto('http://localhost:3000/search');
        await expect(page.getByText(/all rights reserved/i)).toBeVisible();
        await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
        await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
    });

    test('should clear previous query and allow new search', async ({ page }) => {
        await page.locator('input[placeholder*="Search"]').fill('phone');
        await page.getByRole('button', { name: /search/i }).click();
        await page.waitForLoadState('networkidle');

        // Clear and search again
        await page.locator('input[placeholder*="Search"]').fill('');
        await page.locator('input[placeholder*="Search"]').fill('laptop');
        await page.getByRole('button', { name: /search/i }).click();

        await expect(page.getByRole('heading', { name: /search resuts/i })).toBeVisible();
    });


});

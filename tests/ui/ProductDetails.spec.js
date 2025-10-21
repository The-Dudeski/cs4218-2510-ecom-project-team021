import { test, expect } from '@playwright/test';

/**
 * UI tests for the Product Details page.
 * These tests validate that the layout, product info, images,
 * buttons, and footer render correctly and respond to user actions.
 */

test.describe('Product Details Page UI — Virtual Vault, with guest user', () => {

  // Navigate to the Product Details page before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/product/Novel');
    await expect(page.getByRole('heading', { name: /product details/i }))
      .toBeVisible({ timeout: 15000 });
  });

  // Check product info section
  test('should display correct product information', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Name : Novel' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Description : A bestselling' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Price :$' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Category :' })).toBeVisible();
  });

  // Check product image
  test('should render product image correctly', async ({ page }) => {
    const image = page.locator('img.card-img-top').first();
    await expect(image).toBeVisible();
    const src = await image.getAttribute('src');
    expect(src).toContain('/api/v1/product/product-photo/');
  });

  // Check the “Add to Cart” button
  test('should display and allow interaction with Add to Cart button', async ({ page }) => {
    const addToCart = page.getByRole('link', { name: 'Cart' });
    await expect(addToCart).toBeVisible();
    await addToCart.click();
    // If a toast or popup appears later, you can add an assertion for it here
  });

  // Check Similar Products section
  test('should show similar products list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Similar Products ➡️' })).toBeVisible();
    await expect(page.getByText('No Similar Products found')).toBeVisible();
  });

  // Check navigation bar elements
  test('should display navbar with all key links', async ({ page }) => {
    await expect(page.getByText('VIRTUAL VAULT')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
  });

  // Check footer content
  test('should display footer links correctly', async ({ page }) => {
    await expect(page.getByText(/all rights reserved/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  });

  // Ensure layout consistency
  test('should maintain layout with image left and details right', async ({ page }) => {
    const container = page.locator('.product-details');
    await expect(container.locator('.col-md-6').first()).toBeVisible();
    await expect(container.locator('.col-md-6.product-details-info')).toBeVisible();
  });
});

test.describe('Product Details Page UI — Virtual Vault, with logged in user', () => {

  // Navigate to the Product Details page before each test
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
    await page.locator('div:nth-child(2) > .card-body > div:nth-child(3) > button').first().click();

    // Confirm Product Details page loaded
    await expect(page.getByRole('heading', { name: /product details/i }))
      .toBeVisible({ timeout: 15000 });
  });

  // Check product info section
  test('should display correct product information', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Name : The Law of Contract in' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Description : A bestselling' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Price :$' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Category : ' })).toBeVisible();
    await expect(page.getByRole('button', { name: /add to cart/i })).toBeVisible();
  });  

  test('should display navbar with logged-in links', async ({ page }) => {
    await expect(page.getByText('VIRTUAL VAULT')).toBeVisible();
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /categories/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /safwan/i })).toBeVisible(); // logged-in user dropdown
    await expect(page.getByRole('link', { name: /cart/i })).toBeVisible();
  });

  test('should display footer links correctly for logged-in user', async ({ page }) => {
    await expect(page.getByText(/all rights reserved/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /privacy policy/i })).toBeVisible();
  });

  test('should maintain correct layout for logged-in view', async ({ page }) => {
    const container = page.locator('.product-details');
    await expect(container.locator('.col-md-6').first()).toBeVisible();
    await expect(container.locator('.col-md-6.product-details-info')).toBeVisible();
  });

  test('should allow logged-in user to add product to cart', async ({ page }) => {
    const addToCart = page.getByRole('button', { name: /add to cart/i });
    await expect(addToCart).toBeVisible();
    await addToCart.click();

    // Expect toast or cart page update
    await expect(page.getByRole('link', { name: /cart/i })).toBeVisible();
  });
});



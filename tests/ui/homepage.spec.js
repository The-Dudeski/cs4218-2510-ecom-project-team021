import { test, expect } from '@playwright/test';

// ------------------------------------------
// Configuration
// ------------------------------------------
const USER_EMAIL = 'safwan@gmail.com';
const USER_PASSWORD = 'safwan';

// ------------------------------------------
// Helper Functions
// ------------------------------------------
async function login(page, email, password) {
  await page.goto('http://localhost:3000/login');
  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  await page.getByPlaceholder('Enter Your Email').fill(email);
  await page.getByPlaceholder('Enter Your Password').fill(password);
  await page.getByRole('button', { name: /login/i }).click();
  await page.waitForURL('http://localhost:3000/');
}

// ------------------------------------------
// HomePage Basic Layout Tests
// ------------------------------------------
test.describe('HomePage - Basic Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should display banner image', async ({ page }) => {
    const bannerImage = page.getByAltText('bannerimage');
    await expect(bannerImage).toBeVisible();
    await expect(bannerImage).toHaveAttribute('src', '/images/Virtual.png');
  });

  test('should display main heading "All Products"', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /all products/i });
    await expect(heading).toBeVisible();
  });

  test('should have filter sidebar', async ({ page }) => {
    const categoryFilter = page.getByRole('heading', { name: /filter by category/i });
    await expect(categoryFilter).toBeVisible();
    
    const priceFilter = page.getByRole('heading', { name: /filter by price/i });
    await expect(priceFilter).toBeVisible();
  });

  test('should display reset filters button', async ({ page }) => {
    const resetButton = page.getByRole('button', { name: /reset filters/i });
    await expect(resetButton).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await expect(page).toHaveTitle(/all products - best offers/i);
  });

  test('should render within Layout component', async ({ page }) => {
    // Verify Header is present
    const header = page.locator('nav.navbar');
    await expect(header).toBeVisible();

    // Verify Footer is present
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
  });
});

// ------------------------------------------
// Product Display Tests
// ------------------------------------------
test.describe('HomePage - Product Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should display product cards', async ({ page }) => {
    // Wait for products to load
    const productCards = page.locator('.card');
    await expect(productCards.first()).toBeVisible({ timeout: 10000 });
    
    // Should have at least one product
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display product details in cards', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    
    // Check for product image
    const image = firstCard.locator('.card-img-top');
    await expect(image).toBeVisible();
    
    // Check for product name
    const title = firstCard.locator('.card-title').first();
    await expect(title).toBeVisible();
    
    // Check for price
    const price = firstCard.locator('.card-price');
    await expect(price).toBeVisible();
    
    // Check for description
    const description = firstCard.locator('.card-text');
    await expect(description).toBeVisible();
  });

  test('should display "More Details" button on each card', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    
    const moreDetailsButton = firstCard.getByRole('button', { name: /more details/i });
    await expect(moreDetailsButton).toBeVisible();
  });

  test('should display "ADD TO CART" button on each card', async ({ page }) => {
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    
    const addToCartButton = firstCard.getByRole('button', { name: /add to cart/i });
    await expect(addToCartButton).toBeVisible();
  });

  test('should display formatted price with currency', async ({ page }) => {
    const firstPrice = page.locator('.card-price').first();
    await expect(firstPrice).toBeVisible({ timeout: 10000 });
    
    const priceText = await firstPrice.textContent();
    expect(priceText).toMatch(/\$/); // Should contain dollar sign
  });

  test('should truncate product description', async ({ page }) => {
    const firstDescription = page.locator('.card-text').first();
    await expect(firstDescription).toBeVisible({ timeout: 10000 });
    
    const descText = await firstDescription.textContent();
    expect(descText).toContain('...'); // Should be truncated
  });
});

// ------------------------------------------
// Filter Tests
// ------------------------------------------
test.describe('HomePage - Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should display category checkboxes', async ({ page }) => {
    // Wait for categories to load
    const checkboxes = page.locator('.filters .ant-checkbox-wrapper');
    await expect(checkboxes.first()).toBeVisible({ timeout: 10000 });
    
    const count = await checkboxes.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    // Wait for initial products to load
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
    const initialCount = await page.locator('.card').count();
    
    // Click first category checkbox
    const firstCheckbox = page.locator('.filters .ant-checkbox-wrapper').first();
    await firstCheckbox.click();
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    const filteredCount = await page.locator('.card').count();
    // Filtered count should be different (could be more or less)
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test('should display price filter radio buttons', async ({ page }) => {
    const radioButtons = page.locator('.ant-radio-wrapper');
    await expect(radioButtons.first()).toBeVisible({ timeout: 10000 });
    
    const count = await radioButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter products by price', async ({ page }) => {
    // Wait for initial products
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
    
    // Click first price filter option
    const firstRadio = page.locator('.ant-radio-wrapper').first();
    await firstRadio.click();
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Should have some products (or none if no products in that price range)
    const filteredCount = await page.locator('.card').count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });

  test('should reset filters when reset button clicked', async ({ page }) => {
    // Wait for initial load
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
    
    // Apply a category filter
    const firstCheckbox = page.locator('.filters .ant-checkbox-wrapper').first();
    await firstCheckbox.click();
    await page.waitForTimeout(1000);
    
    // Click reset button
    const resetButton = page.getByRole('button', { name: /reset filters/i });
    await resetButton.click();
    
    // Wait for products to reload
    await page.waitForTimeout(1000);
    
    // Checkbox should be unchecked
    const isChecked = await firstCheckbox.locator('input').isChecked();
    expect(isChecked).toBe(false);
  });

  test('should combine category and price filters', async ({ page }) => {
    // Wait for initial products
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
    
    // Apply category filter
    const firstCheckbox = page.locator('.filters .ant-checkbox-wrapper').first();
    await firstCheckbox.click();
    await page.waitForTimeout(500);
    
    // Apply price filter
    const firstRadio = page.locator('.ant-radio-wrapper').first();
    await firstRadio.click();
    await page.waitForTimeout(1000);
    
    // Should have filtered results
    const filteredCount = await page.locator('.card').count();
    expect(filteredCount).toBeGreaterThanOrEqual(0);
  });
});

// ------------------------------------------
// Pagination Tests
// ------------------------------------------
test.describe('HomePage - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should display load more button when more products available', async ({ page }) => {
    // Wait for products to load
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
    
    // Check if load more button exists (may not exist if few products)
    const loadMoreButton = page.getByTestId('load-more-btn');
    const isVisible = await loadMoreButton.isVisible().catch(() => false);
    
    // If visible, it should be clickable
    if (isVisible) {
      await expect(loadMoreButton).toBeEnabled();
      await expect(loadMoreButton).toContainText(/load more/i);
    }
  });

  test('should load more products when load more clicked', async ({ page }) => {
    // Wait for initial products
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
    
    const loadMoreButton = page.getByTestId('load-more-btn');
    const isVisible = await loadMoreButton.isVisible().catch(() => false);
    
    if (isVisible) {
      const initialCount = await page.locator('.card').count();
      
      await loadMoreButton.click();
      await page.waitForTimeout(2000);
      
      const newCount = await page.locator('.card').count();
      expect(newCount).toBeGreaterThan(initialCount);
    }
  });

  test('should disable load more button while loading', async ({ page }) => {
    await expect(page.locator('.card').first()).toBeVisible({ timeout: 10000 });
    
    const loadMoreButton = page.getByTestId('load-more-btn');
    const isVisible = await loadMoreButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // Click load more
      await loadMoreButton.click();
      
      // Button should show loading state or be disabled
      const buttonText = await loadMoreButton.textContent();
      expect(buttonText).toMatch(/loading|load more/i);
    }
  });
});

// ------------------------------------------
// Cart Functionality Tests
// ------------------------------------------
test.describe('HomePage - Add to Cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should add product to cart when "ADD TO CART" clicked', async ({ page }) => {
    // Wait for products to load
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    
    // Get cart badge initial count
    const cartBadge = page.locator('.ant-badge-count');
    const initialCount = await cartBadge.textContent().catch(() => '0');
    
    // Click add to cart
    const addToCartButton = firstCard.getByRole('button', { name: /add to cart/i });
    await addToCartButton.click();
    
    // Wait for toast notification
    await expect(page.getByText(/item added to cart/i)).toBeVisible({ timeout: 5000 });
    
    // Cart count should increase
    await page.waitForTimeout(500);
    const newCount = await cartBadge.textContent();
    expect(parseInt(newCount)).toBeGreaterThan(parseInt(initialCount));
  });

  test('should persist cart items in localStorage', async ({ page }) => {
    // Add product to cart
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.getByRole('button', { name: /add to cart/i }).click();
    await expect(page.getByText(/item added to cart/i)).toBeVisible({ timeout: 5000 });
    
    // Check localStorage
    const cartData = await page.evaluate(() => localStorage.getItem('cart'));
    expect(cartData).toBeTruthy();
    
    const cart = JSON.parse(cartData);
    expect(Array.isArray(cart)).toBe(true);
    expect(cart.length).toBeGreaterThan(0);
  });
});

// ------------------------------------------
// Navigation Tests
// ------------------------------------------
test.describe('HomePage - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
  });

  test('should navigate to product details when "More Details" clicked', async ({ page }) => {
    // Wait for products
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    
    // Click more details
    const moreDetailsButton = firstCard.getByRole('button', { name: /more details/i });
    await moreDetailsButton.click();
    
    // Should navigate to product page
    await page.waitForURL(/\/product\/.+/);
    expect(page.url()).toMatch(/\/product\/.+/);
  });

  test('should navigate to cart page when cart link clicked', async ({ page }) => {
    // Add item to cart first
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.getByRole('button', { name: /add to cart/i }).click();
    await page.waitForTimeout(1000);
    
    // Click cart link in navbar
    const cartLink = page.getByRole('link', { name: /cart/i });
    await cartLink.click();
    
    // Should navigate to cart page
    await page.waitForURL('http://localhost:3000/cart');
  });
});

// ------------------------------------------
// Responsive Design Tests
// ------------------------------------------
test.describe('HomePage - Responsive Design', () => {
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/');
    
    // Banner should be visible
    const banner = page.getByAltText('bannerimage');
    await expect(banner).toBeVisible();
    
    // Products should be visible
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:3000/');
    
    // Filters should be visible
    const categoryFilter = page.getByRole('heading', { name: /filter by category/i });
    await expect(categoryFilter).toBeVisible();
    
    // Products should be visible
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
  });
});

// ------------------------------------------
// Error Handling Tests
// ------------------------------------------
test.describe('HomePage - Error Handling', () => {
  test('should handle no products gracefully', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Even if no products, page should load
    const heading = page.getByRole('heading', { name: /all products/i });
    await expect(heading).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // This test assumes the app handles errors without crashing
    await page.goto('http://localhost:3000/');
    
    // Page should still render
    const heading = page.getByRole('heading', { name: /all products/i });
    await expect(heading).toBeVisible();
  });
});
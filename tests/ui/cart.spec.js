import { test, expect } from '@playwright/test';

// ------------------------------------------
// Configuration: UPDATE THESE CREDENTIALS
// ------------------------------------------
const USER_EMAIL = 'l.d@gmail.com'; 
const USER_PASSWORD = '123';   
const USER_ADDRESS = '123 Test Street, QA City, 90210';
// ------------------------------------------

// ------------------------------------------
// Mock Data Setup
// ------------------------------------------

// Products that are EXPECTED to be on the Home Page and added to cart
const mockProduct1 = {
  _id: 'p-123',
  name: 'Playwright Test Product',
  price: 50.00,
};

const mockProduct2 = {
  _id: 'p-456',
  name: 'Second Test Item',
  price: 150.00,
};

// Mock Auth Response for successful login
const mockAuthResponse = (hasAddress = true) => ({
  user: {
    _id: 'u-101',
    name: 'Ready User',
    email: USER_EMAIL,
    address: hasAddress ? USER_ADDRESS : null,
  },
  token: 'mock-auth-token-456',
});

// ------------------------------------------
// Reusable Helper Functions
// ------------------------------------------

async function login(page, email, password) {

    await page.goto('http://localhost:3000/login'); 
  
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  
    await page.getByPlaceholder('Enter Your Email').fill(email);
    await page.getByPlaceholder('Enter Your Password').fill(password);
    await page.getByRole('button', { name: /login/i }).click();
  
    await page.waitForURL('http://localhost:3000/');
  }

// Function to simulate adding a product to the cart via UI click
test.describe('Cart tests with items', () => {
    test.beforeEach(async ({ page }) => {
      await login(page, USER_EMAIL, USER_PASSWORD)
      page.goto('http://localhost:3000/')
      const productCard1 = page.locator('.card', { hasText: 'Novel' })
      const productCard2 = page.locator('.card', { hasText: 'Textbook' })
      await productCard1.locator('button:has-text("ADD TO CART")').click()
      await productCard2.locator('button:has-text("ADD TO CART")').click()
    })
  
    test('should show two products in cart', async ({ page }) => {
      await page.goto('http://localhost:3000/cart')
      const novelInCart = page.locator('.card', { hasText: 'Novel' })
      const textbookInCart = page.locator('.card', { hasText: 'Textbook' })

    // Wait for them to appear (cart may render asynchronously)
    await expect(novelInCart).toBeVisible({ timeout: 5000 })
    await expect(textbookInCart).toBeVisible({ timeout: 5000 })
    })
  })
  
  test.describe('Empty cart tests', () => {
    test('should display empty message for guest', async ({ page }) => {
      await page.goto('http://localhost:3000/cart')
      await expect(page.getByText('Your Cart Is Empty')).toBeVisible()
    })
  })

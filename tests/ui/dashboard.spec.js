import { test, expect } from '@playwright/test';

// ------------------------------------------
// Configuration: UPDATE THESE CREDENTIALS
// ------------------------------------------
const USER_EMAIL = 'user@gmail.com';
const USER_PASSWORD = '123';

const ADMIN_EMAIL = 'safwan@gmail.com'; 
const ADMIN_PASSWORD = 'safwan';
// ------------------------------------------

// Reusable function to perform login
async function login(page, email, password) {

  await page.goto('http://localhost:3000/login'); 

  await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();

  await page.getByPlaceholder('Enter Your Email').fill(email);
  await page.getByPlaceholder('Enter Your Password').fill(password);
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForURL('http://localhost:3000/');
}


// #################################################
// 1. REGULAR USER DASHBOARD TESTS (Path: /dashboard/user)
// #################################################
test.describe('User Dashboard', () => {
  test.beforeEach(async ({ page }) => {
 
    await login(page, USER_EMAIL, USER_PASSWORD);
    
 
    await page.goto('http://localhost:3000/dashboard/user');
  });

  test('should successfully load the User Dashboard page', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:3000/dashboard/user');
    
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
  });

  test('should display links to Orders and Profile', async ({ page }) => {
    
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible();
    
    await expect(page.getByRole('link', { name: /profile/i })).toBeVisible();
  });

  test('should navigate to the Profile page correctly', async ({ page }) => {
    await page.getByRole('link', { name: /profile/i }).click();

    await expect(page).toHaveURL('http://localhost:3000/dashboard/user/profile');
    await expect(page.getByRole('heading', { name: /user profile/i })).toBeVisible();
  });
});


// #################################################
// 2. ADMIN DASHBOARD TESTS (Path: /dashboard/admin)
// #################################################
test.describe('Admin Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('http://localhost:3000/dashboard/admin');
  });

  test('should successfully load the Admin Dashboard page', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:3000/dashboard/admin');

    await expect(page.getByRole('heading', { name: /admin name/i })).toBeVisible();
  });

  test('should display all expected Admin navigation links', async ({ page }) => {
    
    await expect(page.getByRole('link', { name: /create category/i })).toBeVisible();

    await expect(page.getByRole('link', { name: /create product/i })).toBeVisible();
    
    await expect(page.getByRole('link', { name: /products/i, exact: true })).toBeVisible();
    
    await expect(page.getByRole('link', { name: /orders/i })).toBeVisible();
  });

  test('should navigate to the Create Product page correctly', async ({ page }) => {
    
    await page.getByRole('link', { name: /create product/i }).click();

    await expect(page).toHaveURL('http://localhost:3000/dashboard/admin/create-product');
    await expect(page.getByRole('heading', { name: /create product/i })).toBeVisible();
  });
});
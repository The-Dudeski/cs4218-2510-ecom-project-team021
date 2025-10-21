import { test, expect } from '@playwright/test';

// ------------------------------------------
// Contact Page Tests
// ------------------------------------------

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
  });

  test('should display contact page heading', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /contact us/i });
    await expect(heading).toBeVisible();
  });

  test('should display contact image', async ({ page }) => {
    const contactImage = page.getByAltText('contactus');
    await expect(contactImage).toBeVisible();
    
    // Verify image has correct styling
    const width = await contactImage.evaluate(el => 
      window.getComputedStyle(el).width
    );
    expect(width).toBeTruthy(); // Should have width set
  });

  test('should display introductory text', async ({ page }) => {
    const introText = page.getByText(/for any query or info about product/i);
    await expect(introText).toBeVisible();
    await expect(introText).toContainText('24X7');
  });

  test('should display email contact information', async ({ page }) => {
    const emailText = page.getByText(/www\.help@ecommerceapp\.com/i);
    await expect(emailText).toBeVisible();
  });

  test('should display phone contact information', async ({ page }) => {
    const phoneText = page.getByText(/012-3456789/);
    await expect(phoneText).toBeVisible();
  });

  test('should display toll-free number', async ({ page }) => {
    const tollFreeText = page.getByText(/1800-0000-0000.*toll free/i);
    await expect(tollFreeText).toBeVisible();
  });

  test('should have correct layout structure', async ({ page }) => {
    // Check for Bootstrap grid structure
    const rowDiv = page.locator('.row.contactus');
    await expect(rowDiv).toBeVisible();

    // Check for image column
    const imageColumn = page.locator('.col-md-6');
    await expect(imageColumn).toBeVisible();

    // Check for content column
    const contentColumn = page.locator('.col-md-4');
    await expect(contentColumn).toBeVisible();
  });

  test('should display all contact methods', async ({ page }) => {
    // Verify all three contact methods are present
    const paragraphs = page.locator('.col-md-4 p.mt-3');
    const count = await paragraphs.count();
    expect(count).toBe(3); // Email, Phone, Toll-free
  });

  test('should have proper heading styling', async ({ page }) => {
    const heading = page.getByRole('heading', { name: /contact us/i });
    
    // Check for Bootstrap classes
    await expect(heading).toHaveClass(/bg-dark/);
    await expect(heading).toHaveClass(/text-white/);
    await expect(heading).toHaveClass(/text-center/);
  });

  test('should render within Layout component', async ({ page }) => {
    // Verify Header is present (part of Layout)
    const header = page.locator('nav.navbar');
    await expect(header).toBeVisible();

    // Verify Footer is present (part of Layout)
    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();
  });

  test('should have correct page title in helmet', async ({ page }) => {
    // Check document title
    await expect(page).toHaveTitle(/contact us/i);
  });

  test('should be responsive - check mobile view', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Content should still be visible
    const heading = page.getByRole('heading', { name: /contact us/i });
    await expect(heading).toBeVisible();
    
    const emailText = page.getByText(/www\.help@ecommerceapp\.com/i);
    await expect(emailText).toBeVisible();
  });

  test('should navigate to contact page from footer link', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    
    // Click Contact link in footer
    const contactLink = page.getByRole('link', { name: /contact/i }).last();
    await contactLink.click();
    
    // Verify navigation
    await page.waitForURL('http://localhost:3000/contact');
    const heading = page.getByRole('heading', { name: /contact us/i });
    await expect(heading).toBeVisible();
  });

  test('should display contact info in correct order', async ({ page }) => {
    const paragraphs = page.locator('.col-md-4 p.mt-3');
    
    // First should be email
    const firstPara = paragraphs.nth(0);
    await expect(firstPara).toContainText('www.help@ecommerceapp.com');
    
    // Second should be phone
    const secondPara = paragraphs.nth(1);
    await expect(secondPara).toContainText('012-3456789');
    
    // Third should be toll-free
    const thirdPara = paragraphs.nth(2);
    await expect(thirdPara).toContainText('1800-0000-0000');
  });
});

// ------------------------------------------
// Optional: Accessibility Tests
// ------------------------------------------
test.describe('Contact Page Accessibility', () => {
  test('should have alt text for images', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    const image = page.locator('img[alt="contactus"]');
    await expect(image).toBeVisible();
  });

  test('should have semantic heading structure', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Only one h1
  });
});
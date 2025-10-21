import { test, expect } from '@playwright/test';

test.describe('Admin Category Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.getByRole('link', { name: 'Login' }).click();

    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill('renaAdmin@gmail.com');
    await page.getByRole('textbox', { name: 'Enter Your Password' }).fill('12345678');
    await page.getByRole('button', { name: 'LOGIN' }).click();

    await page.getByRole('button', { name: 'renaAdmin' }).click();
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await page.getByRole('link', { name: 'Create Category' }).click();

    await expect(page.getByText('Manage Category')).toBeVisible();

    await page.goto("http://localhost:3000/dashboard/admin/create-product");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Mock the file upload (this simulates user selecting an image)
    await page.evaluate(() => {
      const input = document.querySelector('[data-testid="file-input"]');
      if (!input) throw new Error("File input not found");

      const fakeFile = new File(["dummy"], "mock.png", { type: "image/png" });
      const dt = new DataTransfer();
      dt.items.add(fakeFile);
      input.files = dt.files;
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  
// test("should create a new product successfully", async ({ page }) => {
//     // Step 1: Select a category
//     await page.locator(".ant-select").first().click();
//     await page.waitForSelector(".ant-select-dropdown", { state: "visible" });
//     const firstOption = page.locator(".ant-select-item-option-content").first();
//     await expect(firstOption).toBeVisible();
//     await firstOption.click();

//     // Step 2: Fill in product details
//     await page.getByPlaceholder("write a name").fill("Playwright Mock Product");
//     await page.getByPlaceholder("write a description").fill("Mock upload test");
//     await page.getByPlaceholder("write a price").fill("10");
//     await page.getByPlaceholder("write a quantity").fill("5");

//     // Step 3: Select shipping
//     await page.locator(".ant-select").nth(1).click();
//     await page.waitForSelector(".ant-select-dropdown", { state: "visible" });
//     await page.getByText("Yes").click();

//     // Step 4: Submit
//     await page.getByRole("button", { name: "CREATE PRODUCT" }).click();

//     // Step 5: Verify success message
//     await expect(page.locator('text=/created successfully/i')).toBeVisible({ timeout: 15000 });

//   });
	
  test('shows error when name is missing', async ({ page }) => {
    await page.getByPlaceholder('write a description').fill('Product without name');
    await page.getByPlaceholder('write a price').fill('10');
    await page.getByPlaceholder('write a quantity').fill('5');

    await page.locator('.ant-select').first().click({ force: true });
    const catDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await catDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await catDropdown.locator('.ant-select-item-option-content').first().click();

    await page.locator('.ant-select').nth(1).click({ force: true });
    const shipDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await shipDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await shipDropdown.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Name is Required/i)).toBeVisible();
  });

  test('shows error when description is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('No Description Product');
    await page.getByPlaceholder('write a price').fill('10');
    await page.getByPlaceholder('write a quantity').fill('5');

    await page.locator('.ant-select').first().click({ force: true });
    const catDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await catDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await catDropdown.locator('.ant-select-item-option-content').first().click();

    await page.locator('.ant-select').nth(1).click({ force: true });
    const shipDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await shipDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await shipDropdown.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Description is Required/i)).toBeVisible();
  });

  test('shows error when price is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('No Price Product');
    await page.getByPlaceholder('write a description').fill('Missing price field');
    await page.getByPlaceholder('write a quantity').fill('5');

    await page.locator('.ant-select').first().click({ force: true });
    const catDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await catDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await catDropdown.locator('.ant-select-item-option-content').first().click();

    await page.locator('.ant-select').nth(1).click({ force: true });
    const shipDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await shipDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await shipDropdown.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Price is Required/i)).toBeVisible();
  });

  test('shows error when category is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('No Category Product');
    await page.getByPlaceholder('write a description').fill('Missing category');
    await page.getByPlaceholder('write a price').fill('20');
    await page.getByPlaceholder('write a quantity').fill('10');

    await page.locator('.ant-select').nth(1).click();
    await page.waitForSelector('.ant-select-dropdown', { state: 'visible' });
    await page.getByText('Yes').click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Category is Required/i)).toBeVisible();
  });

  test('shows error when quantity is missing', async ({ page }) => {
    await page.getByPlaceholder('write a name').fill('No Quantity Product');
    await page.getByPlaceholder('write a description').fill('Missing quantity');
    await page.getByPlaceholder('write a price').fill('15');

    await page.locator('.ant-select').first().click({ force: true });
    const catDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)');
    await catDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await catDropdown.locator('.ant-select-item-option-content').first().click();

    await page.locator('.ant-select').nth(1).click({ force: true });
    const shipDropdown = page.locator('.ant-select-dropdown:not(.ant-select-dropdown-hidden)').last();
    await shipDropdown.waitFor({ state: 'visible', timeout: 10000 });
    await shipDropdown.getByText('Yes', { exact: true }).click();

    await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
    await expect(page.getByText(/Quantity is Required/i)).toBeVisible();
  });

	test('shows error when price is negative', async ({ page }) => {
		await page.getByPlaceholder('write a name').fill('Negative Price');
		await page.getByPlaceholder('write a description').fill('Test invalid price');
		await page.getByPlaceholder('write a price').fill('-10');
		await page.getByPlaceholder('write a quantity').fill('5');

		await page.locator('.ant-select').first().click({ force: true });
		await page.locator('.ant-select-item-option-content').first().click();
		await page.locator('.ant-select').nth(1).click({ force: true });
		await page.getByText('Yes', { exact: true }).click();

		await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
		await expect(page.getByText(/Invalid value for price/i)).toBeVisible();
	});

	test('shows error when quantity is negative', async ({ page }) => {
		await page.getByPlaceholder('write a name').fill('Negative Quantity');
		await page.getByPlaceholder('write a description').fill('Test invalid quantity');
		await page.getByPlaceholder('write a price').fill('20');
		await page.getByPlaceholder('write a quantity').fill('-5');

		await page.locator('.ant-select').first().click({ force: true });
		await page.locator('.ant-select-item-option-content').first().click();
		await page.locator('.ant-select').nth(1).click({ force: true });
		await page.getByText('Yes', { exact: true }).click();

		await page.getByRole('button', { name: 'CREATE PRODUCT' }).click();
		await expect(page.getByText(/Invalid value for quantity/i)).toBeVisible();
	});



});
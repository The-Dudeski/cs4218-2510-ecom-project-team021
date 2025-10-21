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
  });

  test('creates a new category successfully', async ({ page }) => {
    const name = `Category_${Date.now()}`;

    await page.getByTestId('create-category-input').fill(name);
    await page.getByTestId('create-submit').click();

    await expect(page.getByText(`${name} is created`)).toBeVisible();
    await expect(page.locator(`text=${name}`)).toBeVisible();
  });

  test('shows error when category name is empty', async ({ page }) => {
    await page.getByTestId('create-submit').click();
    await expect(page.getByText(/category name is required/i)).toBeVisible();
  });

  test('edits an existing category successfully', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const input = page.getByTestId('update-category-input');
    await expect(input).toBeVisible();

    const newName = `Updated_${Date.now()}`;
    await input.fill(newName);
    await page.getByTestId('update-submit').click();

    await expect(page.getByText(/is updated/i)).toBeVisible();
    await expect(page.locator(`text=${newName}`)).toBeVisible();
  });

  test('closes modal without success message when no change made', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();
    const input = page.getByTestId('update-category-input');

    await expect(input).toBeVisible();
    await page.getByTestId('update-submit').click();

    await expect(input).toBeHidden();
    await expect(page.getByText(/is updated/i)).not.toBeVisible();
  });

  test('shows error when edited name is empty', async ({ page }) => {
    await page.getByRole('button', { name: 'Edit' }).first().click();

    const input = page.getByTestId('update-category-input');
    await input.fill('');
    await page.getByTestId('update-submit').click();

    await expect(page.getByText(/category name is required/i)).toBeVisible();
  });

  test('deletes a category successfully', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const categoryName = await firstRow.locator('td').first().textContent();

    await firstRow.locator('[data-testid^="delete-btn-"]').click();
    await expect(page.getByText(/category is deleted/i)).toBeVisible();
    await expect(page.locator('table tr td', { hasText: categoryName })).toHaveCount(0);
  });

  test('should show error when creating a duplicate category name', async ({ page }) => {
		const name = `Stationery_${Date.now()}`;

		await page.getByTestId('create-category-input').fill(name);
		await page.getByTestId('create-submit').click();
		await expect(page.getByText(`${name} is created`)).toBeVisible({ timeout: 8000 });

		await page.getByTestId('create-category-input').fill(name);
		await page.getByTestId('create-submit').click();

		await expect(page.getByText(/something went wrong in input form/i)).toBeVisible({ timeout: 8000 });
	});

	test('should show error when updating a category to a duplicate name', async ({ page }) => {
		const name1 = `Reading_${Date.now()}`;
		const name2 = `Writing_${Date.now()}`;

		await page.getByTestId('create-category-input').fill(name1);
		await page.getByTestId('create-submit').click();
		await expect(page.getByText(`${name1} is created`)).toBeVisible({ timeout: 8000 });

		await page.getByTestId('create-category-input').fill(name2);
		await page.getByTestId('create-submit').click();
		await expect(page.getByText(`${name2} is created`)).toBeVisible({ timeout: 8000 });

		const editButton = page.getByRole('button', { name: 'Edit' }).nth(1);
		await editButton.click();

		const updateInput = page.getByTestId('update-category-input');
		await expect(updateInput).toBeVisible({ timeout: 8000 });

		await updateInput.fill(name1); 
		await page.getByTestId('update-submit').click();

		await expect(page.getByText(/category already exists/i)).toBeVisible({ timeout: 8000 });
	});


});

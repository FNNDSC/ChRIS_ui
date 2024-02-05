import { test, expect } from "playwright-test-coverage-native";

test.describe("Create account page", () => {
  test("has fields for username and password", async ({ page }) => {
    await page.goto("/login");
    await page.goto('http://localhost:5173/');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    await page.getByLabel('signupform').fill('test-user');
    await page.locator('#chris-email').fill('testuser@example.org');
    await page.locator('#chris-password').fill('testuser1234');
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeInViewport();
    // we don't actually click the button, TODO figure out how to reuse this test account
  });
});

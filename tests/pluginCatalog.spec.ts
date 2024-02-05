import { test, expect } from "playwright-test-coverage-native";

test.describe("Plugin catalog page", () => {
  test("The page renders", async ({ page }) => {
    await page.goto('/catalog');
    await page.getByPlaceholder('Name').fill('hello world');  });
});

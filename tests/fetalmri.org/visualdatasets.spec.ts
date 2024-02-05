import { test } from "playwright-test-coverage-native";

test.describe("Fetal MRI Viewer", () => {
  test("exists", async ({ page }) => {
    await page.goto("/niivue");
  });
});

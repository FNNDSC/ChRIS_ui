import { test as baseTest, expect } from "playwright-test-coverage-native";

export * from "@playwright/test";

export const test = baseTest.extend({
  page: async ({ page }, use) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));
    await use(page);
    expect(errors).toHaveLength(0);
  },
});

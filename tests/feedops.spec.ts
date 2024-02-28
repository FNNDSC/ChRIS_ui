import { test, expect } from "./fixtures/loggedIn.ts";
import { faker } from "@faker-js/faker";
import createFeed from "./helpers/createFeedHelper";
import path from "path";

const SOME_FILE = path.join(__dirname, "..", "package-lock.json");

test("Can perform feed operations", async ({ page }) => {
  test.slow();
  await page.goto("feeds?type=private");
  const classSelector = ".ant-typography";

  const animal = faker.animal.type();
  const feedName = `A study on ${animal}`;
  await createFeed(page, feedName, SOME_FILE);
  await expect(page.getByText("Feed Created Successfully")).toBeVisible();
  const initialText = await page.locator(classSelector).innerText();
  const initialCount = parseCountFromText(initialText);
  await page.getByRole("button").first().click();
  await expect(page.locator("tbody")).toContainText(feedName);
  const labelName = `${feedName}-checkbox`;
  const firstCheckbox = page.locator(`[aria-label="${labelName}"]`).first();

  await firstCheckbox.check();

  await page.getByLabel("feed-action").nth(4).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  const tableLocator = page.locator('[aria-label="Feed Table"]');
  await tableLocator.waitFor();
  const tableCount = await tableLocator.count();
  await expect(tableCount).toBeGreaterThan(0);

  const finalText = await page.locator(classSelector).innerText();
  const countAfterDeletion = parseCountFromText(finalText);
  expect(countAfterDeletion).toBe(initialCount - 1);
});

// Helper function to parse count from text
function parseCountFromText(text: string) {
  const match = text.match(/\((\d+)\)/);
  return match ? Number(match[1]) : 0;
}

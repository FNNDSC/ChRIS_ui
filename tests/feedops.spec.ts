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

  // Add a timeout of 5000 milliseconds to wait for the "Feed Created Successfully" message
  await page.waitForSelector(':text("Feed Created Successfully")');

  const initialText = await page.locator(classSelector).innerText();
  const initialCount = parseCountFromText(initialText);

  await page.getByRole("button").first().click();

  test.slow();
  // Add a timeout of 5000 milliseconds to wait for the "tbody" to contain text
  await expect(page.locator("tbody")).toContainText(feedName);

  const labelName = `${feedName}-checkbox`;
  const firstCheckbox = page.locator(`[aria-label="${labelName}"]`).first();

  await firstCheckbox.check();

  await page.getByLabel("feed-action").nth(4).click();

  // Add a timeout of 5000 milliseconds to wait for the "Confirm" button to be visible
  await page.getByRole("button", { name: "Confirm" }).click({ timeout: 5000 });

  await page.locator('[aria-label="Loading Table"]');

  if (initialCount === 1) {
    await page.locator('[aria-label="Empty Table"]');
  } else await page.locator('[aria-label="Feed Table"]');
});
// Helper function to parse count from text
function parseCountFromText(text: string) {
  const match = text.match(/\((\d+)\)/);
  return match ? Number(match[1]) : 0;
}

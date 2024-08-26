import { test, expect } from "./fixtures/loggedIn.ts";
import { faker } from "@faker-js/faker";
import createFeed from "./helpers/createFeedHelper.ts";
import getProjectFile from "./helpers/projectFile.ts";

const SOME_FILE = getProjectFile("package-lock.json");

test("Can create a feed", async ({ page }) => {
  test.slow();
  await page.goto("feeds?type=private");
  const animal = faker.animal.type();
  const feedName = `A study on ${animal}`;
  await createFeed(page, feedName, SOME_FILE);
  await expect(page.getByText("Feed Created Successfully")).toBeVisible();
  await expect(page.locator("tbody")).toContainText(feedName);
});

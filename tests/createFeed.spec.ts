import { test, expect } from "./fixtures/loggedIn.ts";
import { faker } from "@faker-js/faker";
import path from "path";

const SOME_FILE = path.join(__dirname, "..", "package-lock.json");

test("Can create a feed", async ({ page }) => {
  await page.goto("feeds?type=private");

  const animal = faker.animal.type();
  const feedName = `A study on ${animal}`;
  const feedNote = `The ${animal} is a very noteworthy animal.`;

  await page.getByRole("button", { name: "Create Feed" }).click();
  await page.getByPlaceholder("e.g. Tractography Study").click();
  await page.getByPlaceholder("e.g. Tractography Study").fill(feedName);
  await page.getByPlaceholder("Use this field to describe").click();
  await page.getByPlaceholder("Use this field to describe").fill(feedNote);
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByText("Upload New Data").click();

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Drag 'n' drop some files here").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(SOME_FILE);

  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Create Analysis" }).click();

  await expect(page.getByText("Feed Created Successfully")).toBeVisible();
  await expect(page.locator("tbody")).toContainText(feedName);
});

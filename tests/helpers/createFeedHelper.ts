import { Page } from "playwright";
import { expect } from "../fixtures/loggedIn";
import { faker } from "@faker-js/faker";

async function createFeed(page: Page, feedName: string, SOME_FILE: string) {
  await page.goto("feeds?type=private");
  const animal = faker.animal.type();
  const feedNote = `The ${animal} is a very noteworthy animal.`;

  await page.getByRole("button", { name: "Create Feed" }).click();
  await page.getByPlaceholder("e.g. Tractography Study").click();
  await page.getByPlaceholder("e.g. Tractography Study").fill(feedName);
  await page.getByPlaceholder("Use this field to describe").click();
  await page.getByPlaceholder("Use this field to describe").fill(feedNote);
  await page.getByRole("button", { name: "Next" }).click();

  // Check if the next button is disabled.
  const nextButton = page.getByRole("button", { name: "Next" });
  await expect(nextButton).toBeDisabled();
  await page.getByText("Upload New Data").click();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText("Drag 'n' drop some files here").click();
  const fileChooser = await fileChooserPromise;

  await fileChooser.setFiles(SOME_FILE);
  await nextButton.click();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Create Analysis" }).click();
}

export default createFeed;

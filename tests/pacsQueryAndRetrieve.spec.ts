/*
 * Note: these tests are brittle because they depend on internal Patternfly v4
 * class names. This is due to the lack of accessibility on the PACS pull page.
 */

import { test, expect } from "./fixtures/loggedIn.ts";

test("Retrieve a single study and create a feed", async ({ page, baseURL }) => {
  test.skip(
    baseURL?.includes("localhost:25173") || false,
    "Testing PACS Q/R cannot be done on the global test server.",
  );

  await page.goto("/pacs");

  // When the page is done loading, the name of a PACS server should show up
  // and it should be automatically selected.
  await expect(page.getByText("MINICHRISORTHANC")).toBeVisible();

  // Search for a patient by MRN
  await page.getByLabel("Query").fill("1449c1d");
  await page.getByLabel("Query").press("Enter");

  await expect(
    page.getByText("Patient Birth Date: July 1, 2009"),
  ).toBeVisible();

  // Expand the card and check study metadata
  await page
    .locator(".pf-v5-c-card__header-toggle > .pf-v5-c-button")
    .first()
    .click();
  await expect(page.getByText("1 series, March 8, 2013")).toBeVisible();
  await expect(page.getByText("98edede8b2")).toBeVisible(); // AccessionNumber

  // Click the "Pull Study" button
  await page.locator("div:nth-child(2) > .pf-v5-c-button").click();

  // Assert that the study was pulled successfully
  await expect(
    page.locator(".pf-v5-c-progress__status > .pf-v5-c-progress__measure"),
  ).toBeVisible();
  await expect(
    page.locator(".pf-v5-c-progress__status > .pf-v5-c-progress__measure"),
  ).toHaveText("100%", { timeout: 20_000 });

  // Click the "Create feed" button
  await page
    .locator(".flex-series-item > div > div > .pf-v5-c-button")
    .first()
    .click();

  // Assert that the "Create a New Analysis" wizard appeared
  await expect(
    page.getByRole("heading", { name: "Create a New Analysis" }),
  ).toBeVisible();
  await page
    .getByPlaceholder("e.g. Tractography Study")
    .fill("Analyze patient 98edede8b2 from Playwright test");
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // "Choose files" screen
  await expect(page.getByText("Creating analysis from 1 item")).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // "Choose pipeline" screen
  await expect(page.getByRole("textbox", { name: "search" })).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  // "Review" screen

  await page.getByRole("button", { name: "Create Analysis" }).click();
  // wait for the wizard to close itself after feed is created
  await expect(page.locator(".pf-v5-c-wizard")).not.toBeVisible();
  await expect(
    page.getByText("Analyze patient 98edede8b2 from Playwright test"),
  ).toBeVisible();
});

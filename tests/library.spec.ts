import { test, expect } from "./fixtures/loggedIn.ts";
import path from "path";

test("Tests File Uploads", async ({ page }) => {
  //Avoids timeouts.
  test.slow();
  await page.goto("library");

  const modalSelector = "[role='dialog']";

  // Click on the button to trigger the modal
  await page.getByRole("button", { name: /upload/i }).click();

  // Wait for the modal to appear
  await page.waitForSelector(modalSelector);

  // Get a handle to the modal element
  const modalElementHandle = await page.$(modalSelector);

  // Now you can interact with the modal as needed
  // Example: assert that modal content is visible

  if (modalElementHandle) {
    const isModalVisible = await modalElementHandle.isVisible();
    expect(isModalVisible).toBeTruthy();

    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: /upload files/i }).click();
    const fileChooser = await fileChooserPromise;

    const SOME_FILE = path.join(__dirname, "..", "package-lock.json");
    await fileChooser.setFiles(SOME_FILE);

    await page.waitForSelector("input[name='horizontal-form-name']");

    // Extract the file name from the file-name div
    const fileName = await page.$eval(
      ".file-name-text",
      (element: HTMLDivElement) => element.innerText,
    );

    // Check if the file name is 'package-lock.json'
    expect(fileName).toBe("package-lock.json");

    // Correct the selector for the "Push to File Storage" button
    await page
      .getByRole("button", {
        name: /push to file storage/i,
      })
      .click();

    const username = await page.$eval(
      ".pf-v5-c-menu-toggle__text",
      (element) => element.textContent,
    );

    const directoryNameValue = await page.$eval(
      "input[name='horizontal-form-name']",
      (element: HTMLInputElement) => element.value,
    );
    const expectedURL = `/library/${username}/uploads/${directoryNameValue}`;

    // Start waiting for the progress measure to be 100%
    await page.waitForFunction(() => {
      const progressMeasure = document.querySelector(
        ".pf-v5-c-progress__measure",
      );
      return progressMeasure && progressMeasure.textContent === "100%";
    });

    // Click the close button to close the modal
    await page.click("[aria-label='Close']");
    expect(page.url()).toContain(expectedURL);
  }
});

import { Page, expect } from "@playwright/test";

/**
 * Workaround for Patternfly and its mobile layout.
 *
 * The sidebar is always expanded by default. Some time around when the page
 * is done loading, if Patternfly detects the screen width is too narrow, it
 * will collapse the sidebar. However, the button to collapse the sidebar
 * becomes interactive before that check happens.
 *
 * So to access the sidebar on mobile during first launch, we retry expanding
 * the sidebar twice as a workaround.
 */
async function retryExpandSidebar(page: Page) {
  await expect(async () => {
    await page.getByLabel("Global navigation").tap({ timeout: 500 });
    await page.waitForTimeout(1000); // sidebar animation
    await expect(
      page.getByRole("link", { name: "New and Existing Analyses" }),
    ).toBeInViewport({ timeout: 1000 });
  }).toPass({
    intervals: [100],
    timeout: 3000,
  });
}

export default retryExpandSidebar;

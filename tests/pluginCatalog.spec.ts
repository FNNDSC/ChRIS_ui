import { test, expect } from "./fixtures/notLoggedIn.ts";
import * as clipboard from "./helpers/clipboard.ts";

test.describe("Plugin catalog page", () => {
  test("Can copy plugin URL of pl-mri10yr06mo01da_normal", async ({
    page,
    context,
    browserName,
  }) => {
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }

    await page.goto("/catalog");
    await page.getByPlaceholder("Name").fill("mri10yr");
    await page.getByText("pl-mri10yr06mo01da_normal").click();
    await page.getByRole("link", { name: "Anonymized reference MRI" }).click();

    await page
      .locator(".pf-v5-c-clipboard-copy__group .pf-v5-c-button")
      .click({ delay: 500 });
    await expect(page.getByText("Copied")).toBeVisible();

    // paste from clipboard doesn't seem to work on Safari
    if (browserName !== "webkit") {
      await page.goto("/catalog");
      await page.getByPlaceholder("Name").focus();
      await clipboard.ctrlV(page);
      await expect(page.getByPlaceholder("Name")).toHaveValue(
        /https:\/\/.+\/api\/v1\/plugins\/\d+\//,
      );
    }
  });
});

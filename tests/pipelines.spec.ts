import { test } from "./fixtures/notLoggedIn.ts";

test("Pipelines Page", async ({ page }) => {
  test.slow();
  await page.goto("/pipelines");
});

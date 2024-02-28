import * as loggedIn from "../fixtures/loggedIn";
import * as loggedOut from "../fixtures/notLoggedIn";
import { Page, expect } from "@playwright/test";
import retryExpandSidebar from "../helpers/expandSidebar";

loggedIn.test(
  "Shows a volume when page is navigated to (not logged in)",
  gotoVolumeView,
);

loggedOut.test(
  "Shows a volume when page is navigated to (logged out)",
  gotoVolumeView,
);

async function gotoVolumeView({ page }: { page: Page }) {
  await page.goto("/");
  await retryExpandSidebar(page);
  await page.getByRole("link", { name: "Volume View" }).click();
  await expect(
    page,
    "Volume View redirects immediately to the NiivueDatasetViewer",
  ).toHaveURL(/\/niivue\/\d+.*/);
}

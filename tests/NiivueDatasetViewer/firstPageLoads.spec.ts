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

async function gotoVolumeView({
  page,
  isMobile,
}: { page: Page; isMobile: boolean }) {
  await page.goto("/");
  if (isMobile) {
    await retryExpandSidebar(page);
  }

  const expectedUrls = [
    "**/api/v1/files/2100/serag_template.nii.gz",
    "**/api/v1/files/2157/serag_template.nii.gz.chrisvisualdataset.volume.json",
  ];
  const expectedRes = expectedUrls.map((url) => page.waitForResponse(url));

  await page.getByRole("link", { name: "Volume View" }).click();
  await expect(
    page,
    "Volume View redirects immediately to the NiivueDatasetViewer",
  ).toHaveURL(/\/niivue\/\d+.*/);

  const viewportSize = page.viewportSize();
  if (viewportSize === null) {
    throw new Error("viewportSize is null");
  }

  await expect
    .poll(async () => {
      const box = await page.locator("canvas").boundingBox();
      return box?.height || 0;
    }, "Canvas height should be at least 3/4 of viewport")
    .toBeGreaterThan((viewportSize.height * 3) / 4);
  await expect
    .poll(async () => {
      const box = await page.locator("canvas").boundingBox();
      return box?.width || 0;
    }, "Canvas width should be at least 1/2 of viewport")
    // A lot of leeway because of a bug.
    // https://github.com/FNNDSC/ChRIS_ui/issues/1083
    .toBeGreaterThan(viewportSize.width * 0.4);

  const responses = await Promise.all(expectedRes);
  const responseResults = await Promise.all(
    responses.map((res) => res.finished()),
  );
  responseResults.forEach((result, i) =>
    expect(
      result,
      `Page should successfully GET ${expectedUrls[i]}`,
    ).toBeNull(),
  );
}

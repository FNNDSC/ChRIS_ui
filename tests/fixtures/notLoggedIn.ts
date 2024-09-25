import * as fs from "node:fs";
import * as path from "node:path";

import { test as baseTest, expect } from "@playwright/test";

export * from "@playwright/test";

const istanbulCLIOutput = path.join(process.cwd(), ".nyc_output");

export const test = baseTest.extend({
  // Add code coverage
  // https://github.com/mxschmitt/playwright-test-coverage/blob/1131802a77b1e7c8d21714a32971f27d1d455b60/e2e/baseFixtures.ts
  context: async ({ context }, use, testInfo) => {
    const testTitle = testInfo.title.replaceAll("/", "_");
    const projectName = testInfo.project.name;

    await context.addInitScript(() =>
      window.addEventListener("beforeunload", () =>
        (window as any).collectIstanbulCoverage(
          JSON.stringify((window as any).__coverage__),
        ),
      ),
    );
    await fs.promises.mkdir(istanbulCLIOutput, { recursive: true });
    await context.exposeFunction(
      "collectIstanbulCoverage",
      (coverageJSON: string) => {
        if (coverageJSON)
          fs.writeFileSync(
            path.join(istanbulCLIOutput, `[${projectName}] ${testTitle}.json`),
            coverageJSON,
          );
      },
    );
    await use(context);
    for (const page of context.pages()) {
      await page.evaluate(() =>
        (window as any).collectIstanbulCoverage(
          JSON.stringify((window as any).__coverage__),
        ),
      );
    }
  },

  // Assert no uncaught exceptions
  page: async ({ page }, use) => {
    const errors: Error[] = [];
    page.on("pageerror", (error) => errors.push(error));
    await use(page);
    expect(errors).toHaveLength(0);
  },
});

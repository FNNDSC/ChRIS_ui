import { test as baseTest } from "./notLoggedIn";
import fs from "fs";
import path from "path";
import { faker } from "@faker-js/faker";
import createAccountHelper from "../helpers/createAccount";

export * from "@playwright/test";

// create new user account for each worker
// https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker
export const test = baseTest.extend<{}, { workerStorageState: string }>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`,
      );

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });

      // create a new user account
      const username = faker.internet.userName();
      const email = faker.internet.email();
      const password = `testuser1234`;
      const baseURL = test.info().project.use.baseURL as string;
      await createAccountHelper(baseURL, page, username, email, password);

      await page.context().storageState({ path: fileName });
      await page.close();
      await use(fileName);
    },
    { scope: "worker" },
  ],
});

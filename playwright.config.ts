import { defineConfig, devices, PlaywrightTestConfig } from "playwright-test-coverage-native";


const SAFARI_BROWSERS: PlaywrightTestConfig["projects"] = [];

if (process.env.TEST_SAFARI?.toLowerCase().startsWith('y')) {
  SAFARI_BROWSERS.push(
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  );
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  testIgnore: "**/fetalmri.org/**",
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: "./__snapshots__",
  /* Maximum time one test can run for. */
  timeout: 10 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    baseURL: "http://localhost:5173",
  },

  /* Configure projects for major browsers */
  projects: [
    // NOTE: our goal here isn't to extensively test Niivue, all we need is a working WebGL2!
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        coverageDir: './coverage/tmp',
        coverageSrc: './src',
        coverageSourceMapHandler: 'localhosturl'
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },

    ...SAFARI_BROWSERS
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
  },
});

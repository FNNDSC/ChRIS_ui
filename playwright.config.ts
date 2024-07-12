import { defineConfig, devices, PlaywrightTestConfig } from "@playwright/test";

const SAFARI_BROWSERS: PlaywrightTestConfig["projects"] = [];

const SHOULD_TEST_SAFARI = getBoolEnvVar('TEST_SAFARI');
const SHOULD_TEST_LOCALLY = getBoolEnvVar('TEST_LOCAL');

if (SHOULD_TEST_SAFARI) {
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
 * Name of a npm script which starts a UI development server.
 */
const UI_SCRIPT = SHOULD_TEST_LOCALLY ? 'dev' : 'dev:public';
/**
 * Port number (on localhost) for the server created by {@link UI_SCRIPT}
 */
const UI_PORT = SHOULD_TEST_LOCALLY ? 5173 : 25173;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* A script which deletes the previous coverage data */
  globalSetup: require.resolve('./deleteCoverageData'),

  testDir: "./tests",
  /* The base directory, relative to the config file, for snapshot files created with toMatchSnapshot and toHaveScreenshot. */
  snapshotDir: "./__snapshots__",
  /* Maximum time one test can run for. */
  timeout: 30_000,
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
    baseURL: `http://localhost:${UI_PORT}`,
  },

  /* Configure projects for major browsers */
  projects: [
    // NOTE: our goal here isn't to extensively test Niivue, all we need is a working WebGL2!
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
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
    command: `env USE_BABEL_PLUGIN_ISTANBUL=y CI=true npm run ${UI_SCRIPT}`,
    url: `http://localhost:${UI_PORT}`,
    reuseExistingServer:true
  },
});

/**
 * Get a boolean value from an environment variable.
 */
function getBoolEnvVar(name: string): boolean {
  return process.env[name]?.toLowerCase().startsWith('y') || false;
}

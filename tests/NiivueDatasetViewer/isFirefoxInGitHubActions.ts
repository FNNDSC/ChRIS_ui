/**
 * Detects whether test is Firefox in GitHub Actions, in which case the test
 * should be skipped because WebGL won't work.
 *
 * - https://github.com/microsoft/playwright/issues/21783
 * - https://github.com/microsoft/playwright/issues/11566
 */
function isFirefoxInGitHubActions(browserName: string): boolean {
  return (
    process.env.CI === "true" &&
    !!process.env.GITHUB_ACTION &&
    browserName === "firefox"
  );
}

export default isFirefoxInGitHubActions;

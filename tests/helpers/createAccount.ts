import { Page } from "playwright";

async function createAccountHelper(
  url: string,
  page: Page,
  username: string,
  email: string,
  password: string,
) {
  await page.goto(url);
  await page.getByRole("button", { name: "Sign Up" }).click();
  await page.locator("#chris-username").fill(username);
  await page.locator("#chris-email").fill(email);
  await page.locator("#chris-password").fill(password);
  await page.getByRole("button", { name: "Create Account" }).click();
  // wait for ChRIS_ui to redirect us back to the homepage
  // after successful account creation
  await page.waitForURL(url);
}

export default createAccountHelper;

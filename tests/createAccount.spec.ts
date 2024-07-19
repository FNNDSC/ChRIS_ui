import { test, expect } from "./fixtures/notLoggedIn.ts";
import createAccountHelper from "./helpers/createAccount.ts";
import { faker } from "@faker-js/faker";

test("Can create new user accounts", async ({ page, baseURL }) => {
  test.slow();

  const username = faker.internet.userName();
  const email = faker.internet.email();
  const password = "testuser1234";
  await createAccountHelper("/", page, username, email, password);

  // account options menu should appear after being logged in
  await page.getByRole("button", { name: username }).click();
  // account options menu should have a "Sign out" button
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(
    page.getByRole("button", { name: "Login" }),
    "login button should reappear after signing out",
  ).toBeInViewport();
  // TODO make sure user's private data is no longer there
});

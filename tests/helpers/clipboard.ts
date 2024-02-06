/**
 * Helper functions for copy-paste.
 *
 * https://github.com/microsoft/playwright/issues/8114#issuecomment-1584033229
 */

import { Page } from "playwright";
import * as os from "os";

export async function ctrlC(page: Page): Promise<void> {
  const isMac = os.platform() === "darwin";
  const modifier = isMac ? "Meta" : "Control";
  await page.keyboard.press(`${modifier}+KeyC`);
}

export async function ctrlV(page: Page): Promise<void> {
  const isMac = os.platform() === "darwin";
  const modifier = isMac ? "Meta" : "Control";
  await page.keyboard.press(`${modifier}+KeyV`);
}

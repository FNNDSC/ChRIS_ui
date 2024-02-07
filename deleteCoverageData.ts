import { FullConfig } from "playwright/test";
import path from "path";
import * as fsPromises from "node:fs/promises";

async function globalSetup(_config: FullConfig) {
  const nycOutput = path.join(process.cwd(), ".nyc_output");
  await fsPromises.rm(nycOutput, { recursive: true, force: true });
}

export default globalSetup;

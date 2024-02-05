import { defineConfig } from "playwright-test-coverage-native";
import baseConfig from "./playwright.config.ts";

export default defineConfig(baseConfig, {
  testDir: "./tests/fetalmri.org",
  testIgnore: undefined,
});

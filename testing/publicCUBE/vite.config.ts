import { mergeConfig } from "vite";
import viteConfig from "../../vite.config";

// use an existing CUBE running on NERC
export default mergeConfig(viteConfig, {
  envDir: "./testing/publicCUBE",
  server: {
    port: 25173,
  },
});

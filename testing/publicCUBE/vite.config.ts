import { mergeConfig } from "vite";
import viteConfig from './vite.config';

// use an existing CUBE running on NERC
export default mergeConfig(viteConfig, {
  envDir: './',
  server: {
    port: 25173
  }
});

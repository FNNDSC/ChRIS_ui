import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import macrosPlugin from "vite-plugin-babel-macros";
import IstanbulPlugin from "vite-plugin-istanbul";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Workaround for the ✘ [ERROR] Failed to resolve entry for package "fs". The package may have incorrect main/module/exports specified in its package.json. [plugin vite:dep-pre-bundle]
    nodePolyfills({
      include: ["fs"],
    }),
    macrosPlugin(), // used for getting version string
    ...(process.env.USE_BABEL_PLUGIN_ISTANBUL
      ? [
          IstanbulPlugin({
            include: "src/*",
            exclude: ["node_modules", "test/"],
            extension: [".js", ".ts", ".tsx"],
          }),
        ]
      : []),
  ],
  build: {
    sourcemap: !!process.env.USE_BABEL_PLUGIN_ISTANBUL,
  },
  resolve: {
    alias: {
      // workaround for "Cornerstone3D tools does not build with vite"
      // https://github.com/cornerstonejs/cornerstone3D/issues/1071
      "@cornerstonejs/tools": "@cornerstonejs/tools/dist/umd/index.js",
    },
  },
});

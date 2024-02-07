import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import macrosPlugin from "vite-plugin-babel-macros";
import IstanbulPlugin from "vite-plugin-istanbul";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    macrosPlugin(),  // used for getting version string
    ...(process.env.USE_BABEL_PLUGIN_ISTANBUL ? [IstanbulPlugin({
      include: "src/*",
      exclude: [ "node_modules", "test/" ],
      extension: [ ".js", ".ts", ".tsx" ],
    })] : [])
  ],
  build: {
    sourcemap: !!process.env.USE_BABEL_PLUGIN_ISTANBUL
  },
  resolve: {
    alias: {
      "cornerstone-nifti-image-loader":
        "@cornerstonejs/nifti-image-loader/dist/cornerstoneNIFTIImageLoader.min.js",
    },
  },
});

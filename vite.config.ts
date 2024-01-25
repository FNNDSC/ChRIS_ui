import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import macrosPlugin from "vite-plugin-babel-macros";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    macrosPlugin()  // used for getting version string
  ],
  resolve: {
    alias: {
      "cornerstone-nifti-image-loader":
        "@cornerstonejs/nifti-image-loader/dist/cornerstoneNIFTIImageLoader.min.js",
    },
  },
});

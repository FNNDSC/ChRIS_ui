import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "cornerstone-nifti-image-loader":
        "@cornerstonejs/nifti-image-loader/dist/cornerstoneNIFTIImageLoader.min.js",
    },
  },
});

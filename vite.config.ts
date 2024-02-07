import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import IstanbulPlugin from "vite-plugin-istanbul";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    sourcemap: !!process.env.USE_BABEL_PLUGIN_ISTANBUL
  },
  plugins: [
    react(),
    ...(process.env.USE_BABEL_PLUGIN_ISTANBUL ? [IstanbulPlugin({
      include: "src/*",
      exclude: [ "node_modules", "test/" ],
      extension: [ ".js", ".ts", ".tsx" ],
    })] : [])
  ],
  resolve: {
    alias: {
      "cornerstone-nifti-image-loader":
        "@cornerstonejs/nifti-image-loader/dist/cornerstoneNIFTIImageLoader.min.js",
    },
  },
});

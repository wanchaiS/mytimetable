import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target:
          "https://jie8ry86fa.execute-api.ap-southeast-2.amazonaws.com/V1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^.*\/api/, ""),
      },
    },
  },
  base: "/mytimetable",
});

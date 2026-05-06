import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 公网部署到 Vercel、Netlify 或独立域名根路径时保持根路径，
  // 这样图片继续使用 /art/topicXX/pageXX.png。
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  server: {
    host: "127.0.0.1",
  },
});

/*Tentando dar deploy na Vercel */
/*import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
});*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "./",  // <--- ISSO OBRIGA O VITE A OLHAR PARA O PRÓPRIO PÉ
  build: {
    outDir: "dist",
  }
});

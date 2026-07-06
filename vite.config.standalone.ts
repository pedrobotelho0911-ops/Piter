import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// Build alternativo: gera um único arquivo HTML autocontido (JS e CSS embutidos)
// para abrir direto no navegador via file://, sem precisar de servidor.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist-standalone",
    cssCodeSplit: false,
  },
});

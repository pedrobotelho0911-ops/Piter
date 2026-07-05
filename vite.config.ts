import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Base "/Piter/" para servir via GitHub Pages (pedrobotelho0911-ops.github.io/Piter/);
// "/" apenas no `vite dev`, já que `vite preview` também serve o build de produção.
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/Piter/" : "/",
  plugins: [react()],
}));

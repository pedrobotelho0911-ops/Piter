import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Base "/Piter/rotina/" para servir via GitHub Pages, numa subpasta ao lado do Piter
// Finanças (que continua na raiz "/Piter/"); "/" apenas no `vite dev`, já que
// `vite preview` também serve o build de produção.
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/Piter/rotina/" : "/",
  plugins: [react(), tailwindcss()],
}));

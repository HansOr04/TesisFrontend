import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "node:path";

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/routeTree.gen.ts",
      quoteStyle: "double",
      // Cada ruta se carga bajo demanda (chunk por pantalla).
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Librerías pesadas en chunks propios y cacheables.
        manualChunks: {
          react: ["react", "react-dom"],
          router: ["@tanstack/react-router", "@tanstack/react-query"],
          charts: ["recharts"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
            "lucide-react",
          ],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // En desarrollo el frontend habla con el backend en el mismo origen
      // vía proxy; VITE_API_URL vacío usa este proxy.
      "/api": {
        target: process.env.VITE_PROXY_TARGET ?? "http://localhost:3100",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
        ws: true,
        // La cookie de refresh se emite con Path=/auth; detrás del proxy el
        // navegador la necesita en /api/auth para enviarla al renovar.
        cookiePathRewrite: { "/auth": "/api/auth" },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test-setup.ts",
        "src/routeTree.gen.ts",
      ],
      reporter: ["text-summary", "lcov", "json-summary"],
      // Mínimos actuales: solo pueden subir. La cobertura de la web es baja
      // (las páginas no tienen pruebas); subirlos a medida que se agreguen.
      // Vitest 4 ya cuenta las ramas y funciones de los archivos sin pruebas
      // (antes salían casi al 100 %): con las mismas pruebas, 45 y 25 pasaron
      // a 5,8 y 5,9.
      thresholds: { statements: 5.9, branches: 5, functions: 5, lines: 6 },
    },
  },
});

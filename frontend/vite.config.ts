import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'clerk': ['@clerk/clerk-react'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
          'query': ['@tanstack/react-query'],
        },
      },
    },
    // Use esbuild for minification (faster and included by default)
    minify: 'esbuild',
    // Inline small CSS files to reduce requests
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // Inline assets < 4kb
  },
  // CSS optimization
  css: {
    devSourcemap: mode === 'development',
  },
}));

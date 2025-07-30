import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    },
    headers: {
      'Cache-Control': 'no-cache'
    }
  },
  resolve: {
    alias: {
      '@': './scripts'
    }
  }
});

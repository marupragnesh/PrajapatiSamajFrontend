import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — React plugin + dev server on port 5173
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward /uploads/* requests to Spring Boot (images served by backend)
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});

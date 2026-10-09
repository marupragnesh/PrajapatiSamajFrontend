import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config — React plugin + dev server on port 5173
export default defineConfig({
  plugins: [react()],
  envPrefix: ['VITE_', 'GOOGLE_'], // Allows reading both VITE_ and GOOGLE_ variables in client bundle
  server: {
    host: true, // Exposes dev server on local network (e.g. http://192.168.x.x:5173 for mobile testing)
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

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works when served by the backend or any static host.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
});

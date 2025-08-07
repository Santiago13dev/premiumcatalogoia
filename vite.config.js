import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.', // 👈 necesario para que Vite encuentre public/index.html
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  build: {
    outDir: 'dist', // por si lo necesitas explícito
    emptyOutDir: true
  }
});

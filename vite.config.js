import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración para Vite. Usa el plugin de React para habilitar JSX y Fast Refresh.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
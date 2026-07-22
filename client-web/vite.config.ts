import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 4170,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4171',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});

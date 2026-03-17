import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Allows conections in local networks/linux
    port: 5173,
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    }
  }
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ensure trailing ./ for clarity
    },
  },
  optimizeDeps: {
    include: ['lucide-react'], // include it instead of exclude if you're using tree-shaking or dynamic imports
  },
});

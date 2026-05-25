import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',          // CRITICAL for Electron – absolute paths break file:// loading
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

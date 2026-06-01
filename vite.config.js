import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['maplibre-gl'],
    esbuildOptions: {
      target: 'es2022',
    },
  },
  build: {
    target: 'es2022',
  },
})

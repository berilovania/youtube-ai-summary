// frontend/vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/summarize': 'http://localhost:8000',
      '/export': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})

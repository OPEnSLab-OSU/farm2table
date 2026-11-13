import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dev only: forward /api/* to the Express backend so React can use
    // relative URLs like fetch('/api/stations') without CORS errors.
    // Start the backend first: cd backend && npm run dev
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})

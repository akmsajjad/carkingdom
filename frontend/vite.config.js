import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy API calls to the Django dev server.
    //
    // The browser only ever talks to the Vite origin, so requests are
    // same-origin: no CORS preflight, and cookies behave normally. Frontend
    // code calls bare /api/... paths with no base URL to configure, which is
    // also what production looks like when both are served from one origin.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass(req) {
          const accept = req.headers?.accept ?? ''
          if (req.method === 'GET' && accept.includes('text/html')) {
            return '/index.html'
          }
          return undefined
        },
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        bypass(req) {
          const accept = req.headers?.accept ?? ''
          if (req.method === 'GET' && accept.includes('text/html')) {
            return '/index.html'
          }
          return undefined
        },
      },
    },
  },
})

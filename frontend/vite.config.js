import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// During development React runs on :5173 and Flask on :5000.
// The proxy forwards API calls to Flask so cookies and fetch('/issues') just work.
const FLASK = 'http://127.0.0.1:5000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/issues': FLASK,
      '/me': FLASK,
      '/login': FLASK,
      '/register': FLASK,
      '/logout': FLASK,
    },
  },
})

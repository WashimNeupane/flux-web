import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0)
    strictPort: true,
    port: 5173,
    watch: {
      usePolling: true // Better for WSL
    }
  }
})

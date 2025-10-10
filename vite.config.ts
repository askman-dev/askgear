import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: mode === 'development' ? {
      protocol: 'wss',
      clientPort: 443
    } : undefined
  },
  preview: {
    host: '0.0.0.0',
    port: 5000
  }
}))

import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  // If env overrides are provided (e.g. in HTTPS proxy environments), use them.
  // Otherwise let Vite auto-detect HMR endpoint so it follows the actual dev port.
  const envHmr = process.env.VITE_HMR_HOST
    ? {
        protocol: process.env.VITE_HMR_PROTOCOL || 'wss',
        host: process.env.VITE_HMR_HOST,
        clientPort: Number(process.env.VITE_HMR_CLIENT_PORT) || 443,
      }
    : true

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
        '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
        '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
        '@store': fileURLToPath(new URL('./src/store', import.meta.url)),
      },
    },
    optimizeDeps: {
      exclude: ['zod'],
    },
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: false, // allow Vite to pick a new port on conflict
      allowedHosts: true,
      hmr: isDev ? envHmr : undefined,
      watch: {
        usePolling: true,
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 5000,
    },
  }
})

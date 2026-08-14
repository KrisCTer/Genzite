import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../../infra', '')
  return {
    envDir: '../../infra',
    define: {
      'process.env': {},
      // Explicitly inject from loaded env (for local dev) OR process.env (for Docker)
      'import.meta.env.VITE_API_URL': JSON.stringify(
        process.env.VITE_API_URL || env.VITE_API_URL || 'http://localhost:3000/api/v1'
      ),
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    optimizeDeps: {
      include: ['framer-motion', '@emotion/is-prop-valid']
    }
  }
})


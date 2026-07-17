import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  envDir: '../../infra',
  define: {
    'process.env': {},
    // Explicitly inject from process.env so Docker ARG is baked into the bundle
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:3000/api/v1'
    ),
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['framer-motion', '@emotion/is-prop-valid']
  }
})


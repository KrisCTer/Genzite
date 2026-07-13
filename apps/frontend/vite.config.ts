import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  envDir: '../../infra',

  define: {
    'process.env': {},
  },

  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    dedupe: ['react', 'react-dom'],
  },

  optimizeDeps: {
    include: ['framer-motion', '@emotion/is-prop-valid'],
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'genzite-alb-319745611.us-east-1.elb.amazonaws.com',
      'codespheree.id.vn',
    ],
    hmr: false,
  },
})

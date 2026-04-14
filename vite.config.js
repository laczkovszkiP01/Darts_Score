import { defineConfig } from 'vite'
import { loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const backendEnv = loadEnv(mode, './backend', '')
  const backendPort = backendEnv.PORT || '5000'

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/**/*.test.{js,jsx,ts,tsx}'],
      exclude: ['backend/**']
    },
    server: {
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          rewrite: (path) => path
        }
      }
    }
  }
})

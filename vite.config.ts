import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode
  // The third parameter '' ensures all env variables are loaded, not just those prefixed with VITE_
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    server: {
      proxy: {
          '/rajaongkir': {
              // Use environment variable for target, with a fallback
              target: env.VITE_RAJAONGKIR_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/rajaongkir/, ''),
          },
          '/api': {
              // Use environment variable for target, with a fallback
              target: env.VITE_PB_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
          },
    },
  }
}})

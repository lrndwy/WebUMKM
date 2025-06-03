import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(() => {
  return {
    envDir: '../', // Specify the root directory for .env files
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
              target: process.env.VITE_RAJAONGKIR_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/rajaongkir/, ''),
          },
          '/api': {
              // Use environment variable for target, with a fallback
              target: process.env.VITE_PB_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
          },
    },
  }
}})

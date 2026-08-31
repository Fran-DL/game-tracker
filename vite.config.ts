import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { igdbDevProxy } from './vite-plugins/igdbDevProxy.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Tercer argumento '' = cargar TODAS las variables del .env, no solo las
  // que empiezan con VITE_ (esas son las únicas que Vite expone al cliente).
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      igdbDevProxy({
        clientId: env.TWITCH_CLIENT_ID,
        clientSecret: env.TWITCH_CLIENT_SECRET,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
  }
})
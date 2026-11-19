import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const proxy = { '/api': env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000' }
  return { plugins: [react(), tailwind()], server: { proxy }, preview: { proxy } }
})

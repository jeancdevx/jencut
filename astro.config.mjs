import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [react()],
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1', port: 4321 },
  vite: {
    plugins: [tailwindcss()],
    server: { proxy: { '/api': 'http://127.0.0.1:4318' } }
  }
})

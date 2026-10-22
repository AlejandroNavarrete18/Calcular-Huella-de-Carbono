import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // En desarrollo, las llamadas a /api se redirigen al servidor de correo (carpeta /server).
    // Así el navegador siempre habla con un único origen y no hay problemas de CORS.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})

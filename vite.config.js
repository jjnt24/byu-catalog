import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      '5b12ad1c284e.ngrok-free.app'
    ]
    },
    historyApiFallback: true
})

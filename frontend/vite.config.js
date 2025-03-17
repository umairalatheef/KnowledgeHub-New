import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Required for external access in Docker
    watch: {
      usePolling: true, // Helps Docker detect file changes
      interval: 300,    // Polling interval for better performance
    },
  },
})

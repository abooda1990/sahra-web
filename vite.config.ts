import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base : '/app/',
    server: {
    proxy: {
      '/player_api.php': 'http://localhost:3000',
      '/web': 'http://localhost:3000',
      '/movie': 'http://localhost:3000',
       '/series': 'http://localhost:3000',
    },
  },
})

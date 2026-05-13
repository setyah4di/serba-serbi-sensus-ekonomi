import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'assets',
      resolveId(id) {
        if (id.endsWith('.pdf')) {
          return id;
        }
      },
      load(id) {
        if (id.endsWith('.pdf')) {
          return `export default "${id}";`;
        }
      }
    },
    tailwindcss(),
  ],
})
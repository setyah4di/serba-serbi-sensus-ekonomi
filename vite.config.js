import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

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
    
    // Konfigurasi PWA
    VitePWA({
      registerType: 'autoUpdate',
      // Bagian includeAssets dihapus karena tidak ada robots.txt dan favicon.svg
      manifest: {
        name: 'Serba Serbi SE',
        short_name: 'SerbaSerbi',
        description: 'Aplikasi Monitoring Sensus Ekonomi',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo_bps.png', // Menggunakan logo bps Anda
            sizes: '192x192',   // Browser akan otomatis menyesuaikan
            type: 'image/png',
            purpose: 'any maskable' // Penting agar logo tidak terpotong di HP
          },
          {
            src: 'logo_bps.png', // Menggunakan logo bps Anda
            sizes: '512x512',   // Browser akan otomatis menyesuaikan
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.csv$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'csv-data-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          },
          {
            urlPattern: /\.(?:pdf)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pdf-files-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ],
})
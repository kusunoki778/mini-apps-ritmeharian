import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import type { Connect, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

// Berkas APK disajikan di akar situs supaya bisa diunduh dari aplikasi web.
// Kandidat pertama adalah APK rilis bertanda tangan, lalu debug, lalu salinan di akar repo.
const APK_CANDIDATES = [
  'android/app/build/outputs/apk/release/app-release.apk',
  'android/app/build/outputs/apk/debug/app-debug.apk',
  'Nadi.apk',
];

function findApk(): string | null {
  for (const candidate of APK_CANDIDATES) {
    const full = resolve(candidate);
    if (existsSync(full)) return full;
  }
  return null;
}

// Menyediakan /Nadi.apk di dev dan preview tanpa menaruh berkas di public,
// supaya APK tidak ikut masuk ke bundel web maupun ke dalam APK native.
function serveApk(): Plugin {
  const handler: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url || !req.url.startsWith('/Nadi.apk')) {
      next();
      return;
    }

    const apk = findApk();
    if (!apk) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Berkas APK belum dibangun.');
      return;
    }

    const { size } = statSync(apk);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="Nadi.apk"');
    res.setHeader('Content-Length', size);
    createReadStream(apk).pipe(res);
  };

  return {
    name: 'nadi-serve-apk',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  plugins: [
    serveApk(),
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'prompt',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'Nadi',
        short_name: 'Nadi',
        description: 'Jam, cuaca, kualitas udara, agenda, catatan, dan alarm dalam satu dasbor.',
        start_url: '/',
        display: 'standalone',
        background_color: '#F7F4EE',
        theme_color: '#F7F4EE',
        lang: 'id',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-weather',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 40, maxAgeSeconds: 3600 },
            },
          },
          {
            urlPattern: /^https:\/\/air-quality-api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-air',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 40, maxAgeSeconds: 3600 },
            },
          },
          {
            urlPattern: /^https:\/\/geocoding-api\.open-meteo\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-geocoding',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 20, maxAgeSeconds: 86400 },
            },
          },
        ],
      },
    }),
  ],
  // host true supaya ponsel di Wi-Fi yang sama bisa membuka situs dan mengunduh APK.
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});

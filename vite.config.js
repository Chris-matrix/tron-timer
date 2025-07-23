import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    headers: {
      'Accept-Ranges': 'bytes',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type',
    },
    fs: {
      // Allow serving files from one level up from the package root
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code into separate chunk
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'styled-components'],
          // Split audio files into a separate chunk
          audio: ['/public/sounds/*.mp3'],
        },
      },
    },
  },
  assetsInclude: ['**/*.mp3', '**/*.wav', '**/*.ogg'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'styled-components'],
  },
});

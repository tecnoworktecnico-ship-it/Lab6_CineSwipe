import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { compression } from 'vite-plugin-compression2'

export default defineConfig({
  plugins: [
    react(),
    // Genera archivos .gz y .br para servir con compresión real
    compression({ algorithm: 'gzip', exclude: [/\.(br)$/, /\.(gz)$/] }),
    compression({ algorithm: 'brotliCompress', exclude: [/\.(gz)$/, /\.(br)$/] }),
  ],
  build: {
    minify: 'terser',
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.info'],
        passes: 2,
        ecma: 2020,
      },
      mangle: { safari10: true },
      format: { comments: false },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'vendor-react-dom';
            if (id.includes('react')) return 'vendor-react';
            return 'vendor-others';
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    reportCompressedSize: true,
  },
})

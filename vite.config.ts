import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 2999,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:2998',
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('API proxy error:', err);
          });
        }
      },
      '/static': {
        target: 'http://127.0.0.1:2999',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/static/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Static proxy error:', err);
          });
        }
      },
    }
  },
  build: {
    outDir: 'ismismcube',
    assetsDir: '',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  },
  base: command === 'build' ? '/static/ismismcube/' : '/'
}))

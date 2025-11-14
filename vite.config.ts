import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vitePrerenderPlugin } from 'vite-prerender-plugin'
import { resolve } from 'path'

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    vitePrerenderPlugin({
      prerenderScript: resolve(__dirname, 'src/prerender.ts'),
      renderTarget: '#app'
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 2000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:1998',
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
        target: 'http://127.0.0.1:1999',
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
    outDir: 'deployment',
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

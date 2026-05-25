import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',  // ← Esto es importante para rutas relativas
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
  ,
  server: {
    proxy: {
      // Proxy development requests starting with /api to the Azure Function host
      '/api': {
        // Proxy to the remote host's /api path so requests to /api/XYZ
        // are forwarded to https://.../api/XYZ (no 404 from missing /api)
        target: 'https://cn-pokedex-gneghta4dycxh8dt.eastus-01.azurewebsites.net/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  }
})
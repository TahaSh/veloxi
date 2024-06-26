import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import react from '@vitejs/plugin-react'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Veloxi',
      fileName: (format) => `veloxi.${format === 'es' ? 'js' : 'min.js'}`
    }
  },

  plugins: [dts({ rollupTypes: true }), react()]
})

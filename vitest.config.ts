import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@validations': fileURLToPath(new URL('./src/validations', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@paginas': fileURLToPath(new URL('./src/paginas', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@vistas': fileURLToPath(new URL('./src/vistas', import.meta.url)),
      '@almacenes': fileURLToPath(new URL('./src/almacenes', import.meta.url)),
      '@tipos': fileURLToPath(new URL('./src/tipos', import.meta.url)),
      '@test': fileURLToPath(new URL('./test', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@constantes': fileURLToPath(new URL('./src/constantes', import.meta.url)),
      '@servicios': fileURLToPath(new URL('./src/servicios', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@interfaces': fileURLToPath(new URL('./src/interfaces', import.meta.url)),
      '@enumeraciones': fileURLToPath(new URL('./src/enumeraciones', import.meta.url)),
      // Añade más alias según sea necesario
    }
  }
})

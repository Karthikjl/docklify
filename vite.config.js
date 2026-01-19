import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@monaco-editor/react', 'monaco-editor'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-editor': ['@monaco-editor/react', 'monaco-editor'],
          'markdown': ['markdown-it', 'markdown-it-task-lists', 'markdown-it-emoji', 'markdown-it-katex'],
          'vendor': ['react', 'react-dom'],
        },
      },
    },
  },
})

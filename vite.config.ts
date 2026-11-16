import { defineConfig } from 'vite';

export default defineConfig({
  // Preserve optional PDF imports in Revo UI 4.0.25 during development.
  optimizeDeps: {
    exclude: ['@revolist/ui', '@revolist/ui/react'],
    include: ['react', 'react-dom', 'react-dom/client'],
  },
});

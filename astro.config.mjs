import { defineConfig } from 'astro/config';

export default defineConfig({
  // Quan hi hagi domini definitiu, canviar NOMÉS aquesta línia.
  site: 'https://consell-de-poble.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: { shikiConfig: { theme: 'github-light' } },
    vite: {
    optimizeDeps: { exclude: ['maplibre-gl'] },
    worker: { format: 'es' },
    build: { target: 'es2022' },
  },
});

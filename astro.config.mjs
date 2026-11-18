import { defineConfig } from 'astro/config';
import rehypeContingut from './src/lib/rehype-contingut.mjs';

export default defineConfig({
  // Quan hi hagi domini definitiu, canviar NOMÉS aquesta línia.
  site: 'https://consell-de-poble.pages.dev',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // rehypeContingut: vídeos de YouTube, imatges amb peu i taules (vegeu el fitxer)
  markdown: { shikiConfig: { theme: 'github-light' }, rehypePlugins: [rehypeContingut] },
    vite: {
    optimizeDeps: { exclude: ['maplibre-gl'] },
    worker: { format: 'es' },
    build: { target: 'es2022' },
  },
});

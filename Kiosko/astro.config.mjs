// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'static', // Genera ./dist/ con HTML puro para despliegue en Vercel/CDN
});

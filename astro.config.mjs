import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// Domínio de produção (canonical, Open Graph e sitemap). SITE_URL troca, se precisar.
const site = process.env.SITE_URL || 'https://quantocustabolsonaro.com.br';

// BASE_PATH: subpasta do site (ex.: /quanto-custa-bolsonaro no GitHub Pages sem domínio próprio).
export default defineConfig({
  site,
  base: process.env.BASE_PATH || undefined,
  // /salario-minimo.html é servido como /salario-minimo em qualquer hospedagem estática.
  build: { format: 'file', inlineStylesheets: 'auto' },
  trailingSlash: 'never',
  // React só no build: os componentes do DS viram HTML, sem ilhas no navegador.
  integrations: [react(), sitemap()],
  compressHTML: true,
});

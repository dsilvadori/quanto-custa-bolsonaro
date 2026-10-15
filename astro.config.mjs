import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// SITE_URL é o domínio de produção (canonical, Open Graph e sitemap).
// TODO: definir o domínio final antes do deploy.
const site = process.env.SITE_URL ?? 'http://localhost:4321';

export default defineConfig({
  site,
  // /salario-minimo.html é servido como /salario-minimo em qualquer hospedagem estática.
  build: { format: 'file', inlineStylesheets: 'auto' },
  trailingSlash: 'never',
  // React só no build: os componentes do DS viram HTML, sem ilhas no navegador.
  integrations: [react(), sitemap()],
  compressHTML: true,
});

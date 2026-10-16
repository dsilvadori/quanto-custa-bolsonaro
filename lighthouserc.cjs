// Lighthouse CI no perfil padrão do Lighthouse: celular (Moto G Power) com 4G lento simulado.
// Meta do projeto: 95 ou mais em Performance, Acessibilidade, Boas práticas e SEO.
const paginas = ['/', '/salario-minimo', '/cesta-basica', '/combustivel', '/aposentadoria-bpc', '/como-calculamos', '/fontes'];

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx astro preview --port 4330',
      startServerReadyPattern: 'localhost:4330',
      url: paginas.map((p) => `http://localhost:4330${p}`),
      numberOfRuns: Number(process.env.LHCI_RUNS ?? 3),
      settings: { chromeFlags: '--no-sandbox --headless=new' },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci/relatorios' },
  },
};

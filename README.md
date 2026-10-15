# Quanto custa Bolsonaro no poder

Site estático com simuladores. Requisitos e plano em [prompt-claude-code-quanto-custa.md](prompt-claude-code-quanto-custa.md).

## Rodar local

```bash
npm install
npm run dev       # http://localhost:4321
npm test          # Vitest
npm run build     # gera dist/
npm run preview   # serve dist/
```

Node 20.3 ou mais novo (o CI usa o 22, veja `.nvmrc`).

## Como está montado

- **Astro só no build.** Os componentes React do Bora Lula DS viram HTML estático, e nenhuma página carrega React. A interação fica em TypeScript puro (`src/scripts/`).
- **Design system:** `@boralula/ui` não está no npm. O pacote fica em `vendor/boralula-ui-0.1.0.tgz`, gerado com `npm pack` a partir de [ntmedina-git/bora-lula-ui](https://github.com/ntmedina-git/bora-lula-ui) no commit `5a61202`. Para atualizar: clonar, `npm ci && npm run build && npm pack`, copiar o `.tgz` para `vendor/` e rodar `npm install`.
- **Fontes:** Montserrat 700 e 800 (WOFF2, subset latino) em `src/assets/fonts/`, licença SIL OFL 1.1. Com economia de dados ativa, o site usa a fonte do sistema.
- **SEO:** nome, menus, title, description e data de atualização de cada página ficam em `src/site.ts`. O domínio de produção vem da variável `SITE_URL`.

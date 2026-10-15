// npm run orcamento  (rode depois de npm run build)
// Mede, por página, o que o navegador baixa no primeiro carregamento, comprimido com gzip:
// HTML, CSS, JS (com os módulos importados de forma estática) e fontes. Importações dinâmicas
// (ex.: o gerador do cartão PNG, que só carrega no toque) não contam.
// Falha se passar de: JS 60 KB, CSS 30 KB, total 300 KB.
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = 'dist';
const LIMITES = { js: 60, css: 30, total: 300 }; // KB, gzip
const kb = (bytes) => bytes / 1024;
const gz = async (arquivo) => gzipSync(await readFile(join(DIST, arquivo)), { level: 9 }).length;
const local = (url) => url.startsWith('/') && !url.startsWith('//');

/** JS de entrada + imports estáticos ("import ... from './x.js'"), sem import(). */
async function grafoJs(entrada, vistos = new Set()) {
  if (vistos.has(entrada)) return vistos;
  vistos.add(entrada);
  const codigo = await readFile(join(DIST, entrada), 'utf8');
  const pasta = entrada.slice(0, entrada.lastIndexOf('/') + 1);
  for (const [, caminho] of codigo.matchAll(/(?:^|[;}\s])import\s*(?:[^'"()]*?from\s*)?["'](\.\.?\/[^"']+)["']/g)) {
    await grafoJs(new URL(caminho, `http://x${pasta}`).pathname, vistos);
  }
  return vistos;
}

/** Fontes citadas no CSS. Com font-display: swap, o navegador baixa as que a página usa: contamos todas. */
async function fontesDoCss(css) {
  const codigo = await readFile(join(DIST, css), 'utf8');
  return [...codigo.matchAll(/url\(["']?(\/[^"')]+\.woff2)["']?\)/g)].map((m) => m[1]);
}

const paginas = (await readdir(DIST)).filter((f) => f.endsWith('.html')).sort();
if (paginas.length === 0) {
  console.error(`Nenhuma página em ${DIST}/: rode npm run build antes.`);
  process.exit(1);
}

const erros = [];
const linhas = [];
for (const pagina of paginas) {
  const html = await readFile(join(DIST, pagina), 'utf8');
  const css = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((m) => m[1]).filter(local);
  const js = new Set();
  for (const [, src] of html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)) if (local(src)) await grafoJs(src, js);
  const fontes = new Set((await Promise.all(css.map(fontesDoCss))).flat());

  const t = {
    html: gzipSync(html, { level: 9 }).length,
    css: (await Promise.all(css.map(gz))).reduce((a, b) => a + b, 0),
    js: (await Promise.all([...js].map(gz))).reduce((a, b) => a + b, 0),
    fontes: (await Promise.all([...fontes].map(gz))).reduce((a, b) => a + b, 0),
  };
  const total = t.html + t.css + t.js + t.fontes;
  linhas.push({ pagina, ...Object.fromEntries(Object.entries(t).map(([k, v]) => [k, kb(v).toFixed(1)])), total: kb(total).toFixed(1) });

  if (kb(t.js) > LIMITES.js) erros.push(`${pagina}: JS ${kb(t.js).toFixed(1)} KB > ${LIMITES.js} KB`);
  if (kb(t.css) > LIMITES.css) erros.push(`${pagina}: CSS ${kb(t.css).toFixed(1)} KB > ${LIMITES.css} KB`);
  if (kb(total) > LIMITES.total) erros.push(`${pagina}: total ${kb(total).toFixed(1)} KB > ${LIMITES.total} KB`);
}

console.log(`Orçamento por página (KB, gzip). Limites: JS ${LIMITES.js}, CSS ${LIMITES.css}, total ${LIMITES.total}.`);
console.table(linhas);
if (erros.length) {
  for (const e of erros) console.error(e);
  process.exit(1);
}
console.log('Dentro do orçamento.');

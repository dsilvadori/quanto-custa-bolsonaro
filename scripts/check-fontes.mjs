// npm run check-fontes  (rode depois de npm run build)
// Falha se:
//   (a) um número renderizado (R$ ou %) não tiver <Fonte> no mesmo bloco;
//   (b) um selo apontar para id que não existe em data/fontes.json;
//   (c) uma URL do registro não responder 200 (pule com --sem-rede).
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'node-html-parser';

const DIST = 'dist';
const semRede = process.argv.includes('--sem-rede');
const { fontes } = JSON.parse(await readFile('data/fontes.json', 'utf8'));
const ids = new Set(fontes.map((f) => f.id));
const erros = [];

// Valores em reais ou percentuais. Anos (2026) e datas não contam como número econômico.
const NUMERO = /R\$\s?\d|\d(?:[\d.]*)(?:,\d+)?\s?%/;
// Bloco onde o selo precisa estar. Em gráficos SVG, a figura inteira.
const BLOCOS = new Set(['p', 'li', 'td', 'th', 'dd', 'dt', 'figure', 'figcaption', 'caption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);
// Lugares que mostram a própria fonte ou não são conteúdo: o registro em /fontes e o painel do selo.
const isento = (el) => el.closest('[data-registro-fontes], #painel-fonte, [data-sem-fonte], script, style');

function bloco(el) {
  for (let n = el; n; n = n.parentNode) {
    if (n.rawTagName && BLOCOS.has(n.rawTagName.toLowerCase())) return n;
  }
  return null;
}

function textos(no, saida = []) {
  for (const filho of no.childNodes) {
    if (filho.nodeType === 3) saida.push(filho);
    else textos(filho, saida);
  }
  return saida;
}

const paginas = (await readdir(DIST).catch(() => [])).filter((f) => f.endsWith('.html'));
if (paginas.length === 0) erros.push(`nenhuma página em ${DIST}/: rode npm run build antes`);
for (const arquivo of paginas) {
  const doc = parse(await readFile(join(DIST, arquivo), 'utf8'));

  for (const selo of doc.querySelectorAll('[data-fonte]')) {
    const id = selo.getAttribute('data-fonte');
    if (!ids.has(id)) erros.push(`(b) ${arquivo}: selo com id "${id}" não existe em fontes.json`);
  }

  const main = doc.querySelector('main');
  if (!main) continue;
  for (const texto of textos(main)) {
    const conteudo = texto.text.trim();
    if (!NUMERO.test(conteudo)) continue;
    const pai = texto.parentNode;
    if (isento(pai)) continue;
    // Números calculados (resultado, tabela, gráfico) ficam num contêiner [data-numero] que mostra as fontes da conta.
    const b = pai.closest('[data-numero]') ?? bloco(pai);
    if (!b || !b.querySelector('[data-fonte]')) {
      erros.push(`(a) ${arquivo}: número sem <Fonte> no bloco: "${conteudo.slice(0, 80)}"`);
    }
  }
}

async function responde200(url) {
  for (let tentativa = 1; tentativa <= 3; tentativa++) {
    try {
      const r = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(45_000),
        headers: { 'user-agent': 'Mozilla/5.0 (check-fontes; +https://github.com/)' },
      });
      await r.body?.cancel();
      if (r.status === 200) return 200;
      if (r.status !== 429 && r.status < 500) return r.status;
    } catch (e) {
      if (tentativa === 3) return e.name;
    }
    await new Promise((ok) => setTimeout(ok, 5_000 * tentativa));
  }
  return 'sem resposta';
}


if (!semRede) {
  const urls = [...new Set(fontes.map((f) => f.url))];
  // Poucas por vez, para não ser bloqueado pelos servidores dos órgãos.
  for (let i = 0; i < urls.length; i += 3) {
    const lote = urls.slice(i, i + 3);
    const status = await Promise.all(lote.map(responde200));
    lote.forEach((url, j) => status[j] !== 200 && erros.push(`(c) ${url} respondeu ${status[j]}`));
  }
}

console.log(`check-fontes: ${paginas.length} páginas, ${fontes.length} fontes${semRede ? ', URLs não testadas (--sem-rede)' : ''}.`);
if (erros.length) {
  for (const e of erros) console.error(e);
  console.error(`\n${erros.length} problema(s).`);
  process.exit(1);
}
console.log('Tudo certo.');
